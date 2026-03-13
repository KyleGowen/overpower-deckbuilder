# Complexity report (refactor backlog)

This report lists files that would benefit from refactoring later. No code changes were made in this phase. Use it as a backlog for future work.

---

## Todo list (by milestone)

Track progress by checking off items. Tackle in milestone order or by priority.

### Backend (source)

| ID   | Status | Task | File | Notes |
|------|--------|------|------|--------|
| **M1** | ☑ | Split app wiring from route/middleware registration | [src/index.ts](../../src/index.ts) (~460 lines) | Done: route registration → `src/routes/index.ts`, middleware setup → `src/middleware/setup.ts`. |
| **M2** | ☑ | Extract test server and helpers into smaller modules | [src/test-server.ts](../../src/test-server.ts) (~1,746 lines) | Done: test server reuses `registerRoutes`; bootstrap and lifecycle in `src/test-server/`. |
| **M3** | ☑ | Split deck repository by domain | [src/database/PostgreSQLDeckRepository.ts](../../src/database/PostgreSQLDeckRepository.ts) (~1,061 lines) | Done: split by domain — deck CRUD → `src/database/deck/deck-crud.ts`, deck cards → `deck-cards.ts`, metadata/auth → `deck-metadata.ts`; shared context and card validation in `deck/`. |
| **M4** | ☑ | Refactor card repository | [src/database/PostgreSQLCardRepository.ts](../../src/database/PostgreSQLCardRepository.ts) (~842 lines) | Done: split by domain — context + mappers in `src/database/card/`; character, location, special-power, mission-event, aspect, universe, stats; facade delegates. |
| **M5** | ☐ | Split collections repository | [src/database/collectionsRepository.ts](../../src/database/collectionsRepository.ts) (~738 lines) | Split read vs write paths or by feature. |

### Tests (high line count)

Adopt shared helpers (e.g. [tests/helpers/deckImportTestHelpers.ts](../../../tests/helpers/deckImportTestHelpers.ts)) and split by behavior where possible.

| ID   | Status | Task | File | Lines (approx) |
|------|--------|------|------|----------------|
| **M6** | ☐ | Refactor deck-export-comprehensive tests | tests/unit/deck-export-comprehensive.test.ts | ~2,976 |
| **M7** | ☐ | Refactor card-hover-modal tests | tests/unit/card-hover-modal.test.ts | ~2,231 |
| **M8** | ☐ | Refactor draw-hand-ko-dimming tests | tests/unit/draw-hand-ko-dimming.test.ts | ~1,568 |
| **M9** | ☐ | Refactor deck-import-character tests | tests/unit/deck-import-character.test.ts | ~1,411 |
| **M10** | ☐ | Refactor deck-import-mission-event tests | tests/unit/deck-import-mission-event.test.ts | ~1,214 |
| **M11** | ☐ | Refactor remaining large deck-import-* / deck-export-* tests | Other deck-import-* and deck-export-* files | 800–1,100 each |

---

## Original detail (reference)

### Source (backend)

| File | Lines (approx) | Notes |
|------|----------------|-------|
| [src/index.ts](../../src/index.ts) | ~2,474 | App wiring, middleware, routes. **Candidate:** Split route registration into `src/routes/index.ts`, middleware setup into `src/middleware/setup.ts` or similar. |
| [src/test-server.ts](../../src/test-server.ts) | ~1,746 | Test server and helpers. **Candidate:** Extract test helpers and app bootstrap into smaller modules. |
| [src/database/PostgreSQLDeckRepository.ts](../../src/database/PostgreSQLDeckRepository.ts) | ~1,061 | Single large repository. **Candidate:** Split by domain (e.g. deck CRUD vs deck cards vs metadata) or extract query builders. |
| [src/database/PostgreSQLCardRepository.ts](../../src/database/PostgreSQLCardRepository.ts) | ~842 | **Done (M4):** Split into `src/database/card/` (context, mappers, domain modules). |
| [src/database/collectionsRepository.ts](../../src/database/collectionsRepository.ts) | ~738 | Collection-specific logic. **Candidate:** Split read vs write paths or by feature. |

### Tests (high line count)

| File | Lines (approx) |
|------|----------------|
| tests/unit/deck-export-comprehensive.test.ts | ~2,976 |
| tests/unit/card-hover-modal.test.ts | ~2,231 |
| tests/unit/draw-hand-ko-dimming.test.ts | ~1,568 |
| tests/unit/deck-import-character.test.ts | ~1,411 |
| tests/unit/deck-import-mission-event.test.ts | ~1,214 |
| Plus other large deck-import-* and deck-export-* files | 800–1,100 each |

---

*Generated as part of the codebase hygiene plan. Last updated: 2025.*
