-- Fix Master Thief (Robin Hood) special card image path.
-- It was incorrectly set to robin_hood_master_thief.webp (Any Character card) by V81/V83.
-- Correct image file on disk is master_theif.webp.
UPDATE special_cards
SET image_path = 'specials/master_theif.webp'
WHERE name = 'Master Thief' AND character_name = 'Robin Hood';
