-- Seed tournament winning decks for the Home "Tournament Winners" rail.
-- Generated from local tournament_decks user via scripts/generate-tournament-deck-migration.ts
-- Idempotent: skips decks that tournament_decks already owns by name.
-- Deck metadata (card_count, threat, character slots) is populated by V133 triggers on deck_cards INSERT.
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

        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'ally-universe', '155283bd-b59a-4347-84e9-e9939bcce7f1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'ally-universe', '787c0c41-5764-4138-8389-e2b707528181', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'aspect', '094ebfe2-4dc9-4dcc-9971-689dde6aca45', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'character', '8e0d0b61-a24f-4cdb-a4ef-fe39c3e9ba8f', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'character', 'ccf9fd69-44bb-485b-8d6d-596bd70bf582', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'character', 'da5c1246-cccf-40af-9516-6ad593dcfa01', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'character', 'f024d9d4-33f8-408d-a174-e8d1a968055b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'location', '0ab39fa4-f446-4e33-bda1-255f0937a0a2', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', '07e7a100-c2f5-4ced-8e42-e5d1af71d4e8', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', '145a93ca-028e-4792-bea7-05b15cf2cd0a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', '21b98250-2b67-4a31-9964-566c7b56622d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', '38e090b9-17ea-475c-858a-1f3a411937ab', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', '4166c5d4-60ed-46b5-9514-139fa073c44a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', '5904b9f0-9907-4beb-971a-2e48b0a38d80', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', '87808fc3-318a-4e65-bbfb-1bacfa4628ed', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', 'a22668ad-5ebe-4995-b3fe-b0df8854ccd6', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', 'a3441bc6-bfb9-4f72-8c01-35fc32c08165', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', 'bd84e005-b4d0-4d92-b31e-730b2140aab8', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', 'c869c511-8d2c-4611-909f-d59a07049c05', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', 'd6567018-cce4-4326-9900-e16b38aeb752', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', 'e193561d-7ccc-4128-9a3d-fbc41d788821', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', 'ef1092f4-a5dc-454c-b23e-74d2f2a8b422', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', 'f146a232-fd86-41ae-8114-cd89e341882a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'power', 'f5ed2ecd-1277-491c-8436-d85e26f84edb', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '00381214-c415-4df7-b277-7c1aecf158d6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '08c4e501-7949-49b7-8bd5-da3253c0e574', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '10e1d73e-43f9-4efe-b873-f752681e5edc', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '15c429ff-5ccc-4ed2-8ea7-aeeb9e99315a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '185f666f-8bb2-451b-a3aa-6fc1e3499a80', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '1e9db8cc-1e59-4512-9a81-ab17b5c2d09a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '1f936d3c-9a63-4a3b-af58-d8b0c60beee3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '344ecf25-7a42-445e-b966-038cae34f12e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '41eab20a-8076-4ed3-ad65-c41cbcf0c9f6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '4583e7cd-73eb-4c4c-9435-4c9a5089ada3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '486aa4e5-5ce5-4b08-b347-07cf357500e6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '48714077-671c-435d-b9ac-03f5273982d3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '514f9cad-46a3-4f6c-921d-e7e2f550350b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '7d93334a-78dd-4175-9e69-6f79f02cc797', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '83edbd17-9740-4c60-807b-217608c5bf8c', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '965573c2-2a02-4a3d-9f91-5b3d3c830d95', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '97131fd3-4c90-48c3-bc76-521921637928', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '9c006d80-8838-4b83-bdd2-a01507828ba5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', '9d05ce6b-1183-49d8-84c0-b5a8e42713b3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', 'a7f0dbe8-0a29-4b57-955b-bc19de2d2de3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', 'c3a40085-b766-4c44-97d9-53bd1786ae5b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', 'd577e094-8dc3-454e-b496-ca2741375901', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', 'd9764e00-256c-49f3-9712-0f6e2f47a3d8', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', 'e34b0909-e944-4a8b-8139-ffd9342487be', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', 'ecfe4be3-7ec4-47b4-9eb7-4e99265684b8', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', 'fb96d5ab-c45d-4653-94ec-00f6184505b3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'special', 'ff2d6d16-4d50-4b32-9d54-73941b1e8130', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', '14c3a545-7ae2-411f-b35d-1a4c5bf76a84', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', '24d35cfe-2534-4bb4-97d7-f8293bda6828', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', '3ff57f7c-0078-47b0-bbec-dfca229c0615', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', '9a925b14-51e0-4b67-b63e-0aa3aa6413d5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', 'c05dc0bd-454f-4576-bda5-60a9c08fb92b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000001', 'teamwork', 'd06e8e10-ddb0-4cc9-9af0-eff8f2535e1a', 1);

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

        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'ally-universe', '04492987-be6b-4cb4-8e9b-039cf86adf48', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'ally-universe', '155283bd-b59a-4347-84e9-e9939bcce7f1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'ally-universe', '787c0c41-5764-4138-8389-e2b707528181', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'aspect', '0ad50eca-bab5-4e21-82fe-bc0ad527fbe4', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'character', '31aeee5f-13ea-4e0c-bc0a-03a3ada53980', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'character', '79740ec3-ebf6-4ac9-bc6c-b3d6493bdaaa', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'character', 'e2c2de21-e02e-487a-b3d3-ee2bc7be564e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'character', 'e5b728e7-6b4b-4000-ba4d-6714eada4b2f', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'event', '0e65787a-8d85-44e5-9b15-a6355cd5e053', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'location', 'b6e218e0-e4c6-46ea-ba26-4a547367c83f', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', '550e8400-e29b-41d4-a716-446655440008', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', '550e8400-e29b-41d4-a716-446655440009', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', '550e8400-e29b-41d4-a716-446655440010', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', '550e8400-e29b-41d4-a716-446655440011', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', '550e8400-e29b-41d4-a716-446655440012', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', '550e8400-e29b-41d4-a716-446655440013', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'mission', '550e8400-e29b-41d4-a716-446655440014', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', '07e7a100-c2f5-4ced-8e42-e5d1af71d4e8', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', '145a93ca-028e-4792-bea7-05b15cf2cd0a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', '38e090b9-17ea-475c-858a-1f3a411937ab', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', '3e74bad2-48f4-4e24-9df1-135252607b36', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', '5904b9f0-9907-4beb-971a-2e48b0a38d80', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', '798ac811-2e98-4f93-b31a-706290f2c40d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', '87808fc3-318a-4e65-bbfb-1bacfa4628ed', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', '89cb9018-1a7e-4472-af9a-5573e1929e08', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', '9214c3bf-20c4-47c2-b4ef-44134ed75174', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', 'a22668ad-5ebe-4995-b3fe-b0df8854ccd6', 3);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', 'a3441bc6-bfb9-4f72-8c01-35fc32c08165', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', 'bd84e005-b4d0-4d92-b31e-730b2140aab8', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', 'd6567018-cce4-4326-9900-e16b38aeb752', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'power', 'f146a232-fd86-41ae-8114-cd89e341882a', 3);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '0f09769f-c7b8-4c86-b1a2-3aef6da91cf2', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '15c429ff-5ccc-4ed2-8ea7-aeeb9e99315a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '2c4e8685-8189-4448-adc5-ef2a76e4ed93', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '338a1862-83e7-491d-bb1f-77deb977c8e3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '38ba59c0-131d-4d7b-a887-7d8109f1b315', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '41eab20a-8076-4ed3-ad65-c41cbcf0c9f6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '486aa4e5-5ce5-4b08-b347-07cf357500e6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '4a4996a3-1279-4fab-9447-3905881c6540', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '4ba45778-88f5-4536-9666-cb7296b17739', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '5d1193a0-4151-46f7-9a40-0391399ef47f', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '7ad584cb-67ea-4cab-a86f-9528cf9cf1d6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '7d93334a-78dd-4175-9e69-6f79f02cc797', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '97131fd3-4c90-48c3-bc76-521921637928', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '982440c3-ec84-4c6f-8549-fd89d870f698', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', '9c006d80-8838-4b83-bdd2-a01507828ba5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', 'a7f0dbe8-0a29-4b57-955b-bc19de2d2de3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', 'bf694296-c856-42bc-9071-eeb81e584d60', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', 'c3a40085-b766-4c44-97d9-53bd1786ae5b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', 'ca784dca-f43c-4300-a578-f49eeddbe80b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', 'cac34095-9313-47aa-8e23-027db473357d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', 'e3790d1a-c72f-4291-81cc-59f521b6a8db', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', 'e50a0d23-5610-477b-9277-f1c89d118d7f', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'special', 'fc82cbac-f3de-480d-bb77-e9c6f2ae8f83', 3);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', '24d35cfe-2534-4bb4-97d7-f8293bda6828', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', '84c95e60-4bee-4811-b98c-a21a389156a0', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', 'cc07f33c-e180-4ad1-8121-010a433da6d6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', 'd06e8e10-ddb0-4cc9-9af0-eff8f2535e1a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000002', 'teamwork', 'db3bc3c9-d23e-472b-a47b-c342996cc0c0', 1);

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

        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'ally-universe', '04492987-be6b-4cb4-8e9b-039cf86adf48', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'ally-universe', '155283bd-b59a-4347-84e9-e9939bcce7f1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'ally-universe', '787c0c41-5764-4138-8389-e2b707528181', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'ally-universe', 'bc921316-fe3f-47a1-8aa2-b50add4b4811', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'aspect', '094ebfe2-4dc9-4dcc-9971-689dde6aca45', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'character', '8e0d0b61-a24f-4cdb-a4ef-fe39c3e9ba8f', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'character', 'ced8612d-0945-4fbb-b25b-832497a5e1d3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'character', 'da5c1246-cccf-40af-9516-6ad593dcfa01', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'character', 'e5b728e7-6b4b-4000-ba4d-6714eada4b2f', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'location', 'b6e218e0-e4c6-46ea-ba26-4a547367c83f', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', '07e7a100-c2f5-4ced-8e42-e5d1af71d4e8', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', '145a93ca-028e-4792-bea7-05b15cf2cd0a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', '3e74bad2-48f4-4e24-9df1-135252607b36', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', '4c442606-b60b-4ae7-8af4-124b10f8a07e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', '5904b9f0-9907-4beb-971a-2e48b0a38d80', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', '73048de1-65f7-4654-a6e5-7a2c7c2622be', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', '87808fc3-318a-4e65-bbfb-1bacfa4628ed', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', '89cb9018-1a7e-4472-af9a-5573e1929e08', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', 'a22668ad-5ebe-4995-b3fe-b0df8854ccd6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', 'a3441bc6-bfb9-4f72-8c01-35fc32c08165', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', 'a5f32766-a757-4077-9a9e-adb7ebe7f063', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', 'bd84e005-b4d0-4d92-b31e-730b2140aab8', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', 'bf446280-4e5d-4deb-9f52-71e00fffbcdf', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', 'd6567018-cce4-4326-9900-e16b38aeb752', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', 'f146a232-fd86-41ae-8114-cd89e341882a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'power', 'f5ed2ecd-1277-491c-8436-d85e26f84edb', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '060a69a8-38f6-430b-b246-dfa90c1ed1af', 3);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '13df9aea-6c8d-4b39-b44e-761efebad86d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '15c429ff-5ccc-4ed2-8ea7-aeeb9e99315a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '1f936d3c-9a63-4a3b-af58-d8b0c60beee3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '2a71dd81-c7e1-4f22-8c3c-f88927553a13', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '339c39b2-eb6d-4a90-82f1-328546e772c4', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '344ecf25-7a42-445e-b966-038cae34f12e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '41eab20a-8076-4ed3-ad65-c41cbcf0c9f6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '48714077-671c-435d-b9ac-03f5273982d3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '514f9cad-46a3-4f6c-921d-e7e2f550350b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '56b7f999-f557-42b7-9741-047ab321a540', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '7d93334a-78dd-4175-9e69-6f79f02cc797', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '7f049d42-8a81-4d19-bd83-7089b029a7c1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '83edbd17-9740-4c60-807b-217608c5bf8c', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '97131fd3-4c90-48c3-bc76-521921637928', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '9c006d80-8838-4b83-bdd2-a01507828ba5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', '9d05ce6b-1183-49d8-84c0-b5a8e42713b3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', 'a7f0dbe8-0a29-4b57-955b-bc19de2d2de3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', 'c3a40085-b766-4c44-97d9-53bd1786ae5b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', 'd577e094-8dc3-454e-b496-ca2741375901', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', 'd7a92d8a-24dc-4ea1-8888-114da28584e3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', 'e34b0909-e944-4a8b-8139-ffd9342487be', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', 'ecfe4be3-7ec4-47b4-9eb7-4e99265684b8', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'special', 'ff2d6d16-4d50-4b32-9d54-73941b1e8130', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'teamwork', '24d35cfe-2534-4bb4-97d7-f8293bda6828', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'teamwork', '2aad396f-b639-4bc0-b2e2-90362a26e997', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'teamwork', '515d8d09-8898-43bd-ba70-1e3e188252cf', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000003', 'teamwork', 'd06e8e10-ddb0-4cc9-9af0-eff8f2535e1a', 1);

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

        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', '155283bd-b59a-4347-84e9-e9939bcce7f1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', '787c0c41-5764-4138-8389-e2b707528181', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', '7fe57c26-2b37-4c76-822e-b20b9f75d77a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', 'bc921316-fe3f-47a1-8aa2-b50add4b4811', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'ally-universe', 'bd4b6220-63f3-4f77-a670-1a0a423b3c3f', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'aspect', '094ebfe2-4dc9-4dcc-9971-689dde6aca45', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'character', '08587b6c-45f7-4d84-a1f5-48fe635aab8e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'character', '3b2a4cac-2977-4b8a-9687-7fb9d5dc5d4e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'character', '53fe8558-7415-4e2a-8883-9a5bc6827fe9', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'character', 'ced8612d-0945-4fbb-b25b-832497a5e1d3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'location', 'bf0abccf-1cee-4777-85ee-980df28b7449', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', '550e8400-e29b-41d4-a716-446655440001', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', '550e8400-e29b-41d4-a716-446655440002', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', '550e8400-e29b-41d4-a716-446655440003', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', '550e8400-e29b-41d4-a716-446655440004', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', '550e8400-e29b-41d4-a716-446655440005', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', '550e8400-e29b-41d4-a716-446655440006', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'mission', '550e8400-e29b-41d4-a716-446655440007', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', '145a93ca-028e-4792-bea7-05b15cf2cd0a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', '5904b9f0-9907-4beb-971a-2e48b0a38d80', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', '5c374f94-22c5-4756-9f94-dc8aba056b48', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', '73048de1-65f7-4654-a6e5-7a2c7c2622be', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', '74f4af0c-0701-4691-aadb-d14ef0093795', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', '87808fc3-318a-4e65-bbfb-1bacfa4628ed', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', '93412e1a-eb6a-4b2c-92f0-8036d7837725', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', 'a3441bc6-bfb9-4f72-8c01-35fc32c08165', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', 'c070b5ef-51b0-466b-9719-127dd487caff', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', 'c869c511-8d2c-4611-909f-d59a07049c05', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', 'd6567018-cce4-4326-9900-e16b38aeb752', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', 'ef1092f4-a5dc-454c-b23e-74d2f2a8b422', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'power', 'f5ed2ecd-1277-491c-8436-d85e26f84edb', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '060a69a8-38f6-430b-b246-dfa90c1ed1af', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '0f233035-140b-4cb0-ba19-7d53a6c19bc7', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '13df9aea-6c8d-4b39-b44e-761efebad86d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '15c429ff-5ccc-4ed2-8ea7-aeeb9e99315a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '1e916b30-5859-4c66-bb29-694d68a31718', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '2435760d-a85e-43eb-bb7a-eb5012b3d6d0', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '31e1a628-6bf6-4de4-a402-69a1e1d3c1ba', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '41eab20a-8076-4ed3-ad65-c41cbcf0c9f6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '56b7f999-f557-42b7-9741-047ab321a540', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '579357ec-1744-41ca-8573-0c0b4d84b9a9', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '61cfbc37-a1b7-4982-8e50-9148b08f624f', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '7d93334a-78dd-4175-9e69-6f79f02cc797', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '7f049d42-8a81-4d19-bd83-7089b029a7c1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '7f6e3714-f544-4a33-9019-9998d2e083c8', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '965573c2-2a02-4a3d-9f91-5b3d3c830d95', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '97131fd3-4c90-48c3-bc76-521921637928', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '9bc1ea00-3db3-414f-8416-fb7b1fe6f397', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', '9c006d80-8838-4b83-bdd2-a01507828ba5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', 'a7f0dbe8-0a29-4b57-955b-bc19de2d2de3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', 'c3a40085-b766-4c44-97d9-53bd1786ae5b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', 'cb211e64-8c05-4863-af8a-9f0916aab210', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', 'd577e094-8dc3-454e-b496-ca2741375901', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', 'd7a92d8a-24dc-4ea1-8888-114da28584e3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', 'd80cb4d7-c5e1-4d6e-b476-e474db7f08c3', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'special', 'e86054a0-b45a-4580-b0c2-8fbacdfaecbe', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'teamwork', '00462e60-eb01-4c03-a78d-c6b99843ec38', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'teamwork', '24d35cfe-2534-4bb4-97d7-f8293bda6828', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'teamwork', 'a5c55e8d-2ff5-4ec6-a5f6-e30844ece891', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000004', 'teamwork', 'd06e8e10-ddb0-4cc9-9af0-eff8f2535e1a', 1);

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

        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'ally-universe', '04492987-be6b-4cb4-8e9b-039cf86adf48', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'ally-universe', '155283bd-b59a-4347-84e9-e9939bcce7f1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'ally-universe', 'bc921316-fe3f-47a1-8aa2-b50add4b4811', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'aspect', '094ebfe2-4dc9-4dcc-9971-689dde6aca45', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'character', '0c76ee5d-092d-4275-823b-b5af80422dff', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'character', '4f5a62a1-e70b-4e71-8953-c68fbdb57b35', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'character', 'ced8612d-0945-4fbb-b25b-832497a5e1d3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'character', 'da5c1246-cccf-40af-9516-6ad593dcfa01', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'location', '28b0fa92-cec7-4e21-a8b7-2bac36abd006', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', '550e8400-e29b-41d4-a716-446655440008', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', '550e8400-e29b-41d4-a716-446655440009', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', '550e8400-e29b-41d4-a716-446655440010', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', '550e8400-e29b-41d4-a716-446655440011', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', '550e8400-e29b-41d4-a716-446655440012', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', '550e8400-e29b-41d4-a716-446655440013', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'mission', '550e8400-e29b-41d4-a716-446655440014', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', '145a93ca-028e-4792-bea7-05b15cf2cd0a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', '4c442606-b60b-4ae7-8af4-124b10f8a07e', 3);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', '5904b9f0-9907-4beb-971a-2e48b0a38d80', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', '73048de1-65f7-4654-a6e5-7a2c7c2622be', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', '8512f87b-a9a7-4ea8-b724-f56822f358a2', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', '87808fc3-318a-4e65-bbfb-1bacfa4628ed', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', 'a3441bc6-bfb9-4f72-8c01-35fc32c08165', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', 'af084d88-56be-49fd-a8f9-0781e149a6db', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', 'bf446280-4e5d-4deb-9f52-71e00fffbcdf', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', 'c070b5ef-51b0-466b-9719-127dd487caff', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', 'c869c511-8d2c-4611-909f-d59a07049c05', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', 'd6567018-cce4-4326-9900-e16b38aeb752', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', 'e193561d-7ccc-4128-9a3d-fbc41d788821', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'power', 'f5ed2ecd-1277-491c-8436-d85e26f84edb', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '060a69a8-38f6-430b-b246-dfa90c1ed1af', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '0683a6cb-5c32-43ec-b491-5f9d90f07527', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '13df9aea-6c8d-4b39-b44e-761efebad86d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '15c429ff-5ccc-4ed2-8ea7-aeeb9e99315a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '2a71dd81-c7e1-4f22-8c3c-f88927553a13', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '2fb158c6-82bd-43bf-85b9-b996a5dbb27e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '344ecf25-7a42-445e-b966-038cae34f12e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '3908a4b1-882e-4b28-a359-54be3415b26d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '41eab20a-8076-4ed3-ad65-c41cbcf0c9f6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '48714077-671c-435d-b9ac-03f5273982d3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '514f9cad-46a3-4f6c-921d-e7e2f550350b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '519758e6-33d2-4e3e-a2b4-f039f3045e58', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '56b7f999-f557-42b7-9741-047ab321a540', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '70570abc-fe67-4ab4-af09-0e2e8bc9b59f', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '7f049d42-8a81-4d19-bd83-7089b029a7c1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '8e8bc7db-6594-468c-819b-3d59d205b7c5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '9c006d80-8838-4b83-bdd2-a01507828ba5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', '9c9b7d0b-689f-469b-8c0b-139407a8b7fe', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', 'a7f0dbe8-0a29-4b57-955b-bc19de2d2de3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', 'c3a40085-b766-4c44-97d9-53bd1786ae5b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', 'd577e094-8dc3-454e-b496-ca2741375901', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', 'd5f04dc6-9305-474e-974d-e47e204aa9a8', 3);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', 'd7a92d8a-24dc-4ea1-8888-114da28584e3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'special', 'e34b0909-e944-4a8b-8139-ffd9342487be', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'teamwork', '01b320a4-8b8b-4fcf-a30c-1fa4c56a435e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'teamwork', '2aad396f-b639-4bc0-b2e2-90362a26e997', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'teamwork', 'c05dc0bd-454f-4576-bda5-60a9c08fb92b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000005', 'teamwork', 'd06e8e10-ddb0-4cc9-9af0-eff8f2535e1a', 1);

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

        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', '04492987-be6b-4cb4-8e9b-039cf86adf48', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', '155283bd-b59a-4347-84e9-e9939bcce7f1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', '787c0c41-5764-4138-8389-e2b707528181', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', 'a1a9e0e1-4dc4-46b8-92d7-e2ec7d88ecd1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'ally-universe', 'bc921316-fe3f-47a1-8aa2-b50add4b4811', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'aspect', '094ebfe2-4dc9-4dcc-9971-689dde6aca45', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'character', '0c76ee5d-092d-4275-823b-b5af80422dff', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'character', '53fe8558-7415-4e2a-8883-9a5bc6827fe9', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'character', 'ced8612d-0945-4fbb-b25b-832497a5e1d3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'character', 'da5c1246-cccf-40af-9516-6ad593dcfa01', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'location', 'bf0abccf-1cee-4777-85ee-980df28b7449', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', '550e8400-e29b-41d4-a716-446655440015', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', '550e8400-e29b-41d4-a716-446655440016', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', '550e8400-e29b-41d4-a716-446655440017', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', '550e8400-e29b-41d4-a716-446655440018', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', '550e8400-e29b-41d4-a716-446655440019', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', '550e8400-e29b-41d4-a716-446655440020', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'mission', '550e8400-e29b-41d4-a716-446655440021', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', '145a93ca-028e-4792-bea7-05b15cf2cd0a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', '21b98250-2b67-4a31-9964-566c7b56622d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', '4c442606-b60b-4ae7-8af4-124b10f8a07e', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', '5904b9f0-9907-4beb-971a-2e48b0a38d80', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', '8512f87b-a9a7-4ea8-b724-f56822f358a2', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', '87808fc3-318a-4e65-bbfb-1bacfa4628ed', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', 'a3441bc6-bfb9-4f72-8c01-35fc32c08165', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', 'af084d88-56be-49fd-a8f9-0781e149a6db', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', 'bf446280-4e5d-4deb-9f52-71e00fffbcdf', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', 'c869c511-8d2c-4611-909f-d59a07049c05', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', 'd6567018-cce4-4326-9900-e16b38aeb752', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', 'e193561d-7ccc-4128-9a3d-fbc41d788821', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'power', 'f5ed2ecd-1277-491c-8436-d85e26f84edb', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '060a69a8-38f6-430b-b246-dfa90c1ed1af', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '0683a6cb-5c32-43ec-b491-5f9d90f07527', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '13df9aea-6c8d-4b39-b44e-761efebad86d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '15c429ff-5ccc-4ed2-8ea7-aeeb9e99315a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '2a71dd81-c7e1-4f22-8c3c-f88927553a13', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '339c39b2-eb6d-4a90-82f1-328546e772c4', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '344ecf25-7a42-445e-b966-038cae34f12e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '41eab20a-8076-4ed3-ad65-c41cbcf0c9f6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '48714077-671c-435d-b9ac-03f5273982d3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '514f9cad-46a3-4f6c-921d-e7e2f550350b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '56b7f999-f557-42b7-9741-047ab321a540', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '579357ec-1744-41ca-8573-0c0b4d84b9a9', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '70c9a26c-e121-4118-8e08-a35c9ff9089b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '7d93334a-78dd-4175-9e69-6f79f02cc797', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '7f049d42-8a81-4d19-bd83-7089b029a7c1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', '9c006d80-8838-4b83-bdd2-a01507828ba5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', 'a7f0dbe8-0a29-4b57-955b-bc19de2d2de3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', 'bcc4d001-43bb-43a0-a9ff-569a6cb4ae3b', 3);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', 'c3a40085-b766-4c44-97d9-53bd1786ae5b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', 'd577e094-8dc3-454e-b496-ca2741375901', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', 'd7a92d8a-24dc-4ea1-8888-114da28584e3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', 'e34b0909-e944-4a8b-8139-ffd9342487be', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'special', 'e86054a0-b45a-4580-b0c2-8fbacdfaecbe', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'teamwork', '24d35cfe-2534-4bb4-97d7-f8293bda6828', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'teamwork', '9a925b14-51e0-4b67-b63e-0aa3aa6413d5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'teamwork', 'd06e8e10-ddb0-4cc9-9af0-eff8f2535e1a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'training', '7cad2338-1aff-4a41-a8e4-d4757b790320', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'training', '9698d3b5-8a4d-4330-89e5-4e4f398df0f3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000006', 'training', '9d491d29-f956-4d08-af1b-3d0f04f8c3cc', 1);

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

        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'ally-universe', '04492987-be6b-4cb4-8e9b-039cf86adf48', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'ally-universe', '155283bd-b59a-4347-84e9-e9939bcce7f1', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'ally-universe', 'bc921316-fe3f-47a1-8aa2-b50add4b4811', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'aspect', '094ebfe2-4dc9-4dcc-9971-689dde6aca45', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'character', '0c76ee5d-092d-4275-823b-b5af80422dff', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'character', '3b2a4cac-2977-4b8a-9687-7fb9d5dc5d4e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'character', '4f5a62a1-e70b-4e71-8953-c68fbdb57b35', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'character', 'da5c1246-cccf-40af-9516-6ad593dcfa01', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'location', '00dc4cf6-420d-412d-8138-f1667390d9fd', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', '145a93ca-028e-4792-bea7-05b15cf2cd0a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', '4c442606-b60b-4ae7-8af4-124b10f8a07e', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', '8512f87b-a9a7-4ea8-b724-f56822f358a2', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', '87808fc3-318a-4e65-bbfb-1bacfa4628ed', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', '89cb9018-1a7e-4472-af9a-5573e1929e08', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', 'a3441bc6-bfb9-4f72-8c01-35fc32c08165', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', 'bf446280-4e5d-4deb-9f52-71e00fffbcdf', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', 'c148bd8d-3ccd-4064-9506-2736d0c830bb', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', 'c49bd12e-91f9-48aa-8153-542860bc9402', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', 'd6567018-cce4-4326-9900-e16b38aeb752', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', 'e193561d-7ccc-4128-9a3d-fbc41d788821', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'power', 'f885ef03-d29c-48fd-8b8f-ca69e22d0911', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '01f9a830-f93b-4893-a982-b44a6109ac06', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '0683a6cb-5c32-43ec-b491-5f9d90f07527', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '15c429ff-5ccc-4ed2-8ea7-aeeb9e99315a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '224c0929-fa0a-4f30-8377-fed524d0adf7', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '2fb158c6-82bd-43bf-85b9-b996a5dbb27e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '344ecf25-7a42-445e-b966-038cae34f12e', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '3908a4b1-882e-4b28-a359-54be3415b26d', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '41eab20a-8076-4ed3-ad65-c41cbcf0c9f6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '48714077-671c-435d-b9ac-03f5273982d3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '4a17687e-9d5e-41b6-b81d-84e99f5309ed', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '514f9cad-46a3-4f6c-921d-e7e2f550350b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '519758e6-33d2-4e3e-a2b4-f039f3045e58', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '55e7cb0b-cfa7-48e2-92cb-f5d0b091b0f6', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '56b7f999-f557-42b7-9741-047ab321a540', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '70570abc-fe67-4ab4-af09-0e2e8bc9b59f', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '7d93334a-78dd-4175-9e69-6f79f02cc797', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '8e8bc7db-6594-468c-819b-3d59d205b7c5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '942239ca-b7bf-4d00-b22b-fd5952d85387', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '97131fd3-4c90-48c3-bc76-521921637928', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '9c006d80-8838-4b83-bdd2-a01507828ba5', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', '9c9b7d0b-689f-469b-8c0b-139407a8b7fe', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', 'a7f0dbe8-0a29-4b57-955b-bc19de2d2de3', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', 'c3a40085-b766-4c44-97d9-53bd1786ae5b', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', 'cb211e64-8c05-4863-af8a-9f0916aab210', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', 'd577e094-8dc3-454e-b496-ca2741375901', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', 'd5f04dc6-9305-474e-974d-e47e204aa9a8', 2);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', 'e34b0909-e944-4a8b-8139-ffd9342487be', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'special', 'e79bd151-d046-4d30-9592-533b833fee7a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'teamwork', '24d35cfe-2534-4bb4-97d7-f8293bda6828', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'teamwork', '2aad396f-b639-4bc0-b2e2-90362a26e997', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'teamwork', 'd06e8e10-ddb0-4cc9-9af0-eff8f2535e1a', 1);
        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES ('a2880001-0000-4000-8000-000000000007', 'teamwork', 'fb52f728-562e-4b26-aa5e-682a2f19ba52', 1);

        RAISE NOTICE 'Seeded tournament deck: %', '2025 Nationals 4th (Felipe Cagno)';
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', '2025 Nationals 4th (Felipe Cagno)';
    END IF;
END $$;
