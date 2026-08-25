-- Deck legality is persisted in decks.is_valid and is normally recomputed by
-- application writes. Invalidate pre-existing decks that violate the new G.D.A.
-- Battleground dependency or Any Character Special exclusivity rules so stale
-- validity cannot leave them visible in public/community deck lists.

UPDATE decks d
SET is_valid = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE d.is_valid = TRUE
  AND EXISTS (
      SELECT 1
      FROM deck_cards dc
      JOIN special_cards sc ON sc.id::text = dc.card_id
      WHERE dc.deck_id = d.id
        AND dc.card_type = 'special'
        AND dc.quantity > 0
        AND sc.character_name = 'Any Character'
        AND sc.set = 'SKY'
        AND sc.set_number ~ '^[0-9]+'
        AND substring(sc.set_number FROM '^[0-9]+')::integer BETWEEN 363 AND 374
  )
  AND (
      NOT EXISTS (
          SELECT 1
          FROM deck_cards dc
          JOIN battlegrounds b ON b.id::text = dc.card_id
          WHERE dc.deck_id = d.id
            AND dc.card_type = 'battleground'
            AND dc.quantity > 0
            AND b.name = 'Global Defense Agency'
      )
      OR EXISTS (
          SELECT 1
          FROM deck_cards dc
          JOIN special_cards sc ON sc.id::text = dc.card_id
          WHERE dc.deck_id = d.id
            AND dc.card_type = 'special'
            AND dc.quantity > 0
            AND sc.character_name = 'Any Character'
            AND NOT (
                sc.set = 'SKY'
                AND sc.set_number ~ '^[0-9]+'
                AND substring(sc.set_number FROM '^[0-9]+')::integer BETWEEN 363 AND 374
            )
      )
  );
