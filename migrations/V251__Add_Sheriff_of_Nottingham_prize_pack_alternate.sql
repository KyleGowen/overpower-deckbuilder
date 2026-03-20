-- Prize-pack alternate art for Sheriff of Nottingham (checklist ERB 542 Rare, Prize Packs).
-- Filename uses "Sherrif" (three r) — matches on-disk asset: SherrifOfNottingham-PrizePack.png

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
  'characters/alternate/SherrifOfNottingham-PrizePack.png',
  c.created_at,
  NOW(),
  c.threat_level,
  c.special_abilities,
  '542',
  NULL,
  FALSE,
  'Rare'
FROM characters c
WHERE c.name = 'Sheriff of Nottingham'
  AND c.set = 'ERB'
  AND c.is_foil = FALSE
  AND (c.image_path NOT LIKE '%/alternate/%' OR c.image_path IS NULL)
  AND NOT EXISTS (
    SELECT 1 FROM characters x
    WHERE x.name = 'Sheriff of Nottingham'
      AND x.image_path = 'characters/alternate/SherrifOfNottingham-PrizePack.png'
  )
LIMIT 1;
