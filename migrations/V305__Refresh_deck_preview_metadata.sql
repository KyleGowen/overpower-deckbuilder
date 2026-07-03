-- Re-sync denormalized deck preview metadata (character/location refs) from deck_cards.
-- Fixes deck tiles that show "No image" when deck_cards has valid characters but
-- decks.character_N_id / location_id drifted (e.g. after bulk import/replace).

-- Character slots (first 4 by created_at, valid UUID card_id)
UPDATE decks d
SET
    character_1_id = refs.char1_id::UUID,
    character_2_id = refs.char2_id::UUID,
    character_3_id = refs.char3_id::UUID,
    character_4_id = refs.char4_id::UUID
FROM (
    SELECT
        deck_id,
        MAX(CASE WHEN row_num = 1 THEN card_id END) AS char1_id,
        MAX(CASE WHEN row_num = 2 THEN card_id END) AS char2_id,
        MAX(CASE WHEN row_num = 3 THEN card_id END) AS char3_id,
        MAX(CASE WHEN row_num = 4 THEN card_id END) AS char4_id
    FROM (
        SELECT
            deck_id,
            card_id,
            ROW_NUMBER() OVER (PARTITION BY deck_id ORDER BY created_at, card_id) AS row_num
        FROM deck_cards
        WHERE card_type = 'character'
          AND card_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ) ranked_chars
    WHERE row_num <= 4
    GROUP BY deck_id
) refs
WHERE d.id = refs.deck_id;

-- Clear character refs on decks that no longer have character cards
UPDATE decks d
SET
    character_1_id = NULL,
    character_2_id = NULL,
    character_3_id = NULL,
    character_4_id = NULL
WHERE NOT EXISTS (
    SELECT 1 FROM deck_cards dc
    WHERE dc.deck_id = d.id AND dc.card_type = 'character'
      AND dc.card_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- Location ref (first location card by created_at)
UPDATE decks d
SET location_id = loc_refs.location_id::UUID
FROM (
    SELECT DISTINCT ON (deck_id)
        deck_id,
        card_id AS location_id
    FROM deck_cards
    WHERE card_type = 'location'
      AND card_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ORDER BY deck_id, created_at, card_id
) loc_refs
WHERE d.id = loc_refs.deck_id;

-- Clear location when deck has no location cards
UPDATE decks d
SET location_id = NULL
WHERE NOT EXISTS (
    SELECT 1 FROM deck_cards dc
    WHERE dc.deck_id = d.id AND dc.card_type = 'location'
      AND dc.card_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);
