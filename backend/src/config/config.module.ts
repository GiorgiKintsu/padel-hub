import { Global, Module } from '@nestjs/common';
import { validateEnv, type Env } from './env.js';

export const APP_ENV = Symbol('APP_ENV');

/** Validated, typed environment. Inject with `@Inject(APP_ENV) env: Env`. */
@Global()
@Module({
  providers: [{ provide: APP_ENV, useFactory: (): Env => validateEnv(process.env) }],
  exports: [APP_ENV],
})
export class AppConfigModule {}
