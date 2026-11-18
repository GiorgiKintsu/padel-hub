import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { JobsService } from '../src/jobs/jobs.service.js';
import { SYSTEM_PING_QUEUE } from '../src/jobs/system-jobs.js';
import { createTestDatabase, type TestDatabase } from './support/test-database.js';

async function eventually<T>(fn: () => Promise<T | null | undefined>, timeoutMs = 20_000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() > deadline) throw new Error('condition not met in time');
    await new Promise((r) => setTimeout(r, 250));
  }
}

describe('Application (real PostgreSQL, real pg-boss)', () => {
  let db: TestDatabase;
  let app: INestApplication;

  beforeAll(async () => {
    db = await createTestDatabase();
    process.env.DATABASE_URL = db.url;
    process.env.MIGRATE_ON_BOOT = 'true';
    process.env.JOBS_ENABLED = 'true';
    process.env.NODE_ENV = 'test';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app, { swagger: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await db.drop();
  });

  it('GET /api/v1/health/live is ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/v1/health reports database (with schema version) and jobs as up', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.info.database).toEqual({ status: 'up', schemaVersion: '0001' });
    expect(res.body.info.jobs.status).toBe('up');
  });

  it('serves the OpenAPI document with the health endpoints', async () => {
    const res = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toEqual(expect.arrayContaining(['/api/v1/health', '/api/v1/health/live']));
    await request(app.getHttpServer()).get('/api/docs').expect(200);
  });

  it('unknown routes use the uniform error format', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/nope').expect(404);
    expect(res.body).toMatchObject({ statusCode: 404, error: 'NOT FOUND', path: '/api/v1/nope' });
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('Prisma reads the migrated table', async () => {
    const prisma = app.get(PrismaService);
    const row = await prisma.appMeta.findUnique({ where: { key: 'schema_baseline' } });
    expect(row?.value).toBe('0001');
  });

  it('pg-boss runs a job: enqueue -> worker -> database write', async () => {
    const prisma = app.get(PrismaService);
    const jobId = await app.get(JobsService).send(SYSTEM_PING_QUEUE, {});
    expect(jobId).toEqual(expect.any(String));
    const row = await eventually(() => prisma.appMeta.findUnique({ where: { key: 'last_job_ping' } }));
    expect(new Date(row.value).getTime()).not.toBeNaN();
  });

  it('readiness turns 503 when the schema check fails', async () => {
    // Hide the table the readiness check relies on, then restore it.
    const prisma = app.get(PrismaService);
    await prisma.$executeRawUnsafe('ALTER TABLE schema_migrations RENAME TO schema_migrations_hidden');
    try {
      const res = await request(app.getHttpServer()).get('/api/v1/health').expect(503);
      expect(res.body.statusCode).toBe(503);
      expect(res.body.details.error.database.status).toBe('down');
    } finally {
      await prisma.$executeRawUnsafe('ALTER TABLE schema_migrations_hidden RENAME TO schema_migrations');
    }
  });
});
