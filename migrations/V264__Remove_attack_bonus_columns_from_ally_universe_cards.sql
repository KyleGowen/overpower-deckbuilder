-- Ally universe cards do not use teamwork-style attack bonuses; remove unused columns.
ALTER TABLE ally_universe_cards DROP COLUMN IF EXISTS first_attack_bonus;
ALTER TABLE ally_universe_cards DROP COLUMN IF EXISTS second_attack_bonus;
