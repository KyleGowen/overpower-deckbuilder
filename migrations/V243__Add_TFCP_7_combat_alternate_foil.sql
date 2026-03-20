-- Foil for TFCP promo: 7 - Combat alternate art (power-cards/alternate/7_combat.png).
-- Base row keeps checklist #301; foil row is 301F. Same image_path as base (shimmer via CSS).

UPDATE power_cards
SET set_number_foil = '301F'
WHERE power_type = 'Combat'
  AND value = 7
  AND image_path = 'power-cards/alternate/7_combat.png'
  AND is_foil = FALSE;

INSERT INTO power_cards (id, name, power_type, value, image_path, one_per_deck, set, set_number, set_number_foil, is_foil, created_at, updated_at)
SELECT gen_random_uuid(), name, power_type, value, image_path, one_per_deck, set, '301F', NULL, TRUE, created_at, NOW()
FROM power_cards
WHERE power_type = 'Combat'
  AND value = 7
  AND image_path = 'power-cards/alternate/7_combat.png'
  AND is_foil = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE power_type = 'Combat'
      AND value = 7
      AND image_path = 'power-cards/alternate/7_combat.png'
      AND set_number = '301F'
      AND is_foil = TRUE
  );

INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id::text, b.id::text, 'power'
FROM power_cards f
JOIN power_cards b
  ON f.power_type = b.power_type
  AND f.value = b.value
  AND f.image_path = b.image_path
WHERE f.power_type = 'Combat'
  AND f.value = 7
  AND f.image_path = 'power-cards/alternate/7_combat.png'
  AND f.is_foil = TRUE
  AND b.is_foil = FALSE
ON CONFLICT (foil_card_id) DO NOTHING;
