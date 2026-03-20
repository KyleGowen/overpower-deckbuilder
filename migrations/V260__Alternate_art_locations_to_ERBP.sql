-- Alternate-art location rows (image_path alternate/...) are World Legends Any Hero Essentials promo art (ERBP), not core ERB.
-- See V218__Add_alternate_location_rows.sql.
UPDATE locations
SET
    set = 'ERBP',
    rarity = NULL,
    set_number = NULL,
    set_number_foil = NULL,
    updated_at = NOW()
WHERE image_path LIKE 'alternate/%';
