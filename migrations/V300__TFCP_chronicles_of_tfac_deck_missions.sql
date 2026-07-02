-- TFCP foil missions: The Chronicles of TFAC deck (7 cards).
-- 3 replacements (V296 rows: image_path + name refresh) + 4 new mission rows.
-- Idempotent per promo-set rules (V257).

INSERT INTO sets (code, name) VALUES
    ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;

-- Replacements: red_death_and_bartholomew → captain_bartholomew
UPDATE missions
SET
    name = 'Captain Bartholomew',
    mission_description = 'Captain Bartholomew mission card',
    mission_set = 'The Chronicles of TFAC',
    image_path = 'tfacp/missions/the_chronicles_of_tfac/captain_bartholomew.png',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/red_death_and_bartholomew.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE;

-- Replacements: persian_connection → the_princess_of_persia
UPDATE missions
SET
    name = 'The Princess of Persia',
    mission_description = 'The Princess of Persia mission card',
    mission_set = 'The Chronicles of TFAC',
    image_path = 'tfacp/missions/the_chronicles_of_tfac/the_princess_of_persia.png',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/persian_connection.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE;

-- Replacements: the_hangmen_gang jpg → png
UPDATE missions
SET
    name = 'The Hangmen Gang',
    mission_description = 'The Hangmen Gang mission card',
    mission_set = 'The Chronicles of TFAC',
    image_path = 'tfacp/missions/the_chronicles_of_tfac/the_hangmen_gang.png',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/the_hangmen_gang.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE;

-- New: The Bodyguard
INSERT INTO missions (
    id,
    name,
    set,
    mission_description,
    mission_set,
    image_path,
    is_foil,
    set_number,
    set_number_foil,
    rarity,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    'The Bodyguard',
    'TFCP',
    'The Bodyguard mission card',
    'The Chronicles of TFAC',
    'tfacp/missions/the_chronicles_of_tfac/the_bodyguard.png',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/the_bodyguard.png'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

-- New: Outback Outcast
INSERT INTO missions (
    id,
    name,
    set,
    mission_description,
    mission_set,
    image_path,
    is_foil,
    set_number,
    set_number_foil,
    rarity,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    'Outback Outcast',
    'TFCP',
    'Outback Outcast mission card',
    'The Chronicles of TFAC',
    'tfacp/missions/the_chronicles_of_tfac/outback_outcast.png',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/outback_outcast.png'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

-- New: Mean What You Say (no ellipsis)
INSERT INTO missions (
    id,
    name,
    set,
    mission_description,
    mission_set,
    image_path,
    is_foil,
    set_number,
    set_number_foil,
    rarity,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    'Mean What You Say',
    'TFCP',
    'Mean What You Say mission card',
    'The Chronicles of TFAC',
    'tfacp/missions/the_chronicles_of_tfac/mean_what_you_say.png',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/mean_what_you_say.png'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

-- New: Death Comes in Red
INSERT INTO missions (
    id,
    name,
    set,
    mission_description,
    mission_set,
    image_path,
    is_foil,
    set_number,
    set_number_foil,
    rarity,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    'Death Comes in Red',
    'TFCP',
    'Death Comes in Red mission card',
    'The Chronicles of TFAC',
    'tfacp/missions/the_chronicles_of_tfac/death_comes_in_red.png',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/death_comes_in_red.png'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

-- Metadata drift: 4 new rows
UPDATE missions
SET
    name = 'The Bodyguard',
    mission_description = 'The Bodyguard mission card',
    mission_set = 'The Chronicles of TFAC',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/the_bodyguard.png'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'The Bodyguard'
    OR mission_description IS DISTINCT FROM 'The Bodyguard mission card'
    OR mission_set IS DISTINCT FROM 'The Chronicles of TFAC'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

UPDATE missions
SET
    name = 'Outback Outcast',
    mission_description = 'Outback Outcast mission card',
    mission_set = 'The Chronicles of TFAC',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/outback_outcast.png'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'Outback Outcast'
    OR mission_description IS DISTINCT FROM 'Outback Outcast mission card'
    OR mission_set IS DISTINCT FROM 'The Chronicles of TFAC'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

UPDATE missions
SET
    name = 'Mean What You Say',
    mission_description = 'Mean What You Say mission card',
    mission_set = 'The Chronicles of TFAC',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/mean_what_you_say.png'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'Mean What You Say'
    OR mission_description IS DISTINCT FROM 'Mean What You Say mission card'
    OR mission_set IS DISTINCT FROM 'The Chronicles of TFAC'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

UPDATE missions
SET
    name = 'Death Comes in Red',
    mission_description = 'Death Comes in Red mission card',
    mission_set = 'The Chronicles of TFAC',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/death_comes_in_red.png'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'Death Comes in Red'
    OR mission_description IS DISTINCT FROM 'Death Comes in Red mission card'
    OR mission_set IS DISTINCT FROM 'The Chronicles of TFAC'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );
