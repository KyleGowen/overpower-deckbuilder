-- Prize-pack / promo foil-only print of Training (Sekhmet) (checklist #545 base is ERB).
-- ERBP row: same art and stats as ERB, is_foil TRUE, no checklist # / rarity (promo set rule, V257).

INSERT INTO sets (code, name) VALUES
    ('ERBP', 'Edgar Rice Burroughs and the World Legends - Promos')
ON CONFLICT (code) DO NOTHING;

INSERT INTO training_cards (
    id,
    name,
    set,
    card_description,
    type_1,
    type_2,
    value_to_use,
    bonus,
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
    b.name,
    'ERBP',
    b.card_description,
    b.type_1,
    b.type_2,
    b.value_to_use,
    b.bonus,
    b.image_path,
    b.one_per_deck,
    NULL,
    NULL,
    NULL,
    TRUE,
    b.created_at,
    NOW()
FROM training_cards b
WHERE b.name = 'Training (Sekhmet)'
  AND b.set = 'ERB'
  AND b.is_foil = FALSE
  AND NOT EXISTS (
      SELECT 1
      FROM training_cards x
      WHERE x.name = 'Training (Sekhmet)'
        AND x.set = 'ERBP'
        AND x.is_foil = TRUE
  );

-- Deck editor foil toggle: ERBP foil ID <-> ERB base ID (same name + image_path).
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id::text, b.id::text, 'training'
FROM training_cards f
JOIN training_cards b
  ON b.name = f.name
 AND b.image_path = f.image_path
 AND b.set = 'ERB'
 AND b.is_foil = FALSE
WHERE f.name = 'Training (Sekhmet)'
  AND f.set = 'ERBP'
  AND f.is_foil = TRUE
ON CONFLICT (foil_card_id) DO NOTHING;
