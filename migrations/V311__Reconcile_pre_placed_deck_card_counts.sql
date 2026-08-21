-- V310 changed the count rule. Reconcile decks whose card rows were updated
-- after that migration so list/tournament surfaces match the deck editor.
UPDATE decks d
SET card_count = counts.card_count
FROM (
    SELECT
        d.id AS deck_id,
        COALESCE(SUM(dc.quantity), 0)::int AS card_count
    FROM decks d
    LEFT JOIN deck_cards dc
        ON dc.deck_id = d.id
       AND dc.card_type NOT IN ('character', 'location', 'mission')
       AND dc.exclude_from_draw IS DISTINCT FROM TRUE
    GROUP BY d.id
) counts
WHERE d.id = counts.deck_id
  AND d.card_count IS DISTINCT FROM counts.card_count;
