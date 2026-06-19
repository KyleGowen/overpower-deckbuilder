# Home screen (`/home`)

Landing page after login. Sections, top to bottom:

1. **Hero** — "Welcome to Excelsior" over dedicated landscape character art (`src/resources/images/home/home-hero.png` + generated `home-hero-2x.png` via `assetUrl()` / `srcSet`), right-aligned in the welcome tile. Art scales fluidly in the right two-thirds until the hero tile reaches ~2000px wide (≈ 2048px viewport); wider viewports freeze art width and grow the left panel behind copy. Regenerate `home-hero-2x.png` with `npm run generate:home-hero` after editing the master PNG.
2. **Recent Updates** — news cards from
   `GET /api/v1/recent-updates` (`fetchRecentUpdates`; rows in `recent_updates` table).
   The cards form a single-open accordion: every card is a button
   (`aria-expanded`). On desktop the cards have a fixed height, so clicking a
   card expands it **horizontally only** (the flex tile grows, siblings shrink)
   to reveal its full title and summary — no card ever changes height. Opening a
   card collapses any previously open one. On mobile the row stacks into a full-width
   column and expansion is vertical instead. No modal or navigation.
3. **Community Decks** rail — horizontally scrolling `DeckTile`s backed by
   `GET /api/v1/decks/community` (the `community_decks` account's decks only; see
   [`COMMUNITY_DECKS.md`](./COMMUNITY_DECKS.md)).
4. **Tournament Winning Decks** rail — horizontally scrolling `DeckTile`s backed by
   `GET /api/v1/decks/tournament` (the `tournament_decks` account's decks only; see
   [`TOURNAMENT_DECKS.md`](./TOURNAMENT_DECKS.md)).

## Data
- TanStack Query for recent updates (`fetchRecentUpdates`), community decks (`fetchCommunityDecks`),
  and tournament decks (`fetchTournamentDecks`).
- Deck tiles use `compact` variant in the rail.

## Notes
- Responsive: hero and rails stack into a single column under `.layout-mobile`.
