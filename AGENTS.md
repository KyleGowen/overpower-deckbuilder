# Agent orientation (Excelsior Deckbuilder)

**Excelsior** is an Overpower card game database and deck-building web app. Backend is Node/Express/TypeScript in `src/`; frontend is vanilla JS and HTML in `public/` (no frameworks). Tests live in `tests/` (unit: `tests/unit/`, integration: `tests/integration/`, frontend: `tests/frontend/`).

Before making changes:

1. **Read [.cursorrules](.cursorrules)** — ship command, testing, lint, GUEST behavior, style guide, infra rules, and **Flyway migrations (local dev)** (`npm run migrate` + restart `npm run dev` after adding/editing `migrations/*.sql`).
2. **Read [DEAD_CODE_POLICY.md](DEAD_CODE_POLICY.md)** — how to identify and remove unused code (Knip, frontend manifest).

Key docs:

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — **legacy** HTTP contract (`src/routes/`, `{ success, data, error }`, session cookies).
- [API_V1.md](API_V1.md) — **`/api/v1`** contract (Bearer JWT, `{ data, meta, errors }`). Update this file whenever v1 paths or envelopes change.
- [API_MIGRATION_CHECKLIST.md](API_MIGRATION_CHECKLIST.md) — migration progress; keep in sync when checking routes off.
- [MIGRATION_ARCHITECTURE.md](MIGRATION_ARCHITECTURE.md) — layers, `/admin` rules, testing, JWT env.
- Layering and v1 route grouping: [`src/api/.cursorrules`](src/api/.cursorrules). When moving logic into `src/api/`, follow [.cursor/skills/api-layer-migration/SKILL.md](.cursor/skills/api-layer-migration/SKILL.md).
- [docs/current/PROJECT_LAYOUT.md](docs/current/PROJECT_LAYOUT.md) — project structure and documentation map.
- [docs/current/TESTING_GUIDE.md](docs/current/TESTING_GUIDE.md) — how to run unit/integration tests and which Jest configs to use.
- [docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md](docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md) — Deck editor Card View layout (landscape vs portrait, no frame, bevelled corners); **read before changing card-view CSS** to avoid regressions.
- [MOBILE_DESIGN.md](MOBILE_DESIGN.md) — mobile/dual layout-mode strategy, milestones, refactor log, and **§10** (recent global-nav + DBV All-tab implementation notes for agents).
- **DEV** (Deck Editor View) in **MV**: mobile deck modal list + stats + search + row actions menu — [`public/js/deck-editor-mobile-view.js`](public/js/deck-editor-mobile-view.js), [`public/css/deck-editor-mobile.css`](public/css/deck-editor-mobile.css). **Spec / integration:** [docs/current/DECK_EDITOR_MOBILE_VIEW.md](docs/current/DECK_EDITOR_MOBILE_VIEW.md); tokens summary in [docs/current/STYLE_GUIDE.md](docs/current/STYLE_GUIDE.md) under mobile adaptations.
- [docs/current/DBV_ASPECTS_MOBILE.md](docs/current/DBV_ASPECTS_MOBILE.md) — Aspects DBV mobile: how filters/caption/actions look; links to unit tests.
- [docs/current/DBV_MISSIONS_MOBILE.md](docs/current/DBV_MISSIONS_MOBILE.md) — Missions DBV mobile: mission-set dropdown, card rows, caption, filters/load; links to unit tests.
- [docs/current/DBV_TRAINING_MOBILE.md](docs/current/DBV_TRAINING_MOBILE.md) — Training DBV mobile: Ally-style type toggles (`type_1`/`type_2`), card rows, caption; links to unit tests.
- [docs/current/DBV_BASIC_UNIVERSE_MOBILE.md](docs/current/DBV_BASIC_UNIVERSE_MOBILE.md) — Basic Universe DBV mobile: Training-style type toggles + Teamwork-style To Use/Bonus strips, card rows, caption; links to unit tests.
- [public/js/DBV_POWER_TYPE_FILTER_STRIP.md](public/js/DBV_POWER_TYPE_FILTER_STRIP.md) — DBV reusable power-type icon strip (`data-dbv-power-strip` presets, `dbv-power-type-filter-strip.js`, `dbv-icon-filter-logic.js`, load order, integration).
- [public/js/DBV_CARD_NAME_FILTER.md](public/js/DBV_CARD_NAME_FILTER.md) — DBV reusable card/name text filters (`data-dbv-name-filter` presets, `dbv-card-name-filter.js`, load order after power strip, `template-loader` re-init; filter math unchanged in `search-filter-functions.js` / `filter-functions.js` / `card-filter-toggles.js`).
- [docs/current/MOBILE_DBV_CARD_IMAGE_TRIES.md](docs/current/MOBILE_DBV_CARD_IMAGE_TRIES.md) — mobile DBV row art + `#imageModal` sizing attempts and troubleshooting (what shipped vs what still looked wrong).
- [docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md](docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md) — **repeatable fix** for mobile DBV image sizing (`max-height: none !important` override); checklist and template selectors for every DBV tab.
- [docs/current/COLLECTION_CHECKLIST_SOURCE.md](docs/current/COLLECTION_CHECKLIST_SOURCE.md) — Source of truth for collection card names and numbers (OverPower Check List); use when correcting or populating card data.
- [docs/current/COLLECTION_VIEW_MOBILE.md](docs/current/COLLECTION_VIEW_MOBILE.md) — Collection tab mobile (`layout-mobile`): list vs detail sheet, fixed sort, delegate activation, `layout-mode-change`, unit tests and coverage limits.
