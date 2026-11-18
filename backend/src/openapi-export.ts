import 'reflect-metadata';
import { writeFile } from 'node:fs/promises';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { API_PREFIX, buildOpenApiDocument } from './configure-app.js';

/**
 * Writes `openapi.json` without a running database: JOBS_ENABLED=false and no migrations are needed
 * because the document is built from controller metadata only. Used later to generate the mobile client.
 */
async function main(): Promise<void> {
  process.env.JOBS_ENABLED = 'false';
  process.env.DATABASE_URL ??= 'postgresql://unused:unused@localhost:5432/unused';
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  app.setGlobalPrefix(API_PREFIX);
  const doc = buildOpenApiDocument(app);
  const out = process.argv[2] ?? 'openapi.json';
  await writeFile(out, JSON.stringify(doc, null, 2) + '\n');
  console.log(`OpenAPI document written to ${out}`);
  await app.close();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
