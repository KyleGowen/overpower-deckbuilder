-- Create the internal community_decks user and copy guest demo decks as seed data.
-- Username: community_decks  Password: 5101  Role: USER

DO $$
DECLARE
    guest_user_id UUID := '00000000-0000-0000-0000-000000000001';
    community_user_id UUID := '00000000-0000-0000-0000-000000000002';
    community_password_hash TEXT := '$2b$10$4y9lsEvvADN1Q2LuP4Pd2.VMFT4Qdt5HPpA6mmnq.LS3nBdXa15dW';
    existing_community_id UUID;
    community_deck_count INTEGER;
    guest_deck RECORD;
    new_deck_id UUID;
BEGIN
    SELECT id INTO existing_community_id FROM users WHERE username = 'community_decks';

    IF existing_community_id IS NULL THEN
        INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
        VALUES (
            community_user_id,
            'community_decks',
            'community_decks@example.com',
            community_password_hash,
            'USER',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'community_decks user created with ID: %', community_user_id;
    ELSE
        community_user_id := existing_community_id;
        UPDATE users
        SET password_hash = community_password_hash,
            role = 'USER',
            updated_at = NOW()
        WHERE id = community_user_id;
        RAISE NOTICE 'community_decks user already exists with ID: %', community_user_id;
    END IF;

    SELECT COUNT(*) INTO community_deck_count
    FROM decks
    WHERE user_id = community_user_id;

    IF community_deck_count > 0 THEN
        RAISE NOTICE 'community_decks already owns % deck(s); skipping guest deck copy', community_deck_count;
        RETURN;
    END IF;

    FOR guest_deck IN
        SELECT * FROM decks WHERE user_id = guest_user_id
    LOOP
        new_deck_id := gen_random_uuid();

        INSERT INTO decks (
            id,
            user_id,
            name,
            description,
            created_at,
            updated_at,
            ui_preferences,
            card_count,
            threat,
            character_1_id,
            character_2_id,
            character_3_id,
            character_4_id,
            location_id,
            is_limited,
            is_valid,
            character_1_image,
            character_2_image,
            character_3_image,
            character_4_image,
            reserve_character,
            background_image_path,
            display_mission_card_id
        ) VALUES (
            new_deck_id,
            community_user_id,
            guest_deck.name,
            guest_deck.description,
            guest_deck.created_at,
            guest_deck.updated_at,
            guest_deck.ui_preferences,
            guest_deck.card_count,
            guest_deck.threat,
            guest_deck.character_1_id,
            guest_deck.character_2_id,
            guest_deck.character_3_id,
            guest_deck.character_4_id,
            guest_deck.location_id,
            guest_deck.is_limited,
            guest_deck.is_valid,
            guest_deck.character_1_image,
            guest_deck.character_2_image,
            guest_deck.character_3_image,
            guest_deck.character_4_image,
            guest_deck.reserve_character,
            guest_deck.background_image_path,
            guest_deck.display_mission_card_id
        );

        INSERT INTO deck_cards (
            deck_id,
            card_type,
            card_id,
            quantity,
            exclude_from_draw,
            created_at,
            updated_at
        )
        SELECT
            new_deck_id,
            card_type,
            card_id,
            quantity,
            exclude_from_draw,
            created_at,
            updated_at
        FROM deck_cards
        WHERE deck_id = guest_deck.id;

        RAISE NOTICE 'Copied guest deck "%" (%) to community_decks as %',
            guest_deck.name, guest_deck.id, new_deck_id;
    END LOOP;
END $$;
