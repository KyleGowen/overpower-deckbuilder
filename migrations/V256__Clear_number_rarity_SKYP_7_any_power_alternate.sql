-- SKYP promo alternate: no retail checklist # or tier on the card (like ERBP promo rows).
-- Main-line ERB 7 Any-Power (475 / 475F) is unchanged.

UPDATE power_cards
SET
  set_number = NULL,
  set_number_foil = NULL,
  rarity = NULL,
  updated_at = NOW()
WHERE set = 'SKYP'
  AND power_type = 'Any-Power'
  AND value = 7
  AND image_path IN (
    'power-cards/alternate/7_anypower.png',
    'power-cards/alternate/7_anypower.webp'
  );
