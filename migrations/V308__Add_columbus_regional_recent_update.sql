-- Announce the Columbus Regional tournament breakdown on Home Recent Updates.

INSERT INTO recent_updates (id, title, type, description, card_image_url, created_at, updated_at) VALUES
    (
        'a1000001-0000-4000-8000-000000000006',
        'The Columbus Regional Breakdown',
        'feature',
        'Season One kicked off in Columbus with 53 players at Heroes and Games, and Justin Sadaie claimed victory. See what the field brought: the characters everyone played, who cracked the top 8, surprise standouts, go-to reservists, homebases, and cataclysms. It''s the first look at how Season One is shaping up, all in one place.',
        'characters/alternate/SunWukong-UR_Alt.jpg',
        '2026-07-11 12:00:00',
        '2026-07-11 12:00:00'
    )
ON CONFLICT (id) DO NOTHING;
