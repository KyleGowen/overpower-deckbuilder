-- TFCP foil-only mission promos: The Crows of Mana'Olana (2 cards).
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
    'Kidnapping In The Dead Of Night',
    'TFCP',
    'Kidnapping In The Dead Of Night mission card',
    'The Crows of Mana''Olana',
    'tfacp/missions/the_crows_of_mana_olana/kidnapping_in_the_dead_of_night.jpg',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/kidnapping_in_the_dead_of_night.jpg'
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
    'The Curse Chaser',
    'TFCP',
    'The Curse Chaser mission card',
    'The Crows of Mana''Olana',
    'tfacp/missions/the_crows_of_mana_olana/the_curse_chaser.jpg',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/the_curse_chaser.jpg'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

UPDATE missions
SET
    name = 'Kidnapping In The Dead Of Night',
    mission_description = 'Kidnapping In The Dead Of Night mission card',
    mission_set = 'The Crows of Mana''Olana',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/kidnapping_in_the_dead_of_night.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'Kidnapping In The Dead Of Night'
    OR mission_description IS DISTINCT FROM 'Kidnapping In The Dead Of Night mission card'
    OR mission_set IS DISTINCT FROM 'The Crows of Mana''Olana'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

UPDATE missions
SET
    name = 'The Curse Chaser',
    mission_description = 'The Curse Chaser mission card',
    mission_set = 'The Crows of Mana''Olana',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/the_curse_chaser.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'The Curse Chaser'
    OR mission_description IS DISTINCT FROM 'The Curse Chaser mission card'
    OR mission_set IS DISTINCT FROM 'The Crows of Mana''Olana'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );
