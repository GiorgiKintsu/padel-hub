import { randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pg from 'pg';

/**
 * Provides a REAL, empty PostgreSQL server for the integration tests. Three sources, chosen by TEST_DB:
 *
 *  - (default)  Testcontainers: a throw-away `postgres:17-alpine` Docker container. This is the
 *               reference setup, used in CI and on any machine with Docker.
 *  - external   TEST_DATABASE_URL points at an existing PostgreSQL server (any database on it; the
 *               tests create and drop their own databases there).
 *  - embedded   a real PostgreSQL binary started from the `embedded-postgres` npm package, no Docker.
 *               Fallback for machines where Docker cannot be installed.
 *
 * In all cases every test file gets its own freshly created database, so tests never see each
 * other's data and a failed run leaves nothing behind that matters.
 */

export interface TestServer {
  /** Admin connection string (database `postgres`) of the running server. */
  adminUrl: string;
  mode: 'testcontainers' | 'external' | 'embedded';
  stop: () => Promise<void>;
}

const POSTGRES_IMAGE = 'postgres:17-alpine';

export async function startTestServer(): Promise<TestServer> {
  const mode = process.env.TEST_DB ?? (process.env.TEST_DATABASE_URL ? 'external' : 'testcontainers');
  if (mode === 'external') return externalServer();
  if (mode === 'embedded') return embeddedServer();
  if (mode === 'testcontainers') return containerServer();
  throw new Error(`Unknown TEST_DB="${mode}" (use testcontainers, external or embedded)`);
}

function externalServer(): TestServer {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DB=external requires TEST_DATABASE_URL');
  return { adminUrl: url, mode: 'external', stop: async () => undefined };
}

async function containerServer(): Promise<TestServer> {
  const { PostgreSqlContainer } = await import('@testcontainers/postgresql');
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  return {
    adminUrl: container.getConnectionUri(),
    mode: 'testcontainers',
    stop: async () => {
      await container.stop();
    },
  };
}

async function embeddedServer(): Promise<TestServer> {
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const dir = await mkdtemp(join(tmpdir(), 'padel-embedded-pg-'));
  const port = 54000 + Math.floor(Math.random() * 1000);
  const password = randomBytes(8).toString('hex');
  const server = new EmbeddedPostgres({
    databaseDir: dir,
    user: 'postgres',
    password,
    port,
    persistent: false,
    onLog: () => undefined,
    onError: () => undefined,
  });
  await server.initialise();
  await server.start();
  return {
    adminUrl: `postgresql://postgres:${password}@localhost:${port}/postgres`,
    mode: 'embedded',
    stop: async () => {
      // On Windows embedded-postgres' stop() occasionally never resolves; don't let that hang the test run.
      await Promise.race([server.stop().catch(() => undefined), new Promise((r) => setTimeout(r, 8000))]);
      await rm(dir, { recursive: true, force: true }).catch(() => undefined);
    },
  };
}

export interface TestDatabase {
  url: string;
  drop: () => Promise<void>;
}

/** Creates a new empty database on the server described by TEST_ADMIN_DATABASE_URL (set by global setup). */
export async function createTestDatabase(): Promise<TestDatabase> {
  const adminUrl = process.env.TEST_ADMIN_DATABASE_URL;
  if (!adminUrl) throw new Error('TEST_ADMIN_DATABASE_URL is not set: integration tests must run through jest global setup');
  const name = `test_${randomBytes(6).toString('hex')}`;
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE ${name}`);
  } finally {
    await admin.end();
  }
  const u = new URL(adminUrl);
  u.pathname = `/${name}`;
  return {
    url: u.toString(),
    drop: async () => {
      const c = new pg.Client({ connectionString: adminUrl });
      await c.connect();
      try {
        await c.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      } finally {
        await c.end();
      }
    },
  };
}
