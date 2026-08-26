-- Tighten the Niagara Regional announcement copy for the compact Home tile.

UPDATE recent_updates
SET description = 'Season One continued in Niagara with 42 players at Mecha Games, and Jessica Simms claimed victory. Explore the full tournament breakdown.'
WHERE id = 'a1000001-0000-4000-8000-000000000008';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000008'
      AND description = 'Season One continued in Niagara with 42 players at Mecha Games, and Jessica Simms claimed victory. Explore the full tournament breakdown.'
  ) THEN
    RAISE EXCEPTION 'Niagara Regional recent update copy was not applied';
  END IF;
END $$;
