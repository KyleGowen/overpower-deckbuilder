-- Fix mission image_path values to match actual files in src/resources/cards/images/missions/
-- Aligns database with V74 directory structure; corrects any stray or legacy paths.
-- Each path must match a file under missions/{set-folder}/{filename}.webp

-- King of the Jungle
UPDATE missions SET image_path = 'missions/king-of-the-jungle/beasts_of_tarzan.webp' WHERE name = 'Beasts of Tarzan' AND mission_set = 'King of the Jungle';
UPDATE missions SET image_path = 'missions/king-of-the-jungle/tarzan_and_the_castaways.webp' WHERE name = 'Tarzan and the Castaways' AND mission_set = 'King of the Jungle';
UPDATE missions SET image_path = 'missions/king-of-the-jungle/tarzan_and_the_city_of_gold.webp' WHERE name = 'Tarzan and the City of Gold' AND mission_set = 'King of the Jungle';
UPDATE missions SET image_path = 'missions/king-of-the-jungle/tarzan_and_the_golden_lion.webp' WHERE name = 'Tarzan and the Golden Lion' AND mission_set = 'King of the Jungle';
UPDATE missions SET image_path = 'missions/king-of-the-jungle/tarzan_at_the_earths_core.webp' WHERE name = 'Tarzan at the Earth''s Core' AND mission_set = 'King of the Jungle';
UPDATE missions SET image_path = 'missions/king-of-the-jungle/tarzan_of_the_apes.webp' WHERE name = 'Tarzan of the Apes' AND mission_set = 'King of the Jungle';
UPDATE missions SET image_path = 'missions/king-of-the-jungle/tarzans_quest.webp' WHERE name = 'Tarzan''s Quest' AND mission_set = 'King of the Jungle';

-- The Call of Cthulhu
UPDATE missions SET image_path = 'missions/the-call-of-cthulhu/gone_too_far.webp' WHERE name = 'Gone Too Far' AND mission_set = 'The Call of Cthulhu';
UPDATE missions SET image_path = 'missions/the-call-of-cthulhu/johansens_widow.webp' WHERE name = 'Johansen''s Widow' AND mission_set = 'The Call of Cthulhu';
UPDATE missions SET image_path = 'missions/the-call-of-cthulhu/new_orleans_1908.webp' WHERE name = 'New Orleans, 1908' AND mission_set = 'The Call of Cthulhu';
UPDATE missions SET image_path = 'missions/the-call-of-cthulhu/professor_angells_investigation.webp' WHERE name = 'Professor Angell''s Investigation' AND mission_set = 'The Call of Cthulhu';
UPDATE missions SET image_path = 'missions/the-call-of-cthulhu/the_alert.webp' WHERE name = 'The Alert' AND mission_set = 'The Call of Cthulhu';
UPDATE missions SET image_path = 'missions/the-call-of-cthulhu/the_dreams_of_men.webp' WHERE name = 'The Dreams of Men' AND mission_set = 'The Call of Cthulhu';
UPDATE missions SET image_path = 'missions/the-call-of-cthulhu/worshipping_the_great_old_one.webp' WHERE name = 'Worshipping the Great Old One' AND mission_set = 'The Call of Cthulhu';

-- The Warlord of Mars
UPDATE missions SET image_path = 'missions/the-warlord-of-mars/a_fighting_man_of_mars.webp' WHERE name = 'A Fighting Man of Mars' AND mission_set = 'The Warlord of Mars';
UPDATE missions SET image_path = 'missions/the-warlord-of-mars/swords_of_mars.webp' WHERE name = 'Swords of Mars' AND mission_set = 'The Warlord of Mars';
UPDATE missions SET image_path = 'missions/the-warlord-of-mars/the_battle_of_kings.webp' WHERE name = 'The Battle of Kings' AND mission_set = 'The Warlord of Mars';
UPDATE missions SET image_path = 'missions/the-warlord-of-mars/the_face_of_death.webp' WHERE name = 'The Face of Death' AND mission_set = 'The Warlord of Mars';
UPDATE missions SET image_path = 'missions/the-warlord-of-mars/the_invisible_men.webp' WHERE name = 'The Invisible Men' AND mission_set = 'The Warlord of Mars';
UPDATE missions SET image_path = 'missions/the-warlord-of-mars/the_loyalty_of_woola.webp' WHERE name = 'The Loyalty of Woola' AND mission_set = 'The Warlord of Mars';
UPDATE missions SET image_path = 'missions/the-warlord-of-mars/under_the_moons_of_mars.webp' WHERE name = 'Under the Moons of Mars' AND mission_set = 'The Warlord of Mars';

-- Time Wars: Rise of the Gods
UPDATE missions SET image_path = 'missions/time-wars-rise-of-the-gods/battle_at_olympus.webp' WHERE name = 'Battle at Olympus' AND mission_set = 'Time Wars: Rise of the Gods';
UPDATE missions SET image_path = 'missions/time-wars-rise-of-the-gods/divine_retribution.webp' WHERE name = 'Divine Retribution' AND mission_set = 'Time Wars: Rise of the Gods';
UPDATE missions SET image_path = 'missions/time-wars-rise-of-the-gods/supernatural_allies.webp' WHERE name = 'Supernatural Allies' AND mission_set = 'Time Wars: Rise of the Gods';
UPDATE missions SET image_path = 'missions/time-wars-rise-of-the-gods/the_gods_return.webp' WHERE name = 'The Gods Return' AND mission_set = 'Time Wars: Rise of the Gods';
UPDATE missions SET image_path = 'missions/time-wars-rise-of-the-gods/tide_begins_to_turn.webp' WHERE name = 'Tide Begins to Turn' AND mission_set = 'Time Wars: Rise of the Gods';
UPDATE missions SET image_path = 'missions/time-wars-rise-of-the-gods/travelers_warning.webp' WHERE name = 'Traveler''s Warning' AND mission_set = 'Time Wars: Rise of the Gods';
UPDATE missions SET image_path = 'missions/time-wars-rise-of-the-gods/warriors_from_across_time.webp' WHERE name = 'Warriors from Across Time' AND mission_set = 'Time Wars: Rise of the Gods';
