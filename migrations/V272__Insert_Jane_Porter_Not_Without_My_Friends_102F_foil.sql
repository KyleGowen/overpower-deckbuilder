-- Jane Porter "Not Without My Friends" 102F foil was never inserted: V230 matched
-- name 'Not without my Friends' but V24 seed uses 'Not Without My Friends'. V201
-- set_number_foil update used the same wrong string. Repair base row + foil + map.

-- 1) Backfill set_number_foil on the non-foil row (idempotent)
UPDATE special_cards
SET set_number_foil = '102F'
WHERE character_name = 'Jane Porter'
  AND image_path = 'specials/not_without_my_friends.webp'
  AND is_foil = FALSE
  AND set_number_foil IS DISTINCT FROM '102F';

-- 2) Insert foil row (same columns as V230 special foils)
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '102F', NULL, banned, TRUE
FROM special_cards
WHERE character_name = 'Jane Porter'
  AND image_path = 'specials/not_without_my_friends.webp'
  AND is_foil = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM special_cards s
    WHERE s.character_name = 'Jane Porter'
      AND s.image_path = 'specials/not_without_my_friends.webp'
      AND s.set_number = '102F'
      AND s.is_foil = TRUE
  );

-- 3) foil_card_map for 102 / 102F pair
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id::text, b.id::text, 'special'
FROM special_cards f
JOIN special_cards b
  ON f.character_name = b.character_name
  AND f.name = b.name
  AND f.image_path = b.image_path
WHERE f.character_name = 'Jane Porter'
  AND f.image_path = 'specials/not_without_my_friends.webp'
  AND f.is_foil = TRUE
  AND f.set_number = '102F'
  AND b.is_foil = FALSE
ON CONFLICT (foil_card_id) DO NOTHING;
