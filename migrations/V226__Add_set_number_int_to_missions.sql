-- Migration V226: Add precomputed integer column for set_number ordering on missions.
-- The LATERAL join ORDER BY previously cast NULLIF(m.set_number, '')::int at query time,
-- which is a runtime string-to-int cast that cannot use an index.
-- This column is computed once on write and indexed for fast ordered access.

ALTER TABLE missions ADD COLUMN IF NOT EXISTS set_number_int INTEGER;

UPDATE missions
SET set_number_int = NULLIF(set_number, '')::int
WHERE set_number IS NOT NULL AND set_number != '';

CREATE INDEX IF NOT EXISTS idx_missions_set_number_int
  ON missions(set_number_int ASC NULLS LAST);
