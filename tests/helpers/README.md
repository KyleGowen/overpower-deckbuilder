# Test helpers

Shared setup, mocks, and utilities for unit and integration tests.

## Deck import

- **deckImportTestHelpers.ts** — DOM HTML, window mocks, and teardown for unit tests that load `public/js/components/deck-import.js` in jsdom. Use `DECK_IMPORT_MINIMAL_HTML`, `applyDeckImportMocks(win)`, and `teardownDeckImportMocks(win)` in `beforeEach`/`afterEach`. Used by `deck-import-*.test.ts` files.

## Card hover modal

- **cardHoverModalTestHelpers.ts** — DOM setup, window mocks, script bootstrap, and `createMockMouseEvent()` for unit tests that load `public/js/card-hover-modal.js` in jsdom. Use `setupCardHoverModalBootstrap()` in `beforeEach` and `teardownCardHoverModalMocks(win)` in `afterEach`. Used by `card-hover-modal-init-show-hide.test.ts`, `card-hover-modal-positioning.test.ts`, `card-hover-modal-edge-integration.test.ts`, and `card-hover-modal-statistics.test.ts`.

## Deck export

- **deckExportTestHelpers.ts** — DOM HTML, window mocks, script bootstrap, and teardown for unit tests that load `public/js/components/deck-export.js` in jsdom. Use `setupDeckExportBootstrap()` in `beforeEach` (returns `exportDeckAsJson`, `getExportedJson`, and mocks) and `teardownDeckExportMocks(win)` in `afterEach`. Used by `deck-export-comprehensive-*.test.ts` files (basic, grouping, types-edge, special-attrs, power-sorting, import, enhanced).

## Draw hand KO dimming

- **drawHandKoDimmingTestHelpers.ts** — Load `public/js/components/simulate-ko.js`, set window globals (`availableCardsMap`, `deckEditorCards`, `koCharacters`), and call `SimulateKO.init()`. Use `setupDrawHandKoDimmingBootstrap()` in `beforeEach` and `teardownDrawHandKoDimmingMocks(win)` in `afterEach`. Used by `draw-hand-ko-dimming-character-special.test.ts`, `draw-hand-ko-dimming-teamwork-ally.test.ts`, `draw-hand-ko-dimming-power.test.ts`, `draw-hand-ko-dimming-training-universe.test.ts`, and `draw-hand-ko-dimming-edge-integration.test.ts`.

## Other

- **apiClient.ts** — HTTP client and auth helpers for integration tests (see TESTING_GUIDE.md).
