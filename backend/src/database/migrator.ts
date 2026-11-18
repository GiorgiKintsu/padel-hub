import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';

/**
 * Minimal SQL migration runner. It is the single mechanism for ALL schema changes, which lets the
 * booking core use PostgreSQL features Prisma cannot express (EXCLUDE constraints, partial indexes,
 * btree_gist, ...).
 *
 * Rules:
 *  - files live in `migrations/` and are named `NNNN_description.sql`, applied in name order;
 *  - applied files are recorded in `schema_migrations` with a SHA-256 checksum;
 *  - editing an already-applied file is an error (write a new migration instead);
 *  - each file runs in its own transaction, unless it contains the line `-- migrate:no-transaction`
 *    (needed for e.g. CREATE INDEX CONCURRENTLY);
 *  - a PostgreSQL advisory lock stops two instances migrating at the same time.
 */

const FILE_PATTERN = /^\d{4}_[a-z0-9_]+\.sql$/;
const NO_TX_MARKER = /^--\s*migrate:no-transaction\s*$/m;
const ADVISORY_LOCK_KEY = 7_283_461_001; // arbitrary constant, unique to this app

export interface MigrationFile {
  version: string;
  filename: string;
  sql: string;
  checksum: string;
  transactional: boolean;
}

export interface MigrationResult {
  applied: string[];
  alreadyApplied: string[];
}

export async function loadMigrationFiles(dir: string): Promise<MigrationFile[]> {
  const names = (await readdir(dir)).filter((n) => n.endsWith('.sql')).sort();
  const files: MigrationFile[] = [];
  for (const filename of names) {
    if (!FILE_PATTERN.test(filename)) {
      throw new Error(
        `Migration file "${filename}" must be named NNNN_description.sql (lowercase letters, digits, underscores)`,
      );
    }
    const sql = await readFile(join(dir, filename), 'utf8');
    files.push({
      version: filename.slice(0, 4),
      filename,
      sql,
      checksum: createHash('sha256').update(sql).digest('hex'),
      transactional: !NO_TX_MARKER.test(sql),
    });
  }
  const seen = new Set<string>();
  for (const f of files) {
    if (seen.has(f.version)) throw new Error(`Duplicate migration version ${f.version}`);
    seen.add(f.version);
  }
  return files;
}

export async function runMigrations(
  connectionString: string,
  dir: string,
  log: (msg: string) => void = () => undefined,
): Promise<MigrationResult> {
  const files = await loadMigrationFiles(dir);
  const client = new pg.Client({ connectionString });
  await client.connect();
  const result: MigrationResult = { applied: [], alreadyApplied: [] };
  try {
    await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK_KEY]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    text        PRIMARY KEY,
        filename   text        NOT NULL,
        checksum   text        NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`);
    const { rows } = await client.query<{ version: string; checksum: string; filename: string }>(
      'SELECT version, checksum, filename FROM schema_migrations',
    );
    const applied = new Map(rows.map((r) => [r.version, r]));
    const known = new Set(files.map((f) => f.version));
    for (const row of rows) {
      if (!known.has(row.version)) {
        throw new Error(`Database has migration ${row.filename} that is missing from the migrations folder`);
      }
    }

    for (const file of files) {
      const existing = applied.get(file.version);
      if (existing) {
        if (existing.checksum !== file.checksum) {
          throw new Error(
            `Migration ${file.filename} was modified after it was applied. Do not edit applied migrations; add a new one.`,
          );
        }
        result.alreadyApplied.push(file.filename);
        continue;
      }
      log(`Applying migration ${file.filename}`);
      try {
        if (file.transactional) await client.query('BEGIN');
        await client.query(file.sql);
        await client.query(
          'INSERT INTO schema_migrations (version, filename, checksum) VALUES ($1, $2, $3)',
          [file.version, file.filename, file.checksum],
        );
        if (file.transactional) await client.query('COMMIT');
      } catch (err) {
        if (file.transactional) await client.query('ROLLBACK').catch(() => undefined);
        throw new Error(`Migration ${file.filename} failed: ${(err as Error).message}`, { cause: err });
      }
      result.applied.push(file.filename);
    }
    return result;
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_KEY]).catch(() => undefined);
    await client.end();
  }
}
