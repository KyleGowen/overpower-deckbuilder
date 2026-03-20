-- Prize-pack alternate art for Count of Monte Cristo (checklist ERB 544 Rare, Prize Packs).
-- Image: characters/alternate/CountofMonteCristo-PrizePack_Alt.png

INSERT INTO characters (
  id, name, set, description, energy, combat, brute_force, intelligence,
  image_path, created_at, updated_at, threat_level, special_abilities,
  set_number, set_number_foil, is_foil, rarity
)
SELECT
  gen_random_uuid(),
  c.name,
  c.set,
  c.description,
  c.energy,
  c.combat,
  c.brute_force,
  c.intelligence,
  'characters/alternate/CountofMonteCristo-PrizePack_Alt.png',
  c.created_at,
  NOW(),
  c.threat_level,
  c.special_abilities,
  '544',
  NULL,
  FALSE,
  'Rare'
FROM characters c
WHERE c.name = 'Count of Monte Cristo'
  AND c.set = 'ERB'
  AND c.is_foil = FALSE
  AND (c.image_path NOT LIKE '%/alternate/%' OR c.image_path IS NULL)
  AND NOT EXISTS (
    SELECT 1 FROM characters x
    WHERE x.name = 'Count of Monte Cristo'
      AND x.image_path = 'characters/alternate/CountofMonteCristo-PrizePack_Alt.png'
  )
LIMIT 1;
