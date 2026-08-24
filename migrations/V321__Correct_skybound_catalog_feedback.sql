-- Correct Skybound source-normalization issues reported after launch.

UPDATE special_cards
SET character_name = 'Walkers: Herd', updated_at = NOW()
WHERE set = 'SKY'
  AND set_number IN ('228', '229', '230', '231', '232', '233')
  AND character_name IS DISTINCT FROM 'Walkers: Herd';

UPDATE missions
SET mission_set = 'The Walking Dead: All Out War', updated_at = NOW()
WHERE set = 'SKY'
  AND set_number BETWEEN '407' AND '413'
  AND mission_set IS DISTINCT FROM 'The Walking Dead: All Out War';

UPDATE events
SET mission_set = 'The Walking Dead: All Out War', updated_at = NOW()
WHERE set = 'SKY'
  AND set_number BETWEEN '414' AND '418'
  AND mission_set IS DISTINCT FROM 'The Walking Dead: All Out War';

DO $$
DECLARE
  walker_specials INTEGER;
  walking_dead_missions INTEGER;
  walking_dead_events INTEGER;
BEGIN
  SELECT COUNT(*) INTO walker_specials
  FROM special_cards
  WHERE set = 'SKY'
    AND set_number IN ('228', '229', '230', '231', '232', '233')
    AND character_name = 'Walkers: Herd';

  SELECT COUNT(*) INTO walking_dead_missions
  FROM missions
  WHERE set = 'SKY'
    AND set_number BETWEEN '407' AND '413'
    AND mission_set = 'The Walking Dead: All Out War';

  SELECT COUNT(*) INTO walking_dead_events
  FROM events
  WHERE set = 'SKY'
    AND set_number BETWEEN '414' AND '418'
    AND mission_set = 'The Walking Dead: All Out War';

  IF walker_specials <> 6 OR walking_dead_missions <> 7 OR walking_dead_events <> 5 THEN
    RAISE EXCEPTION
      'Skybound catalog correction mismatch: walker specials %, missions %, events %',
      walker_specials,
      walking_dead_missions,
      walking_dead_events;
  END IF;
END $$;
