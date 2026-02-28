-- Create and populate the foil_card_map table.
--
-- This table provides O(1) bidirectional lookup between a foil card ID and its
-- non-foil counterpart (and vice-versa). Both directions are stored as separate
-- rows so the application can look up either direction with the same query:
--   SELECT base_card_id FROM foil_card_map WHERE foil_card_id = $1
--   SELECT foil_card_id FROM foil_card_map WHERE base_card_id = $1
--
-- Populated by joining foil rows (is_foil = TRUE) to their base rows
-- (is_foil = FALSE) on the fields that make a card unique within its type.
--
-- This table is append-only. To add new foil cards in the future:
--   1. Insert the foil row in a new migration (V230 pattern)
--   2. Insert the mapping row here in that same migration
-- No application code changes are required to support new foils.

CREATE TABLE IF NOT EXISTS foil_card_map (
    foil_card_id  VARCHAR(255) NOT NULL,
    base_card_id  VARCHAR(255) NOT NULL,
    card_type     VARCHAR(50)  NOT NULL,
    PRIMARY KEY (foil_card_id)
);

CREATE INDEX IF NOT EXISTS idx_foil_card_map_base_card_id ON foil_card_map (base_card_id);

-- -------------------------------------------------------
-- Characters: join on name + set + image_path
-- -------------------------------------------------------
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id, b.id, 'character'
FROM   characters f
JOIN   characters b
       ON  f.name       = b.name
       AND f.set        = b.set
       AND f.image_path = b.image_path
WHERE  f.is_foil = TRUE
AND    b.is_foil = FALSE
ON CONFLICT (foil_card_id) DO NOTHING;

-- -------------------------------------------------------
-- Special cards: join on character_name + name + image_path
-- -------------------------------------------------------
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id, b.id, 'special'
FROM   special_cards f
JOIN   special_cards b
       ON  f.character_name = b.character_name
       AND f.name           = b.name
       AND f.image_path     = b.image_path
WHERE  f.is_foil = TRUE
AND    b.is_foil = FALSE
ON CONFLICT (foil_card_id) DO NOTHING;

-- -------------------------------------------------------
-- Power cards: join on power_type + value + image_path
-- -------------------------------------------------------
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id, b.id, 'power'
FROM   power_cards f
JOIN   power_cards b
       ON  f.power_type = b.power_type
       AND f.value      = b.value
       AND f.image_path = b.image_path
WHERE  f.is_foil = TRUE
AND    b.is_foil = FALSE
ON CONFLICT (foil_card_id) DO NOTHING;
