-- NYCC play-test Leonidas alternate (V214): promo / con exclusive per checklist-promos.md — not main ERB 139/508.

INSERT INTO sets (code, name) VALUES
    ('ERBP', 'Edgar Rice Burroughs and the World Legends - Promos')
ON CONFLICT (code) DO NOTHING;

UPDATE characters
SET
  set = 'ERBP',
  rarity = NULL,
  set_number = NULL,
  set_number_foil = NULL,
  updated_at = NOW()
WHERE name = 'Leonidas'
  AND image_path ILIKE '%/Leonidas-ComicConExclusive%';
