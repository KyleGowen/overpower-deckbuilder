-- Reconcile card_count and threat for community_decks user decks.
-- V279 copied guest decks with pre-populated metadata, then inserted deck_cards rows
-- which re-fired V133 triggers and inflated card_count (~2x) and threat.

DO $$
DECLARE
    community_user_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
    UPDATE decks
    SET card_count = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM deck_cards
        WHERE deck_cards.deck_id = decks.id
        AND card_type NOT IN ('character', 'location', 'mission')
    )
    WHERE user_id = community_user_id;

    UPDATE decks
    SET threat = (
        SELECT COALESCE(
            (SELECT COALESCE(SUM(c.threat_level * dc.quantity), 0)
             FROM deck_cards dc
             JOIN characters c ON c.id::VARCHAR(255) = dc.card_id
             WHERE dc.deck_id = decks.id AND dc.card_type = 'character'
             AND dc.card_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') +
            (SELECT COALESCE(SUM(l.threat_level * dc.quantity), 0)
             FROM deck_cards dc
             JOIN locations l ON l.id::VARCHAR(255) = dc.card_id
             WHERE dc.deck_id = decks.id AND dc.card_type = 'location'
             AND dc.card_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
            0
        )
    )
    WHERE user_id = community_user_id;

    UPDATE decks
    SET updated_at = CURRENT_TIMESTAMP
    WHERE user_id = community_user_id;
END $$;
