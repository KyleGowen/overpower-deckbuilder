# Card Database (DBV) — `/data`

Browse, search, filter, and sort the full modern OverPower catalog.

## Controls
- **Search** by card name, character name, or card text including inherent abilities
  (debounced, header bar; `cardMatchesSearchQuery` in `catalogTypeMap`).
- **Type tabs**: Characters, Special Cards, Power Cards, Locations, Missions, Events,
  Aspects, and the Universe types (Advanced/Teamwork/Ally/Training/Basic) — vocab via
  `catalogTypeMap`.
- **Set** dropdown inline with the header search bar (all tabs).
- Sort is fixed per tab: Special Cards by set → character → card name; others by card name.

## Data flow
- Fetches the **full** array for the selected type (`GET /api/v1/catalog/:slug`) — the
  catalog endpoints don't paginate, so filtering, sorting, and pagination are **client
  side** (`Pagination` component).
- Grid uses `CardTile` with `catalogType` for orientation: Characters/Locations/Events are
  landscape (4 per row); other types are portrait (6 per row). Images use `contain` (no crop).
  Tile art uses **progressive** thumb → full-res loading (`CardImage` `progressive` prop).
  Set line shows code + number when available.
- **Foil dedup:** `fetchFoilCardMap` hides foil rows when the base card is in the same tab;
  foil-only rows remain. Base (or foil-only) tiles show a silver ✦ (`has foil` tooltip) when a
  foil variant exists per the map.
- Clicking a tile opens `CardDetailPanel`.

## Add to Deck
- The detail panel exposes an **Add to Deck** action for logged-in users (`addCardToDeck`).
- **GUEST**: the +Deck affordance is **disabled** (product rule — see root `.cursorrules`
  and `docs/current/GUEST_DECK_LESSONS_LEARNED.md`). Do not re-enable without a product
  decision.

## Notes
- Cards legitimately without art show the "No image" placeholder.
- Type tabs use short labels under `.layout-mobile`.
