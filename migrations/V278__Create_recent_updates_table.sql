-- Create recent_updates table
-- Hand-maintained news/announcement cards shown on the Home screen (v2 SPA).
-- Rows are inserted/updated manually via SQL or migrations — not inferred from app activity.

CREATE TABLE recent_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    description VARCHAR(400) NOT NULL,
    card_image_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT recent_updates_type_check CHECK (
        type IN ('feature', 'fix', 'news', 'update', 'event', 'new_cards')
    )
);

CREATE INDEX idx_recent_updates_created_at ON recent_updates(created_at DESC);

CREATE TRIGGER update_recent_updates_updated_at BEFORE UPDATE ON recent_updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial entries (staggered created_at preserves display order: newest first)
INSERT INTO recent_updates (id, title, type, description, card_image_url, created_at) VALUES
    (
        'a1000001-0000-4000-8000-000000000001',
        'A fresh new Excelsior',
        'update',
        'The site has been rebuilt from the ground up with a faster, cleaner desktop and mobile experience.',
        'characters/carson_of_venus.webp',
        '2026-06-09 12:00:00'
    ),
    (
        'a1000001-0000-4000-8000-000000000002',
        'Browse the full card database',
        'feature',
        'Search, filter and page through every modern OverPower card, with a detail view for every card type.',
        'characters/anubis.webp',
        '2026-06-09 11:00:00'
    ),
    (
        'a1000001-0000-4000-8000-000000000003',
        'Track your collection',
        'feature',
        'Record how many of each card you own and keep your inventory in sync across the app.',
        'characters/captain_nemo.webp',
        '2026-06-09 10:00:00'
    );
