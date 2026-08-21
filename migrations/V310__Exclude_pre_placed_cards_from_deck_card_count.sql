-- Keep deck.card_count aligned with cards that count toward deck size.
-- Training cards marked exclude_from_draw=true should not count.

CREATE OR REPLACE FUNCTION update_deck_card_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.card_type NOT IN ('character', 'location', 'mission')
           AND NEW.exclude_from_draw IS DISTINCT FROM TRUE THEN
            UPDATE decks
                SET card_count = card_count + NEW.quantity,
                    updated_at = CURRENT_TIMESTAMP
              WHERE id = NEW.deck_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        IF (OLD.card_type NOT IN ('character', 'location', 'mission')
            AND OLD.exclude_from_draw IS DISTINCT FROM TRUE)
           <> (NEW.card_type NOT IN ('character', 'location', 'mission')
            AND NEW.exclude_from_draw IS DISTINCT FROM TRUE)
           OR OLD.quantity <> NEW.quantity THEN
            UPDATE decks
                SET card_count = card_count
                    - CASE
                        WHEN OLD.card_type NOT IN ('character', 'location', 'mission')
                             AND OLD.exclude_from_draw IS DISTINCT FROM TRUE
                          THEN OLD.quantity
                        ELSE 0
                      END
                    + CASE
                        WHEN NEW.card_type NOT IN ('character', 'location', 'mission')
                             AND NEW.exclude_from_draw IS DISTINCT FROM TRUE
                          THEN NEW.quantity
                        ELSE 0
                      END,
                    updated_at = CURRENT_TIMESTAMP
              WHERE id = NEW.deck_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.card_type NOT IN ('character', 'location', 'mission')
           AND OLD.exclude_from_draw IS DISTINCT FROM TRUE THEN
            UPDATE decks
                SET card_count = card_count - OLD.quantity,
                    updated_at = CURRENT_TIMESTAMP
              WHERE id = OLD.deck_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Re-sync all deck card counts to ignore pre-placed cards.
UPDATE decks d
SET card_count = COALESCE(ct.card_count, 0)
FROM (
    SELECT
        d.id AS deck_id,
        COALESCE(SUM(dc.quantity), 0) AS card_count
    FROM decks d
    LEFT JOIN deck_cards dc
        ON dc.deck_id = d.id
       AND dc.card_type NOT IN ('character', 'location', 'mission')
       AND dc.exclude_from_draw IS DISTINCT FROM TRUE
    GROUP BY d.id
) ct
WHERE d.id = ct.deck_id;
