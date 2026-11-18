import { defineConfig } from 'prisma/config';

// DATABASE_URL is only needed for commands that touch the database
// (`prisma db pull`, `prisma studio`). `prisma generate` / `validate` work without it.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
