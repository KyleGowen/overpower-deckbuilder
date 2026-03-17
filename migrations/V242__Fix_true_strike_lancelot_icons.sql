-- Fix "True Strike" (Lancelot) special card icons.
-- The card acts as a level 7 Combat attack, or level 10 Any-Power attack,
-- so it should carry both Combat and Any-Power icons.
UPDATE special_cards
SET icons = ARRAY['Combat', 'Any-Power']
WHERE name = 'True Strike'
  AND character_name = 'Lancelot';
