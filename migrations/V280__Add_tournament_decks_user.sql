-- Create the internal tournament_decks user (deck seeding is Node-only via seed:tournament-decks).
-- Username: tournament_decks  Password: 5101  Role: USER

DO $$
DECLARE
    tournament_user_id UUID := '00000000-0000-0000-0000-000000000003';
    tournament_password_hash TEXT := '$2b$10$4y9lsEvvADN1Q2LuP4Pd2.VMFT4Qdt5HPpA6mmnq.LS3nBdXa15dW';
    existing_tournament_id UUID;
BEGIN
    SELECT id INTO existing_tournament_id FROM users WHERE username = 'tournament_decks';

    IF existing_tournament_id IS NULL THEN
        INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
        VALUES (
            tournament_user_id,
            'tournament_decks',
            'tournament_decks@example.com',
            tournament_password_hash,
            'USER',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'tournament_decks user created with ID: %', tournament_user_id;
    ELSE
        UPDATE users
        SET password_hash = tournament_password_hash,
            role = 'USER',
            updated_at = NOW()
        WHERE id = existing_tournament_id;
        RAISE NOTICE 'tournament_decks user already exists with ID: %', existing_tournament_id;
    END IF;
END $$;
