-- Nullable rarity on all card tables that have set_number (V183)

ALTER TABLE characters ADD COLUMN rarity VARCHAR(32);
ALTER TABLE special_cards ADD COLUMN rarity VARCHAR(32);
ALTER TABLE power_cards ADD COLUMN rarity VARCHAR(32);
ALTER TABLE missions ADD COLUMN rarity VARCHAR(32);
ALTER TABLE events ADD COLUMN rarity VARCHAR(32);
ALTER TABLE aspects ADD COLUMN rarity VARCHAR(32);
ALTER TABLE advanced_universe_cards ADD COLUMN rarity VARCHAR(32);
ALTER TABLE teamwork_cards ADD COLUMN rarity VARCHAR(32);
ALTER TABLE ally_universe_cards ADD COLUMN rarity VARCHAR(32);
ALTER TABLE training_cards ADD COLUMN rarity VARCHAR(32);
ALTER TABLE basic_universe_cards ADD COLUMN rarity VARCHAR(32);
ALTER TABLE locations ADD COLUMN rarity VARCHAR(32);
