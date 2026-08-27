-- Correct Skybound Teamwork cards whose supplier filenames contained stale
-- use values. The printed card faces are authoritative for these rows.

UPDATE teamwork_cards
SET name = '7 Energy',
    card_description = 'Teamwork card: 7 Energy acts as 4 Attack with Brute Force + Intelligence followup',
    image_path = 'sky/teamwork/317_7_energy.png',
    to_use = '7 Energy',
    acts_as = '4 Attack',
    followup_attack_types = 'Brute Force + Intelligence',
    first_attack_bonus = '1',
    second_attack_bonus = '1',
    updated_at = NOW()
WHERE set = 'SKY'
  AND set_number = '317'
  AND (
    name IS DISTINCT FROM '7 Energy'
    OR card_description IS DISTINCT FROM 'Teamwork card: 7 Energy acts as 4 Attack with Brute Force + Intelligence followup'
    OR image_path IS DISTINCT FROM 'sky/teamwork/317_7_energy.png'
    OR to_use IS DISTINCT FROM '7 Energy'
    OR acts_as IS DISTINCT FROM '4 Attack'
    OR followup_attack_types IS DISTINCT FROM 'Brute Force + Intelligence'
    OR first_attack_bonus IS DISTINCT FROM '1'
    OR second_attack_bonus IS DISTINCT FROM '1'
  );

UPDATE teamwork_cards
SET name = '8 Energy',
    card_description = 'Teamwork card: 8 Energy acts as 4 Attack with Combat + Brute Force followup',
    image_path = 'sky/teamwork/318_8_energy.png',
    to_use = '8 Energy',
    acts_as = '4 Attack',
    followup_attack_types = 'Combat + Brute Force',
    first_attack_bonus = '1',
    second_attack_bonus = '2',
    updated_at = NOW()
WHERE set = 'SKY'
  AND set_number = '318'
  AND (
    name IS DISTINCT FROM '8 Energy'
    OR card_description IS DISTINCT FROM 'Teamwork card: 8 Energy acts as 4 Attack with Combat + Brute Force followup'
    OR image_path IS DISTINCT FROM 'sky/teamwork/318_8_energy.png'
    OR to_use IS DISTINCT FROM '8 Energy'
    OR acts_as IS DISTINCT FROM '4 Attack'
    OR followup_attack_types IS DISTINCT FROM 'Combat + Brute Force'
    OR first_attack_bonus IS DISTINCT FROM '1'
    OR second_attack_bonus IS DISTINCT FROM '2'
  );

DO $$
DECLARE
  corrected_teamwork INTEGER;
BEGIN
  SELECT COUNT(*) INTO corrected_teamwork
  FROM teamwork_cards
  WHERE set = 'SKY'
    AND (
      (
        set_number = '317'
        AND name = '7 Energy'
        AND card_description = 'Teamwork card: 7 Energy acts as 4 Attack with Brute Force + Intelligence followup'
        AND image_path = 'sky/teamwork/317_7_energy.png'
        AND to_use = '7 Energy'
        AND acts_as = '4 Attack'
        AND followup_attack_types = 'Brute Force + Intelligence'
        AND first_attack_bonus = '1'
        AND second_attack_bonus = '1'
      )
      OR (
        set_number = '318'
        AND name = '8 Energy'
        AND card_description = 'Teamwork card: 8 Energy acts as 4 Attack with Combat + Brute Force followup'
        AND image_path = 'sky/teamwork/318_8_energy.png'
        AND to_use = '8 Energy'
        AND acts_as = '4 Attack'
        AND followup_attack_types = 'Combat + Brute Force'
        AND first_attack_bonus = '1'
        AND second_attack_bonus = '2'
      )
    );

  IF corrected_teamwork <> 2 THEN
    RAISE EXCEPTION
      'Skybound Energy Teamwork correction mismatch: expected 2 rows, found %',
      corrected_teamwork;
  END IF;
END $$;
