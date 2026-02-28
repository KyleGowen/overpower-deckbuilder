-- Insert foil card rows derived from the Google Sheet (gid=2083568690).
-- Source of truth: the sheet. V201's set_number_foil values are used only as
-- a join key for alternate art rows; the sheet determines which cards exist.
--
-- Each INSERT copies all data from the source row but sets:
--   is_foil = TRUE
--   set_number = the foil number (e.g. '035F')
--   set_number_foil = NULL (foil rows do not themselves have a foil version)
--
-- All INSERTs are idempotent via NOT EXISTS guards on set_number + name.

-- ============================================================
-- DATA CLEANUP: Remove erroneous 054F assignment from V201.
-- Cthulhu "The Sleeper Awakens" has no foil version per the sheet.
-- ============================================================
UPDATE special_cards
SET set_number_foil = NULL
WHERE character_name = 'Cthulhu'
  AND name = 'The Sleeper Awakens';

-- ============================================================
-- SECTION 1: Character base-art foils (20 characters)
-- Matched by name + set_number (base art only, is_foil = FALSE)
-- ============================================================

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '035F', NULL, TRUE
FROM characters WHERE name = 'Carson of Venus' AND set_number = '035' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Carson of Venus' AND set_number = '035F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '042F', NULL, TRUE
FROM characters WHERE name = 'Count of Monte Cristo' AND set_number = '042' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Count of Monte Cristo' AND set_number = '042F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '048F', NULL, TRUE
FROM characters WHERE name = 'Cthulhu' AND set_number = '048' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Cthulhu' AND set_number = '048F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '055F', NULL, TRUE
FROM characters WHERE name = 'Dejah Thoris' AND set_number = '055' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Dejah Thoris' AND set_number = '055F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '097F', NULL, TRUE
FROM characters WHERE name = 'Jane Porter' AND set_number = '097' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Jane Porter' AND set_number = '097F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '111F', NULL, TRUE
FROM characters WHERE name = 'John Carter of Mars' AND set_number = '111' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'John Carter of Mars' AND set_number = '111F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '118F', NULL, TRUE
FROM characters WHERE name = 'King Arthur' AND set_number = '118' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'King Arthur' AND set_number = '118F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '125F', NULL, TRUE
FROM characters WHERE name = 'Korak' AND set_number = '125' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Korak' AND set_number = '125F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '146F', NULL, TRUE
FROM characters WHERE name = 'Merlin' AND set_number = '146' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Merlin' AND set_number = '146F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '153F', NULL, TRUE
FROM characters WHERE name = 'Mina Harker' AND set_number = '153' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Mina Harker' AND set_number = '153F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '181F', NULL, TRUE
FROM characters WHERE name = 'Professor Moriarty' AND set_number = '181' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Professor Moriarty' AND set_number = '181F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '216F', NULL, TRUE
FROM characters WHERE name = 'Sun Wukong' AND set_number = '216' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Sun Wukong' AND set_number = '216F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '223F', NULL, TRUE
FROM characters WHERE name = 'Tars Tarkas' AND set_number = '223' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Tars Tarkas' AND set_number = '223F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '230F', NULL, TRUE
FROM characters WHERE name = 'Tarzan' AND set_number = '230' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Tarzan' AND set_number = '230F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '237F', NULL, TRUE
FROM characters WHERE name = 'The Mummy' AND set_number = '237' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'The Mummy' AND set_number = '237F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '244F', NULL, TRUE
FROM characters WHERE name = 'The Three Musketeers' AND set_number = '244' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'The Three Musketeers' AND set_number = '244F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '251F', NULL, TRUE
FROM characters WHERE name = 'Time Traveler' AND set_number = '251' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Time Traveler' AND set_number = '251F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '265F', NULL, TRUE
FROM characters WHERE name = 'Victory Harben' AND set_number = '265' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Victory Harben' AND set_number = '265F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '279F', NULL, TRUE
FROM characters WHERE name = 'Zeus' AND set_number = '279' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Zeus' AND set_number = '279F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '285F', NULL, TRUE
FROM characters WHERE name = 'Zorro' AND set_number = '285' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Zorro' AND set_number = '285F');

-- ============================================================
-- SECTION 2: Special card foils (~96 cards)
-- Matched by character_name + name (base art only, is_foil = FALSE)
-- 054F (Cthulhu - The Sleeper Awakens) is intentionally absent per the sheet.
-- 256F uses DB name "Harbinger's Warning" (sheet has a typo).
-- ============================================================

-- Carson of Venus specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '036F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'Janjong Duare Mintep' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'Janjong Duare Mintep' AND set_number = '036F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '037F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'On the Razor''s Edge' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'On the Razor''s Edge' AND set_number = '037F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '038F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'Telepathic Resistance' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'Telepathic Resistance' AND set_number = '038F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '039F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'Sometimes Piracy is the Best Option' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'Sometimes Piracy is the Best Option' AND set_number = '039F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '040F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'T-Ray Gun' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Carson of Venus' AND name = 'T-Ray Gun' AND set_number = '040F');

-- Count of Monte Cristo specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '043F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Friend to Foe' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Friend to Foe' AND set_number = '043F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '044F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Jacopo' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Jacopo' AND set_number = '044F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '045F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Network of Thieves' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Network of Thieves' AND set_number = '045F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '046F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Surprise Swordsman' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Surprise Swordsman' AND set_number = '046F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '047F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Unlimited Resources' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Count of Monte Cristo' AND name = 'Unlimited Resources' AND set_number = '047F');

-- Cthulhu specials (note: 054F does not exist per the sheet)
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '049F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'Ancient One' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'Ancient One' AND set_number = '049F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '050F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'Devoted Follower' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'Devoted Follower' AND set_number = '050F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '051F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'Distracting Intervention' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'Distracting Intervention' AND set_number = '051F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '052F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'Network of Fanatics' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'Network of Fanatics' AND set_number = '052F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '053F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'The Call of Cthulhu' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Cthulhu' AND name = 'The Call of Cthulhu' AND set_number = '053F');

-- Dejah Thoris specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '056F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Warrior of Helium' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Warrior of Helium' AND set_number = '056F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '057F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Diplomat to All Martians' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Diplomat to All Martians' AND set_number = '057F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '059F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Head of Martian Science' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Head of Martian Science' AND set_number = '059F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '060F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Protector of Barsoom' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Protector of Barsoom' AND set_number = '060F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '061F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Champions of Barsoom' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Dejah Thoris' AND name = 'Champions of Barsoom' AND set_number = '061F');

-- Jane Porter specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '098F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Archimedes Q. Porter' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Archimedes Q. Porter' AND set_number = '098F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '100F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Tenacious Pursuit' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Tenacious Pursuit' AND set_number = '100F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '101F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Lady of the Jungle' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Lady of the Jungle' AND set_number = '101F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '102F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Not without my Friends' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Not without my Friends' AND set_number = '102F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '103F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Not a Damsel in Distress' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Jane Porter' AND name = 'Not a Damsel in Distress' AND set_number = '103F');

-- John Carter of Mars specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '112F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Dotar Sojat' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Dotar Sojat' AND set_number = '112F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '114F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Leap into the Fray' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Leap into the Fray' AND set_number = '114F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '115F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Lower Gravity' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Lower Gravity' AND set_number = '115F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '116F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Superhuman Endurance' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Superhuman Endurance' AND set_number = '116F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '117F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Virginia Fighting Man' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'John Carter of Mars' AND name = 'Virginia Fighting Man' AND set_number = '117F');

-- King Arthur specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '119F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'King Arthur' AND name = 'Excalibur' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'King Arthur' AND name = 'Excalibur' AND set_number = '119F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '120F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'King Arthur' AND name = 'King of Camelot' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'King Arthur' AND name = 'King of Camelot' AND set_number = '120F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '121F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'King Arthur' AND name = 'Knights of the Round Table' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'King Arthur' AND name = 'Knights of the Round Table' AND set_number = '121F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '123F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'King Arthur' AND name = 'Heavy is the Head' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'King Arthur' AND name = 'Heavy is the Head' AND set_number = '123F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '124F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'King Arthur' AND name = 'Lead from the Front' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'King Arthur' AND name = 'Lead from the Front' AND set_number = '124F');

-- Korak specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '126F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Korak' AND name = 'John Clayton III' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Korak' AND name = 'John Clayton III' AND set_number = '126F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '127F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Korak' AND name = 'Jungle Survival' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Korak' AND name = 'Jungle Survival' AND set_number = '127F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '129F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Korak' AND name = 'Meriem and Jackie Clayton' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Korak' AND name = 'Meriem and Jackie Clayton' AND set_number = '129F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '130F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Korak' AND name = 'Son of the Jungle' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Korak' AND name = 'Son of the Jungle' AND set_number = '130F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '131F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Korak' AND name = 'To The Death' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Korak' AND name = 'To The Death' AND set_number = '131F');

-- Merlin specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '147F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Merlin' AND name = 'Archimedes' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Merlin' AND name = 'Archimedes' AND set_number = '147F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '148F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Merlin' AND name = 'Ascendant Mage' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Merlin' AND name = 'Ascendant Mage' AND set_number = '148F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '149F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Merlin' AND name = 'For Camelot!' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Merlin' AND name = 'For Camelot!' AND set_number = '149F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '150F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Merlin' AND name = 'Foretell the Future' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Merlin' AND name = 'Foretell the Future' AND set_number = '150F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '152F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Merlin' AND name = 'Summon the Elements' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Merlin' AND name = 'Summon the Elements' AND set_number = '152F');

-- Mina Harker specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '154F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Dracula''s Telepathic Connection' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Dracula''s Telepathic Connection' AND set_number = '154F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '155F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Jonathan Harker, Solicitor' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Jonathan Harker, Solicitor' AND set_number = '155F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '156F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Nocturnal Hunter' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Nocturnal Hunter' AND set_number = '156F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '158F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Tracking Movements' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Tracking Movements' AND set_number = '158F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '159F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Vampiric Celerity' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Mina Harker' AND name = 'Vampiric Celerity' AND set_number = '159F');

-- Professor Moriarty specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '182F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Complex Criminal Scheme' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Complex Criminal Scheme' AND set_number = '182F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '184F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Future Plans' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Future Plans' AND set_number = '184F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '185F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Mathematical Genius' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Mathematical Genius' AND set_number = '185F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '186F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Napoleon of Crime' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Napoleon of Crime' AND set_number = '186F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '187F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Tactical Fighter' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Professor Moriarty' AND name = 'Tactical Fighter' AND set_number = '187F');

-- Sun Wukong specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '217F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Cloud Surfing' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Cloud Surfing' AND set_number = '217F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '218F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Godly Strength' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Godly Strength' AND set_number = '218F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '220F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Staff of the Monkey King' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Staff of the Monkey King' AND set_number = '220F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '221F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Stone Skin' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Stone Skin' AND set_number = '221F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '222F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Transformation Trickery' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Sun Wukong' AND name = 'Transformation Trickery' AND set_number = '222F');

-- Tars Tarkas specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '225F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Barsoomian Warrior & Statesman' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Barsoomian Warrior & Statesman' AND set_number = '225F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '226F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Four-Armed Warrior' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Four-Armed Warrior' AND set_number = '226F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '227F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Jeddak of Thark' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Jeddak of Thark' AND set_number = '227F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '228F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Protector of the Incubator' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Protector of the Incubator' AND set_number = '228F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '229F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Sola' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tars Tarkas' AND name = 'Sola' AND set_number = '229F');

-- Tarzan specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '231F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tarzan' AND name = 'Emotional Senses' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tarzan' AND name = 'Emotional Senses' AND set_number = '231F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '232F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tarzan' AND name = 'Jungle Tactics' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tarzan' AND name = 'Jungle Tactics' AND set_number = '232F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '234F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tarzan' AND name = 'My Feet Feel Like Hands' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tarzan' AND name = 'My Feet Feel Like Hands' AND set_number = '234F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '235F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tarzan' AND name = 'Raised by Mangani Apes' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tarzan' AND name = 'Raised by Mangani Apes' AND set_number = '235F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '236F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Tarzan' AND name = 'Deceptive Maneuver' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Tarzan' AND name = 'Deceptive Maneuver' AND set_number = '236F');

-- The Mummy specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '238F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Mummy' AND name = 'Ancient Wisdom' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Mummy' AND name = 'Ancient Wisdom' AND set_number = '238F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '239F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Mummy' AND name = 'Fury of the Desert' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Mummy' AND name = 'Fury of the Desert' AND set_number = '239F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '241F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Mummy' AND name = 'Reinvigorated By Fresh Organs' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Mummy' AND name = 'Reinvigorated By Fresh Organs' AND set_number = '241F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '242F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Mummy' AND name = 'Relentless Pursuit' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Mummy' AND name = 'Relentless Pursuit' AND set_number = '242F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '243F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Mummy' AND name = 'The Eternal Journey' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Mummy' AND name = 'The Eternal Journey' AND set_number = '243F');

-- The Three Musketeers specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '246F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'Aramis' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'Aramis' AND set_number = '246F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '247F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'Athos' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'Athos' AND set_number = '247F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '248F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'D''Artagnan' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'D''Artagnan' AND set_number = '248F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '249F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'Porthos' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'Porthos' AND set_number = '249F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '250F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'Valiant Charge' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'The Three Musketeers' AND name = 'Valiant Charge' AND set_number = '250F');

-- Time Traveler specials (256F: "Harbinger's Warning" is the correct DB name)
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '252F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'From a Mile Away' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'From a Mile Away' AND set_number = '252F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '253F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'Futuristic Phaser' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'Futuristic Phaser' AND set_number = '253F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '254F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'I''ll Already Be Gone' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'I''ll Already Be Gone' AND set_number = '254F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '256F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'Harbinger''s Warning' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'Harbinger''s Warning' AND set_number = '256F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '257F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'The Tomorrow Doctor' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Time Traveler' AND name = 'The Tomorrow Doctor' AND set_number = '257F');

-- Victory Harben specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '266F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Abner Perry''s Lab Assistant' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Abner Perry''s Lab Assistant' AND set_number = '266F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '267F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Archery, Knives & Jujitsu' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Archery, Knives & Jujitsu' AND set_number = '267F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '268F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Chamston-Hedding Estate' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Chamston-Hedding Estate' AND set_number = '268F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '269F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Department of Theoretical Physics' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Department of Theoretical Physics' AND set_number = '269F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '271F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Practical Physics' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Victory Harben' AND name = 'Practical Physics' AND set_number = '271F');

-- Zeus specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '280F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zeus' AND name = 'A Jealous God' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zeus' AND name = 'A Jealous God' AND set_number = '280F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '281F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zeus' AND name = 'Banishment' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zeus' AND name = 'Banishment' AND set_number = '281F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '282F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zeus' AND name = 'Hera' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zeus' AND name = 'Hera' AND set_number = '282F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '283F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zeus' AND name = 'Law and Order' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zeus' AND name = 'Law and Order' AND set_number = '283F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '284F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zeus' AND name = 'Thunderbolt' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zeus' AND name = 'Thunderbolt' AND set_number = '284F');

-- Zorro specials
INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '287F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zorro' AND name = 'Elite Swordsmanship' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zorro' AND name = 'Elite Swordsmanship' AND set_number = '287F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '288F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zorro' AND name = 'Master of Escape' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zorro' AND name = 'Master of Escape' AND set_number = '288F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '289F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zorro' AND name = 'Rapier' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zorro' AND name = 'Rapier' AND set_number = '289F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '290F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zorro' AND name = 'Riches of Don Diego de la Vega' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zorro' AND name = 'Riches of Don Diego de la Vega' AND set_number = '290F');

INSERT INTO special_cards (id, name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, set_number, set_number_foil, banned, is_foil)
SELECT gen_random_uuid(), name, character_name, set, card_effect, image_path, one_per_deck, cataclysm, ambush, assist, '291F', NULL, banned, TRUE
FROM special_cards WHERE character_name = 'Zorro' AND name = 'Riposte' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM special_cards WHERE character_name = 'Zorro' AND name = 'Riposte' AND set_number = '291F');

-- ============================================================
-- SECTION 3: Power card foils (7 cards)
-- Matched by power_type + value
-- ============================================================

INSERT INTO power_cards (id, name, power_type, value, image_path, one_per_deck, set, set_number, set_number_foil, is_foil, created_at, updated_at)
SELECT gen_random_uuid(), name, power_type, value, image_path, one_per_deck, set, '473F', NULL, TRUE, created_at, NOW()
FROM power_cards WHERE power_type = 'Any-Power' AND value = 5 AND is_foil = FALSE AND (set IS NULL OR set != 'SKY')
AND NOT EXISTS (SELECT 1 FROM power_cards WHERE power_type = 'Any-Power' AND value = 5 AND set_number = '473F')
LIMIT 1;

INSERT INTO power_cards (id, name, power_type, value, image_path, one_per_deck, set, set_number, set_number_foil, is_foil, created_at, updated_at)
SELECT gen_random_uuid(), name, power_type, value, image_path, one_per_deck, set, '474F', NULL, TRUE, created_at, NOW()
FROM power_cards WHERE power_type = 'Any-Power' AND value = 6 AND is_foil = FALSE AND (set IS NULL OR set != 'SKY')
AND NOT EXISTS (SELECT 1 FROM power_cards WHERE power_type = 'Any-Power' AND value = 6 AND set_number = '474F')
LIMIT 1;

INSERT INTO power_cards (id, name, power_type, value, image_path, one_per_deck, set, set_number, set_number_foil, is_foil, created_at, updated_at)
SELECT gen_random_uuid(), name, power_type, value, image_path, one_per_deck, set, '475F', NULL, TRUE, created_at, NOW()
FROM power_cards WHERE power_type = 'Any-Power' AND value = 7 AND is_foil = FALSE AND (set IS NULL OR set != 'SKY')
AND NOT EXISTS (SELECT 1 FROM power_cards WHERE power_type = 'Any-Power' AND value = 7 AND set_number = '475F')
LIMIT 1;

INSERT INTO power_cards (id, name, power_type, value, image_path, one_per_deck, set, set_number, set_number_foil, is_foil, created_at, updated_at)
SELECT gen_random_uuid(), name, power_type, value, image_path, one_per_deck, set, '476F', NULL, TRUE, created_at, NOW()
FROM power_cards WHERE power_type = 'Any-Power' AND value = 8 AND is_foil = FALSE AND (set IS NULL OR set != 'SKY')
AND NOT EXISTS (SELECT 1 FROM power_cards WHERE power_type = 'Any-Power' AND value = 8 AND set_number = '476F')
LIMIT 1;

INSERT INTO power_cards (id, name, power_type, value, image_path, one_per_deck, set, set_number, set_number_foil, is_foil, created_at, updated_at)
SELECT gen_random_uuid(), name, power_type, value, image_path, one_per_deck, set, '477F', NULL, TRUE, created_at, NOW()
FROM power_cards WHERE power_type = 'Multi Power' AND value = 3 AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM power_cards WHERE power_type = 'Multi Power' AND value = 3 AND set_number = '477F')
LIMIT 1;

INSERT INTO power_cards (id, name, power_type, value, image_path, one_per_deck, set, set_number, set_number_foil, is_foil, created_at, updated_at)
SELECT gen_random_uuid(), name, power_type, value, image_path, one_per_deck, set, '478F', NULL, TRUE, created_at, NOW()
FROM power_cards WHERE power_type = 'Multi Power' AND value = 4 AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM power_cards WHERE power_type = 'Multi Power' AND value = 4 AND set_number = '478F')
LIMIT 1;

INSERT INTO power_cards (id, name, power_type, value, image_path, one_per_deck, set, set_number, set_number_foil, is_foil, created_at, updated_at)
SELECT gen_random_uuid(), name, power_type, value, image_path, one_per_deck, set, '479F', NULL, TRUE, created_at, NOW()
FROM power_cards WHERE power_type = 'Multi Power' AND value = 5 AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM power_cards WHERE power_type = 'Multi Power' AND value = 5 AND set_number = '479F')
LIMIT 1;

-- ============================================================
-- SECTION 4: Alternate art character foils (54 cards)
-- Matched by name + set_number_foil on the source row.
-- V201 set set_number_foil on specific alternate art rows;
-- we use that to identify which alternate art each foil corresponds to.
-- ============================================================

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '482F', NULL, TRUE
FROM characters WHERE name = 'Angry Mob (Middle Ages)' AND set_number_foil = '482F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Angry Mob (Middle Ages)' AND set_number = '482F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '483F', NULL, TRUE
FROM characters WHERE name = 'Angry Mob (Industrial Age)' AND set_number_foil = '483F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Angry Mob (Industrial Age)' AND set_number = '483F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '484F', NULL, TRUE
FROM characters WHERE name = 'Angry Mob (Modern Age)' AND set_number_foil = '484F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Angry Mob (Modern Age)' AND set_number = '484F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '485F', NULL, TRUE
FROM characters WHERE name = 'Anubis' AND set_number_foil = '485F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Anubis' AND set_number = '485F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '486F', NULL, TRUE
FROM characters WHERE name = 'Billy the Kid' AND set_number_foil = '486F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Billy the Kid' AND set_number = '486F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '487F', NULL, TRUE
FROM characters WHERE name = 'Carson of Venus' AND set_number_foil = '487F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Carson of Venus' AND set_number = '487F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '488F', NULL, TRUE
FROM characters WHERE name = 'Count of Monte Cristo' AND set_number_foil = '488F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Count of Monte Cristo' AND set_number = '488F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '489F', NULL, TRUE
FROM characters WHERE name = 'Cthulhu' AND set_number_foil = '489F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Cthulhu' AND set_number = '489F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '490F', NULL, TRUE
FROM characters WHERE name = 'Cthulhu' AND set_number_foil = '490F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Cthulhu' AND set_number = '490F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '491F', NULL, TRUE
FROM characters WHERE name = 'Dejah Thoris' AND set_number_foil = '491F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Dejah Thoris' AND set_number = '491F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '492F', NULL, TRUE
FROM characters WHERE name = 'Dejah Thoris' AND set_number_foil = '492F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Dejah Thoris' AND set_number = '492F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '493F', NULL, TRUE
FROM characters WHERE name = 'Dr. Watson' AND set_number_foil = '493F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Dr. Watson' AND set_number = '493F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '494F', NULL, TRUE
FROM characters WHERE name = 'Dracula' AND set_number_foil = '494F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Dracula' AND set_number = '494F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '495F', NULL, TRUE
FROM characters WHERE name = 'Headless Horseman' AND set_number_foil = '495F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Headless Horseman' AND set_number = '495F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '496F', NULL, TRUE
FROM characters WHERE name = 'Hercules' AND set_number_foil = '496F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Hercules' AND set_number = '496F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '497F', NULL, TRUE
FROM characters WHERE name = 'Hercules' AND set_number_foil = '497F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Hercules' AND set_number = '497F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '498F', NULL, TRUE
FROM characters WHERE name = 'Invisible Man' AND set_number_foil = '498F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Invisible Man' AND set_number = '498F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '499F', NULL, TRUE
FROM characters WHERE name = 'Jane Porter' AND set_number_foil = '499F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Jane Porter' AND set_number = '499F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '500F', NULL, TRUE
FROM characters WHERE name = 'Jane Porter' AND set_number_foil = '500F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Jane Porter' AND set_number = '500F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '501F', NULL, TRUE
FROM characters WHERE name = 'Joan of Arc' AND set_number_foil = '501F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Joan of Arc' AND set_number = '501F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '502F', NULL, TRUE
FROM characters WHERE name = 'John Carter of Mars' AND set_number_foil = '502F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'John Carter of Mars' AND set_number = '502F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '503F', NULL, TRUE
FROM characters WHERE name = 'King Arthur' AND set_number_foil = '503F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'King Arthur' AND set_number = '503F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '504F', NULL, TRUE
FROM characters WHERE name = 'King Arthur' AND set_number_foil = '504F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'King Arthur' AND set_number = '504F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '505F', NULL, TRUE
FROM characters WHERE name = 'Korak' AND set_number_foil = '505F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Korak' AND set_number = '505F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '506F', NULL, TRUE
FROM characters WHERE name = 'Korak' AND set_number_foil = '506F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Korak' AND set_number = '506F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '507F', NULL, TRUE
FROM characters WHERE name = 'Lancelot' AND set_number_foil = '507F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Lancelot' AND set_number = '507F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '508F', NULL, TRUE
FROM characters WHERE name = 'Leonidas' AND set_number_foil = '508F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Leonidas' AND set_number = '508F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '509F', NULL, TRUE
FROM characters WHERE name = 'Mina Harker' AND set_number_foil = '509F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Mina Harker' AND set_number = '509F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '510F', NULL, TRUE
FROM characters WHERE name = 'Mina Harker' AND set_number_foil = '510F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Mina Harker' AND set_number = '510F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '511F', NULL, TRUE
FROM characters WHERE name = 'Morgan le Fay' AND set_number_foil = '511F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Morgan le Fay' AND set_number = '511F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '512F', NULL, TRUE
FROM characters WHERE name = 'Morgan le Fay' AND set_number_foil = '512F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Morgan le Fay' AND set_number = '512F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '513F', NULL, TRUE
FROM characters WHERE name = 'Mr. Hyde' AND set_number_foil = '513F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Mr. Hyde' AND set_number = '513F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '514F', NULL, TRUE
FROM characters WHERE name = 'Poseidon' AND set_number_foil = '514F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Poseidon' AND set_number = '514F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '515F', NULL, TRUE
FROM characters WHERE name = 'Professor Moriarty' AND set_number_foil = '515F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Professor Moriarty' AND set_number = '515F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '516F', NULL, TRUE
FROM characters WHERE name = 'Ra' AND set_number_foil = '516F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Ra' AND set_number = '516F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '517F', NULL, TRUE
FROM characters WHERE name = 'Robin Hood' AND set_number_foil = '517F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Robin Hood' AND set_number = '517F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '518F', NULL, TRUE
FROM characters WHERE name = 'Sheriff of Nottingham' AND set_number_foil = '518F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Sheriff of Nottingham' AND set_number = '518F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '519F', NULL, TRUE
FROM characters WHERE name = 'Sherlock Holmes' AND set_number_foil = '519F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Sherlock Holmes' AND set_number = '519F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '520F', NULL, TRUE
FROM characters WHERE name = 'Sun Wukong' AND set_number_foil = '520F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Sun Wukong' AND set_number = '520F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '521F', NULL, TRUE
FROM characters WHERE name = 'Tars Tarkas' AND set_number_foil = '521F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Tars Tarkas' AND set_number = '521F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '522F', NULL, TRUE
FROM characters WHERE name = 'Tarzan' AND set_number_foil = '522F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Tarzan' AND set_number = '522F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '523F', NULL, TRUE
FROM characters WHERE name = 'Merlin' AND set_number_foil = '523F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Merlin' AND set_number = '523F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '524F', NULL, TRUE
FROM characters WHERE name = 'Tarzan' AND set_number_foil = '524F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Tarzan' AND set_number = '524F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '525F', NULL, TRUE
FROM characters WHERE name = 'The Mummy' AND set_number_foil = '525F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'The Mummy' AND set_number = '525F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '526F', NULL, TRUE
FROM characters WHERE name = 'The Three Musketeers' AND set_number_foil = '526F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'The Three Musketeers' AND set_number = '526F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '527F', NULL, TRUE
FROM characters WHERE name = 'Time Traveler' AND set_number_foil = '527F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Time Traveler' AND set_number = '527F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '528F', NULL, TRUE
FROM characters WHERE name = 'Time Traveler' AND set_number_foil = '528F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Time Traveler' AND set_number = '528F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '529F', NULL, TRUE
FROM characters WHERE name = 'Van Helsing' AND set_number_foil = '529F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Van Helsing' AND set_number = '529F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '530F', NULL, TRUE
FROM characters WHERE name = 'Victory Harben' AND set_number_foil = '530F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Victory Harben' AND set_number = '530F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '531F', NULL, TRUE
FROM characters WHERE name = 'Victory Harben' AND set_number_foil = '531F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Victory Harben' AND set_number = '531F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '532F', NULL, TRUE
FROM characters WHERE name = 'Wicked Witch of the West' AND set_number_foil = '532F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Wicked Witch of the West' AND set_number = '532F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '533F', NULL, TRUE
FROM characters WHERE name = 'Zeus' AND set_number_foil = '533F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Zeus' AND set_number = '533F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '534F', NULL, TRUE
FROM characters WHERE name = 'Zorro' AND set_number_foil = '534F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Zorro' AND set_number = '534F');

INSERT INTO characters (id, name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, updated_at, threat_level, special_abilities, set_number, set_number_foil, is_foil)
SELECT gen_random_uuid(), name, set, description, energy, combat, brute_force, intelligence, image_path, created_at, NOW(), threat_level, special_abilities, '535F', NULL, TRUE
FROM characters WHERE name = 'Zorro' AND set_number_foil = '535F' AND is_foil = FALSE
AND NOT EXISTS (SELECT 1 FROM characters WHERE name = 'Zorro' AND set_number = '535F');
