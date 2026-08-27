-- Correct catalog and legality issues reported after the G.D.A. Battleground launch.

-- These cards mention another One Per Deck card in their rules text, but they
-- are not themselves One Per Deck.
UPDATE special_cards
SET one_per_deck = FALSE,
    updated_at = NOW()
WHERE set = 'SKY'
  AND set_number IN ('172', '214')
  AND one_per_deck IS DISTINCT FROM FALSE;

-- Match the printed All For One card text.
UPDATE special_cards
SET card_effect = 'Sort through Draw Pile or Dead Pile for any 1 Teamwork card and put it in hand. For remainder of game, The Three Musketeers may place and play any Teamwork card, regardless of grid requirement, and may make 1 or both follow-up attacks. **One Per Deck**',
    updated_at = NOW()
WHERE set = 'ERB'
  AND character_name = 'The Three Musketeers'
  AND name = 'All For One'
  AND card_effect IS DISTINCT FROM 'Sort through Draw Pile or Dead Pile for any 1 Teamwork card and put it in hand. For remainder of game, The Three Musketeers may place and play any Teamwork card, regardless of grid requirement, and may make 1 or both follow-up attacks. **One Per Deck**';

-- The complete Skybound Any Character block (349-374) belongs to the G.D.A.
-- subset. Invalidate pre-existing decks that use any of those cards without the
-- required Battleground or mix them with a non-G.D.A. Any Character Special.
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
        AND substring(sc.set_number FROM '^[0-9]+')::integer BETWEEN 349 AND 374
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
                AND substring(sc.set_number FROM '^[0-9]+')::integer BETWEEN 349 AND 374
            )
      )
  );

DO $$
DECLARE
  corrected_skybound_specials INTEGER;
  corrected_all_for_one INTEGER;
BEGIN
  SELECT COUNT(*) INTO corrected_skybound_specials
  FROM special_cards
  WHERE set = 'SKY'
    AND set_number IN ('172', '214')
    AND one_per_deck = FALSE;

  SELECT COUNT(*) INTO corrected_all_for_one
  FROM special_cards
  WHERE set = 'ERB'
    AND character_name = 'The Three Musketeers'
    AND name = 'All For One'
    AND card_effect = 'Sort through Draw Pile or Dead Pile for any 1 Teamwork card and put it in hand. For remainder of game, The Three Musketeers may place and play any Teamwork card, regardless of grid requirement, and may make 1 or both follow-up attacks. **One Per Deck**';

  IF corrected_skybound_specials <> 2 OR corrected_all_for_one <> 1 THEN
    RAISE EXCEPTION
      'Catalog feedback correction mismatch: Skybound specials %, All For One %',
      corrected_skybound_specials,
      corrected_all_for_one;
  END IF;
END $$;
