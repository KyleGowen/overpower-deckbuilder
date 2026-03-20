-- Kali: Goddess of War is from the World Legends Any Hero Essentials promo line (ERBP), not core ERB.
UPDATE special_cards
SET
    set = 'ERBP',
    rarity = NULL,
    set_number = NULL,
    set_number_foil = NULL,
    updated_at = NOW()
WHERE name = 'Kali: Goddess of War'
  AND character_name = 'Any Character'
  AND set = 'ERB';
