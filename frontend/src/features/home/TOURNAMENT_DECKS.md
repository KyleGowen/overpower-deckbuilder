# Tournament Winning Decks

The Home "Tournament Winning Decks" rail shows decks owned by the internal **`tournament_decks`** user account.

## How it works
- Source user: `tournament_decks` (`TOURNAMENT_DECKS_USER_ID` in
  [`src/constants/tournamentDecksUser.ts`](../../../../src/constants/tournamentDecksUser.ts)), exposed to the client as
  `tournamentDecksUserId` via `GET /api/v1/config/app`.
- Backend endpoint: `GET /api/v1/decks/tournament` (in
  [`src/api/http/decks.http.ts`](../../../../src/api/http/decks.http.ts)) returns that account's deck list sorted by
  `updated_at` descending. Registered **before** `/decks/:id` so the literal `tournament` segment isn't captured as an id.
  Requires an authenticated session.
- Frontend: `fetchTournamentDecks()` in [`src/lib/api/decks.ts`](../../lib/api/decks.ts), filtered to
  `tournamentDecksUserId` on Home, rendered as `DeckTile`s.

## Managing tournament decks
- **Initial seed:** `npm run seed:tournament-decks` (fixtures in `data/seeds/tournament-decks/`)
- **Import via Cursor skill:** `.cursor/skills/add-tournament-deck/SKILL.md` — paste exported deck JSON v2.0
- **CLI:** `npm run import:tournament-deck -- path/to/export.json`
- **Manual edit:** log in as `tournament_decks` (password in migration `V280`) and use the normal deck editor
