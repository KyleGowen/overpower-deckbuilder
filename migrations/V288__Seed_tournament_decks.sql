-- Seed tournament winning decks for the Home "Tournament Winners" rail.
-- Generated from local tournament_decks user via scripts/generate-tournament-deck-migration.ts
-- Idempotent: skips decks that tournament_decks already owns by name.
-- Card rows resolve by name/stat columns (portable across environments); deck metadata
-- (card_count, threat, character slots) is populated by V133 triggers on deck_cards INSERT.
--
-- Deck manifest (7 decks):
--   a2880001-0000-4000-8000-000000000001  Regionals (Ricky Sauceda, Philadelphia)
--   a2880001-0000-4000-8000-000000000002  Regionals (Phil Miller, Seattle)
--   a2880001-0000-4000-8000-000000000003  Regionals (Thomas Kiene, Toronto)
--   a2880001-0000-4000-8000-000000000004  2025 Nationals 7th (Joe Peters)
--   a2880001-0000-4000-8000-000000000005  2026 Nationals (Jessica Simms)
--   a2880001-0000-4000-8000-000000000006  2026 Nationals (Andrew Taylor)
--   a2880001-0000-4000-8000-000000000007  2025 Nationals 4th (Felipe Cagno)

DO $$
DECLARE
    tournament_user_id UUID := '00000000-0000-0000-0000-000000000003';
    card_id_var TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = tournament_user_id) THEN
        RAISE EXCEPTION 'tournament_decks user missing; apply V280 first';
    END IF;

    -- regionals-ricky-sauceda-philadelphia (local id: ad4f144b-7320-4235-b13c-ca9703e940ee)
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE user_id = tournament_user_id AND name = 'Regionals (Ricky Sauceda, Philadelphia)'
    ) THEN
        INSERT INTO decks (
            id,
            user_id,
            name,
            description,
            created_at,
            updated_at,
            is_private,
            is_limited,
            is_valid,
            card_count,
            threat,
            reserve_character
        ) VALUES (
            'a2880001-0000-4000-8000-000000000001'::uuid,
            tournament_user_id,
            'Regionals (Ricky Sauceda, Philadelphia)',
            '',
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            FALSE,
            0,
            0,
            NULL
        );

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Allan Quatermain
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Allan Quatermain' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- aspect: Isis
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Isis' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'aspect', card_id_var::text, 1);
        END IF;

        -- character: Sun Wukong
        SELECT id INTO card_id_var FROM characters WHERE name = 'Sun Wukong' AND set = 'ERB' AND COALESCE(is_foil, false) = TRUE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'character', card_id_var::text, 1);
        END IF;

        -- character: Dr. Watson
        SELECT id INTO card_id_var FROM characters WHERE name = 'Dr. Watson' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'character', card_id_var::text, 1);
        END IF;

        -- character: Wicked Witch
        SELECT id INTO card_id_var FROM characters WHERE name = 'Wicked Witch' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'character', card_id_var::text, 1);
        END IF;

        -- character: Carson of Venus
        SELECT id INTO card_id_var FROM characters WHERE name = 'Carson of Venus' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'character', card_id_var::text, 1);
        END IF;

        -- location: 221-B Baker St.
        SELECT id INTO card_id_var FROM locations WHERE name = '221-B Baker St.' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'location', card_id_var::text, 1);
        END IF;

        -- power: 8 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 1 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 2);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 2);
        END IF;

        -- power: 3 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'power', card_id_var::text, 1);
        END IF;

        -- special: Always There for a Friend
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Always There for a Friend' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: English Gentleman
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'English Gentleman' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Janjong Duare Mintep
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Janjong Duare Mintep' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Heimdell
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Heimdell' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: All Chips on the Table
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'All Chips on the Table' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Transformation Trickery
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Transformation Trickery' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: One Eye
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'One Eye' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Telepathic Training
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Telepathic Training' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Mystical Energy
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Mystical Energy' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Wolves, Crows, & Black Bees
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Wolves, Crows, & Black Bees' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Harness the Wind
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Harness the Wind' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Hades: Lord of the Underworld
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hades: Lord of the Underworld' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grasp of the Five Elements
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grasp of the Five Elements' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Oni and Succubus
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Oni and Succubus' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Valkyrie Hildr: Select the Slain
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Valkyrie Hildr: Select the Slain' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Godly Strength
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Godly Strength' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Legendary Escape
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Legendary Escape' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: British Army Surgeon
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'British Army Surgeon' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: I Will Have Those Silver Shoes!
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'I Will Have Those Silver Shoes!' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Cloud Surfing
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Cloud Surfing' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Blackheath Rugby Star
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Blackheath Rugby Star' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- special: Staff of the Monkey King
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Staff of the Monkey King' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'special', card_id_var::text, 1);
        END IF;

        -- teamwork: 8 Combat
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '8 Combat' AND followup_attack_types = 'Energy + Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Any-Power' AND followup_attack_types = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Combat
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Combat' AND followup_attack_types = 'Energy + Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Energy
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Energy' AND followup_attack_types = 'Combat + Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Energy
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Energy' AND followup_attack_types = 'Combat + Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded tournament deck: %', 'Regionals (Ricky Sauceda, Philadelphia)';
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', 'Regionals (Ricky Sauceda, Philadelphia)';
    END IF;

    -- regionals-phil-miller-seattle (local id: f8798434-c3a1-46a9-aff2-bd874c0ac95e)
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE user_id = tournament_user_id AND name = 'Regionals (Phil Miller, Seattle)'
    ) THEN
        INSERT INTO decks (
            id,
            user_id,
            name,
            description,
            created_at,
            updated_at,
            is_private,
            is_limited,
            is_valid,
            card_count,
            threat,
            reserve_character
        ) VALUES (
            'a2880001-0000-4000-8000-000000000002'::uuid,
            tournament_user_id,
            'Regionals (Phil Miller, Seattle)',
            '',
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            TRUE,
            0,
            0,
            NULL
        );

        -- ally-universe: Professor Porter
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Professor Porter' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Allan Quatermain
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Allan Quatermain' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- aspect: Amaru: Dragon Legend
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Amaru: Dragon Legend' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'aspect', card_id_var::text, 1);
        END IF;

        -- character: Dejah Thoris
        SELECT id INTO card_id_var FROM characters WHERE name = 'Dejah Thoris' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'character', card_id_var::text, 1);
        END IF;

        -- character: Zorro
        SELECT id INTO card_id_var FROM characters WHERE name = 'Zorro' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'character', card_id_var::text, 1);
        END IF;

        -- character: Leonidas
        SELECT id INTO card_id_var FROM characters WHERE name = 'Leonidas' AND set = 'ERB' AND COALESCE(is_foil, false) = TRUE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'character', card_id_var::text, 1);
        END IF;

        -- character: Billy the Kid
        SELECT id INTO card_id_var FROM characters WHERE name = 'Billy the Kid' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'character', card_id_var::text, 1);
        END IF;

        -- event: The Cost of Knowledge is Sanity
        SELECT id INTO card_id_var FROM events WHERE name = 'The Cost of Knowledge is Sanity' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'event', card_id_var::text, 1);
        END IF;

        -- location: The Round Table
        SELECT id INTO card_id_var FROM locations WHERE name = 'The Round Table' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'location', card_id_var::text, 1);
        END IF;

        -- mission: Gone Too Far
        SELECT id INTO card_id_var FROM missions WHERE name = 'Gone Too Far' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Johansen's Widow
        SELECT id INTO card_id_var FROM missions WHERE name = 'Johansen''s Widow' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: New Orleans, 1908
        SELECT id INTO card_id_var FROM missions WHERE name = 'New Orleans, 1908' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Professor Angell's Investigation
        SELECT id INTO card_id_var FROM missions WHERE name = 'Professor Angell''s Investigation' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Alert
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Alert' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Dreams of Men
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Dreams of Men' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Worshipping the Great Old One
        SELECT id INTO card_id_var FROM missions WHERE name = 'Worshipping the Great Old One' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', card_id_var::text, 1);
        END IF;

        -- power: 8 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 1 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 3);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 2);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'power', card_id_var::text, 3);
        END IF;

        -- special: Elite Swordsmanship
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Elite Swordsmanship' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: 3 Quick Strokes
        SELECT id INTO card_id_var FROM special_cards WHERE name = '3 Quick Strokes' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Ancestral Rapier
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Ancestral Rapier' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Diplomat to All Martians
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Diplomat to All Martians' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Mystical Energy
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Mystical Energy' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Lady of the Lake
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Lady of the Lake' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Fortune of Helium
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fortune of Helium' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: I'll Make You Famous
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'I''ll Make You Famous' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 2);
        END IF;

        -- special: Warrior of Helium
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Warrior of Helium' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Hades: Lord of the Underworld
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hades: Lord of the Underworld' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Valkyrie Hildr: Select the Slain
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Valkyrie Hildr: Select the Slain' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Wrath of Ra
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Wrath of Ra' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Give Them Nothing
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Give Them Nothing' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: For Sparta
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'For Sparta' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Protector of Barsoom
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Protector of Barsoom' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Riches of Don Diego de la Vega
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Riches of Don Diego de la Vega' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 1);
        END IF;

        -- special: Riposte
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Riposte' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 2);
        END IF;

        -- special: 300
        SELECT id INTO card_id_var FROM special_cards WHERE name = '300' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'special', card_id_var::text, 3);
        END IF;

        -- teamwork: 7 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Any-Power' AND followup_attack_types = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Energy
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Energy' AND followup_attack_types = 'Brute Force + Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Combat
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Combat' AND followup_attack_types = 'Brute Force + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 8 Combat
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '8 Combat' AND followup_attack_types = 'Brute Force + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded tournament deck: %', 'Regionals (Phil Miller, Seattle)';
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', 'Regionals (Phil Miller, Seattle)';
    END IF;

    -- regionals-thomas-kiene-toronto (local id: ffb31980-4c9e-4b27-8197-cc2da956f920)
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE user_id = tournament_user_id AND name = 'Regionals (Thomas Kiene, Toronto)'
    ) THEN
        INSERT INTO decks (
            id,
            user_id,
            name,
            description,
            created_at,
            updated_at,
            is_private,
            is_limited,
            is_valid,
            card_count,
            threat,
            reserve_character
        ) VALUES (
            'a2880001-0000-4000-8000-000000000003'::uuid,
            tournament_user_id,
            'Regionals (Thomas Kiene, Toronto)',
            '',
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            FALSE,
            0,
            0,
            NULL
        );

        -- ally-universe: Professor Porter
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Professor Porter' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Allan Quatermain
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Allan Quatermain' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Hucklebuck
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Hucklebuck' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- aspect: Isis
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Isis' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'aspect', card_id_var::text, 1);
        END IF;

        -- character: Sun Wukong
        SELECT id INTO card_id_var FROM characters WHERE name = 'Sun Wukong' AND set = 'ERB' AND COALESCE(is_foil, false) = TRUE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'character', card_id_var::text, 1);
        END IF;

        -- character: Joan of Arc
        SELECT id INTO card_id_var FROM characters WHERE name = 'Joan of Arc' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'character', card_id_var::text, 1);
        END IF;

        -- character: Wicked Witch
        SELECT id INTO card_id_var FROM characters WHERE name = 'Wicked Witch' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'character', card_id_var::text, 1);
        END IF;

        -- character: Billy the Kid
        SELECT id INTO card_id_var FROM characters WHERE name = 'Billy the Kid' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'character', card_id_var::text, 1);
        END IF;

        -- location: The Round Table
        SELECT id INTO card_id_var FROM locations WHERE name = 'The Round Table' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'location', card_id_var::text, 1);
        END IF;

        -- power: 8 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 1 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'power', card_id_var::text, 1);
        END IF;

        -- special: Inspirational Leadership
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Inspirational Leadership' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 3);
        END IF;

        -- special: Protection of Saint Michael
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Protection of Saint Michael' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Transformation Trickery
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Transformation Trickery' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Subjugate the Meek
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Subjugate the Meek' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Bodhisattva: Enlightened One
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Bodhisattva: Enlightened One' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: One Eye
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'One Eye' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Wolves, Crows, & Black Bees
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Wolves, Crows, & Black Bees' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Harness the Wind
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Harness the Wind' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Fairy Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fairy Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Hades: Lord of the Underworld
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hades: Lord of the Underworld' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Patron Saint of France
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Patron Saint of France' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grasp of the Five Elements
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grasp of the Five Elements' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Valkyrie Hildr: Select the Slain
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Valkyrie Hildr: Select the Slain' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Godly Strength
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Godly Strength' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Legendary Escape
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Legendary Escape' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Early Feminist Leader
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Early Feminist Leader' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: I Will Have Those Silver Shoes!
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'I Will Have Those Silver Shoes!' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Cloud Surfing
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Cloud Surfing' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- special: Staff of the Monkey King
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Staff of the Monkey King' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'special', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Any-Power' AND followup_attack_types = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Brute Force
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Brute Force' AND followup_attack_types = 'Intelligence + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 8 Energy
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '8 Energy' AND followup_attack_types = 'Combat + Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000003', 'teamwork', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded tournament deck: %', 'Regionals (Thomas Kiene, Toronto)';
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', 'Regionals (Thomas Kiene, Toronto)';
    END IF;

    -- 2025-nationals-7th-joe-peters (local id: 18222ac4-0429-4594-aee0-5a50c7461372)
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE user_id = tournament_user_id AND name = '2025 Nationals 7th (Joe Peters)'
    ) THEN
        INSERT INTO decks (
            id,
            user_id,
            name,
            description,
            created_at,
            updated_at,
            is_private,
            is_limited,
            is_valid,
            card_count,
            threat,
            reserve_character
        ) VALUES (
            'a2880001-0000-4000-8000-000000000004'::uuid,
            tournament_user_id,
            '2025 Nationals 7th (Joe Peters)',
            '',
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            TRUE,
            0,
            0,
            NULL
        );

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Allan Quatermain
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Allan Quatermain' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Queen Guinevere
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Queen Guinevere' AND stat_to_use = '7 or higher' AND stat_type_to_use = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Hucklebuck
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Hucklebuck' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Guy of Gisborne
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Guy of Gisborne' AND stat_to_use = '7 or higher' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- aspect: Isis
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Isis' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'aspect', card_id_var::text, 1);
        END IF;

        -- character: Cthulhu
        SELECT id INTO card_id_var FROM characters WHERE name = 'Cthulhu' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'character', card_id_var::text, 1);
        END IF;

        -- character: Jane Porter
        SELECT id INTO card_id_var FROM characters WHERE name = 'Jane Porter' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'character', card_id_var::text, 1);
        END IF;

        -- character: Sheriff of Nottingham
        SELECT id INTO card_id_var FROM characters WHERE name = 'Sheriff of Nottingham' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'character', card_id_var::text, 1);
        END IF;

        -- character: Joan of Arc
        SELECT id INTO card_id_var FROM characters WHERE name = 'Joan of Arc' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'character', card_id_var::text, 1);
        END IF;

        -- location: Spartan Training Ground
        SELECT id INTO card_id_var FROM locations WHERE name = 'Spartan Training Ground' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'location', card_id_var::text, 1);
        END IF;

        -- mission: Beasts of Tarzan
        SELECT id INTO card_id_var FROM missions WHERE name = 'Beasts of Tarzan' AND mission_set = 'King of the Jungle' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Tarzan and the Castaways
        SELECT id INTO card_id_var FROM missions WHERE name = 'Tarzan and the Castaways' AND mission_set = 'King of the Jungle' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Tarzan and the City of Gold
        SELECT id INTO card_id_var FROM missions WHERE name = 'Tarzan and the City of Gold' AND mission_set = 'King of the Jungle' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Tarzan and the Golden Lion
        SELECT id INTO card_id_var FROM missions WHERE name = 'Tarzan and the Golden Lion' AND mission_set = 'King of the Jungle' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Tarzan at the Earth's Core
        SELECT id INTO card_id_var FROM missions WHERE name = 'Tarzan at the Earth''s Core' AND mission_set = 'King of the Jungle' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Tarzan of the Apes
        SELECT id INTO card_id_var FROM missions WHERE name = 'Tarzan of the Apes' AND mission_set = 'King of the Jungle' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Tarzan's Quest
        SELECT id INTO card_id_var FROM missions WHERE name = 'Tarzan''s Quest' AND mission_set = 'King of the Jungle' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 2);
        END IF;

        -- power: 6 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 2);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 1 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'power', card_id_var::text, 1);
        END IF;

        -- special: Inspirational Leadership
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Inspirational Leadership' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 2);
        END IF;

        -- special: Draconic Leadership
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Draconic Leadership' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Protection of Saint Michael
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Protection of Saint Michael' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Sleeper Awakens
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Sleeper Awakens' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Rule by Fear
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Rule by Fear' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Burned at the Stake
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Burned at the Stake' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Fairy Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fairy Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: I Command an Army
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'I Command an Army' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Flaming Arrows
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Flaming Arrows' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 2);
        END IF;

        -- special: Hades: Lord of the Underworld
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hades: Lord of the Underworld' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Patron Saint of France
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Patron Saint of France' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Call of Cthulhu
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Call of Cthulhu' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Oni and Succubus
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Oni and Succubus' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Valkyrie Hildr: Select the Slain
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Valkyrie Hildr: Select the Slain' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Ancient One
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Ancient One' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Ethnoarchaeology
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Ethnoarchaeology' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Legendary Escape
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Legendary Escape' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Early Feminist Leader
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Early Feminist Leader' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- special: Network of Fanatics
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Network of Fanatics' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 2);
        END IF;

        -- special: Taxes
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Taxes' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'special', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Brute Force
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Brute Force' AND followup_attack_types = 'Intelligence + Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Any-Power' AND followup_attack_types = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Intelligence
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Intelligence' AND followup_attack_types = 'Brute Force + Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000004', 'teamwork', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded tournament deck: %', '2025 Nationals 7th (Joe Peters)';
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', '2025 Nationals 7th (Joe Peters)';
    END IF;

    -- 2026-nationals-jessica-simms (local id: e8835184-8f91-4056-9f85-3ff6fac01d4a)
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE user_id = tournament_user_id AND name = '2026 Nationals (Jessica Simms)'
    ) THEN
        INSERT INTO decks (
            id,
            user_id,
            name,
            description,
            created_at,
            updated_at,
            is_private,
            is_limited,
            is_valid,
            card_count,
            threat,
            reserve_character
        ) VALUES (
            'a2880001-0000-4000-8000-000000000005'::uuid,
            tournament_user_id,
            '2026 Nationals (Jessica Simms)',
            '',
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            TRUE,
            0,
            0,
            NULL
        );

        -- ally-universe: Professor Porter
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Professor Porter' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Hucklebuck
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Hucklebuck' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- aspect: Isis
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Isis' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'aspect', card_id_var::text, 1);
        END IF;

        -- character: Morgan le Fay
        SELECT id INTO card_id_var FROM characters WHERE name = 'Morgan le Fay' AND set = 'ERB' AND COALESCE(is_foil, false) = TRUE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'character', card_id_var::text, 1);
        END IF;

        -- character: Mina Harker
        SELECT id INTO card_id_var FROM characters WHERE name = 'Mina Harker' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'character', card_id_var::text, 1);
        END IF;

        -- character: Joan of Arc
        SELECT id INTO card_id_var FROM characters WHERE name = 'Joan of Arc' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'character', card_id_var::text, 1);
        END IF;

        -- character: Wicked Witch
        SELECT id INTO card_id_var FROM characters WHERE name = 'Wicked Witch' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'character', card_id_var::text, 1);
        END IF;

        -- location: Asclepieion
        SELECT id INTO card_id_var FROM locations WHERE name = 'Asclepieion' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'location', card_id_var::text, 1);
        END IF;

        -- mission: Gone Too Far
        SELECT id INTO card_id_var FROM missions WHERE name = 'Gone Too Far' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Johansen's Widow
        SELECT id INTO card_id_var FROM missions WHERE name = 'Johansen''s Widow' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: New Orleans, 1908
        SELECT id INTO card_id_var FROM missions WHERE name = 'New Orleans, 1908' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Professor Angell's Investigation
        SELECT id INTO card_id_var FROM missions WHERE name = 'Professor Angell''s Investigation' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Alert
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Alert' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Dreams of Men
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Dreams of Men' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Worshipping the Great Old One
        SELECT id INTO card_id_var FROM missions WHERE name = 'Worshipping the Great Old One' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 3);
        END IF;

        -- power: 5 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 1 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'power', card_id_var::text, 1);
        END IF;

        -- special: Inspirational Leadership
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Inspirational Leadership' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 2);
        END IF;

        -- special: Apprentice of Merlin
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Apprentice of Merlin' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Protection of Saint Michael
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Protection of Saint Michael' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Subjugate the Meek
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Subjugate the Meek' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Feared by All Witches
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Feared by All Witches' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: One Eye
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'One Eye' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Vampiric Celerity
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Vampiric Celerity' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Wolves, Crows, & Black Bees
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Wolves, Crows, & Black Bees' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Harness the Wind
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Harness the Wind' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Valkyrie Skeggjold
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Valkyrie Skeggjold' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Fairy Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fairy Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Avalon's Warmth
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Avalon''s Warmth' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Patron Saint of France
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Patron Saint of France' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Hunger
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Hunger' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Jonathan Harker, Solicitor
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Jonathan Harker, Solicitor' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Legendary Escape
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Legendary Escape' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: Tracking Movements
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Tracking Movements' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 3);
        END IF;

        -- special: Early Feminist Leader
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Early Feminist Leader' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- special: I Will Have Those Silver Shoes!
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'I Will Have Those Silver Shoes!' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'special', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Intelligence
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Intelligence' AND followup_attack_types = 'Combat + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Brute Force
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Brute Force' AND followup_attack_types = 'Intelligence + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Energy
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Energy' AND followup_attack_types = 'Combat + Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000005', 'teamwork', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded tournament deck: %', '2026 Nationals (Jessica Simms)';
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', '2026 Nationals (Jessica Simms)';
    END IF;

    -- 2026-nationals-andrew-taylor (local id: 80b3efbf-e1c2-443c-9e8b-befa3bee10fe)
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE user_id = tournament_user_id AND name = '2026 Nationals (Andrew Taylor)'
    ) THEN
        INSERT INTO decks (
            id,
            user_id,
            name,
            description,
            created_at,
            updated_at,
            is_private,
            is_limited,
            is_valid,
            card_count,
            threat,
            reserve_character
        ) VALUES (
            'a2880001-0000-4000-8000-000000000006'::uuid,
            tournament_user_id,
            '2026 Nationals (Andrew Taylor)',
            '',
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            TRUE,
            0,
            0,
            NULL
        );

        -- ally-universe: Professor Porter
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Professor Porter' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Allan Quatermain
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Allan Quatermain' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Hera
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Hera' AND stat_to_use = '7 or higher' AND stat_type_to_use = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Hucklebuck
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Hucklebuck' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- aspect: Isis
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Isis' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'aspect', card_id_var::text, 1);
        END IF;

        -- character: Morgan le Fay
        SELECT id INTO card_id_var FROM characters WHERE name = 'Morgan le Fay' AND set = 'ERB' AND COALESCE(is_foil, false) = TRUE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'character', card_id_var::text, 1);
        END IF;

        -- character: Sheriff of Nottingham
        SELECT id INTO card_id_var FROM characters WHERE name = 'Sheriff of Nottingham' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'character', card_id_var::text, 1);
        END IF;

        -- character: Joan of Arc
        SELECT id INTO card_id_var FROM characters WHERE name = 'Joan of Arc' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'character', card_id_var::text, 1);
        END IF;

        -- character: Wicked Witch
        SELECT id INTO card_id_var FROM characters WHERE name = 'Wicked Witch' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'character', card_id_var::text, 1);
        END IF;

        -- location: Spartan Training Ground
        SELECT id INTO card_id_var FROM locations WHERE name = 'Spartan Training Ground' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'location', card_id_var::text, 1);
        END IF;

        -- mission: A Fighting Man of Mars
        SELECT id INTO card_id_var FROM missions WHERE name = 'A Fighting Man of Mars' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Swords of Mars
        SELECT id INTO card_id_var FROM missions WHERE name = 'Swords of Mars' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Battle of Kings
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Battle of Kings' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Face of Death
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Face of Death' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Invisible Men
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Invisible Men' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Loyalty of Woola
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Loyalty of Woola' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Under the Moons of Mars
        SELECT id INTO card_id_var FROM missions WHERE name = 'Under the Moons of Mars' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- power: 1 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 2);
        END IF;

        -- power: 5 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 2);
        END IF;

        -- power: 6 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 2);
        END IF;

        -- power: 7 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'power', card_id_var::text, 1);
        END IF;

        -- special: Inspirational Leadership
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Inspirational Leadership' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 2);
        END IF;

        -- special: Apprentice of Merlin
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Apprentice of Merlin' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Protection of Saint Michael
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Protection of Saint Michael' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Subjugate the Meek
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Subjugate the Meek' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Bodhisattva: Enlightened One
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Bodhisattva: Enlightened One' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: One Eye
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'One Eye' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Wolves, Crows, & Black Bees
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Wolves, Crows, & Black Bees' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Harness the Wind
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Harness the Wind' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Fairy Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fairy Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: I Command an Army
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'I Command an Army' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Duality
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Duality' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Hades: Lord of the Underworld
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hades: Lord of the Underworld' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Patron Saint of France
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Patron Saint of France' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Shapeshifter's Guise
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Shapeshifter''s Guise' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 3);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Legendary Escape
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Legendary Escape' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: Early Feminist Leader
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Early Feminist Leader' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- special: I Will Have Those Silver Shoes!
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'I Will Have Those Silver Shoes!' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 2);
        END IF;

        -- special: Taxes
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Taxes' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'special', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Any-Power' AND followup_attack_types = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Energy
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Energy' AND followup_attack_types = 'Combat + Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'teamwork', card_id_var::text, 1);
        END IF;

        -- training: Training (Merlin)
        SELECT id INTO card_id_var FROM training_cards WHERE name = 'Training (Merlin)' AND type_1 = 'Energy' AND type_2 = 'Combat' AND value_to_use = '5 or less' AND bonus = '+4' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'training', card_id_var::text, 1);
        END IF;

        -- training: Training (Cultists)
        SELECT id INTO card_id_var FROM training_cards WHERE name = 'Training (Cultists)' AND type_1 = 'Energy' AND type_2 = 'Intelligence' AND value_to_use = '5 or less' AND bonus = '+4' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'training', card_id_var::text, 1);
        END IF;

        -- training: Training (Leonidas)
        SELECT id INTO card_id_var FROM training_cards WHERE name = 'Training (Leonidas)' AND type_1 = 'Combat' AND type_2 = 'Intelligence' AND value_to_use = '5 or less' AND bonus = '+4' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000006', 'training', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded tournament deck: %', '2026 Nationals (Andrew Taylor)';
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', '2026 Nationals (Andrew Taylor)';
    END IF;

    -- 2025-nationals-4th-felipe-cagno (local id: 13d66936-12b5-42c7-b517-939809522f14)
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE user_id = tournament_user_id AND name = '2025 Nationals 4th (Felipe Cagno)'
    ) THEN
        INSERT INTO decks (
            id,
            user_id,
            name,
            description,
            created_at,
            updated_at,
            is_private,
            is_limited,
            is_valid,
            card_count,
            threat,
            reserve_character
        ) VALUES (
            'a2880001-0000-4000-8000-000000000007'::uuid,
            tournament_user_id,
            '2025 Nationals 4th (Felipe Cagno)',
            '',
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            FALSE,
            0,
            0,
            NULL
        );

        -- ally-universe: Professor Porter
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Professor Porter' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Hucklebuck
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Hucklebuck' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- aspect: Isis
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Isis' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'aspect', card_id_var::text, 1);
        END IF;

        -- character: Morgan le Fay
        SELECT id INTO card_id_var FROM characters WHERE name = 'Morgan le Fay' AND set = 'ERB' AND COALESCE(is_foil, false) = TRUE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'character', card_id_var::text, 1);
        END IF;

        -- character: Jane Porter
        SELECT id INTO card_id_var FROM characters WHERE name = 'Jane Porter' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'character', card_id_var::text, 1);
        END IF;

        -- character: Mina Harker
        SELECT id INTO card_id_var FROM characters WHERE name = 'Mina Harker' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'character', card_id_var::text, 1);
        END IF;

        -- character: Wicked Witch
        SELECT id INTO card_id_var FROM characters WHERE name = 'Wicked Witch' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'character', card_id_var::text, 1);
        END IF;

        -- location: The Land That Time Forgot
        SELECT id INTO card_id_var FROM locations WHERE name = 'The Land That Time Forgot' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'location', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 2);
        END IF;

        -- power: 6 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 2);
        END IF;

        -- power: 1 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'power', card_id_var::text, 1);
        END IF;

        -- special: Tenacious Pursuit
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Tenacious Pursuit' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Apprentice of Merlin
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Apprentice of Merlin' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Charge into Battle!
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Charge into Battle!' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Feared by All Witches
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Feared by All Witches' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: One Eye
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'One Eye' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Vampiric Celerity
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Vampiric Celerity' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Wolves, Crows, & Black Bees
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Wolves, Crows, & Black Bees' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Nocturnal Hunter
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Nocturnal Hunter' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Harness the Wind
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Harness the Wind' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Valkyrie Skeggjold
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Valkyrie Skeggjold' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Not a Damsel in Distress
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Not a Damsel in Distress' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Fairy Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fairy Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Avalon's Warmth
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Avalon''s Warmth' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Hades: Lord of the Underworld
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hades: Lord of the Underworld' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Hunger
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Hunger' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Not Without My Friends
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Not Without My Friends' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Valkyrie Hildr: Select the Slain
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Valkyrie Hildr: Select the Slain' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Jonathan Harker, Solicitor
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Jonathan Harker, Solicitor' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Ethnoarchaeology
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Ethnoarchaeology' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Legendary Escape
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Legendary Escape' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Tracking Movements
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Tracking Movements' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 2);
        END IF;

        -- special: I Will Have Those Silver Shoes!
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'I Will Have Those Silver Shoes!' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- special: Archimedes Q. Porter
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Archimedes Q. Porter' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'special', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Any-Power' AND followup_attack_types = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Brute Force
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Brute Force' AND followup_attack_types = 'Intelligence + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Intelligence
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Intelligence' AND followup_attack_types = 'Brute Force + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a2880001-0000-4000-8000-000000000007', 'teamwork', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded tournament deck: %', '2025 Nationals 4th (Felipe Cagno)';
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', '2025 Nationals 4th (Felipe Cagno)';
    END IF;
END $$;
