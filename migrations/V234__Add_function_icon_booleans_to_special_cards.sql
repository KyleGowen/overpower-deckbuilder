-- Add function-icon boolean columns to special_cards.
-- These columns capture iconography printed on special card images:
-- offensive swords, defensive shield, duration hourglass (battle/game),
-- paperclip attachment, astral plane icon, and first-action-only icon.

ALTER TABLE special_cards ADD COLUMN IF NOT EXISTS icon_offensive_swords BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE special_cards ADD COLUMN IF NOT EXISTS icon_defensive_shield BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE special_cards ADD COLUMN IF NOT EXISTS icon_remainder_of_battle BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE special_cards ADD COLUMN IF NOT EXISTS icon_remainder_of_game BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE special_cards ADD COLUMN IF NOT EXISTS icon_attached_paperclip BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE special_cards ADD COLUMN IF NOT EXISTS icon_astral_plane BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE special_cards ADD COLUMN IF NOT EXISTS icon_first_action_only BOOLEAN NOT NULL DEFAULT FALSE;
