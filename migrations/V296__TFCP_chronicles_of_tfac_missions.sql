-- TFCP foil-only mission promos: The Chronicles of TFAC (3 cards).
-- Idempotent: INSERT missing rows and normalize metadata per promo-set rules (V257).

INSERT INTO sets (code, name) VALUES
    ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;

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
    'Persian Connection',
    'TFCP',
    'Persian Connection mission card',
    'The Chronicles of TFAC',
    'tfacp/missions/the_chronicles_of_tfac/persian_connection.jpg',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/persian_connection.jpg'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

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
    'Red Death & Bartholomew',
    'TFCP',
    'Red Death & Bartholomew mission card',
    'The Chronicles of TFAC',
    'tfacp/missions/the_chronicles_of_tfac/red_death_and_bartholomew.jpg',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/red_death_and_bartholomew.jpg'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

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
    'The Hangmen Gang',
    'TFCP',
    'The Hangmen Gang mission card',
    'The Chronicles of TFAC',
    'tfacp/missions/the_chronicles_of_tfac/the_hangmen_gang.jpg',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/the_hangmen_gang.jpg'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

UPDATE missions
SET
    name = 'Persian Connection',
    mission_description = 'Persian Connection mission card',
    mission_set = 'The Chronicles of TFAC',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/persian_connection.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'Persian Connection'
    OR mission_description IS DISTINCT FROM 'Persian Connection mission card'
    OR mission_set IS DISTINCT FROM 'The Chronicles of TFAC'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

UPDATE missions
SET
    name = 'Red Death & Bartholomew',
    mission_description = 'Red Death & Bartholomew mission card',
    mission_set = 'The Chronicles of TFAC',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/red_death_and_bartholomew.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'Red Death & Bartholomew'
    OR mission_description IS DISTINCT FROM 'Red Death & Bartholomew mission card'
    OR mission_set IS DISTINCT FROM 'The Chronicles of TFAC'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

UPDATE missions
SET
    name = 'The Hangmen Gang',
    mission_description = 'The Hangmen Gang mission card',
    mission_set = 'The Chronicles of TFAC',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_chronicles_of_tfac/the_hangmen_gang.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'The Hangmen Gang'
    OR mission_description IS DISTINCT FROM 'The Hangmen Gang mission card'
    OR mission_set IS DISTINCT FROM 'The Chronicles of TFAC'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );
