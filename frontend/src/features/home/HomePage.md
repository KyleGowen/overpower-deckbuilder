# Home screen (`/home`)

Landing page after login. Sections, top to bottom:

1. **Hero** — "Welcome to Excelsior" over character art, with an "Explore Decks" CTA.
2. **Recent Updates** — news cards from
   [`src/content/recent-updates.ts`](../../content/recent-updates.ts) (static content).
3. **Community Decks** rail — horizontally scrolling `DeckTile`s backed by
   `GET /api/v1/decks/community` (the shared GUEST account's decks; see
   [`COMMUNITY_DECKS.md`](./COMMUNITY_DECKS.md)).
4. **Tournament Winning Decks** — placeholder section for a future feature.

## Data
- TanStack Query for community decks (`fetchCommunityDecks`).
- Deck tiles use `compact` variant in the rail.

## Notes
- Mock-only/placeholder areas (Tournament rail) are clearly stubbed and must not imply live
  data.
- Responsive: hero and rails stack into a single column under `.layout-mobile`.
