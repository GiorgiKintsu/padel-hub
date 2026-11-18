import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp, DOCS_PATH } from './configure-app.js';
import { validateEnv } from './config/env.js';

const LOG_LEVELS: ('error' | 'warn' | 'log' | 'debug' | 'verbose')[] = ['error', 'warn', 'log', 'debug', 'verbose'];

async function bootstrap(): Promise<void> {
  const env = validateEnv(process.env); // fail fast with a readable message
  const app = await NestFactory.create(AppModule, {
    logger: LOG_LEVELS.slice(0, LOG_LEVELS.indexOf(env.LOG_LEVEL) + 1),
  });
  configureApp(app, { swagger: env.SWAGGER_ENABLED });
  app.enableShutdownHooks();
  await app.listen(env.PORT, '0.0.0.0');
  const logger = new Logger('Bootstrap');
  logger.log(`Padel Hub API listening on port ${env.PORT} (${env.NODE_ENV})`);
  if (env.SWAGGER_ENABLED) logger.log(`OpenAPI docs: /${DOCS_PATH}`);
}

bootstrap().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
