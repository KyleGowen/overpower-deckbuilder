-- TFCP promo allies: Tsetseg (5 or less Combat), Annabelle (5 or less Brute Force),
-- Alistair Fairweather (5 or less Intelligence).
-- Idempotent: INSERT missing rows and normalize metadata per promo-set rules (V257).

INSERT INTO sets (code, name) VALUES
    ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;

-- Tsetseg — 5 or less Combat → 3 Combat
INSERT INTO ally_universe_cards (
    id,
    name,
    set,
    card_description,
    stat_to_use,
    stat_type_to_use,
    attack_value,
    attack_type,
    card_text,
    image_path,
    one_per_deck,
    set_number,
    set_number_foil,
    rarity,
    is_foil,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    'Tsetseg',
    'TFCP',
    'Tsetseg ally card',
    '5 or less',
    'Combat',
    3,
    'Combat',
    'Teammate must play 1 Special card.',
    'tfacp/ally/5_combat.png',
    FALSE,
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM ally_universe_cards
    WHERE image_path = 'tfacp/ally/5_combat.png'
      AND set = 'TFCP'
      AND is_foil = FALSE
);

UPDATE ally_universe_cards
SET
    name = 'Tsetseg',
    card_description = 'Tsetseg ally card',
    stat_to_use = '5 or less',
    stat_type_to_use = 'Combat',
    attack_value = 3,
    attack_type = 'Combat',
    card_text = 'Teammate must play 1 Special card.',
    set = 'TFCP',
    one_per_deck = FALSE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/ally/5_combat.png'
  AND set = 'TFCP'
  AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM 'Tsetseg'
    OR card_description IS DISTINCT FROM 'Tsetseg ally card'
    OR stat_to_use IS DISTINCT FROM '5 or less'
    OR stat_type_to_use IS DISTINCT FROM 'Combat'
    OR attack_value IS DISTINCT FROM 3
    OR attack_type IS DISTINCT FROM 'Combat'
    OR card_text IS DISTINCT FROM 'Teammate must play 1 Special card.'
    OR one_per_deck IS NOT FALSE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

-- Annabelle — 5 or less Brute Force → 3 Brute Force
INSERT INTO ally_universe_cards (
    id,
    name,
    set,
    card_description,
    stat_to_use,
    stat_type_to_use,
    attack_value,
    attack_type,
    card_text,
    image_path,
    one_per_deck,
    set_number,
    set_number_foil,
    rarity,
    is_foil,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    'Annabelle',
    'TFCP',
    'Annabelle ally card',
    '5 or less',
    'Brute Force',
    3,
    'Brute Force',
    'Teammate must play 1 Special card.',
    'tfacp/ally/5_brute_force.png',
    FALSE,
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM ally_universe_cards
    WHERE image_path = 'tfacp/ally/5_brute_force.png'
      AND set = 'TFCP'
      AND is_foil = FALSE
);

UPDATE ally_universe_cards
SET
    name = 'Annabelle',
    card_description = 'Annabelle ally card',
    stat_to_use = '5 or less',
    stat_type_to_use = 'Brute Force',
    attack_value = 3,
    attack_type = 'Brute Force',
    card_text = 'Teammate must play 1 Special card.',
    set = 'TFCP',
    one_per_deck = FALSE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/ally/5_brute_force.png'
  AND set = 'TFCP'
  AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM 'Annabelle'
    OR card_description IS DISTINCT FROM 'Annabelle ally card'
    OR stat_to_use IS DISTINCT FROM '5 or less'
    OR stat_type_to_use IS DISTINCT FROM 'Brute Force'
    OR attack_value IS DISTINCT FROM 3
    OR attack_type IS DISTINCT FROM 'Brute Force'
    OR card_text IS DISTINCT FROM 'Teammate must play 1 Special card.'
    OR one_per_deck IS NOT FALSE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );

-- Alistair Fairweather — 5 or less Intelligence → 3 Intelligence
INSERT INTO ally_universe_cards (
    id,
    name,
    set,
    card_description,
    stat_to_use,
    stat_type_to_use,
    attack_value,
    attack_type,
    card_text,
    image_path,
    one_per_deck,
    set_number,
    set_number_foil,
    rarity,
    is_foil,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    'Alistair Fairweather',
    'TFCP',
    'Alistair Fairweather ally card',
    '5 or less',
    'Intelligence',
    3,
    'Intelligence',
    'Teammate must play 1 Special card.',
    'tfacp/ally/5_intelligence.png',
    FALSE,
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM ally_universe_cards
    WHERE image_path = 'tfacp/ally/5_intelligence.png'
      AND set = 'TFCP'
      AND is_foil = FALSE
);

UPDATE ally_universe_cards
SET
    name = 'Alistair Fairweather',
    card_description = 'Alistair Fairweather ally card',
    stat_to_use = '5 or less',
    stat_type_to_use = 'Intelligence',
    attack_value = 3,
    attack_type = 'Intelligence',
    card_text = 'Teammate must play 1 Special card.',
    set = 'TFCP',
    one_per_deck = FALSE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/ally/5_intelligence.png'
  AND set = 'TFCP'
  AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM 'Alistair Fairweather'
    OR card_description IS DISTINCT FROM 'Alistair Fairweather ally card'
    OR stat_to_use IS DISTINCT FROM '5 or less'
    OR stat_type_to_use IS DISTINCT FROM 'Intelligence'
    OR attack_value IS DISTINCT FROM 3
    OR attack_type IS DISTINCT FROM 'Intelligence'
    OR card_text IS DISTINCT FROM 'Teammate must play 1 Special card.'
    OR one_per_deck IS NOT FALSE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );
