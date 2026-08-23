-- Advanced Universe cards can carry the same "first action only" function icon
-- as character Specials. Skybound #112 is the first catalog row that needs it.

ALTER TABLE advanced_universe_cards
  ADD COLUMN IF NOT EXISTS icon_first_action_only BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE advanced_universe_cards
SET icon_first_action_only = TRUE,
    updated_at = NOW()
WHERE set = 'SKY'
  AND set_number = '112';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM advanced_universe_cards
    WHERE set = 'SKY'
      AND set_number = '112'
      AND icon_first_action_only = TRUE
  ) THEN
    RAISE EXCEPTION 'Skybound #112 first-action-only icon was not preserved';
  END IF;
END $$;
