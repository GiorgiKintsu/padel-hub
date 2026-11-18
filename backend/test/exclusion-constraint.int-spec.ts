import { join } from 'node:path';
import pg from 'pg';
import { runMigrations } from '../src/database/migrator.js';
import { createTestDatabase, type TestDatabase } from './support/test-database.js';

/**
 * Stage A only proves that the database machinery the booking core (stage C) depends on really works:
 * btree_gist is installed by the baseline migration and an EXCLUDE constraint on (court, time range)
 * rejects overlaps even under concurrent inserts. The throw-away table here is NOT the booking schema.
 */
describe('EXCLUDE constraint on time ranges (real PostgreSQL)', () => {
  let db: TestDatabase;
  let pool: pg.Pool;

  beforeAll(async () => {
    db = await createTestDatabase();
    await runMigrations(db.url, join(process.cwd(), 'migrations'));
    pool = new pg.Pool({ connectionString: db.url, max: 10 });
    await pool.query(`
      CREATE TABLE probe_slots (
        id    serial PRIMARY KEY,
        court int NOT NULL,
        span  tstzrange NOT NULL,
        EXCLUDE USING gist (court WITH =, span WITH &&)
      )`);
  });

  afterAll(async () => {
    await pool.end();
    await db.drop();
  });

  const insert = (court: number, from: string, to: string) =>
    pool.query('INSERT INTO probe_slots (court, span) VALUES ($1, tstzrange($2, $3))', [court, from, to]);

  it('rejects overlapping ranges on the same court', async () => {
    await insert(1, '2030-01-01T10:00Z', '2030-01-01T11:30Z');
    await expect(insert(1, '2030-01-01T11:00Z', '2030-01-01T12:00Z')).rejects.toMatchObject({ code: '23P01' });
  });

  it('allows back-to-back ranges and the same time on another court', async () => {
    await insert(2, '2030-01-01T10:00Z', '2030-01-01T11:00Z');
    await expect(insert(2, '2030-01-01T11:00Z', '2030-01-01T12:00Z')).resolves.toBeDefined();
    await expect(insert(3, '2030-01-01T10:00Z', '2030-01-01T11:00Z')).resolves.toBeDefined();
  });

  it('lets exactly one of many simultaneous inserts for the same slot win', async () => {
    const attempts = await Promise.allSettled(
      Array.from({ length: 10 }, () => insert(9, '2030-02-01T18:00Z', '2030-02-01T19:30Z')),
    );
    expect(attempts.filter((a) => a.status === 'fulfilled')).toHaveLength(1);
    const rejected = attempts.filter((a): a is PromiseRejectedResult => a.status === 'rejected');
    expect(rejected).toHaveLength(9);
    expect(rejected.every((r) => (r.reason as { code?: string }).code === '23P01')).toBe(true);
  });
});
