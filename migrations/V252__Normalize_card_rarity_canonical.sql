-- Canonical rarities: Common, Uncommon, Rare, Ultra Rare; NULL allowed.
-- Normalizes legacy checklist / import strings (incl. leading * and "slot, rare drop" foil labels).
-- Verified against DISTINCT rarity audit: *RARE, *ULTRA RARE, *Uncommon slot, rare drop,
-- Common slot, rare drop, plus already-canonical values.

-- Normalized key: trim, strip leading asterisks, collapse whitespace, lower.
-- Map keys to exactly four display strings.

UPDATE characters SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE special_cards SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE power_cards SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE missions SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE events SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE aspects SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE advanced_universe_cards SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE teamwork_cards SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE ally_universe_cards SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE training_cards SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE basic_universe_cards SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

UPDATE locations SET rarity = CASE lower(regexp_replace(btrim(regexp_replace(btrim(rarity), '^\*+', '', 'g')), '\s+', ' ', 'g'))
    WHEN 'common' THEN 'Common'
    WHEN 'uncommon' THEN 'Uncommon'
    WHEN 'rare' THEN 'Rare'
    WHEN 'ultra rare' THEN 'Ultra Rare'
    WHEN 'ultrarare' THEN 'Ultra Rare'
    WHEN 'ultra-rare' THEN 'Ultra Rare'
    WHEN 'common slot, rare drop' THEN 'Common'
    WHEN 'uncommon slot, rare drop' THEN 'Uncommon'
    ELSE rarity
END
WHERE rarity IS NOT NULL;

DO $$
DECLARE
  bad_count INTEGER;
BEGIN
  SELECT
    (SELECT COUNT(*) FROM characters WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM special_cards WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM power_cards WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM missions WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM events WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM aspects WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM advanced_universe_cards WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM teamwork_cards WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM ally_universe_cards WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM training_cards WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM basic_universe_cards WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
    + (SELECT COUNT(*) FROM locations WHERE rarity IS NOT NULL AND rarity NOT IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'))
  INTO bad_count;

  IF bad_count > 0 THEN
    RAISE EXCEPTION 'V252: % rows still have non-canonical rarity; extend mapping before applying CHECK', bad_count;
  END IF;
END $$;

ALTER TABLE characters ADD CONSTRAINT characters_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE special_cards ADD CONSTRAINT special_cards_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE power_cards ADD CONSTRAINT power_cards_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE missions ADD CONSTRAINT missions_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE events ADD CONSTRAINT events_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE aspects ADD CONSTRAINT aspects_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE advanced_universe_cards ADD CONSTRAINT advanced_universe_cards_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE teamwork_cards ADD CONSTRAINT teamwork_cards_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE ally_universe_cards ADD CONSTRAINT ally_universe_cards_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE training_cards ADD CONSTRAINT training_cards_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE basic_universe_cards ADD CONSTRAINT basic_universe_cards_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
ALTER TABLE locations ADD CONSTRAINT locations_rarity_allowed_chk
  CHECK (rarity IS NULL OR rarity IN ('Common', 'Uncommon', 'Rare', 'Ultra Rare'));
