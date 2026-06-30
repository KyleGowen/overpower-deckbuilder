---
name: add-tournament-deck
description: >-
  Import an exported deck JSON (v2.0) into the internal tournament_decks user
  account for the Home Tournament Winning Decks rail. Use when the user says
  "add tournament deck", "import tournament deck", or pastes exported deck JSON
  to publish to tournament decks.
---

# Add tournament deck

## When to use

- User pastes deck export JSON (v2.0 format from `public/js/components/deck-export.md`)
- User asks to add/import a deck to tournament decks
- User wants to populate the Home "Tournament Winning Decks" rail

## Account

- **Username:** `tournament_decks`
- **Password:** `5101` (local dev; for manual login / deck editor edits only)
- **User id:** `00000000-0000-0000-0000-000000000003` (`TOURNAMENT_DECKS_USER_ID`)

The CLI script uses the database directly and does not need credentials.

## Workflow

Copy and track progress:

```
Add tournament deck:
- [ ] 1. Validate JSON has `name` and `cards` (v2.0 export shape)
- [ ] 2. Save JSON to a temp file (e.g. `tmp/tournament-deck-import.json`)
- [ ] 3. Run `npm run import:tournament-deck -- tmp/tournament-deck-import.json`
- [ ] 4. Report deck id, name, cards added; list any unresolved card names
- [ ] 5. Delete temp file if created for this task
- [ ] 6. (Production) Regenerate Flyway seed with `npm run generate:tournament-deck-migration` when adding to prod deploy
```

Imported decks are **public** automatically (`is_private=false`) so users can open them from the Home rail. For production deploys, prefer including the deck in the generated `V288`-style migration so stable IDs and card rows ship with Flyway.

## Step details

1. **JSON source:** User paste in chat, or an existing `.json` file path they provide.
2. **Save:** Write the JSON to `tmp/tournament-deck-import.json` (create `tmp/` if needed). Ensure valid JSON.
3. **Run import** from repo root (requires local PostgreSQL + migrations applied):

   ```bash
   npm run import:tournament-deck -- tmp/tournament-deck-import.json
   ```

4. **Outcomes:**
   - Exit 0: success — report `deckId`, `deckName`, card count from script output
   - Exit 2: partial success — deck created but some cards unresolved; show the warning list
   - Exit 1: failure — show error message; do not claim success

5. **Verify (optional):** `GET /api/v1/decks/tournament` as an authenticated user should include the new deck near the top (sorted by `updated_at`). Click the tile — deck editor should load (not "Deck not found"); imports are public by default.

## Initial seed (not per-import)

After migration V280, run once locally:

```bash
npm run seed:tournament-decks
```

Idempotent: skips if `tournament_decks` already owns any decks.

## Hard stops

| Condition | Action |
|-----------|--------|
| Invalid JSON | Fix syntax; do not run import |
| Missing `name` or `cards` | Ask user for a complete v2.0 export |
| Database not running | Start local dev DB / `npm run migrate` first |
| All cards unresolved | Report failure; deck may exist empty — investigate export vs catalog |

## Related

- Import implementation: [`scripts/import-tournament-deck.ts`](../../../scripts/import-tournament-deck.ts)
- Seed script: [`scripts/seed-tournament-decks.ts`](../../../scripts/seed-tournament-decks.ts)
- Service: [`src/services/deckExportImport/`](../../../src/services/deckExportImport/)
- Feature doc: [`frontend/src/features/home/TOURNAMENT_DECKS.md`](../../../frontend/src/features/home/TOURNAMENT_DECKS.md)
