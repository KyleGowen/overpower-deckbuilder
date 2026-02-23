-- Fix location image_path values broken by V73 (wrong filenames)
-- V73 incorrectly set Asclepieion to locations/ascleipeion.webp (typo) and Event Horizon to locations/horizon.webp
-- Actual files: asclepieion.webp, event_horizon_the_future.webp in locations/ root

UPDATE locations
SET image_path = 'asclepieion.webp', updated_at = COALESCE(updated_at, NOW())
WHERE name = 'Asclepieion' AND (image_path LIKE '%ascleipeion%' OR image_path = 'locations/ascleipeion.webp');

UPDATE locations
SET image_path = 'event_horizon_the_future.webp', updated_at = COALESCE(updated_at, NOW())
WHERE name = 'Event Horizon: The Future' AND (image_path LIKE '%horizon%' OR image_path = 'locations/horizon.webp');
