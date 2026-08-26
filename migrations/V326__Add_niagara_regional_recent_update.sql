-- Announce the Niagara Regional tournament breakdown on Home Recent Updates.

INSERT INTO recent_updates (id, title, type, description, card_image_url, created_at, updated_at) VALUES
    (
        'a1000001-0000-4000-8000-000000000008',
        'The Niagara Regional Breakdown',
        'feature',
        'Season One continued in Niagara with 42 players at Mecha Games, and Jessica Simms claimed victory. Explore the full field breakdown: the most-played characters, top 8 performers, breakout winners, reservists, homebases, cataclysms, and the decks that finished first and second. The Niagara Regional dashboard is now live.',
        'characters/joan_of_arc.webp',
        '2026-08-26 12:00:00',
        '2026-08-26 12:00:00'
    )
ON CONFLICT (id) DO NOTHING;
