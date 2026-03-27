-- Ally universe cards: 1st/2nd attack bonus (string values like teamwork_cards, e.g. '0', '1', '2').
ALTER TABLE ally_universe_cards
    ADD COLUMN IF NOT EXISTS first_attack_bonus VARCHAR(255),
    ADD COLUMN IF NOT EXISTS second_attack_bonus VARCHAR(255);

UPDATE ally_universe_cards SET first_attack_bonus = '0' WHERE first_attack_bonus IS NULL;
UPDATE ally_universe_cards SET second_attack_bonus = '0' WHERE second_attack_bonus IS NULL;

ALTER TABLE ally_universe_cards
    ALTER COLUMN first_attack_bonus SET DEFAULT '0',
    ALTER COLUMN first_attack_bonus SET NOT NULL,
    ALTER COLUMN second_attack_bonus SET DEFAULT '0',
    ALTER COLUMN second_attack_bonus SET NOT NULL;
