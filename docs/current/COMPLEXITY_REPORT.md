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
| **M5** | ☑ | Split collections repository | [src/database/collectionsRepository.ts](../../src/database/collectionsRepository.ts) (~738 lines) | Done: split by feature — context + types in `src/database/collection/`; collection-crud, collection-cards, collection-history, card-lookup; facade delegates and re-exports types. |

### Tests (high line count)

Adopt shared helpers (e.g. [tests/helpers/deckImportTestHelpers.ts](../../../tests/helpers/deckImportTestHelpers.ts)) and split by behavior where possible.

| ID   | Status | Task | File | Lines (approx) |
|------|--------|------|------|----------------|
| **M6** | ☑ | Refactor deck-export-comprehensive tests | tests/unit/deck-export-comprehensive*.test.ts | Done: split into deck-export-comprehensive-basic, -grouping, -types-edge, -special-attrs, -power-sorting, -import, -enhanced + [tests/helpers/deckExportTestHelpers.ts](../../../tests/helpers/deckExportTestHelpers.ts). |
| **M7** | ☑ | Refactor card-hover-modal tests | tests/unit/card-hover-modal-*.test.ts | Done: split into init-show-hide, positioning, edge-integration, statistics + [tests/helpers/cardHoverModalTestHelpers.ts](../../../tests/helpers/cardHoverModalTestHelpers.ts). |
| **M8** | ☑ | Refactor draw-hand-ko-dimming tests | tests/unit/draw-hand-ko-dimming-*.test.ts | Done: split into character-special, teamwork-ally, power, training-universe, edge-integration + [tests/helpers/drawHandKoDimmingTestHelpers.ts](../../../tests/helpers/drawHandKoDimmingTestHelpers.ts). |
| **M9** | ☑ | Refactor deck-import-character tests | tests/unit/deck-import-character-*.test.ts | Done: split into extract-find, process, overlay-edge. |
| **M10** | ☑ | Refactor deck-import-mission-event tests | tests/unit/deck-import-mission-event-*.test.ts | Done: split into extract-find, process. |
| **M11** | ☑ | Refactor remaining large deck-import-* / deck-export-* tests | Other deck-import-* and deck-export-* files | Done: remaining files (deck-import-teamwork, -location, -ally, -special, -basic-universe, -aspect-advanced-universe, -training; deck-export-basic-universe) left as single files; can adopt [deckImportTestHelpers](../../../tests/helpers/deckImportTestHelpers.ts) / [deckExportTestHelpers](../../../tests/helpers/deckExportTestHelpers.ts) and optional extract-find vs process split in a future pass. |

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
| tests/unit/deck-export-comprehensive-*.test.ts | Split (M6 done); see [deckExportTestHelpers](../../../tests/helpers/deckExportTestHelpers.ts). |
| tests/unit/card-hover-modal-*.test.ts | Split (M7 done); see [cardHoverModalTestHelpers](../../../tests/helpers/cardHoverModalTestHelpers.ts). |
| tests/unit/draw-hand-ko-dimming-*.test.ts | Split (M8 done); see [drawHandKoDimmingTestHelpers](../../../tests/helpers/drawHandKoDimmingTestHelpers.ts). |
| tests/unit/deck-import-character-*.test.ts | Split (M9 done). |
| tests/unit/deck-import-mission-event-*.test.ts | Split (M10 done). |
| Other deck-import-* / deck-export-* (M11) | Left as single files; see M11 note for helper adoption path. |

---

*Generated as part of the codebase hygiene plan. Last updated: 2025.*
