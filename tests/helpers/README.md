# Test helpers

Shared setup, mocks, and utilities for unit and integration tests.

## Active helpers

- **apiClient.ts** — HTTP client and auth helpers for integration tests (see [`docs/current/TESTING_GUIDE.md`](../../docs/current/TESTING_GUIDE.md)).

## Removed with v1 UI

The following jsdom helpers loaded scripts from `public/js/` and were deleted when the legacy frontend was removed:

- **deckImportTestHelpers.ts** — was used by `deck-import-*.test.ts`
- **deckExportTestHelpers.ts** — was used by `deck-export-comprehensive-*.test.ts`
- **cardHoverModalTestHelpers.ts** — was used by `card-hover-modal-*.test.ts`
- **drawHandKoDimmingTestHelpers.ts** — was used by `draw-hand-ko-dimming-*.test.ts`

v2 deck import/export, images, and legality tests live under **`tests/unit/frontend-v2/`** and import from `frontend/src/` directly.
