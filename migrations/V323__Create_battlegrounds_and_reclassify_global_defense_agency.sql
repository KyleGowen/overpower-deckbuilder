-- Battlegrounds are structural cards distinct from Locations.
-- Preserve Global Defense Agency's UUID while moving its catalog row and all
-- saved deck/collection references to the new card type.

CREATE TABLE battlegrounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    set VARCHAR(10) NOT NULL REFERENCES sets(code),
    image_path VARCHAR(500),
    special_ability TEXT,
    set_number VARCHAR(8),
    set_number_foil VARCHAR(8),
    is_foil BOOLEAN NOT NULL DEFAULT FALSE,
    rarity VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT battlegrounds_rarity_allowed_chk
        CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
);

CREATE INDEX idx_battlegrounds_name ON battlegrounds(name);
CREATE INDEX idx_battlegrounds_set ON battlegrounds(set);

INSERT INTO battlegrounds (
    id, name, set, image_path, special_ability, set_number, set_number_foil,
    is_foil, rarity, created_at, updated_at
)
SELECT
    id, name, set, image_path, special_ability, set_number, set_number_foil,
    is_foil, rarity, created_at, updated_at
FROM locations
WHERE name = 'Global Defense Agency';

DO $$
BEGIN
    IF (SELECT COUNT(*) FROM battlegrounds WHERE name = 'Global Defense Agency') <> 1 THEN
        RAISE EXCEPTION 'Expected exactly one Global Defense Agency Battleground';
    END IF;
END $$;

-- Battlegrounds, like Locations, do not belong to the draw pile or card_count.
-- Replace the function before reclassifying saved deck rows so the UPDATE does
-- not temporarily add Battlegrounds to persisted deck counts.
CREATE OR REPLACE FUNCTION update_deck_card_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.card_type NOT IN ('character', 'location', 'battleground', 'mission')
           AND NEW.exclude_from_draw IS DISTINCT FROM TRUE THEN
            UPDATE decks
                SET card_count = card_count + NEW.quantity,
                    updated_at = CURRENT_TIMESTAMP
              WHERE id = NEW.deck_id;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF (OLD.card_type NOT IN ('character', 'location', 'battleground', 'mission')
            AND OLD.exclude_from_draw IS DISTINCT FROM TRUE)
           <> (NEW.card_type NOT IN ('character', 'location', 'battleground', 'mission')
            AND NEW.exclude_from_draw IS DISTINCT FROM TRUE)
           OR OLD.quantity <> NEW.quantity THEN
            UPDATE decks
                SET card_count = card_count
                    - CASE
                        WHEN OLD.card_type NOT IN ('character', 'location', 'battleground', 'mission')
                             AND OLD.exclude_from_draw IS DISTINCT FROM TRUE
                          THEN OLD.quantity
                        ELSE 0
                      END
                    + CASE
                        WHEN NEW.card_type NOT IN ('character', 'location', 'battleground', 'mission')
                             AND NEW.exclude_from_draw IS DISTINCT FROM TRUE
                          THEN NEW.quantity
                        ELSE 0
                      END,
                    updated_at = CURRENT_TIMESTAMP
              WHERE id = NEW.deck_id;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.card_type NOT IN ('character', 'location', 'battleground', 'mission')
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

UPDATE deck_cards dc
SET card_type = 'battleground',
    updated_at = CURRENT_TIMESTAMP
FROM battlegrounds b
WHERE dc.card_type = 'location'
  AND dc.card_id = b.id::text
  AND b.name = 'Global Defense Agency';

UPDATE collection_cards cc
SET card_type = 'battleground',
    updated_at = CURRENT_TIMESTAMP
FROM battlegrounds b
WHERE cc.card_type = 'location'
  AND cc.card_id = b.id
  AND b.name = 'Global Defense Agency';

DELETE FROM locations
WHERE name = 'Global Defense Agency';

UPDATE decks d
SET card_count = COALESCE(ct.card_count, 0)
FROM (
    SELECT
        d.id AS deck_id,
        COALESCE(SUM(dc.quantity), 0) AS card_count
    FROM decks d
    LEFT JOIN deck_cards dc
        ON dc.deck_id = d.id
       AND dc.card_type NOT IN ('character', 'location', 'battleground', 'mission')
       AND dc.exclude_from_draw IS DISTINCT FROM TRUE
    GROUP BY d.id
) ct
WHERE d.id = ct.deck_id;

COMMENT ON TABLE battlegrounds IS 'Battleground structural cards; distinct from Locations and limited to one per deck.';
COMMENT ON COLUMN decks.card_count IS 'Draw-pile card count excluding characters, locations, battlegrounds, missions, and pre-placed cards.';
