import { join } from 'node:path';

/** `backend/migrations`. Run commands from `backend/` (npm scripts and Docker do), or set MIGRATIONS_DIR. */
export const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR ?? join(process.cwd(), 'migrations');
