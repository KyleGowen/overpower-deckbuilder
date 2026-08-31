-- Feature Atom Eve's second alternate art on the Skybound reveal announcement.

UPDATE recent_updates
SET card_image_url = 'sky/characters/469_atom_eve.png',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'a1000001-0000-4000-8000-000000000009';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000009'
      AND card_image_url = 'sky/characters/469_atom_eve.png'
  ) THEN
    RAISE EXCEPTION 'Skybound alternate-art reveal did not use Atom Eve collector 469';
  END IF;
END $$;
