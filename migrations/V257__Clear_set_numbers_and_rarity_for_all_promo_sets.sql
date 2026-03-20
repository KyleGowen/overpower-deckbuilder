-- Promo sets (ERBP, TFCP, SKYP): no retail checklist # or rarity on any card row.
-- Keeps set code for grouping; clears display/sort fields used like main-line ERB numbers.

UPDATE characters SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE special_cards SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE power_cards SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE missions SET set_number = NULL, set_number_foil = NULL, rarity = NULL, set_number_int = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE events SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE aspects SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE advanced_universe_cards SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE teamwork_cards SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE ally_universe_cards SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE training_cards SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE basic_universe_cards SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');

UPDATE locations SET set_number = NULL, set_number_foil = NULL, rarity = NULL, updated_at = NOW()
WHERE set IN ('ERBP', 'TFCP', 'SKYP');
