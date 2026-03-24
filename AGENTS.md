# Agent orientation (Excelsior Deckbuilder)

**Excelsior** is an Overpower card game database and deck-building web app. Backend is Node/Express/TypeScript in `src/`; frontend is vanilla JS and HTML in `public/` (no frameworks). Tests live in `tests/` (unit: `tests/unit/`, integration: `tests/integration/`, frontend: `tests/frontend/`).

Before making changes:

1. **Read [.cursorrules](.cursorrules)** — ship command, testing, lint, GUEST behavior, style guide, infra rules, and **Flyway migrations (local dev)** (`npm run migrate` + restart `npm run dev` after adding/editing `migrations/*.sql`).
2. **Read [DEAD_CODE_POLICY.md](DEAD_CODE_POLICY.md)** — how to identify and remove unused code (Knip, frontend manifest).

Key docs:

- [docs/current/PROJECT_LAYOUT.md](docs/current/PROJECT_LAYOUT.md) — project structure and documentation map.
- [docs/current/TESTING_GUIDE.md](docs/current/TESTING_GUIDE.md) — how to run unit/integration tests and which Jest configs to use.
- [docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md](docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md) — Deck editor Card View layout (landscape vs portrait, no frame, bevelled corners); **read before changing card-view CSS** to avoid regressions.
- [MOBILE_DESIGN.md](MOBILE_DESIGN.md) — mobile/dual layout-mode strategy, milestones, and refactor log (`layout-mobile` on `<html>`, `mobile-layout.css`).
- [docs/current/COLLECTION_CHECKLIST_SOURCE.md](docs/current/COLLECTION_CHECKLIST_SOURCE.md) — Source of truth for collection card names and numbers (OverPower Check List); use when correcting or populating card data.
