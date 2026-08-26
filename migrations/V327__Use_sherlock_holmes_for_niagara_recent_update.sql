-- Use Sherlock Holmes's default character art for the Niagara Regional announcement.

UPDATE recent_updates
SET card_image_url = 'characters/sherlock_holmes.webp'
WHERE id = 'a1000001-0000-4000-8000-000000000008';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000008'
      AND card_image_url = 'characters/sherlock_holmes.webp'
  ) THEN
    RAISE EXCEPTION 'Niagara Regional recent update Sherlock Holmes thumbnail was not applied';
  END IF;
END $$;
