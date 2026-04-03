# API layer migration — reference (evolving)

## Doc map

| Doc | Use |
|-----|-----|
| [API_DOCUMENTATION.md](../../../API_DOCUMENTATION.md) | Legacy `/api/...` |
| [API_V1.md](../../../API_V1.md) | `/api/v1` only |
| [API_MIGRATION_CHECKLIST.md](../../../API_MIGRATION_CHECKLIST.md) | Progress |
| [MIGRATION_ARCHITECTURE.md](../../../MIGRATION_ARCHITECTURE.md) | Layers, JWT, testing |
| [src/api/.cursorrules](../../../src/api/.cursorrules) | Agent rules |

## Conventions

- **`src/api/services/`** — HTTP-agnostic; inject repositories.
- **`src/api/http/*.http.ts`** — Express only; call services; v1 envelope.
- **`src/routes/`** — Legacy wire-up only for routes **not** yet migrated to v1. After migration, **remove** the legacy handler and move callers to **`/api/v1/...`**.

## API_V1.md — per-endpoint template

Paste under the right TOC section (auth, dbv-catalog, …):

```markdown
### \`METHOD /api/v1/...\`

**Auth:** None | Bearer access token.

**Request model:** \`src/api/http/models/...\`

**Response 200:** \`data\` shape …

**Response 4xx/5xx:** \`errors[]\` entries (no raw reflected input).

**Implementation:** \`src/api/http/<file>.http.ts\` · service \`src/api/services/...\`
```

## Legacy API_DOCUMENTATION.md — implementation line

```markdown
**API module:** `src/api/<path>.ts` · **Route wiring:** `src/routes/<file>.ts`
```

## Test checklist snippet (per `*.http.ts`)

- [ ] Unit: every route + success + auth/validation/403/500 branches (mocked deps)
- [ ] Integration: ≥1 Supertest case against real app wiring (`src/test-server`)
- [ ] **Cursor browser** on **local `npm run dev`**: prove the route (or the UI flow that calls it) works end-to-end—see skill loop **step 11**

## Changelog (skill + layer)

| Date | Note |
|------|------|
| 2026-04-03 | Initial skill: doc + Cursor context updates required per migration. |
| 2026-04-03 | API_V1.md + checklist + MIGRATION_ARCHITECTURE; v1 loop + testing gates. |
| 2026-04-03 | Policy: after v1 ships for a route, **remove** legacy handler; update all clients + docs; v1 envelope + `catalog-v1-envelope.js` for list payloads. |
| 2026-04-03 | P0: `GET /api/v1/catalog/special-cards` added; legacy `GET /api/special-cards` removed (same pattern as characters/locations). |
| 2026-04-03 | Loop step 10: when migration work is complete, **restart `npm run dev`** (after `npm run migrate` if SQL changed); aligns with repo `.cursorrules` / `AGENTS.md`. |
| 2026-04-03 | Loop step 11: **always** verify migrated/changed routes with **Cursor IDE browser** against the local server (MCP `cursor-ide-browser`); tests alone are not enough. |
| 2026-04-03 | P0: `GET /api/v1/catalog/missions` added; legacy `GET /api/missions` removed (same pattern as other catalog lists). |
| 2026-04-03 | P0: `GET /api/v1/catalog/events` added; legacy `GET /api/events` removed. |
