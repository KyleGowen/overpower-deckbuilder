# Community Decks (placeholder)

The Home "Community Decks" rail is a **temporary** stand-in until real community decks
exist.

## How it works today
- Source: the shared **GUEST account's** saved decks.
- The guest user id is `GUEST_USER_ID` in
  [`src/constants/guestUser.ts`](../../../../src/constants/guestUser.ts) and is exposed to
  the client as `communityGuestUserId` via `GET /api/v1/config/app`.
- Backend endpoint: `GET /api/v1/decks/community` (in
  [`src/api/http/decks.http.ts`](../../../../src/api/http/decks.http.ts)) returns that
  account's transformed deck list. It is registered **before** `/decks/:id` so the literal
  `community` segment isn't captured as an id, and it requires an authenticated session.
- Frontend: `fetchCommunityDecks()` in
  [`src/lib/api/decks.ts`](../../lib/api/decks.ts), rendered as `DeckTile`s on Home.

## Migrating to real community decks
Replace the source selection in the `/decks/community` handler (e.g. a "published/community"
flag or a dedicated table/owner) and update this doc + `API_V1.md`. The frontend contract
(list of `DeckListItem`) can stay the same.
