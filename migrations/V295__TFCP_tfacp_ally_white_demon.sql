-- TFCP promo ally: White Demon Of Mazandaran (5 or less Energy, 3 Energy attack).
-- Idempotent: INSERT missing row and normalize metadata per promo-set rules (V257).

INSERT INTO sets (code, name) VALUES
    ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;

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
    'White Demon Of Mazandaran',
    'TFCP',
    'White Demon Of Mazandaran ally card',
    '5 or less',
    'Energy',
    3,
    'Energy',
    'Teammate must play 1 Special card.',
    'tfacp/ally/5_energy.png',
    FALSE,
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM ally_universe_cards
    WHERE image_path = 'tfacp/ally/5_energy.png'
      AND set = 'TFCP'
      AND is_foil = FALSE
);

UPDATE ally_universe_cards
SET
    name = 'White Demon Of Mazandaran',
    card_description = 'White Demon Of Mazandaran ally card',
    stat_to_use = '5 or less',
    stat_type_to_use = 'Energy',
    attack_value = 3,
    attack_type = 'Energy',
    card_text = 'Teammate must play 1 Special card.',
    set = 'TFCP',
    one_per_deck = FALSE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/ally/5_energy.png'
  AND set = 'TFCP'
  AND is_foil = FALSE
  AND (
    name IS DISTINCT FROM 'White Demon Of Mazandaran'
    OR card_description IS DISTINCT FROM 'White Demon Of Mazandaran ally card'
    OR stat_to_use IS DISTINCT FROM '5 or less'
    OR stat_type_to_use IS DISTINCT FROM 'Energy'
    OR attack_value IS DISTINCT FROM 3
    OR attack_type IS DISTINCT FROM 'Energy'
    OR card_text IS DISTINCT FROM 'Teammate must play 1 Special card.'
    OR one_per_deck IS NOT FALSE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );
