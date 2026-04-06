-- Zorro alternate art: on-disk PNGs Zorro-UR_Alt.png (ERB 534 Tan / Ultra Rare) and
-- Zorro-Alt.png (ERB 535 Rare). Fixes V213 .jpg paths, adds missing second alternate row + 535F foil + foil_card_map.
-- ERB 533 remains Zeus (unchanged).

-- 1) UR art incorrectly numbered 535 → 534 / 534F
UPDATE characters
SET set_number = '534',
    set_number_foil = '534F',
    updated_at = NOW()
WHERE name = 'Zorro'
  AND set = 'ERB'
  AND is_foil = FALSE
  AND image_path LIKE '%Zorro-UR_Alt%'
  AND set_number = '535';

-- 2) Non-foil UR row: .png, checklist 534, Ultra Rare (exclude Rare alt file)
UPDATE characters
SET image_path = 'characters/alternate/Zorro-UR_Alt.png',
    set_number = '534',
    set_number_foil = '534F',
    rarity = 'Ultra Rare',
    updated_at = NOW()
WHERE name = 'Zorro'
  AND set = 'ERB'
  AND is_foil = FALSE
  AND image_path <> 'characters/alternate/Zorro-Alt.png'
  AND image_path LIKE '%/alternate/%'
  AND (
    image_path IN (
      'characters/alternate/Zorro-UR_Alt.jpg',
      'characters/alternate/zorro.png',
      'characters/alternate/Zorro-UR_Alt.png'
    )
    OR image_path LIKE '%/Zorro-UR_Alt.%'
  );

-- 3) Foil 534F: same image as non-foil UR
UPDATE characters
SET image_path = 'characters/alternate/Zorro-UR_Alt.png',
    updated_at = NOW()
WHERE name = 'Zorro'
  AND set = 'ERB'
  AND is_foil = TRUE
  AND set_number = '534F';

-- 4) Second alternate: Zorro-Alt.png (ERB 535 / 535F non-foil)
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
  'characters/alternate/Zorro-Alt.png',
  src.created_at,
  NOW(),
  src.threat_level,
  src.special_abilities,
  '535',
  '535F',
  FALSE,
  'Rare'
FROM characters src
WHERE src.id = (
  SELECT COALESCE(
    (SELECT id FROM characters
     WHERE name = 'Zorro' AND set = 'ERB' AND is_foil = FALSE
       AND image_path = 'characters/alternate/Zorro-UR_Alt.png'
     LIMIT 1),
    (SELECT id FROM characters
     WHERE name = 'Zorro' AND set = 'ERB' AND is_foil = FALSE
       AND (image_path NOT LIKE '%/alternate/%' OR image_path IS NULL)
     LIMIT 1)
  )
)
AND NOT EXISTS (
  SELECT 1 FROM characters x
  WHERE x.name = 'Zorro'
    AND x.image_path = 'characters/alternate/Zorro-Alt.png'
);

-- 5) Foil row 535F (same pattern as V230)
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
  '535F',
  NULL,
  TRUE,
  rarity
FROM characters
WHERE name = 'Zorro'
  AND set = 'ERB'
  AND is_foil = FALSE
  AND image_path = 'characters/alternate/Zorro-Alt.png'
  AND set_number = '535'
  AND NOT EXISTS (
    SELECT 1 FROM characters z
    WHERE z.name = 'Zorro' AND z.set_number = '535F' AND z.is_foil = TRUE
  );

-- 6) foil_card_map for new 535 / 535F pair
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id::text, b.id::text, 'character'
FROM characters f
JOIN characters b
  ON f.name = b.name
  AND f.set = b.set
  AND f.image_path = b.image_path
WHERE f.name = 'Zorro'
  AND f.set = 'ERB'
  AND f.is_foil = TRUE
  AND f.set_number = '535F'
  AND b.is_foil = FALSE
  AND b.set_number = '535'
ON CONFLICT (foil_card_id) DO NOTHING;

-- 7) Stored user data: jpg / legacy zorro.png → UR .png
UPDATE collection_cards
SET image_path = REPLACE(image_path, 'characters/alternate/Zorro-UR_Alt.jpg', 'characters/alternate/Zorro-UR_Alt.png'),
    updated_at = NOW()
WHERE image_path LIKE '%characters/alternate/Zorro-UR_Alt.jpg%';

UPDATE collection_cards
SET image_path = REPLACE(image_path, 'characters/alternate/zorro.png', 'characters/alternate/Zorro-UR_Alt.png'),
    updated_at = NOW()
WHERE image_path LIKE '%characters/alternate/zorro.png%';

DO $$
DECLARE
  col TEXT;
  cols TEXT[] := ARRAY['character_1_image', 'character_2_image', 'character_3_image', 'character_4_image'];
BEGIN
  FOREACH col IN ARRAY cols LOOP
    EXECUTE format(
      'UPDATE decks SET %1$I = REPLACE(%1$I, %2$L, %3$L), updated_at = NOW() WHERE %1$I LIKE %4$L',
      col,
      'characters/alternate/Zorro-UR_Alt.jpg',
      'characters/alternate/Zorro-UR_Alt.png',
      '%%characters/alternate/Zorro-UR_Alt.jpg%%'
    );
    EXECUTE format(
      'UPDATE decks SET %1$I = REPLACE(%1$I, %2$L, %3$L), updated_at = NOW() WHERE %1$I LIKE %4$L',
      col,
      'characters/alternate/zorro.png',
      'characters/alternate/Zorro-UR_Alt.png',
      '%%characters/alternate/zorro.png%%'
    );
  END LOOP;
END $$;
