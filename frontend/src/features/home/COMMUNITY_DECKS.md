# Community Decks

The Home "Community Decks" rail shows decks owned by the internal **`community_decks`** user account.

## How it works
- Source user: `community_decks` (`COMMUNITY_DECKS_USER_ID` in
  [`src/constants/communityDecksUser.ts`](../../../../src/constants/communityDecksUser.ts)), exposed to the client as
  `communityDecksUserId` via `GET /api/v1/config/app`.
- Backend endpoint: `GET /api/v1/decks/community` (in
  [`src/api/http/decks.http.ts`](../../../../src/api/http/decks.http.ts)) returns that account's deck list sorted by
  `updated_at` descending. Registered **before** `/decks/:id` so the literal `community` segment isn't captured as an id.
  Requires an authenticated session.
- Frontend: `fetchCommunityDecks()` in [`src/lib/api/decks.ts`](../../lib/api/decks.ts), filtered to
  `communityDecksUserId` on Home, rendered as `DeckTile`s.

## Managing community decks
- **Import via Cursor skill:** `.cursor/skills/add-community-deck/SKILL.md` — paste exported deck JSON v2.0.
- **CLI:** `npm run import:community-deck -- path/to/export.json`
- **Manual edit:** log in as `community_decks` (password in migration `V278`) and use the normal deck editor.
