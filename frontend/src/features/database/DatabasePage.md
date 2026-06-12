# Card Database (DBV) — `/data`

Browse, search, filter, and sort the full modern OverPower catalog.

## Controls
- **Search** by card name, character name, or card text including inherent abilities
  (debounced, header bar; `cardMatchesSearchQuery` in `catalogTypeMap`).
- **Type tabs**: Characters, Special Cards, Power Cards, Locations, Missions, Events,
  Aspects, and the Universe types (Advanced/Teamwork/Ally/Training/Basic) — vocab via
  `catalogTypeMap`. **All** is the last tab: text list across every type (no images).
- **Set** dropdown inline with the header search bar (all tabs).
- **Filter rail** (`DbvFilterRail`) visible on per-type tabs only (hidden on **All**).
  Per-tab controls (numeric stat op/value rows, power-type icon strips, function icons,
  mission-set select) are config-driven via `filters/dbvFilterConfig.ts`. Advanced filters
  reset on tab change; search and set persist. Active constraints show as removable chips
  at the rail end with a **Clear** action. Optional **collapse** via left chevron (default
  expanded; collapsed state is a thin rule with left-aligned chevron-down; collapse
  preference persists across tab switches).
- Sort is fixed per tab: Special Cards by set → character → card name; others by card name.
  **All** tab: set → foil tier → set_number → name (`compareAllCatalogCards`).

## All tab
- Merges all 12 catalog slugs (`useAllCatalogCards`); foil dedup per slug like per-type tabs.
- Renders `CatalogAllList` (spread grid rows: `#`, name, type/set badges; 48 per page). Row
  click opens `CardDetailPanel` with the card's real catalog type. No inline deck/collection
  buttons on rows.

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
