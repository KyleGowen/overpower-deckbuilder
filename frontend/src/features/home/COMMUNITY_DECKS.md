# Community Decks (Home rail)

The Home **"Community Decks"** rail shows the latest **user-shared public decks** — the same pool as the Community page "Community Decks" tab.

## How the Home rail works
- Backend endpoint: `GET /api/v1/community/decks` (optional auth; guests may call it).
- Rules: `is_private = false`, `is_valid = true`, `is_limited = false`; excludes internal guest/tournament accounts.
- Frontend: `fetchCommunityFeed()` in [`src/lib/api/favorites.ts`](../../lib/api/favorites.ts), query key `['decks', 'community-feed', '']` (shared with [`CommunityPage.tsx`](../community/CommunityPage.tsx)).
- Home shows the first **12** tiles from the feed (`HOME_COMMUNITY_RAIL_LIMIT` in [`HomePage.tsx`](./HomePage.tsx)).
- Tiles include `ownerDisplayName` from the API enrichment and render it in the
  `DeckTile` footer lower-left (same placement as the Community page grid).
  Clicking the owner name navigates to that user's public deck list.

## Curated `community_decks` account (separate)
Editorial decks for the internal **`community_decks`** service account are **not** what powers the Home rail anymore. That account is still used for manual curation:

- User id: `COMMUNITY_DECKS_USER_ID` (`00000000-0000-0000-0000-000000000002`) via `GET /api/v1/config/app` → `communityDecksUserId`.
- API: `GET /api/v1/decks/community` — [`fetchCommunityDecks()`](../../lib/api/decks.ts).
- **Import via Cursor skill:** `.cursor/skills/add-community-deck/SKILL.md`
- **CLI:** `npm run import:community-deck -- path/to/export.json`
- **Manual edit:** log in as `community_decks` (password in migration `V279`) and use the deck editor.

## Making your deck appear on Home
1. Open the deck in the editor (owner only).
2. Toggle visibility to **Public** (`is_private = false`).
3. Deck must be **legal** (Standard/Venture) and **not Limited** to appear in the community feed.

Public profile (`/users/:id/decks`) only requires Public; legality/Limited are not filtered there.
