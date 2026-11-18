import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pg from 'pg';
import { runMigrations } from '../src/database/migrator.js';
import { createTestDatabase, type TestDatabase } from './support/test-database.js';

const REAL_MIGRATIONS = join(process.cwd(), 'migrations');

async function query<T extends pg.QueryResultRow>(url: string, sql: string): Promise<T[]> {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    return (await c.query<T>(sql)).rows;
  } finally {
    await c.end();
  }
}

describe('SQL migration runner (real PostgreSQL)', () => {
  let db: TestDatabase;
  beforeEach(async () => {
    db = await createTestDatabase();
  });
  afterEach(async () => {
    await db.drop();
  });

  it('applies the real migrations to an empty database and is idempotent', async () => {
    const first = await runMigrations(db.url, REAL_MIGRATIONS);
    expect(first.applied).toContain('0001_baseline.sql');

    const second = await runMigrations(db.url, REAL_MIGRATIONS);
    expect(second.applied).toEqual([]);
    expect(second.alreadyApplied).toContain('0001_baseline.sql');

    const meta = await query<{ value: string }>(db.url, "SELECT value FROM app_meta WHERE key = 'schema_baseline'");
    expect(meta[0]?.value).toBe('0001');
    const ext = await query(db.url, "SELECT 1 FROM pg_extension WHERE extname = 'btree_gist'");
    expect(ext).toHaveLength(1);
  });

  it('refuses to run when an applied migration file was edited', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mig-'));
    await writeFile(join(dir, '0001_a.sql'), 'CREATE TABLE a (id int);');
    await runMigrations(db.url, dir);
    await writeFile(join(dir, '0001_a.sql'), 'CREATE TABLE a (id int, extra int);');
    await expect(runMigrations(db.url, dir)).rejects.toThrow(/modified after it was applied/);
  });

  it('rolls a failing migration back completely and does not record it', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mig-'));
    await writeFile(join(dir, '0001_ok.sql'), 'CREATE TABLE ok_table (id int);');
    await writeFile(join(dir, '0002_bad.sql'), 'CREATE TABLE half_done (id int); SELECT * FROM does_not_exist;');
    await expect(runMigrations(db.url, dir)).rejects.toThrow(/0002_bad\.sql failed/);

    const tables = await query<{ table_name: string }>(
      db.url,
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    const names = tables.map((t) => t.table_name);
    expect(names).toContain('ok_table');
    expect(names).not.toContain('half_done');
    const recorded = await query<{ version: string }>(db.url, 'SELECT version FROM schema_migrations');
    expect(recorded.map((r) => r.version)).toEqual(['0001']);
  });

  it('supports no-transaction migrations (e.g. CREATE INDEX CONCURRENTLY)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mig-'));
    await writeFile(join(dir, '0001_t.sql'), 'CREATE TABLE t (id int);');
    await writeFile(
      join(dir, '0002_idx.sql'),
      '-- migrate:no-transaction\nCREATE INDEX CONCURRENTLY t_id_idx ON t (id);',
    );
    await expect(runMigrations(db.url, dir)).resolves.toMatchObject({ applied: ['0001_t.sql', '0002_idx.sql'] });
  });

  it('two instances migrating at once do not conflict (advisory lock)', async () => {
    const results = await Promise.all([
      runMigrations(db.url, REAL_MIGRATIONS),
      runMigrations(db.url, REAL_MIGRATIONS),
    ]);
    const appliedTotal = results.flatMap((r) => r.applied);
    expect(appliedTotal.filter((n) => n === '0001_baseline.sql')).toHaveLength(1);
  });
});
