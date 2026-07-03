# Frontend migration: v1 vanilla JS → v2 React SPA

## Timeline

1. **v1 (legacy):** Single-page app in `public/` — vanilla HTML/CSS/JS, `layout-mobile` at 900px, Express served `public/index.html` for all routes.
2. **v2 build-out:** React 19 + Vite + TypeScript SPA in `frontend/`, served from `frontend/dist/` when built.
3. **Cutover:** Production Express routes prefer `frontend/dist/index.html`; v1 remained as rollback via `EXCELSIOR_DISABLE_SPA=1` and Docker `COPY public/`.
4. **v1 removal (current):** Rollback path retired. `public/` deleted; only the v2 SPA is served.

## What was removed

- Entire `public/` tree (HTML shells, CSS, JS, components, templates)
- `EXCELSIOR_DISABLE_SPA` and legacy fallback in `src/routes/spaIndexPath.ts`
- Static mounts for `/public/` and root `express.static('public')`
- `GET /js/app-config.js` (replaced by `GET /api/v1/config/app`)
- ~140 v1 unit/frontend/integration tests and v1-only agent rules

## What replaced it

| Concern | v2 location |
|---------|-------------|
| Visual source of truth | [`STYLE_GUIDE_V2.md`](../../STYLE_GUIDE_V2.md) |
| Architecture / dev workflow | [`docs/current/FRONTEND_V2.md`](../current/FRONTEND_V2.md) |
| Mobile layout | `LayoutModeProvider` (900px) in `frontend/src/lib/layout/` |
| Deck import/export JSON contract | [`docs/current/DECK_IMPORT.md`](../current/DECK_IMPORT.md), [`DECK_EXPORT.md`](../current/DECK_EXPORT.md) |
| Feature specs | `frontend/src/features/*/*.md` |

## Archived v1 documentation

Historical specs live in this `docs/archive/` folder:

- [`STYLE_GUIDE.md`](STYLE_GUIDE.md) — v1 visual guide
- [`MOBILE_DESIGN.md`](MOBILE_DESIGN.md) — v1 mobile strategy and index
- [`DECK_EDITOR_MOBILE_VIEW.md`](DECK_EDITOR_MOBILE_VIEW.md), [`DECK_EDITOR_CARD_VIEW_LAYOUT.md`](DECK_EDITOR_CARD_VIEW_LAYOUT.md)
- [`DBV_ARCHITECTURE.md`](DBV_ARCHITECTURE.md), `DBV_*_MOBILE.md`
- [`FRONTEND_SCRIPT_MANIFEST.md`](FRONTEND_SCRIPT_MANIFEST.md) — v1 script load order
- Other v1 per-tab and debugging notes in this directory

## Local development after removal

- **Browse:** `http://localhost:5173` (Vite dev server)
- **API:** Express on `:8085` (proxied by Vite)
- Express alone requires `frontend/dist/` (run `npm --prefix frontend run build`) — there is no HTML fallback without a build.
