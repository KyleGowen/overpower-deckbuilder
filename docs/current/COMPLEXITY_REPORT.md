# Complexity report (refactor backlog)

This report lists files that would benefit from refactoring later. All milestones (M1–M11) are complete. The tables below reflect the **current** files and line counts after the refactors. Use the "Original detail" section as a reference for what was split.

---

## Todo list (by milestone)

Track progress by checking off items. All items complete.

### Backend (source)

| ID   | Status | Task | Files | Line counts (current) |
|------|--------|------|-------|------------------------|
| **M1** | ☑ | Split app wiring from route/middleware registration | [src/index.ts](../../src/index.ts), [src/routes/index.ts](../../src/routes/index.ts), [src/middleware/setup.ts](../../src/middleware/setup.ts) | 462, 26, 30 |
| **M2** | ☑ | Extract test server and helpers into smaller modules | [src/test-server.ts](../../src/test-server.ts), [src/test-server/](../../src/test-server/) | 6; bootstrap 152, testOnlyRoutes 103, lifecycle 53 |
| **M3** | ☑ | Split deck repository by domain | [PostgreSQLDeckRepository.ts](../../src/database/PostgreSQLDeckRepository.ts), [src/database/deck/](../../src/database/deck/) | 200; deck-crud 531, deck-cards 432, deck-metadata 74, context 41 |
| **M4** | ☑ | Refactor card repository | [PostgreSQLCardRepository.ts](../../src/database/PostgreSQLCardRepository.ts), [src/database/card/](../../src/database/card/) | 180; mappers 267, universe 173, special-power 78, stats 65, mission-event 56, context 46, character 43, location 34, aspect 27 |
| **M5** | ☑ | Split collections repository | [collectionsRepository.ts](../../src/database/collectionsRepository.ts), [src/database/collection/](../../src/database/collection/) | 109; collection-cards 246, card-lookup 140, collection-history 34, collection-crud 31, types 32, context 9 |

### Tests (high line count)

Shared helpers and split test files (current line counts below).

| ID   | Status | Task | Files | Line counts (current) |
|------|--------|------|-------|------------------------|
| **M6** | ☑ | Refactor deck-export-comprehensive tests | tests/unit/deck-export-comprehensive-*.test.ts, [deckExportTestHelpers.ts](../../../tests/helpers/deckExportTestHelpers.ts) | basic 441, enhanced 727, grouping 298, import 40, power-sorting 498, special-attrs 520, types-edge 452; helper 221 |
| **M7** | ☑ | Refactor card-hover-modal tests | tests/unit/card-hover-modal-*.test.ts, [cardHoverModalTestHelpers.ts](../../../tests/helpers/cardHoverModalTestHelpers.ts) | init-show-hide 293, positioning 226, statistics 1565, edge-integration 131; helper 149 |
| **M8** | ☑ | Refactor draw-hand-ko-dimming tests | tests/unit/draw-hand-ko-dimming-*.test.ts, [drawHandKoDimmingTestHelpers.ts](../../../tests/helpers/drawHandKoDimmingTestHelpers.ts) | character-special 219, teamwork-ally 453, power 470, training-universe 213, edge-integration 313; helper 60 |
| **M9** | ☑ | Refactor deck-import-character tests | tests/unit/deck-import-character-*.test.ts | extract-find 645, process 1173, overlay-edge 687 |
| **M10** | ☑ | Refactor deck-import-mission-event tests | tests/unit/deck-import-mission-event-*.test.ts | extract-find 936, process 890 |
| **M11** | ☑ | Refactor remaining large deck-import-* / deck-export-* tests | Other deck-import-* and deck-export-* files | Left as single files; can adopt deckImportTestHelpers / deckExportTestHelpers in a future pass. [deckImportTestHelpers.ts](../../../tests/helpers/deckImportTestHelpers.ts) 61 lines. |

---

## Current files and line counts (post-refactor)

### Source (backend)

| File | Lines |
|------|-------|
| [src/index.ts](../../src/index.ts) | 462 |
| [src/routes/index.ts](../../src/routes/index.ts) | 26 |
| [src/middleware/setup.ts](../../src/middleware/setup.ts) | 30 |
| [src/test-server.ts](../../src/test-server.ts) | 6 |
| [src/test-server/bootstrap.ts](../../src/test-server/bootstrap.ts) | 152 |
| [src/test-server/testOnlyRoutes.ts](../../src/test-server/testOnlyRoutes.ts) | 103 |
| [src/test-server/lifecycle.ts](../../src/test-server/lifecycle.ts) | 53 |
| [src/database/PostgreSQLDeckRepository.ts](../../src/database/PostgreSQLDeckRepository.ts) | 200 |
| [src/database/deck/deck-crud.ts](../../src/database/deck/deck-crud.ts) | 531 |
| [src/database/deck/deck-cards.ts](../../src/database/deck/deck-cards.ts) | 432 |
| [src/database/deck/deck-metadata.ts](../../src/database/deck/deck-metadata.ts) | 74 |
| [src/database/deck/context.ts](../../src/database/deck/context.ts) | 41 |
| [src/database/PostgreSQLCardRepository.ts](../../src/database/PostgreSQLCardRepository.ts) | 180 |
| [src/database/card/mappers.ts](../../src/database/card/mappers.ts) | 267 |
| [src/database/card/universe.ts](../../src/database/card/universe.ts) | 173 |
| [src/database/card/special-power.ts](../../src/database/card/special-power.ts) | 78 |
| [src/database/card/stats.ts](../../src/database/card/stats.ts) | 65 |
| [src/database/card/mission-event.ts](../../src/database/card/mission-event.ts) | 56 |
| [src/database/card/context.ts](../../src/database/card/context.ts) | 46 |
| [src/database/card/character.ts](../../src/database/card/character.ts) | 43 |
| [src/database/card/location.ts](../../src/database/card/location.ts) | 34 |
| [src/database/card/aspect.ts](../../src/database/card/aspect.ts) | 27 |
| [src/database/collectionsRepository.ts](../../src/database/collectionsRepository.ts) | 109 |
| [src/database/collection/collection-cards.ts](../../src/database/collection/collection-cards.ts) | 246 |
| [src/database/collection/card-lookup.ts](../../src/database/collection/card-lookup.ts) | 140 |
| [src/database/collection/collection-history.ts](../../src/database/collection/collection-history.ts) | 34 |
| [src/database/collection/collection-crud.ts](../../src/database/collection/collection-crud.ts) | 31 |
| [src/database/collection/types.ts](../../src/database/collection/types.ts) | 32 |
| [src/database/collection/context.ts](../../src/database/collection/context.ts) | 9 |

### Test helpers

| File | Lines |
|------|-------|
| [tests/helpers/deckExportTestHelpers.ts](../../../tests/helpers/deckExportTestHelpers.ts) | 221 |
| [tests/helpers/cardHoverModalTestHelpers.ts](../../../tests/helpers/cardHoverModalTestHelpers.ts) | 149 |
| [tests/helpers/drawHandKoDimmingTestHelpers.ts](../../../tests/helpers/drawHandKoDimmingTestHelpers.ts) | 60 |
| [tests/helpers/deckImportTestHelpers.ts](../../../tests/helpers/deckImportTestHelpers.ts) | 61 |

### Unit tests (refactored suites)

| File | Lines |
|------|-------|
| deck-export-comprehensive-enhanced.test.ts | 727 |
| deck-export-comprehensive-special-attrs.test.ts | 520 |
| deck-export-comprehensive-power-sorting.test.ts | 498 |
| deck-export-comprehensive-types-edge.test.ts | 452 |
| deck-export-comprehensive-basic.test.ts | 441 |
| deck-export-comprehensive-grouping.test.ts | 298 |
| deck-export-comprehensive-import.test.ts | 40 |
| card-hover-modal-statistics.test.ts | 1565 |
| card-hover-modal-init-show-hide.test.ts | 293 |
| card-hover-modal-positioning.test.ts | 226 |
| card-hover-modal-edge-integration.test.ts | 131 |
| deck-import-character-process.test.ts | 1173 |
| deck-import-character-overlay-edge.test.ts | 687 |
| deck-import-character-extract-find.test.ts | 645 |
| draw-hand-ko-dimming-teamwork-ally.test.ts | 453 |
| draw-hand-ko-dimming-power.test.ts | 470 |
| draw-hand-ko-dimming-edge-integration.test.ts | 313 |
| draw-hand-ko-dimming-training-universe.test.ts | 213 |
| draw-hand-ko-dimming-character-special.test.ts | 219 |
| deck-import-mission-event-extract-find.test.ts | 936 |
| deck-import-mission-event-process.test.ts | 890 |

---

## Original detail (reference)

Pre-refactor line counts and what was split (for historical context).

### Source (backend) — before refactor

| File | Lines (before) | After refactor |
|------|----------------|----------------|
| src/index.ts | ~2,474 | 462; route registration → src/routes/index.ts (26), middleware → src/middleware/setup.ts (30). |
| src/test-server.ts | ~1,746 | 6; bootstrap/lifecycle/helpers → src/test-server/ (bootstrap 152, testOnlyRoutes 103, lifecycle 53). |
| PostgreSQLDeckRepository.ts | ~1,061 | 200; deck CRUD/cards/metadata → src/database/deck/ (deck-crud 531, deck-cards 432, deck-metadata 74, context 41). |
| PostgreSQLCardRepository.ts | ~842 | 180; domain modules → src/database/card/ (mappers, universe, special-power, stats, mission-event, context, character, location, aspect). |
| collectionsRepository.ts | ~738 | 109; → src/database/collection/ (collection-cards 246, card-lookup 140, collection-history 34, collection-crud 31, types 32, context 9). |

### Tests — before refactor

| Suite | Before | After |
|-------|--------|--------|
| deck-export-comprehensive-* | Single large file(s) | 7 files + deckExportTestHelpers (221). |
| card-hover-modal-* | Single large file(s) | 4 files + cardHoverModalTestHelpers (149). |
| draw-hand-ko-dimming-* | Single large file(s) | 5 files + drawHandKoDimmingTestHelpers (60). |
| deck-import-character-* | Single large file(s) | 3 files (extract-find, process, overlay-edge). |
| deck-import-mission-event-* | Single large file(s) | 2 files (extract-find, process). |
| Other deck-import-* / deck-export-* (M11) | — | Left as single files; deckImportTestHelpers (61) available for adoption. |

---

*Generated as part of the codebase hygiene plan. Last updated: March 2025.*
