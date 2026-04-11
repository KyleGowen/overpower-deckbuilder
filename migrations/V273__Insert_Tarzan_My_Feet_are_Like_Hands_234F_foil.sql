-- Tarzan "My Feet are Like Hands" 234F foil was never inserted: V230 matched
-- name 'My Feet Feel Like Hands' (checklist typo) but V24 seed uses
-- 'My Feet are Like Hands'. V184/V201 used the wrong string too. Repair.

-- 1) Backfill set_number_foil on the non-foil row (idempotent)
UPDATE special_cards
SET set_number_foil = '234F'
WHERE character_name = 'Tarzan'
  AND image_path = 'specials/my_feet_are_like_hands.webp'
  AND is_foil = FALSE
  AND set_number_foil IS DISTINCT FROM '234F';

-- 2) Insert foil row (same columns as V230 special foils)
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '234F', NULL, banned, TRUE
FROM special_cards
WHERE character_name = 'Tarzan'
  AND image_path = 'specials/my_feet_are_like_hands.webp'
  AND is_foil = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM special_cards s
    WHERE s.character_name = 'Tarzan'
      AND s.image_path = 'specials/my_feet_are_like_hands.webp'
      AND s.set_number = '234F'
      AND s.is_foil = TRUE
  );

-- 3) foil_card_map for 234 / 234F pair
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id::text, b.id::text, 'special'
FROM special_cards f
JOIN special_cards b
  ON f.character_name = b.character_name
  AND f.name = b.name
  AND f.image_path = b.image_path
WHERE f.character_name = 'Tarzan'
  AND f.image_path = 'specials/my_feet_are_like_hands.webp'
  AND f.is_foil = TRUE
  AND f.set_number = '234F'
  AND b.is_foil = FALSE
ON CONFLICT (foil_card_id) DO NOTHING;
