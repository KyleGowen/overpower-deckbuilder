-- TFCP NAOL promo power cards: level 7/8 stat slots + 5 Multi-Power.
-- Idempotent INSERT + metadata normalize per promo-set rules (V257).

INSERT INTO sets (code, name) VALUES
    ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;

-- 7 - Energy (NAOL)
INSERT INTO power_cards (
    id, name, power_type, value, image_path, one_per_deck,
    set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT
    gen_random_uuid(), '7 - Energy', 'Energy', 7, 'tfacp/power/7_energy_naol.png', TRUE,
    'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/7_energy_naol.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE power_cards SET
    name = '7 - Energy', power_type = 'Energy', value = 7, set = 'TFCP',
    one_per_deck = TRUE, set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE image_path = 'tfacp/power/7_energy_naol.png' AND set = 'TFCP' AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '7 - Energy' OR power_type IS DISTINCT FROM 'Energy' OR value IS DISTINCT FROM 7
    OR one_per_deck IS NOT TRUE OR set_number IS NOT NULL OR set_number_foil IS NOT NULL OR rarity IS NOT NULL
  );

-- 7 - Combat (NAOL)
INSERT INTO power_cards (
    id, name, power_type, value, image_path, one_per_deck,
    set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT
    gen_random_uuid(), '7 - Combat', 'Combat', 7, 'tfacp/power/7_combat_naol.png', TRUE,
    'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/7_combat_naol.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE power_cards SET
    name = '7 - Combat', power_type = 'Combat', value = 7, set = 'TFCP',
    one_per_deck = TRUE, set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE image_path = 'tfacp/power/7_combat_naol.png' AND set = 'TFCP' AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '7 - Combat' OR power_type IS DISTINCT FROM 'Combat' OR value IS DISTINCT FROM 7
    OR one_per_deck IS NOT TRUE OR set_number IS NOT NULL OR set_number_foil IS NOT NULL OR rarity IS NOT NULL
  );

-- 7 - Brute Force (NAOL)
INSERT INTO power_cards (
    id, name, power_type, value, image_path, one_per_deck,
    set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT
    gen_random_uuid(), '7 - Brute Force', 'Brute Force', 7, 'tfacp/power/7_brute_force_naol.png', TRUE,
    'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/7_brute_force_naol.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE power_cards SET
    name = '7 - Brute Force', power_type = 'Brute Force', value = 7, set = 'TFCP',
    one_per_deck = TRUE, set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE image_path = 'tfacp/power/7_brute_force_naol.png' AND set = 'TFCP' AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '7 - Brute Force' OR power_type IS DISTINCT FROM 'Brute Force' OR value IS DISTINCT FROM 7
    OR one_per_deck IS NOT TRUE OR set_number IS NOT NULL OR set_number_foil IS NOT NULL OR rarity IS NOT NULL
  );

-- 7 - Intelligence (NAOL)
INSERT INTO power_cards (
    id, name, power_type, value, image_path, one_per_deck,
    set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT
    gen_random_uuid(), '7 - Intelligence', 'Intelligence', 7, 'tfacp/power/7_intelligence_naol.png', TRUE,
    'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/7_intelligence_naol.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE power_cards SET
    name = '7 - Intelligence', power_type = 'Intelligence', value = 7, set = 'TFCP',
    one_per_deck = TRUE, set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE image_path = 'tfacp/power/7_intelligence_naol.png' AND set = 'TFCP' AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '7 - Intelligence' OR power_type IS DISTINCT FROM 'Intelligence' OR value IS DISTINCT FROM 7
    OR one_per_deck IS NOT TRUE OR set_number IS NOT NULL OR set_number_foil IS NOT NULL OR rarity IS NOT NULL
  );

-- 8 - Energy (NAOL)
INSERT INTO power_cards (
    id, name, power_type, value, image_path, one_per_deck,
    set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT
    gen_random_uuid(), '8 - Energy', 'Energy', 8, 'tfacp/power/8_energy_naol.png', TRUE,
    'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/8_energy_naol.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE power_cards SET
    name = '8 - Energy', power_type = 'Energy', value = 8, set = 'TFCP',
    one_per_deck = TRUE, set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE image_path = 'tfacp/power/8_energy_naol.png' AND set = 'TFCP' AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '8 - Energy' OR power_type IS DISTINCT FROM 'Energy' OR value IS DISTINCT FROM 8
    OR one_per_deck IS NOT TRUE OR set_number IS NOT NULL OR set_number_foil IS NOT NULL OR rarity IS NOT NULL
  );

-- 8 - Combat (NAOL)
INSERT INTO power_cards (
    id, name, power_type, value, image_path, one_per_deck,
    set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT
    gen_random_uuid(), '8 - Combat', 'Combat', 8, 'tfacp/power/8_combat_naol.png', TRUE,
    'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/8_combat_naol.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE power_cards SET
    name = '8 - Combat', power_type = 'Combat', value = 8, set = 'TFCP',
    one_per_deck = TRUE, set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE image_path = 'tfacp/power/8_combat_naol.png' AND set = 'TFCP' AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '8 - Combat' OR power_type IS DISTINCT FROM 'Combat' OR value IS DISTINCT FROM 8
    OR one_per_deck IS NOT TRUE OR set_number IS NOT NULL OR set_number_foil IS NOT NULL OR rarity IS NOT NULL
  );

-- 8 - Brute Force (NAOL)
INSERT INTO power_cards (
    id, name, power_type, value, image_path, one_per_deck,
    set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT
    gen_random_uuid(), '8 - Brute Force', 'Brute Force', 8, 'tfacp/power/8_brute_force_naol.png', TRUE,
    'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/8_brute_force_naol.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE power_cards SET
    name = '8 - Brute Force', power_type = 'Brute Force', value = 8, set = 'TFCP',
    one_per_deck = TRUE, set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE image_path = 'tfacp/power/8_brute_force_naol.png' AND set = 'TFCP' AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '8 - Brute Force' OR power_type IS DISTINCT FROM 'Brute Force' OR value IS DISTINCT FROM 8
    OR one_per_deck IS NOT TRUE OR set_number IS NOT NULL OR set_number_foil IS NOT NULL OR rarity IS NOT NULL
  );

-- 8 - Intelligence (NAOL)
INSERT INTO power_cards (
    id, name, power_type, value, image_path, one_per_deck,
    set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT
    gen_random_uuid(), '8 - Intelligence', 'Intelligence', 8, 'tfacp/power/8_intelligence_naol.png', TRUE,
    'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/8_intelligence_naol.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE power_cards SET
    name = '8 - Intelligence', power_type = 'Intelligence', value = 8, set = 'TFCP',
    one_per_deck = TRUE, set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE image_path = 'tfacp/power/8_intelligence_naol.png' AND set = 'TFCP' AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '8 - Intelligence' OR power_type IS DISTINCT FROM 'Intelligence' OR value IS DISTINCT FROM 8
    OR one_per_deck IS NOT TRUE OR set_number IS NOT NULL OR set_number_foil IS NOT NULL OR rarity IS NOT NULL
  );

-- 5 - Multi Power (NAOL)
INSERT INTO power_cards (
    id, name, power_type, value, image_path, one_per_deck,
    set, set_number, set_number_foil, rarity, is_foil, created_at, updated_at
)
SELECT
    gen_random_uuid(), '5 - Multi Power', 'Multi Power', 5, 'tfacp/power/5_multipower_naol.png', TRUE,
    'TFCP', NULL, NULL, NULL, FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE image_path = 'tfacp/power/5_multipower_naol.png' AND set = 'TFCP' AND is_foil = FALSE
);

UPDATE power_cards SET
    name = '5 - Multi Power', power_type = 'Multi Power', value = 5, set = 'TFCP',
    one_per_deck = TRUE, set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE image_path = 'tfacp/power/5_multipower_naol.png' AND set = 'TFCP' AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM '5 - Multi Power' OR power_type IS DISTINCT FROM 'Multi Power' OR value IS DISTINCT FROM 5
    OR one_per_deck IS NOT TRUE OR set_number IS NOT NULL OR set_number_foil IS NOT NULL OR rarity IS NOT NULL
  );
