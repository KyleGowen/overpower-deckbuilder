ALTER TABLE deck_cards
ADD COLUMN display_order INTEGER;

WITH ranked_cards AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY deck_id
      ORDER BY created_at, card_type, card_id
    ) - 1 AS display_order
  FROM deck_cards
)
UPDATE deck_cards dc
SET display_order = ranked_cards.display_order
FROM ranked_cards
WHERE dc.id = ranked_cards.id;

COMMENT ON COLUMN deck_cards.display_order IS
  'Stable zero-based display order supplied by the deck editor and used by deck previews.';

CREATE INDEX idx_deck_cards_deck_display_order
ON deck_cards(deck_id, display_order);
