-- Glenn is 16 threat when he starts in Reserve (base threat remains 15).
-- His Basic Universe grid exception is enforced in application validation.

CREATE OR REPLACE FUNCTION calculate_deck_threat_total(
    target_deck_id UUID,
    reserve_character_id UUID
)
RETURNS INTEGER AS $$
    SELECT
        COALESCE((
            SELECT SUM(
                CASE
                    WHEN c.name = 'Carson of Venus' AND c.id = reserve_character_id THEN 19
                    WHEN c.name = 'Morgan le Fay' AND c.id = reserve_character_id THEN 20
                    WHEN c.name = 'Victory Harben' AND c.id = reserve_character_id THEN 20
                    WHEN c.name = 'Glenn' AND c.id = reserve_character_id THEN 16
                    ELSE c.threat_level
                END * dc.quantity
            )
            FROM deck_cards dc
            JOIN characters c ON c.id::VARCHAR(255) = dc.card_id
            WHERE dc.deck_id = target_deck_id
              AND dc.card_type = 'character'
              AND dc.card_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        ), 0)
        +
        COALESCE((
            SELECT SUM(l.threat_level * dc.quantity)
            FROM deck_cards dc
            JOIN locations l ON l.id::VARCHAR(255) = dc.card_id
            WHERE dc.deck_id = target_deck_id
              AND dc.card_type = 'location'
              AND dc.card_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        ), 0);
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION update_deck_threat()
RETURNS TRIGGER AS $$
DECLARE
    target_deck_id UUID;
    reserve_character_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_deck_id := OLD.deck_id;
        IF OLD.card_type NOT IN ('character', 'location') THEN
            RETURN OLD;
        END IF;
    ELSE
        target_deck_id := NEW.deck_id;
        IF NEW.card_type NOT IN ('character', 'location') THEN
            RETURN NEW;
        END IF;
    END IF;

    SELECT d.reserve_character
    INTO reserve_character_id
    FROM decks d
    WHERE d.id = target_deck_id;

    UPDATE decks
    SET threat = calculate_deck_threat_total(target_deck_id, reserve_character_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = target_deck_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_deck_threat_on_reserve_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.reserve_character IS DISTINCT FROM NEW.reserve_character THEN
        UPDATE decks
        SET threat = calculate_deck_threat_total(NEW.id, NEW.reserve_character),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Correct already-saved decks where Glenn currently starts in Reserve.
UPDATE decks d
SET threat = calculate_deck_threat_total(d.id, d.reserve_character),
    updated_at = CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1
    FROM characters c
    WHERE c.id = d.reserve_character
      AND c.name = 'Glenn'
);
