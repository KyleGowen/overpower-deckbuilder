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
- **Production seed (Flyway):** `migrations/V288__Seed_tournament_decks.sql` seeds all decks owned by the local `tournament_decks` user at generation time (currently 7). Idempotent by deck name. Regenerate after local adds/edits with `npm run generate:tournament-deck-migration`.
- **Local seed (Node):** `npm run seed:tournament-decks` imports JSON fixtures from `data/seeds/tournament-decks/` (2 files; skips if `tournament_decks` already owns any deck)
- **Import via Cursor skill:** `.cursor/skills/add-tournament-deck/SKILL.md` — paste exported deck JSON v2.0
- **CLI:** `npm run import:tournament-deck -- path/to/export.json` — imports are **public** (`is_private=false`) automatically
- **Manual edit:** log in as `tournament_decks` (password in migration `V280`) and use the normal deck editor

### Visibility (public vs private)

Curated tournament decks must be **public** so users can open them from the Home rail (`GET /api/v1/decks/:id/full`). The tournament list endpoint returns all `tournament_decks` decks regardless of privacy, but the detail endpoint blocks private decks for non-owners.

- **Flyway seeds** (`V288`, etc.) insert with `is_private = FALSE`.
- **CLI/skill imports** (`import:tournament-deck`, `seed:tournament-decks`) set `is_private=false` via `importDeckFromExport`.
- **Repair:** `migrations/V289__Fix_tournament_deck_visibility.sql` flips any still-private `tournament_decks` decks public (fixes decks imported before the auto-public behavior).

For production, prefer regenerating `V288` via `npm run generate:tournament-deck-migration` after local edits so new environments get stable deck IDs and card rows.
