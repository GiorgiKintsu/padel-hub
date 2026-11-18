-- Baseline. Hand-written SQL migration (see backend/README.md, "Migrations").

-- Needed by the booking core (stage C): EXCLUDE constraints that combine equality on a court id
-- with overlap on a time range require btree_gist.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Small key/value table. Used for the schema/seed marker and as the first table Prisma queries,
-- so the readiness check exercises the real Prisma -> PostgreSQL path.
CREATE TABLE app_meta (
  key        text        PRIMARY KEY,
  value      text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_meta (key, value) VALUES ('schema_baseline', '0001');
