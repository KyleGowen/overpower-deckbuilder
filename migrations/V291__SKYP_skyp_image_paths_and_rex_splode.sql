-- Relocate SKYP promo art to skyp/ folder paths and add Rex Splode Comic Con exclusive character.
-- Idempotent: repairs legacy alternate paths and missing Rex Splode row.

INSERT INTO sets (code, name) VALUES
    ('SKYP', 'Skybound - Promos')
ON CONFLICT (code) DO NOTHING;

-- 7 - Any-Power SKYP: move from power-cards/alternate/ to skyp/power/
UPDATE power_cards
SET image_path = 'skyp/power/7_anypower.png', updated_at = NOW()
WHERE image_path IN (
    'power-cards/alternate/7_anypower.png',
    'power-cards/alternate/7_anypower.webp'
)
AND set = 'SKYP';

-- Ensure row exists at new path (repairs missing row after path migration)
INSERT INTO power_cards (
    id,
    name,
    power_type,
    value,
    image_path,
    one_per_deck,
    set,
    set_number,
    set_number_foil,
    rarity,
    is_foil,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    '7 - Any-Power',
    'Any-Power',
    7,
    'skyp/power/7_anypower.png',
    TRUE,
    'SKYP',
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'skyp/power/7_anypower.png'
);

UPDATE power_cards
SET
    name = '7 - Any-Power',
    power_type = 'Any-Power',
    value = 7,
    set = 'SKYP',
    one_per_deck = TRUE,
    is_foil = FALSE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'skyp/power/7_anypower.png'
  AND (
    name IS DISTINCT FROM '7 - Any-Power'
    OR power_type IS DISTINCT FROM 'Any-Power'
    OR value IS DISTINCT FROM 7
    OR set IS DISTINCT FROM 'SKYP'
    OR one_per_deck IS NOT TRUE
    OR is_foil IS TRUE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

-- Rex Splode Comic Con exclusive (SKYP promo — no main-line SKY base row yet)
INSERT INTO characters (
    id,
    name,
    set,
    description,
    energy,
    combat,
    brute_force,
    intelligence,
    image_path,
    threat_level,
    special_abilities,
    set_number,
    set_number_foil,
    rarity,
    is_foil,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    'Rex Splode',
    'SKYP',
    NULL,
    7,
    5,
    3,
    2,
    'skyp/characters/RexSplode-ComicConExclusive.png',
    18,
    'Placed Energy Power cards 1 through 4 are considered ''Charged Power cards'' and are +1 to attack.',
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM characters
    WHERE name = 'Rex Splode'
      AND image_path = 'skyp/characters/RexSplode-ComicConExclusive.png'
);
