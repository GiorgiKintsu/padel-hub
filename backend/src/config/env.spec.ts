import { validateEnv } from './env.js';

describe('validateEnv', () => {
  const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db' };

  it('applies defaults', () => {
    const env = validateEnv(base);
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
    expect(env.JOBS_ENABLED).toBe(true);
    expect(env.MIGRATE_ON_BOOT).toBe(false);
    expect(env.SWAGGER_ENABLED).toBe(true);
  });

  it('disables Swagger by default in production, unless asked', () => {
    expect(validateEnv({ ...base, NODE_ENV: 'production' }).SWAGGER_ENABLED).toBe(false);
    expect(validateEnv({ ...base, NODE_ENV: 'production', SWAGGER_ENABLED: 'true' }).SWAGGER_ENABLED).toBe(true);
  });

  it('requires DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-postgres URL without echoing the value', () => {
    const secret = 'mysql://admin:topsecret@host/db';
    let message = '';
    try {
      validateEnv({ DATABASE_URL: secret });
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toMatch(/DATABASE_URL must be a postgresql/);
    expect(message).not.toContain('topsecret');
  });

  it('rejects bad booleans and ports', () => {
    expect(() => validateEnv({ ...base, JOBS_ENABLED: 'yes' })).toThrow(/JOBS_ENABLED/);
    expect(() => validateEnv({ ...base, PORT: '99999' })).toThrow(/PORT/);
  });
});
