-- Finalize the Skybound launch announcement wording.

UPDATE recent_updates
SET description = 'The Skybound set has arrived in Excelsior! Browse the full release in the card database. Stay tuned for alternate-art card reveals in future updates.'
WHERE id = 'a1000001-0000-4000-8000-000000000007';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000007'
      AND description = 'The Skybound set has arrived in Excelsior! Browse the full release in the card database. Stay tuned for alternate-art card reveals in future updates.'
  ) THEN
    RAISE EXCEPTION 'Skybound recent update final copy was not applied';
  END IF;
END $$;
