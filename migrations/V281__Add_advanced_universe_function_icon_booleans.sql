-- Add function-icon boolean columns to advanced_universe_cards (parity with special_cards).

ALTER TABLE advanced_universe_cards ADD COLUMN IF NOT EXISTS icon_offensive_swords BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE advanced_universe_cards ADD COLUMN IF NOT EXISTS icon_defensive_shield BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE advanced_universe_cards ADD COLUMN IF NOT EXISTS icon_remainder_of_battle BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE advanced_universe_cards ADD COLUMN IF NOT EXISTS icon_remainder_of_game BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE advanced_universe_cards ADD COLUMN IF NOT EXISTS icon_astral_plane BOOLEAN NOT NULL DEFAULT FALSE;
