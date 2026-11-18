// Starts a real local PostgreSQL WITHOUT Docker (npm package `embedded-postgres`).
// Development convenience for machines where Docker is not installed. Not for production.
//   npm run db:embedded          -> postgresql://padel:padel@localhost:5433/padel_hub
import { existsSync } from 'node:fs';
import EmbeddedPostgres from 'embedded-postgres';

const dir = new URL('../.embedded-pg/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const port = Number(process.env.EMBEDDED_PG_PORT ?? 5433);
const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: 'padel',
  password: 'padel',
  port,
  persistent: true,
  onLog: () => undefined,
});
if (!existsSync(dir)) await pg.initialise();
await pg.start();
try {
  await pg.createDatabase('padel_hub');
} catch {
  /* already exists */
}
console.log(`PostgreSQL is running: postgresql://padel:padel@localhost:${port}/padel_hub  (Ctrl+C to stop)`);

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
