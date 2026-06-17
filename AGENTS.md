# Agent orientation (Excelsior Deckbuilder)

**Excelsior** is an Overpower card game database and deck-building web app. Backend is Node/Express/TypeScript in `src/`; frontend is vanilla JS and HTML in `public/` (no frameworks). Tests live in `tests/` (unit: `tests/unit/`, integration: `tests/integration/`, frontend: `tests/frontend/`).

Before making changes:

1. **Read [.cursorrules](.cursorrules)** — ship command, testing, lint, GUEST behavior, style guide, infra rules, Flyway migrations, and subagent requirements. `.cursorrules` is the authoritative source for workflow rules.
2. **Local dev URL is `http://localhost:5173`** (Vite in `frontend/`). Run root `npm run dev` (API :8085) **and** `frontend/npm run dev` (UI :5173). Do not browse `:8085` for v2 UI work unless testing a production-like build.
3. **Read [DEAD_CODE_POLICY.md](DEAD_CODE_POLICY.md)** — how to identify and remove unused code (Knip, frontend manifest).

Key docs:

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — **legacy** HTTP contract (`src/routes/`, `{ success, data, error }`, session cookies).
- [API_V1.md](API_V1.md) — **`/api/v1`** contract (Bearer JWT, `{ data, meta, errors }`). Update this file whenever v1 paths or envelopes change.
- [API_MIGRATION_CHECKLIST.md](API_MIGRATION_CHECKLIST.md) — migration progress; keep in sync when checking routes off.
- [MIGRATION_ARCHITECTURE.md](MIGRATION_ARCHITECTURE.md) — layers, `/admin` rules, testing, JWT env.
- Layering and v1 route grouping: [`src/api/.cursorrules`](src/api/.cursorrules). When moving logic into `src/api/`, follow [.cursor/skills/api-layer-migration/SKILL.md](.cursor/skills/api-layer-migration/SKILL.md).
- [docs/current/PROJECT_LAYOUT.md](docs/current/PROJECT_LAYOUT.md) — project structure and documentation map.
- [docs/current/DECK_LEGALITY_RULES.md](docs/current/DECK_LEGALITY_RULES.md) — Standard (Venture) vs Skirmish vs in-app Limited; rulebook cites + `DeckValidationService` / client validator mapping and known gaps. **Any-Power:** Training uses **any** primary ≤ cap; Power / Teamwork use **max** for ≥ (see doc §3.1).
- [docs/current/TESTING_GUIDE.md](docs/current/TESTING_GUIDE.md) — how to run unit/integration tests and which Jest configs to use.
- [docs/current/ENDPOINT_HIT_METRICS.md](docs/current/ENDPOINT_HIT_METRICS.md) — `endpoint_hit_counts` async metrics; on startup the app seeds missing route keys at zero and **deletes rows for routes no longer registered** (no per-route migration).
- [docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md](docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md) — Deck editor Card View layout (landscape vs portrait, no frame, bevelled corners); **read before changing card-view CSS** to avoid regressions.
- [MOBILE_DESIGN.md](MOBILE_DESIGN.md) — mobile/dual layout-mode strategy, milestones, refactor log, and **§10** (recent global-nav + DBV All-tab implementation notes for agents).
- **DEV** (Deck Editor View) in **MV**: mobile deck modal list + stats + search + row actions menu — [`public/js/deck-editor-mobile-view.js`](public/js/deck-editor-mobile-view.js), [`public/css/deck-editor-mobile.css`](public/css/deck-editor-mobile.css). **Spec / integration:** [docs/current/DECK_EDITOR_MOBILE_VIEW.md](docs/current/DECK_EDITOR_MOBILE_VIEW.md); tokens summary in [docs/current/STYLE_GUIDE.md](docs/current/STYLE_GUIDE.md) under mobile adaptations.
- **DBV/mobile docs:** See [`MOBILE_DESIGN.md`](MOBILE_DESIGN.md) for the umbrella mobile strategy and per-tab doc index. Per-tab specs live under `docs/current/DBV_*_MOBILE.md`; reusable filter components under `public/js/DBV_*.md`.
- [docs/current/COLLECTION_CHECKLIST_SOURCE.md](docs/current/COLLECTION_CHECKLIST_SOURCE.md) — Source of truth for collection card names and numbers (OverPower Check List); use when correcting or populating card data.
- [docs/current/COLLECTION_VIEW_MOBILE.md](docs/current/COLLECTION_VIEW_MOBILE.md) — Collection tab mobile (`layout-mobile`): list vs detail sheet, fixed sort, delegate activation, `layout-mode-change`, unit tests and coverage limits.
- [docs/current/SIMULATE_KO_FEATURE.md](docs/current/SIMULATE_KO_FEATURE.md) — Simulate KO (client-only deck editor knockout simulation): v2 tile-footer KO in [`frontend/src/features/deck-editor/DeckEditorPage.md`](frontend/src/features/deck-editor/DeckEditorPage.md); legacy draw-hand, Card/List/Tile views, and mobile ⋯ menu in the same doc.

## External API hardening

Before touching auth, transport, CORS, caching, or `/api/v1` routes, read [`src/api/.cursorrules`](src/api/.cursorrules) — it has the full Phase 0–3 security index (kill switches, middleware files, per-phase doc links).
