-- Announce card-linked official errata in Home Recent Updates.

INSERT INTO recent_updates (id, title, type, description, card_image_url, created_at, updated_at) VALUES
    (
        'a1000001-0000-4000-8000-000000000010',
        'Official errata, right on the card',
        'feature',
        'Cards with official Season 1 errata now show the relevant ruling at the bottom of their detail panel, along with a direct link to LRG’s source. Multi-card entries are scoped to the card you’re viewing.',
        'sky/specials/374_damien_darkblood.png',
        '2026-09-04 06:00:00',
        '2026-09-04 06:00:00'
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    type = EXCLUDED.type,
    description = EXCLUDED.description,
    card_image_url = EXCLUDED.card_image_url,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM recent_updates
    WHERE id = 'a1000001-0000-4000-8000-000000000010'
      AND title = 'Official errata, right on the card'
      AND type = 'feature'
      AND card_image_url = 'sky/specials/374_damien_darkblood.png'
      AND description LIKE '%direct link to LRG’s source%'
      AND description LIKE '%scoped to the card you’re viewing%'
  ) THEN
    RAISE EXCEPTION 'Card errata feature recent update was not applied';
  END IF;
END $$;
