-- Relocate TFCP 7 - Combat promo art from power-cards/alternate/ to tfacp/power/.
-- Idempotent: updates base and foil rows sharing the same image_path.

INSERT INTO sets (code, name) VALUES
    ('TFCP', 'The Few and the Cursed - Promos')
ON CONFLICT (code) DO NOTHING;

UPDATE power_cards
SET image_path = 'tfacp/power/7_combat.png', updated_at = NOW()
WHERE image_path IN (
    'power-cards/alternate/7_combat.png',
    'power-cards/alternate/7_combat.webp'
)
AND set = 'TFCP';

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
    'tfacp/power/7_combat.png',
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
    WHERE image_path = 'tfacp/power/7_combat.png'
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
WHERE image_path = 'tfacp/power/7_combat.png'
  AND set = 'TFCP'
  AND (
    name IS DISTINCT FROM '7 - Combat'
    OR power_type IS DISTINCT FROM 'Combat'
    OR value IS DISTINCT FROM 7
    OR one_per_deck IS NOT TRUE
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );
