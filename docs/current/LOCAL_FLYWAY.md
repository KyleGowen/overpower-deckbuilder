# Local Flyway migrations (Docker Postgres + Flyway Docker image)

## Local database

| Item | Value |
|------|--------|
| Container | `overpower-postgres` (`postgres:15`) |
| Compose file | [`docker/docker-compose.yml`](../../docker/docker-compose.yml) |
| Host port | **1337** → container 5432 |
| Database | `overpower` |
| User / password | `postgres` / `password` |
| JDBC (from host) | `jdbc:postgresql://localhost:1337/overpower` |
| Connection string | `postgresql://postgres:password@localhost:1337/overpower` |

Start Postgres:

```bash
cd docker && docker compose up -d
```

## Flyway on this machine

**Flyway CLI is not installed on the host.** Do not spend time installing it, fixing `PATH`, or retrying `npm run migrate` when the error is `flyway: not found` (or equivalent).

Use the **official Flyway Docker image** instead. It reads the same `migrations/` SQL files and writes to the same `flyway_schema_history` table with **correct checksums** — schema history stays valid.

### Run migrations (preferred)

From repo root (Git Bash / WSL):

```bash
bash scripts/flyway-docker.sh migrate
```

PowerShell:

```powershell
.\scripts\flyway-docker.ps1 migrate
```

Other commands: `info`, `validate`, `repair`, `clean` — pass as the first argument to the script.

### Equivalent raw Docker command

```bash
docker run --rm \
  -v "$(pwd):/workspace" \
  -w /workspace \
  flyway/flyway:latest \
  -configFiles=conf/flyway.docker.conf \
  migrate
```

Config: [`conf/flyway.docker.conf`](../../conf/flyway.docker.conf) — same as [`conf/flyway.conf`](../../conf/flyway.conf) except JDBC host is `host.docker.internal` (required inside the Flyway container on Docker Desktop).

Host-only config [`conf/flyway.conf`](../../conf/flyway.conf) keeps `localhost:1337` for tools that run on the host (e.g. a future local Flyway CLI install).

## What not to do

- Do **not** install Flyway CLI unless Kyle explicitly asks.
- Do **not** loop on `npm run migrate` / `npm run migrate:info` when Flyway is missing from `PATH`.
- Do **not** apply SQL by hand to `overpower-postgres` for versioned schema changes — always go through Flyway so `flyway_schema_history` stays consistent.
- Do **not** use `localhost` inside the Flyway Docker container for the DB URL — use `host.docker.internal` (already set in `flyway.docker.conf`).

## `npm run migrate` vs Docker Flyway

[`src/scripts/flywayRunner.ts`](../../src/scripts/flywayRunner.ts) shells out to the **`flyway` binary on PATH**. On Kyle's machine that binary is absent, so:

| Command | Works without host Flyway CLI? |
|---------|------------------------------|
| `bash scripts/flyway-docker.sh migrate` | Yes |
| `npm run migrate` | No (unless Flyway CLI is installed) |

Express dev boot ([`databaseInitialization.ts`](../../src/services/databaseInitialization.ts)) calls `npm run migrate` in non-production. If API startup fails with Flyway not found:

1. Run `bash scripts/flyway-docker.sh migrate` (or `.ps1`) to apply pending SQL.
2. Restart API with `SKIP_MIGRATIONS=true` for that session, **or** install Flyway CLI (only if Kyle wants that).

Production and CI use Flyway inside Docker images where the CLI is already present.

## After migrating

Restart **both** dev servers (root `npm run dev` + `frontend/npm run dev`) and browse **http://localhost:5173**. See [`migrations/.cursorrules`](../../migrations/.cursorrules).
