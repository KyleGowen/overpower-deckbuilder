# Collection — `/users/:userId/collection`

Track how many of each card you own. Same browse/filter chrome as the Database, plus
per-card quantity steppers and an "Owned only" toggle.

## Controls
- Search (debounced), type tabs, **Owned only** checkbox.
- Header shows `totalOwned` and `uniqueCards`.
- Each `CardTile` has a footer `QuantityStepper` and an `x{n}` owned badge; unowned cards
  are dimmed. The detail panel also exposes a stepper.

## Data flow (`useCollection`)
Unifies two backends:
- **Logged-in**: server collection (`GET /api/v1/collections/me/cards`, Query-cached).
- **Guest**: `localStorage` via `guestCollection.ts` (re-renders on
  `guest-collection-change`).

### Add vs update (important)
The PUT endpoint (`/…/:cardId`) only updates a card **already** in the collection (404
otherwise). So `setQuantity`:
- **POSTs** (`addCollectionCard`) when the card isn't owned yet (`current <= 0`),
- **PUTs** (`setCollectionQuantity`) once it is — including quantity `0` to remove.

## Notes
- Catalog is fetched per type and paginated client-side, like the Database.
