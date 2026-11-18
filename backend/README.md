# Padel Hub — backend

NestJS + TypeScript (strict) + PostgreSQL. REST API under `/api/v1`, OpenAPI at `/api/docs`.
Product rules live only in [`../docs/PADEL_HUB_FULL_DOCUMENTATION.md`](../docs/PADEL_HUB_FULL_DOCUMENTATION.md);
this file is about running and testing the code.

**Status: stage A (foundation).** There are no business endpoints yet — only health checks. Auth, clubs,
booking and the rest arrive in stages B–H.

## What exists

| Part | Where | What it does |
|---|---|---|
| Config | `src/config/` | Environment is validated with Zod at startup; the app refuses to start with a readable error if it is wrong. |
| Database | `src/database/` | Prisma client (`PrismaService`, PostgreSQL driver adapter) for queries; **our own SQL migration runner** for schema changes. |
| Migrations | `migrations/*.sql` | Hand-written SQL, applied in order. |
| Jobs | `src/jobs/` | `pg-boss` queue stored in PostgreSQL (schema `pgboss`). Stage A has one job, `system.ping`, to prove enqueue → worker → DB write. |
| Health | `src/health/` | `GET /api/v1/health/live` (process is up) and `GET /api/v1/health` (database + schema version + job queue). |
| OpenAPI | `src/configure-app.ts` | Swagger UI at `/api/docs`, JSON at `/api/docs-json`; `npm run openapi:export` writes `openapi.json` (no database needed) for the mobile client generator. |
| Errors | `src/common/` | One error JSON shape for the whole API. Unknown errors never leak internals. |

Redis is **not** used (decision recorded in the main documentation).

## Requirements

- Node.js 22.18+ (tested on 22-compatible APIs; developed on Node 24) and npm.
- For the database: **Docker** (recommended) — *or* the Docker-free fallback described below.

## Run locally

```sh
cd backend
npm ci                      # also generates the Prisma client
cp .env.example .env        # local development values only; never commit .env
```

**Option 1 — Docker Compose (reference setup)**

```sh
docker compose up -d db     # PostgreSQL 17 on localhost:5432
npm run start:dev           # API on http://localhost:3000 (MIGRATE_ON_BOOT=true applies migrations)
```

or everything in containers: `docker compose up --build` (API on http://localhost:3000).

**Option 2 — no Docker (development convenience)**

```sh
npm run db:embedded         # real PostgreSQL via npm package, postgresql://padel:padel@localhost:5433/padel_hub
# in a second terminal:
DATABASE_URL=postgresql://padel:padel@localhost:5433/padel_hub MIGRATE_ON_BOOT=true npm run start:dev
```

Check it:

```sh
curl http://localhost:3000/api/v1/health/live
curl http://localhost:3000/api/v1/health
# Swagger UI: http://localhost:3000/api/docs
```

Production-style start: `npm run build && npm run db:migrate && npm run start:prod`.

## Migrations

All schema changes are SQL files in `migrations/`, named `NNNN_description.sql` (four digits, lowercase).
Prisma Migrate is deliberately **not** used: the booking core needs PostgreSQL features Prisma cannot
express (`EXCLUDE USING gist` on time ranges, partial indexes, `SELECT … FOR UPDATE` flows), and one
mechanism for everything is simpler than two.

- `npm run db:migrate` applies pending files (`DATABASE_URL` required). The app does the same on startup when `MIGRATE_ON_BOOT=true`.
- Applied files are recorded in `schema_migrations` with a SHA-256 checksum. **Never edit an applied migration** — the runner refuses to continue; add a new file instead.
- Each file runs in one transaction and is rolled back completely on error. A file containing the line `-- migrate:no-transaction` runs without one (for `CREATE INDEX CONCURRENTLY`).
- A PostgreSQL advisory lock makes two instances starting at once safe.
- `prisma/schema.prisma` is a **hand-maintained mirror** of the tables Prisma queries. After changing a table that Prisma uses, update the schema by hand and run `npx prisma generate` (also runs on `npm install`).

`0001_baseline.sql` installs the `btree_gist` extension (needed by the booking exclusion constraint) and a small `app_meta` table.

## Tests

```sh
npm run check               # lint + typecheck + all tests
npm run test:unit           # no database needed
npm run test:e2e            # integration tests on a throw-away PostgreSQL via Testcontainers (needs Docker)
npm run test:e2e:embedded   # same tests, PostgreSQL from the `embedded-postgres` package (no Docker)
```

Integration tests use a **real** PostgreSQL and real `pg-boss`; every test file gets its own freshly created
database. `TEST_DB` selects the source: `testcontainers` (default), `embedded`, or `TEST_DATABASE_URL=…`
(an existing server).

What the tests prove today:

- migration runner: applies from empty, is idempotent, rejects edited files, rolls failures back, supports no-transaction files, is safe under concurrent start;
- the `EXCLUDE` constraint on `(court, time range)` really rejects overlaps (and 9 of 10 simultaneous identical inserts), allows back-to-back slots — a technical probe on a throw-away table, **not** the booking schema;
- the app boots against the real database, serves health and OpenAPI, returns the uniform error shape, reads through Prisma, runs a `pg-boss` job end to end, and reports 503 when the schema check fails;
- environment validation (unit tests).

Jest runs with `--experimental-vm-modules` because NestJS 12 packages are ESM-only; the npm scripts set it.

## Environment variables

See [`.env.example`](.env.example). Required: `DATABASE_URL`. Everything else has a default.

## Layout

```
backend/
  migrations/        hand-written SQL migrations
  prisma/            schema.prisma (mirror) — generated client goes to src/generated (git-ignored)
  src/               application code (ESM-style imports with .js suffix)
  test/              integration tests (*.int-spec.ts) and test support
  scripts/           dev helpers (embedded Postgres, cross-platform env runner)
  Dockerfile, docker-compose.yml, .env.example
```
