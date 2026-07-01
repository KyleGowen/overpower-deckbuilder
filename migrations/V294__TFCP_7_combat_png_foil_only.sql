-- TFCP 7 - Combat promo art at tfacp/power/7_combat.png is foil-only (physical printing).
-- Keep 7_combat_2.jpg as the non-foil TFCP printing; map foil row to ERB 7 - Combat base.

-- Remap user decks that referenced the deleted non-foil TFCP png row.
UPDATE deck_cards dc
SET card_id = foil.id::text
FROM power_cards foil
WHERE dc.card_type = 'power'
  AND dc.card_id IN (
      SELECT id::text FROM power_cards
      WHERE set = 'TFCP'
        AND image_path = 'tfacp/power/7_combat.png'
        AND is_foil = FALSE
  )
  AND foil.set = 'TFCP'
  AND foil.image_path = 'tfacp/power/7_combat.png'
  AND foil.is_foil = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM deck_cards existing
      WHERE existing.deck_id = dc.deck_id
        AND existing.card_type = dc.card_type
        AND existing.card_id = foil.id::text
  );

-- Merge quantities when foil row already present in the same deck.
UPDATE deck_cards foil_row
SET quantity = foil_row.quantity + dup.quantity
FROM deck_cards dup
JOIN power_cards foil
  ON foil.set = 'TFCP'
 AND foil.image_path = 'tfacp/power/7_combat.png'
 AND foil.is_foil = TRUE
WHERE foil_row.deck_id = dup.deck_id
  AND foil_row.card_type = dup.card_type
  AND foil_row.card_type = 'power'
  AND foil_row.card_id = foil.id::text
  AND dup.card_id IN (
      SELECT id::text FROM power_cards
      WHERE set = 'TFCP'
        AND image_path = 'tfacp/power/7_combat.png'
        AND is_foil = FALSE
  );

DELETE FROM deck_cards
WHERE card_type = 'power'
  AND card_id IN (
      SELECT id::text FROM power_cards
      WHERE set = 'TFCP'
        AND image_path = 'tfacp/power/7_combat.png'
        AND is_foil = FALSE
  );

-- Merge collection quantities before card_id remaps (avoids collection_cards_unique violations).
UPDATE collection_cards foil_row
SET quantity = foil_row.quantity + dup.quantity,
    updated_at = NOW()
FROM collection_cards dup
JOIN power_cards foil
  ON foil.set = 'TFCP'
 AND foil.image_path = 'tfacp/power/7_combat.png'
 AND foil.is_foil = TRUE
WHERE foil_row.collection_id = dup.collection_id
  AND foil_row.card_type = dup.card_type
  AND foil_row.card_type = 'power'
  AND foil_row.card_id = foil.id
  AND dup.card_id IN (
      SELECT id FROM power_cards
      WHERE set = 'TFCP'
        AND image_path = 'tfacp/power/7_combat.png'
        AND is_foil = FALSE
  )
  AND (
    dup.image_path = 'tfacp/power/7_combat.png'
    OR dup.image_path LIKE '%/tfacp/power/7_combat.png'
  );

DELETE FROM collection_cards
WHERE card_type = 'power'
  AND card_id IN (
      SELECT id FROM power_cards
      WHERE set = 'TFCP'
        AND image_path = 'tfacp/power/7_combat.png'
        AND is_foil = FALSE
  );

UPDATE collection_cards cc
SET card_id = foil.id,
    updated_at = NOW()
FROM power_cards foil
WHERE foil.set = 'TFCP'
  AND foil.image_path = 'tfacp/power/7_combat.png'
  AND foil.is_foil = TRUE
  AND cc.card_type = 'power'
  AND cc.card_id IS DISTINCT FROM foil.id
  AND (
    cc.image_path = 'tfacp/power/7_combat.png'
    OR cc.image_path LIKE '%/tfacp/power/7_combat.png'
  )
  AND NOT EXISTS (
      SELECT 1 FROM collection_cards existing
      WHERE existing.collection_id = cc.collection_id
        AND existing.card_type = cc.card_type
        AND existing.card_id = foil.id
        AND existing.image_path = cc.image_path
  );

DELETE FROM foil_card_map
WHERE foil_card_id IN (
    SELECT id::text FROM power_cards
    WHERE set = 'TFCP'
      AND image_path = 'tfacp/power/7_combat.png'
)
OR base_card_id IN (
    SELECT id::text FROM power_cards
    WHERE set = 'TFCP'
      AND image_path = 'tfacp/power/7_combat.png'
      AND is_foil = FALSE
);

-- Promote sole non-foil row when no foil sibling exists (repairs V292-only inserts).
UPDATE power_cards
SET
    is_foil = TRUE,
    name = '7 - Combat',
    power_type = 'Combat',
    value = 7,
    set = 'TFCP',
    one_per_deck = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE set = 'TFCP'
  AND image_path = 'tfacp/power/7_combat.png'
  AND is_foil = FALSE
  AND NOT EXISTS (
      SELECT 1 FROM power_cards x
      WHERE x.set = 'TFCP'
        AND x.image_path = 'tfacp/power/7_combat.png'
        AND x.is_foil = TRUE
  );

-- Delete non-foil only when a foil row already exists.
DELETE FROM power_cards
WHERE set = 'TFCP'
  AND image_path = 'tfacp/power/7_combat.png'
  AND is_foil = FALSE
  AND EXISTS (
      SELECT 1 FROM power_cards x
      WHERE x.set = 'TFCP'
        AND x.image_path = 'tfacp/power/7_combat.png'
        AND x.is_foil = TRUE
  );

UPDATE power_cards
SET
    name = '7 - Combat',
    power_type = 'Combat',
    value = 7,
    set = 'TFCP',
    one_per_deck = TRUE,
    is_foil = TRUE,
    set_number = NULL,
    set_number_foil = NULL,
    rarity = NULL,
    updated_at = NOW()
WHERE set = 'TFCP'
  AND image_path = 'tfacp/power/7_combat.png'
  AND is_foil = TRUE;

-- Foil-only promo: deck editor foil toggle maps TFCP foil art to ERB 7 - Combat base.
INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)
SELECT f.id::text, b.id::text, 'power'
FROM power_cards f
JOIN LATERAL (
  SELECT id
  FROM power_cards
  WHERE power_type = 'Combat'
    AND value = 7
    AND set = 'ERB'
    AND is_foil = FALSE
  ORDER BY
    CASE
      WHEN image_path = 'power-cards/301_7_combat.webp' THEN 0
      WHEN image_path = 'power-cards/7_combat.webp' THEN 1
      ELSE 2
    END,
    image_path
  LIMIT 1
) b ON TRUE
WHERE f.set = 'TFCP'
  AND f.image_path = 'tfacp/power/7_combat.png'
  AND f.is_foil = TRUE
ON CONFLICT (foil_card_id) DO UPDATE
SET base_card_id = EXCLUDED.base_card_id;
