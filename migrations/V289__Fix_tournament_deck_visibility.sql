-- V288 skipped decks that tournament_decks already owned by name (CLI/seed imports).
-- Those imports inherit is_private=TRUE (V285 default) and V287 only ran once before
-- they were added. The tournament rail lists all decks but GET /decks/:id/full blocks
-- private decks for non-owners — users see tiles but get "Deck not found" on click.

UPDATE decks
SET is_private = FALSE
WHERE user_id = '00000000-0000-0000-0000-000000000003'  -- tournament_decks
  AND is_private = TRUE;
