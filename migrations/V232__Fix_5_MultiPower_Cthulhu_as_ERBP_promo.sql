-- Fix 5 Multi Power Cthulhu alternate art: move to ERBP promo set with correct card numbers (7 / 7F).
-- Tarzan (original art) stays ERB 479/479F. Cthulhu (alternate art) becomes ERBP 7/7F.
-- Both remain alternate art versions of the same card for deck-building (grouped by power_type + value).

-- Step 1: Add ERBP set
INSERT INTO sets (code, name) VALUES
    ('ERBP', 'Edgar Rice Burroughs and the World Legends - Promos')
ON CONFLICT (code) DO NOTHING;

-- Step 2: Fix Cthulhu base card - move to ERBP, set numbers 7 / 7F
UPDATE power_cards
SET set = 'ERBP', set_number = '7', set_number_foil = '7F'
WHERE power_type = 'Multi Power'
  AND value = 5
  AND image_path = 'power-cards/alternate/5_multipower.webp'
  AND is_foil = FALSE;

-- Step 3: Ensure 479F foil has Tarzan (original) image - V230 LIMIT 1 may have picked Cthulhu
UPDATE power_cards
SET image_path = 'power-cards/5_multipower.webp'
WHERE power_type = 'Multi Power'
  AND value = 5
  AND set_number = '479F'
  AND is_foil = TRUE
  AND image_path = 'power-cards/alternate/5_multipower.webp';

-- Step 4: Insert Cthulhu foil row (7F)
INSERT INTO power_cards (id, name, power_type, value, image_path, one_per_deck, set, set_number, set_number_foil, is_foil, created_at, updated_at)
SELECT gen_random_uuid(), name, power_type, value, image_path, one_per_deck, 'ERBP', '7F', NULL, TRUE, created_at, NOW()
FROM power_cards
WHERE power_type = 'Multi Power'
  AND value = 5
  AND image_path = 'power-cards/alternate/5_multipower.webp'
  AND is_foil = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM power_cards
    WHERE power_type = 'Multi Power' AND value = 5
      AND image_path = 'power-cards/alternate/5_multipower.webp'
      AND set_number = '7F'
  );

-- Step 5: Rebuild foil_card_map for 5 Multi Power (delete old, insert correct mappings)
-- V231 joins on power_type + value + image_path; we need both Tarzan and Cthulhu mappings
DELETE FROM foil_card_map
WHERE card_type = 'power'
  AND foil_card_id IN (
    SELECT id::text FROM power_cards
    WHERE power_type = 'Multi Power' AND value = 5 AND is_foil = TRUE
  );

INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id, b.id, 'power'
FROM power_cards f
JOIN power_cards b
  ON f.power_type = b.power_type
  AND f.value = b.value
  AND f.image_path = b.image_path
WHERE f.power_type = 'Multi Power'
  AND f.value = 5
  AND f.is_foil = TRUE
  AND b.is_foil = FALSE
ON CONFLICT (foil_card_id) DO NOTHING;

-- Step 6: Add checklist rows for ERBP 7 and 7F
INSERT INTO checklist_erb_world_legends ("Set", "#", "Card Name", "Card Special", "Rarity", "Location")
SELECT 'ERBP', '7', '5 MultiPower Power Card', 'MultiPower Power Card', 'Uncommon', 'Promo'
WHERE NOT EXISTS (SELECT 1 FROM checklist_erb_world_legends WHERE "Set" = 'ERBP' AND "#" = '7');

INSERT INTO checklist_erb_world_legends ("Set", "#", "Card Name", "Card Special", "Rarity", "Location")
SELECT 'ERBP', '7F', '5 MultiPower Power Card', 'MultiPower Power Card', '*Uncommon slot, rare drop', 'Promo'
WHERE NOT EXISTS (SELECT 1 FROM checklist_erb_world_legends WHERE "Set" = 'ERBP' AND "#" = '7F');
