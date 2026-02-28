-- Add is_foil column to all card tables
-- FALSE = normal card, TRUE = foil version of an existing card
-- Foil cards are stored as separate rows sharing the same image_path as their
-- non-foil counterpart; the metallic shimmer effect is applied via CSS only.

ALTER TABLE characters           ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE special_cards        ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE power_cards          ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE locations            ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE missions             ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE events               ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE aspects              ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE advanced_universe_cards ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE teamwork_cards       ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE ally_universe_cards  ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE training_cards       ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE basic_universe_cards ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT FALSE;
