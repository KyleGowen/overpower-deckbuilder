---
name: add-community-deck
description: >-
  Import an exported deck JSON (v2.0) into the internal community_decks user
  account for the Home Community Decks rail. Use when the user says "add community
  deck", "import community deck", or pastes exported deck JSON to publish to
  community decks.
---

# Add community deck

## When to use

- User pastes deck export JSON (v2.0 format from `public/js/components/deck-export.md`)
- User asks to add/import a deck to community decks
- User wants to populate the Home "Community Decks" rail

## Account

- **Username:** `community_decks`
- **Password:** `5101` (local dev; for manual login / deck editor edits only)
- **User id:** `00000000-0000-0000-0000-000000000002` (`COMMUNITY_DECKS_USER_ID`)

The CLI script uses the database directly and does not need credentials.

## Workflow

Copy and track progress:

```
Add community deck:
- [ ] 1. Validate JSON has `name` and `cards` (v2.0 export shape)
- [ ] 2. Save JSON to a temp file (e.g. `tmp/community-deck-import.json`)
- [ ] 3. Run `npm run import:community-deck -- tmp/community-deck-import.json`
- [ ] 4. Report deck id, name, cards added; list any unresolved card names
- [ ] 5. Delete temp file if created for this task
```

## Step details

1. **JSON source:** User paste in chat, or an existing `.json` file path they provide.
2. **Save:** Write the JSON to `tmp/community-deck-import.json` (create `tmp/` if needed). Ensure valid JSON.
3. **Run import** from repo root (requires local PostgreSQL + migrations applied):

   ```bash
   npm run import:community-deck -- tmp/community-deck-import.json
   ```

4. **Outcomes:**
   - Exit 0: success — report `deckId`, `deckName`, card count from script output
   - Exit 2: partial success — deck created but some cards unresolved; show the warning list
   - Exit 1: failure — show error message; do not claim success

5. **Verify (optional):** `GET /api/v1/decks/community` as an authenticated user should include the new deck near the top (sorted by `updated_at`).

## Hard stops

| Condition | Action |
|-----------|--------|
| Invalid JSON | Fix syntax; do not run import |
| Missing `name` or `cards` | Ask user for a complete v2.0 export |
| Database not running | Start local dev DB / `npm run migrate` first |
| All cards unresolved | Report failure; deck may exist empty — investigate export vs catalog |

## Related

- Import implementation: [`scripts/import-community-deck.ts`](../../../scripts/import-community-deck.ts)
- Service: [`src/services/deckExportImport/`](../../../src/services/deckExportImport/)
- Feature doc: [`frontend/src/features/home/COMMUNITY_DECKS.md`](../../../frontend/src/features/home/COMMUNITY_DECKS.md)
