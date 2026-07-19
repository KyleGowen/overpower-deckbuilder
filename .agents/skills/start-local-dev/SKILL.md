---
name: start-local-dev
description: Start or verify the Excelsior local development environment. Use when the user says /start, asks to start the local server, run local dev, bring up the app, verify localhost, or make sure the health check passes for /Users/kyle/cursored. Starts/reuses the root API on 8085, starts/reuses the Vite frontend on 5173, and verifies /health.
---

# Start Local Dev

## Workflow

Use this skill for `/start` in the Excelsior repo.

1. Run `scripts/start_local_dev.py` from this skill folder with the repo root as the working directory or first argument.
2. If sandboxed startup fails with `EPERM`, rerun the same command with approval/escalation. The API needs local Postgres access on `localhost:1337`; Vite binds `0.0.0.0:5173`.
3. Report:
   - API URL: `http://localhost:8085`
   - Frontend URL: `http://localhost:5173`
   - `/health` status, database status/latency, response latency, latest git commit, and latest migration.

Do not use basic port checks as the final API verification. Always use `http://localhost:8085/health`.

## Notes

- Root `npm run dev` starts the Express API and runs thumbnail generation first.
- `frontend/npm run dev` starts the Vite SPA.
- If a server is already responding, leave it alone and verify it.
- Keep long-running server sessions open when the user asked to start local dev.
