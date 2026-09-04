-- Tighten the card-linked errata Recent Updates announcement copy.

UPDATE recent_updates
SET description = 'Cards with official errata now show the relevant ruling at the bottom of their detail panel, along with a direct link to LRG’s official source.',
    updated_at = '2026-09-04 06:30:00'
WHERE id = 'a1000001-0000-4000-8000-000000000010';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000010'
      AND description = 'Cards with official errata now show the relevant ruling at the bottom of their detail panel, along with a direct link to LRG’s official source.'
  ) THEN
    RAISE EXCEPTION 'Card errata feature announcement copy was not updated';
  END IF;
END $$;
