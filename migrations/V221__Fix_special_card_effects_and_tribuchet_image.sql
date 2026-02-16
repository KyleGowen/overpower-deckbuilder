-- Fix special card effects and Tribuchet image path
-- This migration corrects incorrect card_effect text for two special cards
-- and fixes the image path for the Tribuchet basic universe card.

-- Fix Pitchforks and Torches (Angry Mob: Middle Ages) - correct card effect
UPDATE special_cards
SET card_effect = 'Acts as a level 7 MultiPower attack.  If successful, target character may not play Special cards for remainder of battle',
    updated_at = NOW()
WHERE name = 'Pitchforks and Torches' AND character_name = 'Angry Mob: Middle Ages';

-- Fix Avalon's Warmth (Morgan le Fay) - correct card effect
UPDATE special_cards
SET card_effect = 'Remove all hits from the permanent record of Morgan le Fay or target teammate. May be played from Reserve. **One Per Deck**',
    updated_at = NOW()
WHERE name = 'Avalon''s Warmth' AND character_name = 'Morgan le Fay';

-- Fix Tribuchet basic universe card - correct image path
UPDATE basic_universe_cards
SET image_path = 'basic-universe/7_brute_force_3.webp'
WHERE name = 'Tribuchet'
  AND type = 'Brute Force'
  AND value_to_use = '7 or greater'
  AND bonus = '+3';
