-- Level 8 power alternate-art rows (World Legends promo art) → ERBP so they are not treated as main-line ERB.
-- Collection UI: isMainErbSetCode('ERBP') is false, so "(Alternate Art)" is not appended (Set column shows promos name).

INSERT INTO sets (code, name) VALUES
    ('ERBP', 'Edgar Rice Burroughs and the World Legends - Promos')
ON CONFLICT (code) DO NOTHING;

UPDATE power_cards
SET set = 'ERBP', updated_at = NOW()
WHERE set = 'ERB'
  AND value = 8
  AND image_path IN (
    'power-cards/alternate/8_intelligence.webp',
    'power-cards/alternate/8_energy.webp',
    'power-cards/alternate/8_combat.webp',
    'power-cards/alternate/8_brute_force.webp'
  );
