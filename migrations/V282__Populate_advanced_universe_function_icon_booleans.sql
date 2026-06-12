-- Populate function-icon booleans on advanced_universe_cards.
-- Values derived from card effect text and image scan of the three ERB advanced universe cards.

-- Shards of the Staff — offensive + defensive + remainder of game (card art + effect text)
UPDATE advanced_universe_cards
SET
  icon_offensive_swords = TRUE,
  icon_defensive_shield = TRUE,
  icon_remainder_of_battle = FALSE,
  icon_remainder_of_game = TRUE,
  icon_astral_plane = FALSE,
  updated_at = NOW()
WHERE name = 'Shards of the Staff';

-- Staff Fragments — offensive + remainder of game (no shield on art)
UPDATE advanced_universe_cards
SET
  icon_offensive_swords = TRUE,
  icon_defensive_shield = FALSE,
  icon_remainder_of_battle = FALSE,
  icon_remainder_of_game = TRUE,
  icon_astral_plane = FALSE,
  updated_at = NOW()
WHERE name = 'Staff Fragments';

-- Staff Head — offensive + remainder of game (no shield on art)
UPDATE advanced_universe_cards
SET
  icon_offensive_swords = TRUE,
  icon_defensive_shield = FALSE,
  icon_remainder_of_battle = FALSE,
  icon_remainder_of_game = TRUE,
  icon_astral_plane = FALSE,
  updated_at = NOW()
WHERE name = 'Staff Head';
