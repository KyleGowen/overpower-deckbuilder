-- Apply the Season 1 errata that changes persisted catalog data.
-- Rulings and clarifications remain in errata.entry_text so printed card text
-- stays distinct from official interpretive guidance.

-- The Flaxans #052 is officially considered playable from Reserve.
UPDATE special_cards
SET card_effect = $effect$Move The Flaxans to the Front Line.
OR
Move The Flaxans to the Reserve for remainder of battle.
May be played from Reserve.$effect$,
    updated_at = NOW()
WHERE set = 'SKY'
  AND set_number = '052'
  AND character_name = 'The Flaxans'
  AND name = 'Second Invasion'
  AND card_effect IS DISTINCT FROM $effect$Move The Flaxans to the Front Line.
OR
Move The Flaxans to the Reserve for remainder of battle.
May be played from Reserve.$effect$;

-- Immortal #073 has a full (remainder-of-game) hourglass, not the printed
-- half (remainder-of-battle) hourglass. Other function icons are unchanged.
UPDATE special_cards
SET icon_remainder_of_battle = FALSE,
    icon_remainder_of_game = TRUE,
    updated_at = NOW()
WHERE set = 'SKY'
  AND set_number = '073'
  AND character_name = 'Immortal'
  AND name = 'I am Immortal'
  AND (
    icon_remainder_of_battle IS DISTINCT FROM FALSE
    OR icon_remainder_of_game IS DISTINCT FROM TRUE
  );

-- The alternate-art Walkers: Herd #450 must carry the same inherent text as
-- the normal #226 printing. This is already true in the seed migration, but
-- the conditional repair protects environments whose catalog has drifted.
UPDATE characters AS alternate
SET special_abilities = normal.special_abilities,
    updated_at = NOW()
FROM characters AS normal
WHERE alternate.set = 'SKY'
  AND alternate.set_number = '450'
  AND alternate.is_foil = FALSE
  AND alternate.name = 'Walkers: Herd'
  AND normal.set = 'SKY'
  AND normal.set_number = '226'
  AND normal.is_foil = FALSE
  AND normal.name = 'Walkers: Herd'
  AND alternate.special_abilities IS DISTINCT FROM normal.special_abilities;

-- The official ERB #134 face says "may not be negated." The existing
-- persisted text incorrectly says "may be placed."
UPDATE special_cards
SET card_effect = $effect$Sort through Dead Pile and find "Sword and Shield" and immediately put it into play. Lancelot's team is +2 to Venture Total this battle. This card may not be negated.$effect$,
    updated_at = NOW()
WHERE set = 'ERB'
  AND set_number = '134'
  AND character_name = 'Lancelot'
  AND name = 'For Guinevere''s Love'
  AND card_effect IS DISTINCT FROM $effect$Sort through Dead Pile and find "Sword and Shield" and immediately put it into play. Lancelot's team is +2 to Venture Total this battle. This card may not be negated.$effect$;

DO $$
DECLARE
  second_invasion_rows INTEGER;
  immortal_rows INTEGER;
  walkers_alt_rows INTEGER;
  guinevere_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO second_invasion_rows
  FROM special_cards
  WHERE set = 'SKY'
    AND set_number = '052'
    AND character_name = 'The Flaxans'
    AND name = 'Second Invasion'
    AND card_effect = $effect$Move The Flaxans to the Front Line.
OR
Move The Flaxans to the Reserve for remainder of battle.
May be played from Reserve.$effect$
    AND icon_offensive_swords = TRUE
    AND icon_remainder_of_battle = TRUE
    AND icon_remainder_of_game = FALSE
    AND icon_attached_paperclip = TRUE;

  SELECT COUNT(*) INTO immortal_rows
  FROM special_cards
  WHERE set = 'SKY'
    AND set_number = '073'
    AND character_name = 'Immortal'
    AND name = 'I am Immortal'
    AND icon_remainder_of_battle = FALSE
    AND icon_remainder_of_game = TRUE
    AND icon_offensive_swords = TRUE
    AND icon_astral_plane = TRUE;

  SELECT COUNT(*) INTO walkers_alt_rows
  FROM characters AS alternate
  JOIN characters AS normal
    ON normal.set = 'SKY'
    AND normal.set_number = '226'
    AND normal.is_foil = FALSE
    AND normal.name = 'Walkers: Herd'
  WHERE alternate.set = 'SKY'
    AND alternate.set_number = '450'
    AND alternate.is_foil = FALSE
    AND alternate.name = 'Walkers: Herd'
    AND alternate.special_abilities = normal.special_abilities
    AND alternate.special_abilities = $ability$May not play Universe cards.
When Walkers: Herd is KO'd, flip this card instead of removing them.$ability$;

  SELECT COUNT(*) INTO guinevere_rows
  FROM special_cards
  WHERE set = 'ERB'
    AND set_number = '134'
    AND character_name = 'Lancelot'
    AND name = 'For Guinevere''s Love'
    AND card_effect = $effect$Sort through Dead Pile and find "Sword and Shield" and immediately put it into play. Lancelot's team is +2 to Venture Total this battle. This card may not be negated.$effect$;

  IF second_invasion_rows <> 1
    OR immortal_rows <> 1
    OR walkers_alt_rows <> 1
    OR guinevere_rows <> 1 THEN
    RAISE EXCEPTION
      'Season 1 catalog errata mismatch: Second Invasion %, I am Immortal %, Walkers #450 %, For Guinevere''s Love %',
      second_invasion_rows,
      immortal_rows,
      walkers_alt_rows,
      guinevere_rows;
  END IF;
END $$;
