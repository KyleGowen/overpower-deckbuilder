-- 7 - Any-Power alternate art belongs in Skybound promos (SKYP), not main-line SKY.
-- Same row identity as V204 (which moved it from TFCP to SKY).

INSERT INTO sets (code, name) VALUES
    ('SKYP', 'Skybound - Promos')
ON CONFLICT (code) DO NOTHING;

UPDATE power_cards
SET
  set = 'SKYP',
  updated_at = NOW()
WHERE power_type = 'Any-Power'
  AND value = 7
  AND image_path IN (
    'power-cards/alternate/7_anypower.png',
    'power-cards/alternate/7_anypower.webp'
  );
