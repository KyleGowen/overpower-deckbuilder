-- Skybound foil rows listed in Skybound - Full Set - Data.xls.
-- The supplied F-suffixed images are printing-production files and are intentionally
-- not published. Each foil row reuses its matching non-foil image_path; the frontend
-- supplies the established foil sheen. Protected alternate art therefore remains the
-- card back for both the base and foil database rows.

WITH foil_pairs (base_number, foil_number) AS (
  VALUES
    ('227', '227F'),
    ('419', '419F'),
    ('423', '423F'),
    ('424', '424F'),
    ('425', '425F'),
    ('427', '427F'),
    ('432', '432F'),
    ('436', '436F'),
    ('437', '437F'),
    ('438', '438F'),
    ('442', '442F'),
    ('446', '446F'),
    ('452', '452F'),
    ('456', '456F'),
    ('461', '461F'),
    ('465', '465F'),
    ('466', '466F'),
    ('467', '467F'),
    ('471', '471F')
)
UPDATE characters base
SET set_number_foil = pairs.foil_number,
    updated_at = NOW()
FROM foil_pairs pairs
WHERE base.set = 'SKY'
  AND base.set_number = pairs.base_number
  AND base.is_foil = FALSE
  AND base.set_number_foil IS DISTINCT FROM pairs.foil_number;

WITH foil_pairs (base_number, foil_number) AS (
  VALUES
    ('227', '227F'), ('419', '419F'), ('423', '423F'), ('424', '424F'),
    ('425', '425F'), ('427', '427F'), ('432', '432F'), ('436', '436F'),
    ('437', '437F'), ('438', '438F'), ('442', '442F'), ('446', '446F'),
    ('452', '452F'), ('456', '456F'), ('461', '461F'), ('465', '465F'),
    ('466', '466F'), ('467', '467F'), ('471', '471F')
)
INSERT INTO characters (
  id, name, set, description, energy, combat, brute_force, intelligence,
  image_path, reverse_image_path, threat_level, special_abilities,
  set_number, set_number_foil, is_foil, rarity, created_at, updated_at
)
SELECT
  gen_random_uuid(), base.name, base.set, base.description, base.energy, base.combat,
  base.brute_force, base.intelligence, base.image_path, base.reverse_image_path,
  base.threat_level, base.special_abilities, pairs.foil_number, NULL, TRUE,
  base.rarity, NOW(), NOW()
FROM foil_pairs pairs
JOIN characters base
  ON base.set = 'SKY'
  AND base.set_number = pairs.base_number
  AND base.is_foil = FALSE
WHERE NOT EXISTS (
  SELECT 1
  FROM characters existing
  WHERE existing.set = 'SKY'
    AND existing.set_number = pairs.foil_number
    AND existing.is_foil = TRUE
);

-- V312 inserted 227F before the printing-file policy was clarified. Normalize that
-- row, and make every other listed foil an exact gameplay/art copy of its base row.
WITH foil_pairs (base_number, foil_number) AS (
  VALUES
    ('227', '227F'), ('419', '419F'), ('423', '423F'), ('424', '424F'),
    ('425', '425F'), ('427', '427F'), ('432', '432F'), ('436', '436F'),
    ('437', '437F'), ('438', '438F'), ('442', '442F'), ('446', '446F'),
    ('452', '452F'), ('456', '456F'), ('461', '461F'), ('465', '465F'),
    ('466', '466F'), ('467', '467F'), ('471', '471F')
)
UPDATE characters foil
SET name = base.name,
    description = base.description,
    energy = base.energy,
    combat = base.combat,
    brute_force = base.brute_force,
    intelligence = base.intelligence,
    image_path = base.image_path,
    reverse_image_path = base.reverse_image_path,
    threat_level = base.threat_level,
    special_abilities = base.special_abilities,
    set_number_foil = NULL,
    rarity = base.rarity,
    updated_at = NOW()
FROM foil_pairs pairs
JOIN characters base
  ON base.set = 'SKY'
  AND base.set_number = pairs.base_number
  AND base.is_foil = FALSE
WHERE foil.set = 'SKY'
  AND foil.set_number = pairs.foil_number
  AND foil.is_foil = TRUE;

WITH foil_pairs (base_number, foil_number) AS (
  VALUES
    ('227', '227F'), ('419', '419F'), ('423', '423F'), ('424', '424F'),
    ('425', '425F'), ('427', '427F'), ('432', '432F'), ('436', '436F'),
    ('437', '437F'), ('438', '438F'), ('442', '442F'), ('446', '446F'),
    ('452', '452F'), ('456', '456F'), ('461', '461F'), ('465', '465F'),
    ('466', '466F'), ('467', '467F'), ('471', '471F')
)
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT foil.id::text, base.id::text, 'character'
FROM foil_pairs pairs
JOIN characters base
  ON base.set = 'SKY'
  AND base.set_number = pairs.base_number
  AND base.is_foil = FALSE
JOIN characters foil
  ON foil.set = 'SKY'
  AND foil.set_number = pairs.foil_number
  AND foil.is_foil = TRUE
ON CONFLICT (foil_card_id) DO UPDATE
SET base_card_id = EXCLUDED.base_card_id,
    card_type = EXCLUDED.card_type;

DO $$
DECLARE
  expected_foils TEXT[] := ARRAY[
    '227F', '419F', '423F', '424F', '425F', '427F', '432F', '436F', '437F',
    '438F', '442F', '446F', '452F', '456F', '461F', '465F', '466F', '467F', '471F'
  ];
  foil_rows INTEGER;
  mapped_rows INTEGER;
  mismatched_images INTEGER;
  tagged_bases INTEGER;
BEGIN
  SELECT COUNT(*) INTO foil_rows
  FROM characters
  WHERE set = 'SKY' AND is_foil = TRUE AND set_number = ANY(expected_foils);
  IF foil_rows <> 19 THEN
    RAISE EXCEPTION 'Skybound foil migration expected 19 foil rows, found %', foil_rows;
  END IF;

  SELECT COUNT(*) INTO mapped_rows
  FROM foil_card_map mappings
  JOIN characters foil ON foil.id::text = mappings.foil_card_id
  WHERE foil.set = 'SKY' AND foil.set_number = ANY(expected_foils);
  IF mapped_rows <> 19 THEN
    RAISE EXCEPTION 'Skybound foil migration expected 19 mappings, found %', mapped_rows;
  END IF;

  SELECT COUNT(*) INTO mismatched_images
  FROM characters foil
  JOIN characters base
    ON base.set = foil.set
    AND base.set_number = regexp_replace(foil.set_number, 'F$', '')
    AND base.is_foil = FALSE
  WHERE foil.set = 'SKY'
    AND foil.set_number = ANY(expected_foils)
    AND foil.image_path IS DISTINCT FROM base.image_path;
  IF mismatched_images <> 0 THEN
    RAISE EXCEPTION 'Skybound foil migration found % printing-only image paths', mismatched_images;
  END IF;

  SELECT COUNT(*) INTO tagged_bases
  FROM characters
  WHERE set = 'SKY' AND is_foil = FALSE AND set_number_foil = ANY(expected_foils);
  IF tagged_bases <> 19 THEN
    RAISE EXCEPTION 'Skybound foil migration expected 19 tagged base rows, found %', tagged_bases;
  END IF;
END $$;
