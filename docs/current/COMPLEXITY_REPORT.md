# Complexity report (refactor backlog)

This report lists files that would benefit from refactoring later. No code changes were made in this phase. Use it as a backlog for future work.

## Source (backend)

| File | Lines (approx) | Notes |
|------|----------------|-------|
| [src/index.ts](../../src/index.ts) | ~2,474 | App wiring, middleware, routes. **Candidate:** Split route registration into `src/routes/index.ts`, middleware setup into `src/middleware/setup.ts` or similar. |
| [src/test-server.ts](../../src/test-server.ts) | ~1,746 | Test server and helpers. **Candidate:** Extract test helpers and app bootstrap into smaller modules. |
| [src/database/PostgreSQLDeckRepository.ts](../../src/database/PostgreSQLDeckRepository.ts) | ~1,061 | Single large repository. **Candidate:** Split by domain (e.g. deck CRUD vs deck cards vs metadata) or extract query builders. |
| [src/database/PostgreSQLCardRepository.ts](../../src/database/PostgreSQLCardRepository.ts) | ~842 | **Candidate:** Extract query/response mapping or domain slices. |
| [src/database/collectionsRepository.ts](../../src/database/collectionsRepository.ts) | ~738 | Collection-specific logic. **Candidate:** Split read vs write paths or by feature. |

## Tests (high line count)

These are good candidates for shared helpers and splitting by behavior (see Phase 3 consolidation; more deck-import/deck-export files can adopt [tests/helpers/deckImportTestHelpers.ts](../../../tests/helpers/deckImportTestHelpers.ts) or similar):

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
