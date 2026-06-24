# Collection — `/users/:userId/collection`

Track how many of each card you own. Same browse/filter chrome as the Database, plus
per-card quantity steppers and an "Owned only" toggle.

## Controls
- Search (debounced), type tabs (**All** first; default **All**), set dropdown, **Owned only** checkbox.
- Search uses `cardMatchesSearchQuery` (same as DBV). The keyword **`foil`** filters to foil printing rows only (`is_foil = true`); combine with name/text (e.g. `foil tarzan`). Distinct from DBV **Has Foil** checkbox (foil-capable base cards).
- Header shows `totalOwned` and `uniqueCards`.
- Per-type tabs: `CardTile` grid with footer `QuantityStepper`; unowned cards are dimmed.
- **All** tab: `CatalogAllList` spread grid rows (`#`, type, name, set badge, stepper);
  fixed-width `#` and type columns for aligned skimming; mobile type badges use compact
  abbreviations (`Spc`, `Chr`, …). Special and Advanced Universe rows prefix the linked character on **desktop** only
  (`Anubis - Book of the Dead`); mobile uses the card name alone to save width.
  checklist sort (`compareAllCatalogCards`). Detail panel also exposes a stepper and
  **Is Foil** Yes/No (`card.is_foil` via `isFoilCard`).

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
- Per-type catalog is fetched per tab; **All** merges all 12 slugs client-side. Pagination
  is client-side (24 tiles per type tab, 48 list rows on All).
