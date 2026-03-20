-- ERB Promos (set code ERBP): checklist has no retail rarity; keep NULL so UI omits "(Common)" etc.

UPDATE characters SET rarity = NULL WHERE set = 'ERBP';
UPDATE special_cards SET rarity = NULL WHERE set = 'ERBP';
UPDATE power_cards SET rarity = NULL WHERE set = 'ERBP';
UPDATE missions SET rarity = NULL WHERE set = 'ERBP';
UPDATE events SET rarity = NULL WHERE set = 'ERBP';
UPDATE aspects SET rarity = NULL WHERE set = 'ERBP';
UPDATE advanced_universe_cards SET rarity = NULL WHERE set = 'ERBP';
UPDATE teamwork_cards SET rarity = NULL WHERE set = 'ERBP';
UPDATE ally_universe_cards SET rarity = NULL WHERE set = 'ERBP';
UPDATE training_cards SET rarity = NULL WHERE set = 'ERBP';
UPDATE basic_universe_cards SET rarity = NULL WHERE set = 'ERBP';
UPDATE locations SET rarity = NULL WHERE set = 'ERBP';
