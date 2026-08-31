-- Announce the approved Skybound alternate-art reveal on Home Recent Updates.

INSERT INTO recent_updates (id, title, type, description, card_image_url, created_at, updated_at) VALUES
    (
        'a1000001-0000-4000-8000-000000000009',
        'Skybound alternate art revealed!',
        'new_cards',
        'The Skybound alternate-art character cards are officially revealed. Open Skybound Characters in the card database and turn off "Hide Alts" to browse every alternate printing, including the two-sided Walkers: Herd.',
        'sky/characters/419_invincible.png',
        '2026-08-31 14:45:00',
        '2026-08-31 14:45:00'
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    type = EXCLUDED.type,
    description = EXCLUDED.description,
    card_image_url = EXCLUDED.card_image_url,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

-- The launch tile remains in the archive, but its future-reveal teaser is now obsolete.
UPDATE recent_updates
SET description = 'The Skybound set has arrived in Excelsior! Browse the full release in the card database.'
WHERE id = 'a1000001-0000-4000-8000-000000000007';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000009'
      AND title = 'Skybound alternate art revealed!'
      AND type = 'new_cards'
      AND card_image_url = 'sky/characters/419_invincible.png'
      AND description LIKE '%turn off "Hide Alts"%'
  ) THEN
    RAISE EXCEPTION 'Skybound alternate-art reveal recent update was not applied';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000007'
      AND description LIKE '%future update%'
  ) THEN
    RAISE EXCEPTION 'Skybound launch recent update still advertises a future reveal';
  END IF;
END $$;
