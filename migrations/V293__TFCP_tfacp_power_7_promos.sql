-- TFCP promo power cards: 7 Energy, 7 Brute Force, 7 Intelligence, and second 7 Combat printing.
-- Idempotent: INSERT missing rows and normalize metadata per promo-set rules (V257).

INSERT INTO sets (code, name) VALUES
    ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;

-- 7 - Energy
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
    '7 - Energy',
    'Energy',
    7,
    'tfacp/power/7_energy.jpg',
    TRUE,
    'TFCP',
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/7_energy.jpg'
      AND set = 'TFCP'
      AND is_foil = FALSE
);

UPDATE power_cards
SET
    name = '7 - Energy',
    power_type = 'Energy',
    value = 7,
    set = 'TFCP',
    one_per_deck = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/power/7_energy.jpg'
  AND set = 'TFCP'
  AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '7 - Energy'
    OR power_type IS DISTINCT FROM 'Energy'
    OR value IS DISTINCT FROM 7
    OR one_per_deck IS NOT TRUE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

-- 7 - Brute Force
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
    '7 - Brute Force',
    'Brute Force',
    7,
    'tfacp/power/7_brute_force.jpg',
    TRUE,
    'TFCP',
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/7_brute_force.jpg'
      AND set = 'TFCP'
      AND is_foil = FALSE
);

UPDATE power_cards
SET
    name = '7 - Brute Force',
    power_type = 'Brute Force',
    value = 7,
    set = 'TFCP',
    one_per_deck = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/power/7_brute_force.jpg'
  AND set = 'TFCP'
  AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '7 - Brute Force'
    OR power_type IS DISTINCT FROM 'Brute Force'
    OR value IS DISTINCT FROM 7
    OR one_per_deck IS NOT TRUE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

-- 7 - Intelligence
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
    '7 - Intelligence',
    'Intelligence',
    7,
    'tfacp/power/7_intelligence.jpg',
    TRUE,
    'TFCP',
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/7_intelligence.jpg'
      AND set = 'TFCP'
      AND is_foil = FALSE
);

UPDATE power_cards
SET
    name = '7 - Intelligence',
    power_type = 'Intelligence',
    value = 7,
    set = 'TFCP',
    one_per_deck = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/power/7_intelligence.jpg'
  AND set = 'TFCP'
  AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '7 - Intelligence'
    OR power_type IS DISTINCT FROM 'Intelligence'
    OR value IS DISTINCT FROM 7
    OR one_per_deck IS NOT TRUE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

-- 7 - Combat (second printing)
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
    '7 - Combat',
    'Combat',
    7,
    'tfacp/power/7_combat_2.jpg',
    TRUE,
    'TFCP',
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/7_combat_2.jpg'
      AND set = 'TFCP'
      AND is_foil = FALSE
);

UPDATE power_cards
SET
    name = '7 - Combat',
    power_type = 'Combat',
    value = 7,
    set = 'TFCP',
    one_per_deck = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/power/7_combat_2.jpg'
  AND set = 'TFCP'
  AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '7 - Combat'
    OR power_type IS DISTINCT FROM 'Combat'
    OR value IS DISTINCT FROM 7
    OR one_per_deck IS NOT TRUE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );
