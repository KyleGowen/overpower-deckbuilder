-- Add launch emphasis to the Skybound announcement copy.

UPDATE recent_updates
SET description = 'The Skybound set has arrived in Excelsior! Browse the full release in the card database. Alternate-art cards will be revealed in a future update.'
WHERE id = 'a1000001-0000-4000-8000-000000000007';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000007'
      AND description = 'The Skybound set has arrived in Excelsior! Browse the full release in the card database. Alternate-art cards will be revealed in a future update.'
  ) THEN
    RAISE EXCEPTION 'Skybound recent update copy punctuation was not applied';
  END IF;
END $$;
