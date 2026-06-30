# Home screen (`/home`)

Landing page after login. Sections, top to bottom:

1. **Hero** — "Welcome to Excelsior" over dedicated landscape character art (`src/resources/images/home/home-hero.png` + generated `home-hero-2x.png` via `assetUrl()` / `srcSet`), right-aligned in the welcome tile. Art scales fluidly in the right two-thirds until the hero tile reaches ~2000px wide (≈ 2048px viewport); wider viewports freeze art width and grow the left panel behind copy. Regenerate `home-hero-2x.png` with `npm run generate:home-hero` after editing the master PNG. CTA is a compact accent-outline pill (`btn btn-ghost home__hero-cta`), not a filled primary button.
2. **Recent Updates** — news cards from
   `GET /api/v1/recent-updates` (`useRecentUpdates`; rows in `recent_updates` table).
   Shows the **3 newest** tiles (`HOME_RECENT_UPDATES_LIMIT`). When more than 3 exist,
   a **View All** link in the section header navigates to [`/home/updates`](./HomeUpdatesPage.md).
   Tiles use shared `RecentUpdateTile` / `RecentUpdatesList` (`layout="rail"`). The cards
   form a single-open accordion: every card is a button (`aria-expanded`). On desktop the
   cards have a fixed height, so clicking a card expands it **horizontally only** (the flex
   tile grows, siblings shrink) to reveal its full title and summary — no card ever changes
   height. Opening a card collapses any previously open one. On mobile the row stacks into
   a full-width column and expansion is vertical instead. No modal or navigation from the tile.
3. **Community Decks** rail — horizontally scrolling `DeckTile`s backed by
   `GET /api/v1/community/decks` (user-shared public legal decks; first 12 from
   the feed). Same data as the Community page Community tab — see
   [`COMMUNITY_DECKS.md`](./COMMUNITY_DECKS.md). Tiles show the owner's display
   name in the footer lower-left (click → `/users/:userId/decks`); tile body
   click opens the deck readonly in the editor.
4. **Tournament Winning Decks** rail — horizontally scrolling `DeckTile`s backed by
   `GET /api/v1/decks/tournament` (the `tournament_decks` account's decks only; see
   [`TOURNAMENT_DECKS.md`](./TOURNAMENT_DECKS.md)).

## Data
- TanStack Query for recent updates (`useRecentUpdates`), community feed (`fetchCommunityFeed`,
  key `['decks', 'community-feed', '']`), and tournament decks (`fetchTournamentDecks`).
- Deck tiles use `compact` variant in the rail.

## Notes
- Responsive: hero and rails stack into a single column under `.layout-mobile`.
