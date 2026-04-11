-- Zorro "Ancestral Rapier" 289F foil was never inserted: V230 matched name 'Rapier'
-- (checklist shorthand) but V24 seed uses 'Ancestral Rapier'. V184/V201 used 'Rapier'
-- for set_number / set_number_foil updates. Repair by canonical name (image_path may be
-- specials/ancestral_rapier.webp or specials/ancestial_rapier.webp after V81/V83).

-- 1) Backfill set_number_foil on the non-foil row (idempotent)
UPDATE special_cards
SET set_number_foil = '289F'
WHERE character_name = 'Zorro'
  AND name = 'Ancestral Rapier'
  AND is_foil = FALSE
  AND set_number_foil IS DISTINCT FROM '289F';

-- 2) Insert foil row (same columns as V230 special foils)
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '289F', NULL, banned, TRUE
FROM special_cards
WHERE character_name = 'Zorro'
  AND name = 'Ancestral Rapier'
  AND is_foil = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM special_cards s
    WHERE s.character_name = 'Zorro'
      AND s.name = 'Ancestral Rapier'
      AND s.set_number = '289F'
      AND s.is_foil = TRUE
  );

-- 3) foil_card_map for 289 / 289F pair
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id::text, b.id::text, 'special'
FROM special_cards f
JOIN special_cards b
  ON f.character_name = b.character_name
  AND f.name = b.name
  AND f.image_path = b.image_path
WHERE f.character_name = 'Zorro'
  AND f.name = 'Ancestral Rapier'
  AND f.is_foil = TRUE
  AND f.set_number = '289F'
  AND b.is_foil = FALSE
ON CONFLICT (foil_card_id) DO NOTHING;
