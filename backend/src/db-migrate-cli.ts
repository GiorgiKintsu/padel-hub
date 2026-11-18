import { MIGRATIONS_DIR } from './database/migrations-dir.js';
import { runMigrations } from './database/migrator.js';

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const result = await runMigrations(url, MIGRATIONS_DIR, (m) => console.log(m));
  console.log(`Migrations: ${result.applied.length} applied, ${result.alreadyApplied.length} already up to date.`);
}

main().catch((err: unknown) => {
  console.error((err as Error).message);
  process.exit(1);
});
