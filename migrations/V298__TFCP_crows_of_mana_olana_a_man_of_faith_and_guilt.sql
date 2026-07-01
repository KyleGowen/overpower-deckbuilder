-- TFCP foil-only mission promo: A Man Of Faith And Guilt (The Crows of Mana'Olana).
-- Idempotent: INSERT missing row and normalize metadata per promo-set rules (V257).

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
    'A Man Of Faith And Guilt',
    'TFCP',
    'A Man Of Faith And Guilt mission card',
    'The Crows of Mana''Olana',
    'tfacp/missions/the_crows_of_mana_olana/a_man_of_faith_and_guilt.jpg',
    TRUE,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM missions
    WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/a_man_of_faith_and_guilt.jpg'
      AND set = 'TFCP'
      AND is_foil = TRUE
);

UPDATE missions
SET
    name = 'A Man Of Faith And Guilt',
    mission_description = 'A Man Of Faith And Guilt mission card',
    mission_set = 'The Crows of Mana''Olana',
    set = 'TFCP',
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE image_path = 'tfacp/missions/the_crows_of_mana_olana/a_man_of_faith_and_guilt.jpg'
  AND set = 'TFCP'
  AND is_foil = TRUE
  AND (
    name IS DISTINCT FROM 'A Man Of Faith And Guilt'
    OR mission_description IS DISTINCT FROM 'A Man Of Faith And Guilt mission card'
    OR mission_set IS DISTINCT FROM 'The Crows of Mana''Olana'
    OR set_number IS NOT NULL
    OR set_number_foil IS NOT NULL
    OR rarity IS NOT NULL
  );
