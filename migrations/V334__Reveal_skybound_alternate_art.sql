-- Reveal the approved Skybound alternate-art character printings (collectors 419-472).
-- Source filenames remain audited in scripts/skybound/skybound-manifest.json.
WITH revealed (set_number, image_path, reverse_image_path) AS (
VALUES
  ('419', 'sky/characters/419_invincible.png', NULL),
  ('420', 'sky/characters/420_omni_man.png', NULL),
  ('421', 'sky/characters/421_rex_splode.png', NULL),
  ('422', 'sky/characters/422_robot.png', NULL),
  ('423', 'sky/characters/423_atom_eve.png', NULL),
  ('424', 'sky/characters/424_dupli_kate.png', NULL),
  ('425', 'sky/characters/425_allen_the_alien.png', NULL),
  ('426', 'sky/characters/426_the_flaxans.png', NULL),
  ('427', 'sky/characters/427_mauler_twins.png', NULL),
  ('428', 'sky/characters/428_immortal.png', NULL),
  ('429', 'sky/characters/429_battle_beast.png', NULL),
  ('430', 'sky/characters/430_angstrom_levy.png', NULL),
  ('431', 'sky/characters/431_doc_seismic.png', NULL),
  ('432', 'sky/characters/432_machine_head_and_his_gang.png', NULL),
  ('433', 'sky/characters/433_cecil_and_the_g_d_a.png', NULL),
  ('434', 'sky/characters/434_lizard_league.png', NULL),
  ('435', 'sky/characters/435_black_samson.png', NULL),
  ('436', 'sky/characters/436_rick_grimes.png', NULL),
  ('437', 'sky/characters/437_andrea.png', NULL),
  ('438', 'sky/characters/438_michonne.png', NULL),
  ('439', 'sky/characters/439_negan.png', NULL),
  ('440', 'sky/characters/440_ezekiel.png', NULL),
  ('441', 'sky/characters/441_maggie.png', NULL),
  ('442', 'sky/characters/442_glenn.png', NULL),
  ('443', 'sky/characters/443_the_governor_woodbury.png', NULL),
  ('444', 'sky/characters/444_alpha_and_the_whisperers.png', NULL),
  ('445', 'sky/characters/445_the_hilltop.png', NULL),
  ('446', 'sky/characters/446_alexandria.png', NULL),
  ('447', 'sky/characters/447_the_saviors.png', NULL),
  ('448', 'sky/characters/448_the_kingdom.png', NULL),
  ('449', 'sky/characters/449_abraham_rosita_and_eugene.png', NULL),
  ('450', 'sky/characters/450_walkers_herd.png', 'sky/characters/450_walkers.png'),
  ('451', 'sky/characters/451_mikey_rhodes.png', NULL),
  ('452', 'sky/characters/452_rick_grimes.png', NULL),
  ('453', 'sky/characters/453_spencer_dales.png', NULL),
  ('454', 'sky/characters/454_negan.png', NULL),
  ('455', 'sky/characters/455_invincible.png', NULL),
  ('456', 'sky/characters/456_rick_grimes.png', NULL),
  ('457', 'sky/characters/457_michonne.png', NULL),
  ('458', 'sky/characters/458_negan.png', NULL),
  ('459', 'sky/characters/459_the_governor_woodbury.png', NULL),
  ('460', 'sky/characters/460_michonne.png', NULL),
  ('461', 'sky/characters/461_negan.png', NULL),
  ('462', 'sky/characters/462_allen_the_alien.png', NULL),
  ('463', 'sky/characters/463_robot.png', NULL),
  ('464', 'sky/characters/464_rex_splode.png', NULL),
  ('465', 'sky/characters/465_battle_beast.png', NULL),
  ('466', 'sky/characters/466_monster_girl.png', NULL),
  ('467', 'sky/characters/467_god_king_lore.png', NULL),
  ('468', 'sky/characters/468_omni_man.png', NULL),
  ('469', 'sky/characters/469_atom_eve.png', NULL),
  ('470', 'sky/characters/470_allen_the_alien.png', NULL),
  ('471', 'sky/characters/471_atom_eve.png', NULL),
  ('472', 'sky/characters/472_invincible.png', NULL)
)
UPDATE characters base
SET image_path = revealed.image_path,
    reverse_image_path = revealed.reverse_image_path,
    updated_at = NOW()
FROM revealed
WHERE base.set = 'SKY'
  AND base.set_number = revealed.set_number
  AND base.is_foil = FALSE;

-- Foil rows keep the existing application sheen and reuse the newly revealed base art.
UPDATE characters foil
SET image_path = base.image_path,
    updated_at = NOW()
FROM characters base
WHERE foil.set = 'SKY'
  AND foil.is_foil = TRUE
  AND foil.set_number ~ '^[0-9]+F$'
  AND base.set = 'SKY'
  AND base.is_foil = FALSE
  AND base.set_number = regexp_replace(foil.set_number, 'F$', '');

DO $$
DECLARE
  revealed_base_rows INTEGER;
  hidden_base_rows INTEGER;
  mismatched_foil_rows INTEGER;
  walkers_reverse_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO revealed_base_rows
  FROM characters
  WHERE set = 'SKY'
    AND is_foil = FALSE
    AND set_number ~ '^[0-9]+$'
    AND set_number::INTEGER BETWEEN 419 AND 472
    AND image_path LIKE 'sky/characters/%';

  IF revealed_base_rows <> 54 THEN
    RAISE EXCEPTION 'Skybound alternate-art reveal expected 54 base rows, found %', revealed_base_rows;
  END IF;

  SELECT COUNT(*) INTO hidden_base_rows
  FROM characters
  WHERE set = 'SKY'
    AND is_foil = FALSE
    AND set_number ~ '^[0-9]+$'
    AND set_number::INTEGER BETWEEN 419 AND 472
    AND image_path = 'sky/card-back/overpowerback.png';

  IF hidden_base_rows <> 0 THEN
    RAISE EXCEPTION 'Skybound alternate-art reveal left % base rows on the card back', hidden_base_rows;
  END IF;

  SELECT COUNT(*) INTO mismatched_foil_rows
  FROM characters foil
  JOIN characters base
    ON base.set = 'SKY'
    AND base.is_foil = FALSE
    AND base.set_number = regexp_replace(foil.set_number, 'F$', '')
  WHERE foil.set = 'SKY'
    AND foil.is_foil = TRUE
    AND foil.set_number ~ '^[0-9]+F$'
    AND foil.image_path IS DISTINCT FROM base.image_path;

  IF mismatched_foil_rows <> 0 THEN
    RAISE EXCEPTION 'Skybound alternate-art reveal found % foil rows with mismatched base art', mismatched_foil_rows;
  END IF;

  SELECT COUNT(*) INTO walkers_reverse_rows
  FROM characters
  WHERE set = 'SKY'
    AND set_number = '450'
    AND is_foil = FALSE
    AND reverse_image_path = 'sky/characters/450_walkers.png';

  IF walkers_reverse_rows <> 1 THEN
    RAISE EXCEPTION 'Skybound alternate-art reveal expected collector 450 reverse art, found % rows', walkers_reverse_rows;
  END IF;
END $$;
