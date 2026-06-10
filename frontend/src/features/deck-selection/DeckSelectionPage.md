# Deck Selection — `/users/:userId/decks`

Grid of the user's decks (`DeckTile`, `full` variant) with create, search, favorite, and
per-deck actions. Titled "My Decks" (or "Guest Decks").

## Capabilities
- **New Deck**: opens a `SlideOutPanel` form (name + optional description) → `createDeck` →
  navigates to the editor. `createDeck` returns a normalized `{ id, userId }` (the create
  API returns a flat deck row, not the `{ metadata }` list shape).
- **Search** decks by name; favorites sort to the top (`lib/decks/favorites.ts`,
  localStorage).
- **Actions** panel (kebab on a tile): Open/Edit, View (read-only `?readonly=true`), toggle
  favorite, and Delete (with confirm).
- Header shows deck count and total card count.

## Data
- `fetchDecksForUser(isGuest)` → user (`/api/v1/decks`) or guest (`/api/v1/guest/decks`).
- Characters catalog is fetched to compute each tile's max-stat line (`deckMaxStats`).

## Notes
- Guest decks (ids prefixed `guest_`) are session/local only; delete is allowed for guest's
  own session decks.
- The page renders the bare component — `ShelledLayout`/`ProtectedRoute` are applied by the
  router, not here.
