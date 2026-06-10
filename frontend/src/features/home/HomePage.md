# Home screen (`/home`)

Landing page after login. Sections, top to bottom:

1. **Hero** — "Welcome to Excelsior" over character art, with an "Explore Decks" CTA.
2. **Recent Updates** — news cards from
   `GET /api/v1/recent-updates` (`fetchRecentUpdates`; rows in `recent_updates` table).
   The cards form a single-open accordion: every card is a button
   (`aria-expanded`). On desktop the cards have a fixed height, so clicking a
   card expands it **horizontally only** (the flex tile grows, siblings shrink)
   to reveal its full title and summary — no card ever changes height. Opening a
   card collapses any previously open one. On mobile the row stacks into a column
   and expansion is vertical instead. No modal or navigation.
3. **Community Decks** rail — horizontally scrolling `DeckTile`s backed by
   `GET /api/v1/decks/community` (the shared GUEST account's decks; see
   [`COMMUNITY_DECKS.md`](./COMMUNITY_DECKS.md)).
4. **Tournament Winning Decks** — placeholder section for a future feature.

## Data
- TanStack Query for recent updates (`fetchRecentUpdates`) and community decks (`fetchCommunityDecks`).
- Deck tiles use `compact` variant in the rail.

## Notes
- Mock-only/placeholder areas (Tournament rail) are clearly stubbed and must not imply live
  data.
- Responsive: hero and rails stack into a single column under `.layout-mobile`.
