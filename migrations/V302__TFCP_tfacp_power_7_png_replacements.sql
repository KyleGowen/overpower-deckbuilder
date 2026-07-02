-- TFCP level-7 promo power art replacements: on-disk jpg → png paths.
-- 7_combat.png foil art also replaced on disk (image_path unchanged).

UPDATE power_cards
SET image_path = 'tfacp/power/7_energy.png',
    updated_at = NOW()
WHERE set = 'TFCP'
  AND image_path = 'tfacp/power/7_energy.jpg'
  AND is_foil = FALSE;

UPDATE power_cards
SET image_path = 'tfacp/power/7_brute_force.png',
    updated_at = NOW()
WHERE set = 'TFCP'
  AND image_path = 'tfacp/power/7_brute_force.jpg'
  AND is_foil = FALSE;

UPDATE power_cards
SET image_path = 'tfacp/power/7_intelligence.png',
    updated_at = NOW()
WHERE set = 'TFCP'
  AND image_path = 'tfacp/power/7_intelligence.jpg'
  AND is_foil = FALSE;

UPDATE power_cards
SET image_path = 'tfacp/power/7_combat_2.png',
    updated_at = NOW()
WHERE set = 'TFCP'
  AND image_path = 'tfacp/power/7_combat_2.jpg'
  AND is_foil = FALSE;

UPDATE collection_cards
SET image_path = REPLACE(image_path, 'tfacp/power/7_energy.jpg', 'tfacp/power/7_energy.png'),
    updated_at = NOW()
WHERE image_path LIKE '%tfacp/power/7_energy.jpg%';

UPDATE collection_cards
SET image_path = REPLACE(image_path, 'tfacp/power/7_brute_force.jpg', 'tfacp/power/7_brute_force.png'),
    updated_at = NOW()
WHERE image_path LIKE '%tfacp/power/7_brute_force.jpg%';

UPDATE collection_cards
SET image_path = REPLACE(image_path, 'tfacp/power/7_intelligence.jpg', 'tfacp/power/7_intelligence.png'),
    updated_at = NOW()
WHERE image_path LIKE '%tfacp/power/7_intelligence.jpg%';

UPDATE collection_cards
SET image_path = REPLACE(image_path, 'tfacp/power/7_combat_2.jpg', 'tfacp/power/7_combat_2.png'),
    updated_at = NOW()
WHERE image_path LIKE '%tfacp/power/7_combat_2.jpg%';
