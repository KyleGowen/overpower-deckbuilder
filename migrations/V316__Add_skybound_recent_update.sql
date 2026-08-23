-- Announce the Skybound set launch on the Home Recent Updates rail.

INSERT INTO recent_updates (id, title, type, description, card_image_url, created_at, updated_at) VALUES
    (
        'a1000001-0000-4000-8000-000000000007',
        'Skybound is here!',
        'update',
        'The Skybound set has arrived in Excelsior. Browse the full release in the card database, explore its new characters and strategies, and start building decks with Skybound cards today.',
        'sky/specials/374_damien_darkblood.png',
        '2026-08-23 12:00:00',
        '2026-08-23 12:00:00'
    )
ON CONFLICT (id) DO NOTHING;
