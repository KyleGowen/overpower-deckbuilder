-- Give the Skybound launch announcement a more iconic Invincible thumbnail.

UPDATE recent_updates
SET card_image_url = 'sky/specials/003_i_am_invincible.png'
WHERE id = 'a1000001-0000-4000-8000-000000000007';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000007'
      AND card_image_url = 'sky/specials/003_i_am_invincible.png'
  ) THEN
    RAISE EXCEPTION 'Skybound recent update Invincible thumbnail was not applied';
  END IF;
END $$;
