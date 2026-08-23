-- Correct four Skybound cards whose printed frame says Advanced Universe but
-- whose source workbook rows were initially imported as character Specials.
-- Preserve UUIDs so existing local deck and collection references remain valid.

INSERT INTO advanced_universe_cards (
  id,
  name,
  set,
  card_description,
  image_path,
  one_per_deck,
  character,
  set_number,
  set_number_foil,
  is_foil,
  rarity,
  icon_offensive_swords,
  icon_defensive_shield,
  icon_remainder_of_battle,
  icon_remainder_of_game,
  icon_astral_plane,
  created_at,
  updated_at
)
SELECT
  id,
  name,
  set,
  card_effect,
  image_path,
  one_per_deck,
  character_name,
  set_number,
  set_number_foil,
  is_foil,
  rarity,
  icon_offensive_swords,
  icon_defensive_shield,
  icon_remainder_of_battle,
  icon_remainder_of_game,
  icon_astral_plane,
  created_at,
  NOW()
FROM special_cards
WHERE set = 'SKY'
  AND set_number IN ('112', '126', '131', '242')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  set = EXCLUDED.set,
  card_description = EXCLUDED.card_description,
  image_path = EXCLUDED.image_path,
  one_per_deck = EXCLUDED.one_per_deck,
  character = EXCLUDED.character,
  set_number = EXCLUDED.set_number,
  set_number_foil = EXCLUDED.set_number_foil,
  is_foil = EXCLUDED.is_foil,
  rarity = EXCLUDED.rarity,
  icon_offensive_swords = EXCLUDED.icon_offensive_swords,
  icon_defensive_shield = EXCLUDED.icon_defensive_shield,
  icon_remainder_of_battle = EXCLUDED.icon_remainder_of_battle,
  icon_remainder_of_game = EXCLUDED.icon_remainder_of_game,
  icon_astral_plane = EXCLUDED.icon_astral_plane,
  updated_at = NOW();

UPDATE deck_cards
SET card_type = 'advanced-universe'
WHERE card_type = 'special'
  AND card_id IN (
    SELECT id::text
    FROM advanced_universe_cards
    WHERE set = 'SKY' AND set_number IN ('112', '126', '131', '242')
  );

UPDATE collection_cards
SET card_type = 'advanced_universe', updated_at = NOW()
WHERE card_type = 'special'
  AND card_id IN (
    SELECT id
    FROM advanced_universe_cards
    WHERE set = 'SKY' AND set_number IN ('112', '126', '131', '242')
  );

DELETE FROM special_cards s
USING advanced_universe_cards a
WHERE s.id = a.id
  AND s.set = 'SKY'
  AND s.set_number IN ('112', '126', '131', '242');

DO $$
DECLARE
  moved_count integer;
  remaining_special_count integer;
BEGIN
  SELECT COUNT(*) INTO moved_count
  FROM advanced_universe_cards
  WHERE set = 'SKY' AND set_number IN ('112', '126', '131', '242');

  SELECT COUNT(*) INTO remaining_special_count
  FROM special_cards
  WHERE set = 'SKY' AND set_number IN ('112', '126', '131', '242');

  IF moved_count <> 4 OR remaining_special_count <> 0 THEN
    RAISE EXCEPTION
      'Skybound advanced-universe correction failed: advanced %, special %',
      moved_count,
      remaining_special_count;
  END IF;
END $$;
