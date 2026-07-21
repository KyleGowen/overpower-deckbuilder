---
name: start
description: >-
  Starts the Excelsior v2 dev stack (Express API :8085 + Vite SPA :5173 with LAN).
  Migrations run automatically when the API starts (same as npm run dev). Returns
  formatted /health on success, or API startup log on migration/startup failure.
  Use when the user says "/start", "start dev server", "start the dev servers",
  or wants local dev at http://localhost:5173.
disable-model-invocation: true
---

# /start — local dev stack

## Meaning

When the user says **`/start`**, start the **v2 dev stack** so the app is available at **`http://localhost:5173`** and on **LAN** (Vite `host: true`), and verify.

**Migrations are not a separate step for `/start`.** They run automatically when the Express API starts — same as normal `npm run dev`:

```
npm run dev → src/index.ts → DatabaseInitializationService.initializeDatabase()
  → npm run migrate → flyway -configFiles=conf/flyway.conf migrate
```

**Local Flyway CLI is not installed on Kyle's machine.** If API boot fails because `flyway` is missing from `PATH`, apply pending SQL with `bash scripts/flyway-docker.sh migrate` (see [`docs/current/LOCAL_FLYWAY.md`](docs/current/LOCAL_FLYWAY.md)) — do **not** install Flyway CLI or loop on `npm run migrate`. Then restart API with `SKIP_MIGRATIONS=true` if needed.

See [`src/services/databaseInitialization.ts`](src/services/databaseInitialization.ts). Skip only when `SKIP_MIGRATIONS=true`.

**User-facing output** (exactly one of these — never both):

| Outcome | Output |
|---------|--------|
| API + Vite **healthy** | Formatted `/health` check (step 5) |
| API **never becomes healthy** (migration or startup failure) | Full **API `npm run dev` terminal log** for diagnosis — **do not start Vite** if API is still down |

Browse URL (success only): **`http://localhost:5173`** (not `:8085`). API health: **`http://localhost:8085/health`**.

## Two processes required

| Process | Directory | Command | Port |
|---------|-----------|---------|------|
| Express API | repo root | `npm run dev` | `127.0.0.1:8085` |
| Vite SPA | `frontend/` | `npm run dev` | `:5173` (localhost + LAN) |

**Start API first.** Vite proxies `/api` to the API — only start Vite after the API health probe passes (migrations finished during API boot).

## Workflow

```
/start progress:
- [ ] 1. Inspect running terminals
- [ ] 2. Probe API + Vite
- [ ] 3. Start or restart API (background) — migrations run on boot
- [ ] 4. Wait for API healthy (or fail with API terminal log)
- [ ] 5. Start or restart Vite if needed (background)
- [ ] 6. Wait for Vite, then print health check (success only)
```

### 1. Inspect terminals

Check the `terminals/` folder for existing `npm run dev` in **repo root** and **`frontend/`**.

### 2. Probe before starting

From repo root:

```bash
curl -sf http://localhost:8085/health >/dev/null && echo API_OK || echo API_DOWN
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
```

Expect Vite HTTP **200** (or another successful Vite dev response).

### 3. Start or restart API

If API probe fails, or a fresh start is needed, start Express in the **background** (`block_until_ms: 0`) from **repo root**:

```bash
npm run dev
```

Do **not** run `npm run migrate` separately — that duplicates what the API already does on startup and may use a different shell `PATH` than the running dev process.

| Situation | Action |
|-----------|--------|
| API probe fails | Start (or restart) `npm run dev` at repo root |
| API probe passes and no restart needed | Skip to step 5 for Vite only |

### 4. Wait for API (migrations run here)

Poll `curl -sf http://localhost:8085/health` (up to ~90s, 2s interval) while watching the **API terminal log** for `🔄 Running Flyway migrations` / `✅ Database initialization completed`.

**If API never becomes healthy:**

1. **Stop.** Do **not** start Vite.
2. Return the **full API terminal output** (stdout + stderr) as the primary response — migration errors, Flyway failures, DB connection errors, and stack traces appear here.
3. Do **not** run the health check or claim success.

### 5. Start or restart Vite

**Only after API health passes.** From `frontend/`:

```bash
npm run dev
```

| Situation | Action |
|-----------|--------|
| Vite probe fails | Start (or restart) `npm run dev` in `frontend/` |
| Vite probe passes | Skip restart |

### 6. Output on success (required)

**Only when API and Vite are both healthy.** The user-facing response must be the health check output.

From repo root:

```bash
bash scripts/dev-health-check.sh
```

Fallback if `bash`/`jq` unavailable:

```bash
curl -s http://localhost:8085/health | jq -r -f scripts/dev-health-check.jq
```

After the health block, you may add one short line with URLs:

- Local: `http://localhost:5173`
- LAN: read the Vite terminal **Network** line (e.g. `http://192.168.x.x:5173`)

### Output on API/migration failure (required)

**When the API never passes `/health` after start:**

1. **Do not** start Vite.
2. Return the **full API `npm run dev` terminal log** verbatim for diagnosis.
3. Do **not** run the formatted health check.

## Hard stops

| Condition | Action |
|-----------|--------|
| API never healthy (migration or boot failure) | Output = API terminal log. **Do not** start Vite. **Do not** health check. |
| Port already in use | Identify owning process; do not stack duplicate servers |
| Vite never returns 200 after API is healthy | Show Vite terminal error |
| `jq` missing | Raw `curl -s http://localhost:8085/health` and note formatting skipped |

## Related rules

- [`src/services/databaseInitialization.ts`](src/services/databaseInitialization.ts) — auto-migrate on API boot
- [`.cursor/rules/v2-dev-server.mdc`](.cursor/rules/v2-dev-server.mdc) — two-process dev stack
- [`.cursor/rules/local-dev-lan.mdc`](.cursor/rules/local-dev-lan.mdc) — LAN URL expectations
- [docs/current/FRONTEND_V2.md](docs/current/FRONTEND_V2.md) — full v2 dev workflow
