import { startTestServer, type TestServer } from './test-database';

declare global {
  var __TEST_SERVER__: TestServer | undefined;
}

export default async function globalSetup(): Promise<void> {
  const server = await startTestServer();
  globalThis.__TEST_SERVER__ = server;
  // Worker processes are spawned after global setup and inherit this variable.
  process.env.TEST_ADMIN_DATABASE_URL = server.adminUrl;
  console.log(`\n[integration] PostgreSQL source: ${server.mode}`);
}
