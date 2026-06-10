# Card Database (DBV) — `/data`

Browse, search, filter, and sort the full modern OverPower catalog.

## Controls
- **Search** by card name (debounced).
- **Type tabs**: Characters, Special Cards, Power Cards, Locations, Missions, Events,
  Aspects, and the Universe types (Advanced/Teamwork/Ally/Training/Basic) — vocab via
  `catalogTypeMap`.
- **Set** and **Rarity** filters, and a **Sort by** (Name / Set / Rarity / Total stats).

## Data flow
- Fetches the **full** array for the selected type (`GET /api/v1/catalog/:slug`) — the
  catalog endpoints don't paginate, so filtering, sorting, and pagination are **client
  side** (`Pagination` component).
- Grid uses `CardTile`; clicking a tile opens `CardDetailPanel`.

## Add to Deck
- The detail panel exposes an **Add to Deck** action for logged-in users (`addCardToDeck`).
- **GUEST**: the +Deck affordance is **disabled** (product rule — see root `.cursorrules`
  and `docs/current/GUEST_DECK_LESSONS_LEARNED.md`). Do not re-enable without a product
  decision.

## Notes
- Cards legitimately without art show the "No image" placeholder.
- Type tabs use short labels under `.layout-mobile`.
