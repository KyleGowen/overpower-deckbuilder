# Deck Selection — `/users/:userId/decks`

Grid of the user's decks (`DeckTile`, `full` variant) with create, search, and
per-deck actions. Titled "My Decks" (or "Guest Decks").

## Capabilities
- **New Deck**: opens a `SlideOutPanel` form (name + optional description) → `createDeck` →
  navigates to the editor. `createDeck` returns a normalized `{ id, userId }` (the create
  API returns a flat deck row, not the `{ metadata }` list shape).
- **Import Deck**: ghost button between search and **New Deck** opens `ImportDeckPanel`
  (right `SlideOutPanel`, 480px). Paste v2.0 export JSON → client-side parse, card-name
  resolution against all catalog types → **creates a new deck** (`createDeck` + `replaceDeckCards` +
  optional `updateDeckMeta` for `limited` / `reserve_character`) → navigates to the editor. Unlike v1 deck-editor import,
  this does **not** merge into an open deck. Available to GUEST, USER, and ADMIN.
- **Search** decks by name (sorted alphabetically).
- **Actions** panel (kebab on a tile): Open/Edit, View (read-only `?readonly=true`), **Export deck**, and Delete (with confirm).
- Header shows deck count.

## Data
- `fetchDecksForUser(isGuest)` → user (`/api/v1/decks`) or guest (`/api/v1/guest/decks`).
- Characters catalog is fetched to compute each tile's max-stat line (`deckMaxStats`).
- **Export deck** (actions menu) uses `useDeckExportInput` → `fetchDeckFull` + catalog fetches (list tiles only carry preview cards) → reuses [`ExportDeckPanel`](../deck-editor/ExportDeckPanel.tsx) and `buildDeckExportJson`. Available to deck owners from selection (editor export remains read-only-only).

## Notes
- Guest decks (ids prefixed `guest_`) are session/local only; delete is allowed for guest's
  own session decks.
- Import logic lives in `frontend/src/lib/decks/` (`extractCardsFromImportJson`,
  `resolveImportCardIds`, `importDeckFromJson`, `importCatalogLoader`). Contract matches
  [`public/js/components/deck-import.md`](public/js/components/deck-import.md) for parsing and
  name resolution; persistence uses existing deck HTTP APIs (no import endpoint).
- The page renders the bare component — `ShelledLayout`/`ProtectedRoute` are applied by the
  router, not here.
