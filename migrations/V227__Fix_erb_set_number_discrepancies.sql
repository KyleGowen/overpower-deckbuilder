-- Fix ERB set number discrepancies identified by reconciling against checklist_erb_world_legends.csv
--
-- Group 1: Wicked Witch of the West specials (off-by-one bug)
--   Root cause: V199/V200 overwrote V184's correct values (273-278) with 272-277,
--   colliding with the Wicked Witch of the West character card at 272.
UPDATE special_cards SET set_number = '273' WHERE name = 'Aquaphobic'                    AND "set" = 'ERB';
UPDATE special_cards SET set_number = '274' WHERE name = 'Feared by All Witches'         AND "set" = 'ERB';
UPDATE special_cards SET set_number = '275' WHERE name = 'I Will Have Those Silver Shoes!' AND "set" = 'ERB';
UPDATE special_cards SET set_number = '276' WHERE name = 'One Eye'                       AND "set" = 'ERB';
UPDATE special_cards SET set_number = '277' WHERE name = 'Harness the Wind'              AND "set" = 'ERB';
UPDATE special_cards SET set_number = '278' WHERE name = 'Wolves, Crows, & Black Bees'  AND "set" = 'ERB';

-- Group 2: Fix misspelling of "Heimdell" (cataclysm Any-Character special, set_number 439 is correct)
UPDATE special_cards SET name = 'Heimdell'
WHERE name = 'Heimdall' AND "set" = 'ERB' AND cataclysm = TRUE AND character_name = 'Any Character';

-- Group 3: Fix Ancestral Rapier (Zorro special) — correct set_number from 439 to 289
--   V199 incorrectly assigned this card to 439; the correct position per the checklist is 289.
UPDATE special_cards SET set_number = '289'
WHERE name = 'Ancestral Rapier' AND "set" = 'ERB' AND character_name = 'Zorro';

-- Group 4: Wicked Witch of the West character cards — set_number was never assigned
--   V184/V185 used "Wicked Witch of the West" in the WHERE clause but the DB name is
--   "Wicked Witch", so both character rows silently received no update.
UPDATE characters SET set_number = '272'
WHERE name = 'Wicked Witch' AND "set" = 'ERB' AND image_path = 'characters/wicked_witch.webp';

UPDATE characters SET set_number = '532'
WHERE name = 'Wicked Witch' AND "set" = 'ERB' AND image_path = 'characters/alternate/WickedWitch-Alt.png';
