-- Ensure 7 - Any-Power Skybound promo alternate art exists as its own power_cards row
-- (grouped in UI/deck editor with main ERB art via power_type + value = 7 + Any-Power).
-- Idempotent: repairs missing rows, wrong metadata, or legacy .webp path.

INSERT INTO sets (code, name) VALUES
    ('SKYP', 'Skybound - Promos')
ON CONFLICT (code) DO NOTHING;

-- Prefer PNG (on-disk asset + integration tests). If both rows exist, remove legacy webp row.
DELETE FROM power_cards pc
USING power_cards png
WHERE pc.image_path = 'power-cards/alternate/7_anypower.webp'
  AND png.image_path = 'power-cards/alternate/7_anypower.png'
  AND pc.id <> png.id;

UPDATE power_cards
SET image_path = 'power-cards/alternate/7_anypower.png', updated_at = NOW()
WHERE image_path = 'power-cards/alternate/7_anypower.webp';

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
    'power-cards/alternate/7_anypower.png',
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
    WHERE image_path = 'power-cards/alternate/7_anypower.png'
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
WHERE image_path = 'power-cards/alternate/7_anypower.png'
  AND (
    name IS DISTINCT FROM '7 - Any-Power'
    OR power_type IS DISTINCT FROM 'Any-Power'
    OR value IS DISTINCT FROM 7
    OR set IS DISTINCT FROM 'SKYP'
    OR one_per_deck IS NOT TRUE
    OR is_foil IS TRUE
  );
