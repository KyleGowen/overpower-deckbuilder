-- V246 matched only .png; some DBs still have .jpg (V213) or other extensions for the same file.
-- Prize-pack Sherlock (violin art) must be checklist #539 Rare, not base #209.

UPDATE characters
SET set_number = '539',
    rarity = 'Rare'
WHERE name = 'Sherlock Holmes'
  AND is_foil = false
  AND (
    image_path ILIKE '%/Sherlock-PrizePack_Alt%'
    OR image_path = 'characters/alternate/sherlock_holmes2.jpg'
  );
