# Agent orientation (Excelsior Deckbuilder)

**Excelsior** is an Overpower card game database and deck-building web app. Backend is Node/Express/TypeScript in `src/`. **The production frontend is the v2 React SPA in `frontend/`** (React 19 + Vite + TypeScript); Express serves `frontend/dist/index.html` for app routes. Tests live in `tests/` (unit: `tests/unit/`, integration: `tests/integration/`); v2 unit tests import from `frontend/src/`.

Before making changes:

1. **Read [.cursorrules](.cursorrules)** — ship command, testing, lint, GUEST behavior, style guide, infra rules, Flyway migrations, and subagent requirements. `.cursorrules` is the authoritative source for workflow rules.
2. **Local dev URL is `http://localhost:5173`** (Vite in `frontend/`). Run root `npm run dev` (API :8085) **and** `frontend/npm run dev` (UI :5173).
3. **Read [DEAD_CODE_POLICY.md](DEAD_CODE_POLICY.md)** — how to identify and remove unused code (Knip).

Key docs:

- [docs/current/FRONTEND_V2.md](docs/current/FRONTEND_V2.md) — **the v2 React SPA** (`frontend/`): architecture, routing, dev workflow, and how the production build is served. **Start here for frontend work.**
- [STYLE_GUIDE_V2.md](STYLE_GUIDE_V2.md) — visual source of truth for the v2 React SPA. Update it for any v2 UI change.
- [frontend/.cursorrules](frontend/.cursorrules) — conventions for the v2 SPA (component structure, lib map, API client, layout/query patterns).
- [docs/archive/FRONTEND_V1_TO_V2_MIGRATION.md](docs/archive/FRONTEND_V1_TO_V2_MIGRATION.md) — historical v1 → v2 migration story and archived doc index.
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — **legacy** HTTP contract (`src/routes/`, `{ success, data, error }`, session cookies).
- [API_V1.md](API_V1.md) — **`/api/v1`** contract (Bearer JWT, `{ data, meta, errors }`). Update this file whenever v1 paths or envelopes change.
- [API_MIGRATION_CHECKLIST.md](API_MIGRATION_CHECKLIST.md) — migration progress; keep in sync when checking routes off.
- [MIGRATION_ARCHITECTURE.md](MIGRATION_ARCHITECTURE.md) — layers, `/admin` rules, testing, JWT env.
- Layering and v1 route grouping: [`src/api/.cursorrules`](src/api/.cursorrules). When moving logic into `src/api/`, follow [.cursor/skills/api-layer-migration/SKILL.md](.cursor/skills/api-layer-migration/SKILL.md).
- [docs/current/PROJECT_LAYOUT.md](docs/current/PROJECT_LAYOUT.md) — project structure and documentation map.
- [docs/current/LOCAL_FLYWAY.md](docs/current/LOCAL_FLYWAY.md) — local Postgres (`overpower-postgres`, port **1337**) and Flyway via Docker image (no host Flyway CLI).
- [docs/current/DECK_LEGALITY_RULES.md](docs/current/DECK_LEGALITY_RULES.md) — Standard (Venture) vs Skirmish vs in-app Limited; rulebook cites + `DeckValidationService` / client validator mapping and known gaps. **Any-Power:** Training uses **any** primary ≤ cap; Power / Teamwork use **max** for ≥ (see doc §3.1).
- [docs/current/TESTING_GUIDE.md](docs/current/TESTING_GUIDE.md) — how to run unit/integration tests and which Jest configs to use.
- [docs/current/ENDPOINT_HIT_METRICS.md](docs/current/ENDPOINT_HIT_METRICS.md) — `endpoint_hit_counts` async metrics; on startup the app seeds missing route keys at zero and **deletes rows for routes no longer registered** (no per-route migration).
- [docs/current/SIMULATE_KO_FEATURE.md](docs/current/SIMULATE_KO_FEATURE.md) — Simulate KO in [`frontend/src/features/deck-editor/DeckEditorPage.md`](frontend/src/features/deck-editor/DeckEditorPage.md).
- [docs/current/DRAW_HAND_FEATURE.md](docs/current/DRAW_HAND_FEATURE.md) — Draw Hand in [`DrawHandPanel.tsx`](frontend/src/features/deck-editor/DrawHandPanel.tsx) + [`drawHand.ts`](frontend/src/lib/decks/drawHand.ts).
- [docs/current/COLLECTION_CHECKLIST_SOURCE.md](docs/current/COLLECTION_CHECKLIST_SOURCE.md) — Source of truth for collection card names and numbers (OverPower Check List).

## External API hardening

Before touching auth, transport, CORS, caching, or `/api/v1` routes, read [`src/api/.cursorrules`](src/api/.cursorrules) — it has the full Phase 0–3 security index (kill switches, middleware files, per-phase doc links).
