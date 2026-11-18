import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';

export const API_PREFIX = 'api/v1';
export const DOCS_PATH = 'api/docs';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Padel Hub API')
    .setDescription('Backend API for the Padel Hub mobile app and management panels.')
    .setVersion('0.1.0')
    .build();
  return SwaggerModule.createDocument(app, config);
}

/** Settings shared by the real server (main.ts) and the integration tests, so tests see the real HTTP behaviour. */
export function configureApp(app: INestApplication, opts: { swagger: boolean }): void {
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(new AllExceptionsFilter());
  if (opts.swagger) {
    SwaggerModule.setup(DOCS_PATH, app, buildOpenApiDocument(app));
  }
}
