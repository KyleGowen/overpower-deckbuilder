-- Point readers from the Niagara Regional announcement to the full dashboard.

UPDATE recent_updates
SET description = 'Season One continued in Niagara with 42 players at Mecha Games, and Jessica Simms claimed victory. Explore the full tournament breakdown by clicking "View All".'
WHERE id = 'a1000001-0000-4000-8000-000000000008';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000008'
      AND description = 'Season One continued in Niagara with 42 players at Mecha Games, and Jessica Simms claimed victory. Explore the full tournament breakdown by clicking "View All".'
  ) THEN
    RAISE EXCEPTION 'Niagara Regional recent update View All copy was not applied';
  END IF;
END $$;
