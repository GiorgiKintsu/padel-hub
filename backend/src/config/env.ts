import { z } from 'zod';

const boolFromString = z.enum(['true', 'false']).transform((v) => v === 'true');

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    LOG_LEVEL: z.enum(['error', 'warn', 'log', 'debug', 'verbose']).default('log'),
    DATABASE_URL: z
      .string()
      .refine((v) => /^postgres(ql)?:\/\//.test(v), 'DATABASE_URL must be a postgresql:// URL'),
    // Run pending SQL migrations when the app starts. Convenient in development;
    // in production prefer the explicit `npm run db:migrate` step.
    MIGRATE_ON_BOOT: boolFromString.default(false),
    // Start the pg-boss job queue inside this process.
    JOBS_ENABLED: boolFromString.default(true),
    // Swagger UI at /api/docs, OpenAPI JSON at /api/docs-json. Off by default in production.
    SWAGGER_ENABLED: boolFromString.optional(),
  })
  .transform((env) => ({
    ...env,
    SWAGGER_ENABLED: env.SWAGGER_ENABLED ?? env.NODE_ENV !== 'production',
  }));

export type Env = z.infer<typeof envSchema>;

/** Validates raw environment variables. Throws a readable error without echoing values (they may be secrets). */
export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  return parsed.data;
}
