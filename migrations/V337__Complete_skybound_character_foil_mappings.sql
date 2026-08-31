-- Complete the Skybound character foil map from the original workbook filenames.
-- Some workbook collector-number cells omit the F suffix even though the source
-- filename is explicitly NNNF_; the filename is authoritative for foil identity.

CREATE TEMP TABLE skybound_character_foil_pairs (
  base_number TEXT PRIMARY KEY,
  foil_number TEXT UNIQUE NOT NULL
) ON COMMIT DROP;

INSERT INTO skybound_character_foil_pairs (base_number, foil_number) VALUES
  ('227', '227F'),
  ('419', '419F'), ('420', '420F'), ('421', '421F'), ('422', '422F'),
  ('423', '423F'), ('424', '424F'), ('425', '425F'), ('426', '426F'),
  ('427', '427F'), ('428', '428F'), ('429', '429F'), ('430', '430F'),
  ('431', '431F'), ('432', '432F'), ('433', '433F'), ('434', '434F'),
  ('435', '435F'), ('436', '436F'), ('437', '437F'), ('438', '438F'),
  ('439', '439F'), ('440', '440F'), ('441', '441F'), ('442', '442F'),
  ('443', '443F'), ('444', '444F'), ('445', '445F'), ('446', '446F'),
  ('447', '447F'), ('449', '449F'), ('451', '451F'), ('452', '452F'),
  ('453', '453F'), ('454', '454F'), ('455', '455F'), ('456', '456F'),
  ('457', '457F'), ('458', '458F'), ('459', '459F'), ('460', '460F'),
  ('461', '461F'), ('462', '462F'), ('463', '463F'), ('464', '464F'),
  ('465', '465F'), ('466', '466F'), ('467', '467F'), ('468', '468F'),
  ('469', '469F'), ('470', '470F'), ('471', '471F'), ('472', '472F');

UPDATE characters base
SET set_number_foil = pairs.foil_number,
    updated_at = NOW()
FROM skybound_character_foil_pairs pairs
WHERE base.set = 'SKY'
  AND base.set_number = pairs.base_number
  AND base.is_foil = FALSE
  AND base.set_number_foil IS DISTINCT FROM pairs.foil_number;

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
FROM skybound_character_foil_pairs pairs
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
FROM skybound_character_foil_pairs pairs
JOIN characters base
  ON base.set = 'SKY'
  AND base.set_number = pairs.base_number
  AND base.is_foil = FALSE
WHERE foil.set = 'SKY'
  AND foil.set_number = pairs.foil_number
  AND foil.is_foil = TRUE;

INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT foil.id::text, base.id::text, 'character'
FROM skybound_character_foil_pairs pairs
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
  expected_pairs INTEGER;
  foil_rows INTEGER;
  mapped_rows INTEGER;
  tagged_bases INTEGER;
  mismatched_rows INTEGER;
  unexpected_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO expected_pairs FROM skybound_character_foil_pairs;
  IF expected_pairs <> 53 THEN
    RAISE EXCEPTION 'Skybound foil completion expected 53 source pairs, found %', expected_pairs;
  END IF;

  SELECT COUNT(*) INTO foil_rows
  FROM characters foil
  JOIN skybound_character_foil_pairs pairs ON pairs.foil_number = foil.set_number
  WHERE foil.set = 'SKY' AND foil.is_foil = TRUE;
  IF foil_rows <> 53 THEN
    RAISE EXCEPTION 'Skybound foil completion expected 53 foil rows, found %', foil_rows;
  END IF;

  SELECT COUNT(*) INTO mapped_rows
  FROM skybound_character_foil_pairs pairs
  JOIN characters foil
    ON foil.set = 'SKY' AND foil.set_number = pairs.foil_number AND foil.is_foil = TRUE
  JOIN characters base
    ON base.set = 'SKY' AND base.set_number = pairs.base_number AND base.is_foil = FALSE
  JOIN foil_card_map mappings
    ON mappings.foil_card_id = foil.id::text
    AND mappings.base_card_id = base.id::text
    AND mappings.card_type = 'character';
  IF mapped_rows <> 53 THEN
    RAISE EXCEPTION 'Skybound foil completion expected 53 mappings, found %', mapped_rows;
  END IF;

  SELECT COUNT(*) INTO tagged_bases
  FROM characters base
  JOIN skybound_character_foil_pairs pairs
    ON pairs.base_number = base.set_number AND pairs.foil_number = base.set_number_foil
  WHERE base.set = 'SKY' AND base.is_foil = FALSE;
  IF tagged_bases <> 53 THEN
    RAISE EXCEPTION 'Skybound foil completion expected 53 tagged bases, found %', tagged_bases;
  END IF;

  SELECT COUNT(*) INTO mismatched_rows
  FROM skybound_character_foil_pairs pairs
  JOIN characters base
    ON base.set = 'SKY' AND base.set_number = pairs.base_number AND base.is_foil = FALSE
  JOIN characters foil
    ON foil.set = 'SKY' AND foil.set_number = pairs.foil_number AND foil.is_foil = TRUE
  WHERE foil.name IS DISTINCT FROM base.name
    OR foil.energy IS DISTINCT FROM base.energy
    OR foil.combat IS DISTINCT FROM base.combat
    OR foil.brute_force IS DISTINCT FROM base.brute_force
    OR foil.intelligence IS DISTINCT FROM base.intelligence
    OR foil.image_path IS DISTINCT FROM base.image_path
    OR foil.reverse_image_path IS DISTINCT FROM base.reverse_image_path
    OR foil.threat_level IS DISTINCT FROM base.threat_level
    OR foil.special_abilities IS DISTINCT FROM base.special_abilities;
  IF mismatched_rows <> 0 THEN
    RAISE EXCEPTION 'Skybound foil completion found % mismatched foil rows', mismatched_rows;
  END IF;

  SELECT COUNT(*) INTO unexpected_rows
  FROM characters foil
  WHERE foil.set = 'SKY'
    AND foil.is_foil = TRUE
    AND foil.set_number ~ '^[0-9]+F$'
    AND NOT EXISTS (
      SELECT 1
      FROM skybound_character_foil_pairs pairs
      WHERE pairs.foil_number = foil.set_number
    );
  IF unexpected_rows <> 0 THEN
    RAISE EXCEPTION 'Skybound foil completion found % source-unlisted foil rows', unexpected_rows;
  END IF;
END $$;
