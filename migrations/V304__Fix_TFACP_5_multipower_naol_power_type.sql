-- V303 inserted TFCP 5 Multi Power NAOL with power_type 'Multi-Power'; canonical DB value is 'Multi Power' (V67).

UPDATE power_cards
SET power_type = 'Multi Power',
    updated_at = NOW()
WHERE image_path = 'tfacp/power/5_multipower_naol.png'
  AND set = 'TFCP'
  AND is_foil = FALSE
  AND power_type IS DISTINCT FROM 'Multi Power';
