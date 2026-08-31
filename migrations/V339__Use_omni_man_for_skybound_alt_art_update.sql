-- Feature Omni-Man on the Skybound alternate-art reveal announcement.

UPDATE recent_updates
SET card_image_url = 'sky/characters/420_omni_man.png',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'a1000001-0000-4000-8000-000000000009';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000009'
      AND card_image_url = 'sky/characters/420_omni_man.png'
  ) THEN
    RAISE EXCEPTION 'Skybound alternate-art reveal did not use Omni-Man collector 420';
  END IF;
END $$;
