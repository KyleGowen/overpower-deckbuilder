# Card Database (DBV) — `/data`

Browse, search, filter, and sort the full modern OverPower catalog.

## Controls
- **Search** by card name, character name, or card text including inherent abilities
  (debounced, header bar; `cardMatchesSearchQuery` in `catalogTypeMap`).
- **Type tabs**: Characters, Special Cards, Power Cards, Locations, Missions, Events,
  Aspects, and the Universe types (Advanced/Teamwork/Ally/Training/Basic) — vocab via
  `catalogTypeMap`. **All** is the first tab (default selection remains Characters): text list across every type (no images).
- **Mobile swipe** (`.layout-mobile` only): swipe left/right on card grid, All list, or
  empty content cycles type tabs cyclically in `DBV_TAB_ORDER` (All → Characters → … → Basic → All).
  Same gesture model as deck editor card view (`useHorizontalSwipe`, 50px threshold). Swipe left
  = next tab; swipe right = previous tab. Disabled while `CardDetailPanel` is open. Gestures
  starting on `.db__types`, `.db__header`, `.dbv-filter-rail`, `.pagination`, or form controls
  are ignored (`DBV_SWIPE_BLOCK_SELECTOR`). On tab change: scroll page to top; active chip
  `scrollIntoView` in the type strip.
- **Mobile back / swipe-back** from card detail: `useCardDetailHistory` pushes one React Router
  history entry while `CardDetailPanel` is open so OS back closes the slide-out without leaving
  `/data` (tab, filters, pagination, and scroll preserved). Backdrop/Escape use the same `close`
  helper (`navigate(-1)` pops the dummy entry).
- **Set** dropdown inline with the header search bar (all tabs).
- **Filter rail** (`DbvFilterRail`) visible on per-type tabs only (hidden on **All**).
  Per-tab controls (numeric stat op/value rows, power-type icon strips, function icons,
  mission-set select) are config-driven via `filters/dbvFilterConfig.ts`. Advanced filters
  reset on tab change; search, set, **Has Foil**, and collapse persist. Active constraints
  show as removable chips at the rail end with a **Clear** action (Clear does not reset Has
  Foil). Optional **collapse** via left chevron (default expanded; collapsed state is a thin
  rule with left-aligned chevron-down; collapse preference persists across tab switches).
- **Has Foil** toggle (`.dbv-filter-rail__foil-toggle`, trailing end of filter rail): when
  checked, only cards with a foil variant per `foil_card_map` remain (base rows with a foil
  counterpart or foil-only promos). Uses `matchesHasFoilFilter` / `cardHasFoilVersion` after
  foil dedup. Persists across type tab switches; off restores the full deduped catalog.
- Sort is fixed per tab: all per-type tabs sort by **set** → **set_number**, then tab tiebreakers
  (Special Cards: character with `Any Character` last; Power Cards: power type → value; others: name).
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
  landscape (4 per row desktop); other types are portrait (6 per row desktop). Mobile uses
  one card per row for all types. Images use `contain` (no crop).
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
- Type tab strip (`.db__types`) scrolls horizontally inside the page; page-level sideways pan is blocked by mobile `overflow-x: clip` on the document/shell chain.
- **Mobile swipe between type tabs:** swipe left/right on the card grid, All list, or content area cycles tabs in `DBV_TAB_ORDER` (cyclical wrap). Swipe is disabled while card detail is open. See `useHorizontalSwipe` + `DBV_SWIPE_BLOCK_SELECTOR`.
