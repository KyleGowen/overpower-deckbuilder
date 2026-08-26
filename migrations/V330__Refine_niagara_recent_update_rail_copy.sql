-- Name the Tournament rail and preserve a two-space visual sentence break.

UPDATE recent_updates
SET description = CONCAT(
  'Season One continued in Niagara with 42 players at Mecha Games, and Jessica Simms claimed victory.',
  CHR(160),
  ' Explore the full tournament breakdown by clicking "View All" on the Tournament rail.'
)
WHERE id = 'a1000001-0000-4000-8000-000000000008';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000008'
      AND description = CONCAT(
        'Season One continued in Niagara with 42 players at Mecha Games, and Jessica Simms claimed victory.',
        CHR(160),
        ' Explore the full tournament breakdown by clicking "View All" on the Tournament rail.'
      )
  ) THEN
    RAISE EXCEPTION 'Niagara Regional recent update Tournament rail copy was not applied';
  END IF;
END $$;
