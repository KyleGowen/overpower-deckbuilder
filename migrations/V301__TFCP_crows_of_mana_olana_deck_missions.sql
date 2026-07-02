-- TFCP foil missions: The Crows of Mana'Olana deck (7 cards).
-- 3 replacements (V297/V298 rows: image_path + name refresh) + 4 new mission rows.
-- Idempotent per promo-set rules (V257).

INSERT INTO sets (code, name) VALUES
    ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;

-- Replacement: the_curse_chaser jpg → png
UPDATE missions
SET
    name = 'The Curse Chaser',
    mission_description = 'The Curse Chaser mission card',
    mission_set = 'The Crows of Mana''Olana',
    image_path = 'tfacp/missions/the_crows_of_mana_olana/the_curse_chaser.png',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/the_curse_chaser.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE;

-- Replacement: kidnapping_in_the_dead_of_night → kidnapping_in_the_night
UPDATE missions
SET
    name = 'Kidnapping In The Night',
    mission_description = 'Kidnapping In The Night mission card',
    mission_set = 'The Crows of Mana''Olana',
    image_path = 'tfacp/missions/the_crows_of_mana_olana/kidnapping_in_the_night.png',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/kidnapping_in_the_dead_of_night.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE;

-- Replacement: a_man_of_faith_and_guilt → a_man_of_guilt_and_faith
UPDATE missions
SET
    name = 'A Man Of Guilt And Faith',
    mission_description = 'A Man Of Guilt And Faith mission card',
    mission_set = 'The Crows of Mana''Olana',
    image_path = 'tfacp/missions/the_crows_of_mana_olana/a_man_of_guilt_and_faith.png',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/a_man_of_faith_and_guilt.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE;

-- New: The Crows Are Fake?
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
    'The Crows Are Fake?',
    'TFCP',
    'The Crows Are Fake? mission card',
    'The Crows of Mana''Olana',
    'tfacp/missions/the_crows_of_mana_olana/the_crows_are_fake.png',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/the_crows_are_fake.png'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

-- New: A Horrifying Truth
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
    'A Horrifying Truth',
    'TFCP',
    'A Horrifying Truth mission card',
    'The Crows of Mana''Olana',
    'tfacp/missions/the_crows_of_mana_olana/a_horrifying_truth.png',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/a_horrifying_truth.png'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

-- New: Death Of A Friend
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
    'Death Of A Friend',
    'TFCP',
    'Death Of A Friend mission card',
    'The Crows of Mana''Olana',
    'tfacp/missions/the_crows_of_mana_olana/death_of_a_friend.png',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/death_of_a_friend.png'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

-- New: Crows No More
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
    'Crows No More',
    'TFCP',
    'Crows No More mission card',
    'The Crows of Mana''Olana',
    'tfacp/missions/the_crows_of_mana_olana/crows_no_more.png',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/crows_no_more.png'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

-- Metadata drift: 4 new rows
UPDATE missions
SET
    name = 'The Crows Are Fake?',
    mission_description = 'The Crows Are Fake? mission card',
    mission_set = 'The Crows of Mana''Olana',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/the_crows_are_fake.png'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'The Crows Are Fake?'
    OR mission_description IS DISTINCT FROM 'The Crows Are Fake? mission card'
    OR mission_set IS DISTINCT FROM 'The Crows of Mana''Olana'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

UPDATE missions
SET
    name = 'A Horrifying Truth',
    mission_description = 'A Horrifying Truth mission card',
    mission_set = 'The Crows of Mana''Olana',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/a_horrifying_truth.png'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'A Horrifying Truth'
    OR mission_description IS DISTINCT FROM 'A Horrifying Truth mission card'
    OR mission_set IS DISTINCT FROM 'The Crows of Mana''Olana'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

UPDATE missions
SET
    name = 'Death Of A Friend',
    mission_description = 'Death Of A Friend mission card',
    mission_set = 'The Crows of Mana''Olana',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/death_of_a_friend.png'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'Death Of A Friend'
    OR mission_description IS DISTINCT FROM 'Death Of A Friend mission card'
    OR mission_set IS DISTINCT FROM 'The Crows of Mana''Olana'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

UPDATE missions
SET
    name = 'Crows No More',
    mission_description = 'Crows No More mission card',
    mission_set = 'The Crows of Mana''Olana',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/crows_no_more.png'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'Crows No More'
    OR mission_description IS DISTINCT FROM 'Crows No More mission card'
    OR mission_set IS DISTINCT FROM 'The Crows of Mana''Olana'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );
