-- Fix Merlin's "For Camelot!" special card effect text
-- Corrects two errors:
--   1. "Morgana le Fay" → "Morgan le Fay" (incorrect name spelling)
--   2. "may defend them from Reserve" → "may defend Merlin" (incorrect effect description)

UPDATE special_cards
SET card_effect = 'For remainder of game, Merlin may defend King Arthur, Lancelot, and Morgan le Fay with Power cards and may defend Merlin.'
WHERE name = 'For Camelot!'
  AND character_name = 'Merlin';

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM special_cards
    WHERE name = 'For Camelot!'
      AND character_name = 'Merlin'
      AND card_effect = 'For remainder of game, Merlin may defend King Arthur, Lancelot, and Morgan le Fay with Power cards and may defend Merlin.';

    IF updated_count = 1 THEN
        RAISE NOTICE 'Successfully updated "For Camelot!" card effect for Merlin.';
    ELSE
        RAISE EXCEPTION 'Expected 1 updated row but found %. Check that the card exists with character_name = ''Merlin'' and name = ''For Camelot!''.', updated_count;
    END IF;
END $$;
