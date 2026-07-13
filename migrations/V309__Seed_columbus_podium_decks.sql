-- Seed Columbus S1 podium decks for tournament_decks (prod-stable UUIDs).
-- Generated via scripts/generate-columbus-podium-migration.ts
-- Idempotent: skips when deck id already exists.
--
-- Deck manifest:
--   81d73769-e987-4c85-a9f8-6629980a1807  S1 Regionals (Columbus 1st, Justin Sadaie)
--   a6df76ba-c073-4e65-bc68-2046ee3919b1  S1 Regionals (Columbus 2nd, Noor El-barrad
--   bb9a2144-9c15-4cb3-9c38-851e66972c74  S1 Regionals (Columbus 3rd, Charlie Hanford)

DO $$
DECLARE
    tournament_user_id UUID := '00000000-0000-0000-0000-000000000003';
    card_id_var TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = tournament_user_id) THEN
        RAISE EXCEPTION 'tournament_decks user missing; apply V280 first';
    END IF;

    -- s1-columbus-1st-justin-sadaie
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE id = '81d73769-e987-4c85-a9f8-6629980a1807'::uuid
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
            '81d73769-e987-4c85-a9f8-6629980a1807'::uuid,
            tournament_user_id,
            'S1 Regionals (Columbus 1st, Justin Sadaie)',
            NULL,
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            TRUE,
            0,
            0,
            NULL
        );

        -- character: Angry Mob (Middle Ages)
        SELECT id INTO card_id_var FROM characters WHERE name = 'Angry Mob (Middle Ages)' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'character', card_id_var::text, 1);
        END IF;

        -- special: Pitchforks and Torches
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Pitchforks and Torches' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Regent of the Crown
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Regent of the Crown' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Don't Let it Get Away!
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Don''t Let it Get Away!' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Strength in Numbers
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Strength in Numbers' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Mob Mentality
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Mob Mentality' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- character: Morgan le Fay
        SELECT id INTO card_id_var FROM characters WHERE name = 'Morgan le Fay' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'character', card_id_var::text, 1);
        END IF;

        -- special: Apprentice of Merlin
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Apprentice of Merlin' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Duality
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Duality' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Shapeshifter's Guise
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Shapeshifter''s Guise' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 3);
        END IF;

        -- character: Wicked Witch
        SELECT id INTO card_id_var FROM characters WHERE name = 'Wicked Witch' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'character', card_id_var::text, 1);
        END IF;

        -- special: One Eye
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'One Eye' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Harness the Wind
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Harness the Wind' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Wolves, Crows, & Black Bees
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Wolves, Crows, & Black Bees' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: I Will Have Those Silver Shoes!
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'I Will Have Those Silver Shoes!' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 2);
        END IF;

        -- character: Cthulhu
        SELECT id INTO card_id_var FROM characters WHERE name = 'Cthulhu' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'character', card_id_var::text, 1);
        END IF;

        -- special: Network of Fanatics
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Network of Fanatics' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 2);
        END IF;

        -- special: The Sleeper Awakens
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Sleeper Awakens' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Call of Cthulhu
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Call of Cthulhu' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- location: The Round Table
        SELECT id INTO card_id_var FROM locations WHERE name = 'The Round Table' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'location', card_id_var::text, 1);
        END IF;

        -- mission: The Dreams of Men
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Dreams of Men' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Professor Angell's Investigation
        SELECT id INTO card_id_var FROM missions WHERE name = 'Professor Angell''s Investigation' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: New Orleans, 1908
        SELECT id INTO card_id_var FROM missions WHERE name = 'New Orleans, 1908' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Worshipping the Great Old One
        SELECT id INTO card_id_var FROM missions WHERE name = 'Worshipping the Great Old One' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Alert
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Alert' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Johansen's Widow
        SELECT id INTO card_id_var FROM missions WHERE name = 'Johansen''s Widow' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Gone Too Far
        SELECT id INTO card_id_var FROM missions WHERE name = 'Gone Too Far' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'mission', card_id_var::text, 1);
        END IF;

        -- special: Fairy Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fairy Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Oni and Succubus
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Oni and Succubus' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Draconic Leadership
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Draconic Leadership' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Hades: Lord of the Underworld
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hades: Lord of the Underworld' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Legendary Escape
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Legendary Escape' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'special', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Brute Force
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Brute Force' AND followup_attack_types = 'Intelligence + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Any-Power' AND followup_attack_types = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 7 Intelligence
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '7 Intelligence' AND followup_attack_types = 'Brute Force + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'teamwork', card_id_var::text, 1);
        END IF;

        -- ally-universe: Hucklebuck
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Hucklebuck' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Hera
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Hera' AND stat_to_use = '7 or higher' AND stat_type_to_use = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Professor Porter
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Professor Porter' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- power: 8 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 2);
        END IF;

        -- power: 7 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 2);
        END IF;

        -- power: 6 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 3);
        END IF;

        -- power: 3 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- power: 1 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'power', card_id_var::text, 1);
        END IF;

        -- event: Desperate Gamble
        SELECT id INTO card_id_var FROM events WHERE name = 'Desperate Gamble' AND mission_set = 'The Call of Cthulhu' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'event', card_id_var::text, 1);
        END IF;

        -- aspect: Isis
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Isis' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('81d73769-e987-4c85-a9f8-6629980a1807', 'aspect', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded Columbus podium deck: %', 'S1 Regionals (Columbus 1st, Justin Sadaie)';
    ELSE
        RAISE NOTICE 'Columbus podium deck already exists; skipping: %', 'S1 Regionals (Columbus 1st, Justin Sadaie)';
    END IF;

    -- s1-columbus-2nd-noor-el-barrad
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE id = 'a6df76ba-c073-4e65-bc68-2046ee3919b1'::uuid
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
            'a6df76ba-c073-4e65-bc68-2046ee3919b1'::uuid,
            tournament_user_id,
            'S1 Regionals (Columbus 2nd, Noor El-barrad',
            NULL,
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            TRUE,
            0,
            0,
            (SELECT id FROM characters WHERE name = 'Jane Porter' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1)
        );

        -- character: Sun Wukong
        SELECT id INTO card_id_var FROM characters WHERE name = 'Sun Wukong' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'character', card_id_var::text, 1);
        END IF;

        -- special: Cloud Surfing
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Cloud Surfing' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Staff of the Monkey King
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Staff of the Monkey King' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grasp of the Five Elements
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grasp of the Five Elements' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Transformation Trickery
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Transformation Trickery' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Godly Strength
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Godly Strength' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- character: Zorro
        SELECT id INTO card_id_var FROM characters WHERE name = 'Zorro' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'character', card_id_var::text, 1);
        END IF;

        -- special: Riposte
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Riposte' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 3);
        END IF;

        -- special: Elite Swordsmanship
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Elite Swordsmanship' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 2);
        END IF;

        -- special: 3 Quick Strokes
        SELECT id INTO card_id_var FROM special_cards WHERE name = '3 Quick Strokes' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Riches of Don Diego de la Vega
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Riches of Don Diego de la Vega' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- character: Dejah Thoris
        SELECT id INTO card_id_var FROM characters WHERE name = 'Dejah Thoris' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'character', card_id_var::text, 1);
        END IF;

        -- special: Protector of Barsoom
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Protector of Barsoom' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Warrior of Helium
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Warrior of Helium' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Fortune of Helium
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fortune of Helium' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- character: Jane Porter
        SELECT id INTO card_id_var FROM characters WHERE name = 'Jane Porter' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'character', card_id_var::text, 1);
        END IF;

        -- special: Tenacious Pursuit
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Tenacious Pursuit' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Hades: Lord of the Underworld
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hades: Lord of the Underworld' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Fairy Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fairy Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Bodhisattva: Enlightened One
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Bodhisattva: Enlightened One' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- special: Draconic Leadership
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Draconic Leadership' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        -- aspect: Amaru: Dragon Legend
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Amaru: Dragon Legend' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'aspect', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Brute Force
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Brute Force' AND followup_attack_types = 'Energy + Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Energy
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Energy' AND followup_attack_types = 'Brute Force + Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'teamwork', card_id_var::text, 1);
        END IF;

        -- teamwork: 8 Combat
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '8 Combat' AND followup_attack_types = 'Brute Force + Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'teamwork', card_id_var::text, 1);
        END IF;

        -- ally-universe: Professor Porter
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Professor Porter' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Allan Quatermain
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Allan Quatermain' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- power: 8 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 2);
        END IF;

        -- power: 7 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 2);
        END IF;

        -- power: 6 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 2);
        END IF;

        -- power: 4 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 1 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 7 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- power: 8 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'power', card_id_var::text, 1);
        END IF;

        -- mission: Captain Bartholomew
        SELECT id INTO card_id_var FROM missions WHERE name = 'Captain Bartholomew' AND mission_set = 'The Chronicles of TFAC' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Death Comes in Red
        SELECT id INTO card_id_var FROM missions WHERE name = 'Death Comes in Red' AND mission_set = 'The Chronicles of TFAC' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Mean What You Say
        SELECT id INTO card_id_var FROM missions WHERE name = 'Mean What You Say' AND mission_set = 'The Chronicles of TFAC' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Outback Outcast
        SELECT id INTO card_id_var FROM missions WHERE name = 'Outback Outcast' AND mission_set = 'The Chronicles of TFAC' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Bodyguard
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Bodyguard' AND mission_set = 'The Chronicles of TFAC' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Hangmen Gang
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Hangmen Gang' AND mission_set = 'The Chronicles of TFAC' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Princess of Persia
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Princess of Persia' AND mission_set = 'The Chronicles of TFAC' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'mission', card_id_var::text, 1);
        END IF;

        -- location: The Round Table
        SELECT id INTO card_id_var FROM locations WHERE name = 'The Round Table' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'location', card_id_var::text, 1);
        END IF;

        -- special: Legendary Escape
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Legendary Escape' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('a6df76ba-c073-4e65-bc68-2046ee3919b1', 'special', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded Columbus podium deck: %', 'S1 Regionals (Columbus 2nd, Noor El-barrad';
    ELSE
        RAISE NOTICE 'Columbus podium deck already exists; skipping: %', 'S1 Regionals (Columbus 2nd, Noor El-barrad';
    END IF;

    -- s1-columbus-3rd-charlie-hanford
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE id = 'bb9a2144-9c15-4cb3-9c38-851e66972c74'::uuid
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
            'bb9a2144-9c15-4cb3-9c38-851e66972c74'::uuid,
            tournament_user_id,
            'S1 Regionals (Columbus 3rd, Charlie Hanford)',
            NULL,
            NOW(),
            NOW(),
            FALSE,
            FALSE,
            TRUE,
            0,
            0,
            (SELECT id FROM characters WHERE name = 'Jane Porter' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1)
        );

        -- character: Ra
        SELECT id INTO card_id_var FROM characters WHERE name = 'Ra' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'character', card_id_var::text, 1);
        END IF;

        -- special: Cult of Menevis Bull
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Cult of Menevis Bull' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Eye of Sekhmet
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Eye of Sekhmet' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Healing Waters of the Nile
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Healing Waters of the Nile' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 2);
        END IF;

        -- advanced-universe: Shards of the Staff
        SELECT id INTO card_id_var FROM advanced_universe_cards WHERE name = 'Shards of the Staff' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'advanced-universe', card_id_var::text, 1);
        END IF;

        -- advanced-universe: Staff Head
        SELECT id INTO card_id_var FROM advanced_universe_cards WHERE name = 'Staff Head' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'advanced-universe', card_id_var::text, 1);
        END IF;

        -- special: Thunderbolt
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Thunderbolt' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 6);
        END IF;

        -- special: Hera
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hera' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Law and Order
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Law and Order' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Banishment
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Banishment' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- character: Korak
        SELECT id INTO card_id_var FROM characters WHERE name = 'Korak' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'character', card_id_var::text, 1);
        END IF;

        -- special: Son of the Jungle
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Son of the Jungle' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 3);
        END IF;

        -- special: Meriem and Jackie Clayton
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Meriem and Jackie Clayton' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: John Clayton III
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'John Clayton III' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- character: Zeus
        SELECT id INTO card_id_var FROM characters WHERE name = 'Zeus' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'character', card_id_var::text, 1);
        END IF;

        -- character: Jane Porter
        SELECT id INTO card_id_var FROM characters WHERE name = 'Jane Porter' AND set = 'ERB' AND COALESCE(is_foil, false) = FALSE LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'character', card_id_var::text, 1);
        END IF;

        -- special: Tenacious Pursuit
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Tenacious Pursuit' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Valkyrie Hildr: Select the Slain
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Valkyrie Hildr: Select the Slain' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Preternatural Healing
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Preternatural Healing' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Hades: Lord of the Underworld
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Hades: Lord of the Underworld' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Grim Reaper
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Grim Reaper' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: The Gemini
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'The Gemini' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Legendary Escape
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Legendary Escape' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Disorient Opponent
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Disorient Opponent' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Merlin's Magic
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Merlin''s Magic' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Freya: Goddess of Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Freya: Goddess of Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Fairy Protection
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Fairy Protection' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Charge into Battle!
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Charge into Battle!' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- special: Valkyrie Skeggjold
        SELECT id INTO card_id_var FROM special_cards WHERE name = 'Valkyrie Skeggjold' AND set = 'ERB' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'special', card_id_var::text, 1);
        END IF;

        -- aspect: Supay
        SELECT id INTO card_id_var FROM aspects WHERE name = 'Supay' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'aspect', card_id_var::text, 1);
        END IF;

        -- teamwork: 6 Any-Power
        SELECT id INTO card_id_var FROM teamwork_cards WHERE name = '6 Any-Power' AND followup_attack_types = 'Any-Power / Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'teamwork', card_id_var::text, 1);
        END IF;

        -- ally-universe: Little John
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Little John' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Hucklebuck
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Hucklebuck' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Allan Quatermain
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Allan Quatermain' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- ally-universe: Professor Porter
        SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = 'Professor Porter' AND stat_to_use = '5 or less' AND stat_type_to_use = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'ally-universe', card_id_var::text, 1);
        END IF;

        -- event: The Giant Man of Mars
        SELECT id INTO card_id_var FROM events WHERE name = 'The Giant Man of Mars' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'event', card_id_var::text, 1);
        END IF;

        -- mission: The Face of Death
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Face of Death' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Battle of Kings
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Battle of Kings' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: A Fighting Man of Mars
        SELECT id INTO card_id_var FROM missions WHERE name = 'A Fighting Man of Mars' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Swords of Mars
        SELECT id INTO card_id_var FROM missions WHERE name = 'Swords of Mars' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Invisible Men
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Invisible Men' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: The Loyalty of Woola
        SELECT id INTO card_id_var FROM missions WHERE name = 'The Loyalty of Woola' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'mission', card_id_var::text, 1);
        END IF;

        -- mission: Under the Moons of Mars
        SELECT id INTO card_id_var FROM missions WHERE name = 'Under the Moons of Mars' AND mission_set = 'The Warlord of Mars' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'mission', card_id_var::text, 1);
        END IF;

        -- location: Asclepieion
        SELECT id INTO card_id_var FROM locations WHERE name = 'Asclepieion' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'location', card_id_var::text, 1);
        END IF;

        -- power: 8 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 8 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 3);
        END IF;

        -- power: 7 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 7 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 3);
        END IF;

        -- power: 6 - Energy
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Energy' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 1 - Combat
        SELECT id INTO card_id_var FROM power_cards WHERE value = 1 AND power_type = 'Combat' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 2 - Brute Force
        SELECT id INTO card_id_var FROM power_cards WHERE value = 2 AND power_type = 'Brute Force' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Intelligence
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Intelligence' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 3 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 3 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 4 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 4 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Multi Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Multi Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 5 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 5 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        -- power: 6 - Any-Power
        SELECT id INTO card_id_var FROM power_cards WHERE value = 6 AND power_type = 'Any-Power' LIMIT 1;
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES ('bb9a2144-9c15-4cb3-9c38-851e66972c74', 'power', card_id_var::text, 1);
        END IF;

        RAISE NOTICE 'Seeded Columbus podium deck: %', 'S1 Regionals (Columbus 3rd, Charlie Hanford)';
    ELSE
        RAISE NOTICE 'Columbus podium deck already exists; skipping: %', 'S1 Regionals (Columbus 3rd, Charlie Hanford)';
    END IF;
END $$;
