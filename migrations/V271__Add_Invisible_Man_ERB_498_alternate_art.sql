-- ERB alternate art: InvisibleMan-Alt.png (checklist 498 Rare, 498F foil).
-- Base row was never inserted, so V184/V201 updates and V230 Section 4 foil INSERT were no-ops.

-- 1) Non-foil alternate (498 / 498F checklist pairing on base row)
INSERT INTO characters (
  id, name, set, description, energy, combat, brute_force, intelligence,
  image_path, created_at, updated_at, threat_level, special_abilities,
  set_number, set_number_foil, is_foil, rarity
)
SELECT
  gen_random_uuid(),
  src.name,
  src.set,
  src.description,
  src.energy,
  src.combat,
  src.brute_force,
  src.intelligence,
  'characters/alternate/InvisibleMan-Alt.png',
  src.created_at,
  NOW(),
  src.threat_level,
  src.special_abilities,
  '498',
  '498F',
  FALSE,
  'Rare'
FROM characters src
WHERE src.name = 'Invisible Man'
  AND src.set = 'ERB'
  AND src.is_foil = FALSE
  AND src.set_number = '090'
  AND (src.image_path NOT LIKE '%/alternate/%' OR src.image_path IS NULL)
  AND NOT EXISTS (
    SELECT 1 FROM characters x
    WHERE x.name = 'Invisible Man'
      AND x.image_path = 'characters/alternate/InvisibleMan-Alt.png'
  )
LIMIT 1;

-- 2) Foil row 498F (same image as non-foil alternate)
INSERT INTO characters (
  id, name, set, description, energy, combat, brute_force, intelligence,
  image_path, created_at, updated_at, threat_level, special_abilities,
  set_number, set_number_foil, is_foil, rarity
)
SELECT
  gen_random_uuid(),
  name,
  set,
  description,
  energy,
  combat,
  brute_force,
  intelligence,
  image_path,
  created_at,
  NOW(),
  threat_level,
  special_abilities,
  '498F',
  NULL,
  TRUE,
  rarity
FROM characters
WHERE name = 'Invisible Man'
  AND set = 'ERB'
  AND is_foil = FALSE
  AND image_path = 'characters/alternate/InvisibleMan-Alt.png'
  AND set_number = '498'
  AND NOT EXISTS (
    SELECT 1 FROM characters z
    WHERE z.name = 'Invisible Man' AND z.set_number = '498F' AND z.is_foil = TRUE
  );

-- 3) foil_card_map for 498 / 498F pair
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id::text, b.id::text, 'character'
FROM characters f
JOIN characters b
  ON f.name = b.name
  AND f.set = b.set
  AND f.image_path = b.image_path
WHERE f.name = 'Invisible Man'
  AND f.set = 'ERB'
  AND f.is_foil = TRUE
  AND f.set_number = '498F'
  AND b.is_foil = FALSE
  AND b.set_number = '498'
ON CONFLICT (foil_card_id) DO NOTHING;
