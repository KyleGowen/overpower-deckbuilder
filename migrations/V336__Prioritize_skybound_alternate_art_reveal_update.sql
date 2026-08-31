-- Keep the reveal announcement ahead of the historical launch tile after retiring its teaser.

UPDATE recent_updates
SET updated_at = CURRENT_TIMESTAMP
WHERE id = 'a1000001-0000-4000-8000-000000000009';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates reveal
    JOIN recent_updates launch
      ON launch.id = 'a1000001-0000-4000-8000-000000000007'
    WHERE reveal.id = 'a1000001-0000-4000-8000-000000000009'
      AND reveal.updated_at >= launch.updated_at
  ) THEN
    RAISE EXCEPTION 'Skybound alternate-art reveal update was not prioritized';
  END IF;
END $$;
