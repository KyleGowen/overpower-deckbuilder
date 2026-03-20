-- Fix Janjong Duare Mintep (Carson of Venus) special: attacks/defense refer to Carson's team, not Carson alone

UPDATE special_cards
SET card_effect = 'For remainder of game, any attack made on Carson''s team may be moved to this card. Carson''s team may not defend this card. Discard this card after 1 hit. May be played from Reserve. **One Per Deck**'
WHERE name = 'Janjong Duare Mintep'
  AND character_name = 'Carson of Venus';

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM special_cards
    WHERE name = 'Janjong Duare Mintep'
      AND character_name = 'Carson of Venus'
      AND card_effect = 'For remainder of game, any attack made on Carson''s team may be moved to this card. Carson''s team may not defend this card. Discard this card after 1 hit. May be played from Reserve. **One Per Deck**';

    IF updated_count >= 1 THEN
        RAISE NOTICE 'Successfully updated Janjong Duare Mintep card effect (% row(s)).', updated_count;
    ELSE
        RAISE EXCEPTION 'Expected at least 1 updated row but found %. Check name / character_name.', updated_count;
    END IF;
END $$;
