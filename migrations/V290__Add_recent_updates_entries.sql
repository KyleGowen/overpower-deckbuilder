-- Add Community Deck and Mobile Layout feature updates; index updated_at for sort order.

CREATE INDEX idx_recent_updates_updated_at ON recent_updates(updated_at DESC);

INSERT INTO recent_updates (id, title, type, description, card_image_url, created_at, updated_at) VALUES
    (
        'a1000001-0000-4000-8000-000000000004',
        'The Community Deck Section',
        'feature',
        'The Community tab now showcases public, legal Standard decks shared by players. Open any deck to explore the list, or tap the owner name to view their public decks. To share your own deck, open it in the deck editor and click the Public visibility badge. Only Legal, non-Limited decks appear in the community feed. Discover new ideas and inspiration from fellow deck builders.',
        'characters/alternate/AngryMobIndustrialAge-Alt.jpg',
        '2026-06-30 12:00:00',
        '2026-06-30 12:00:00'
    ),
    (
        'a1000001-0000-4000-8000-000000000005',
        'New Mobile Layout and Controls',
        'update',
        'Excelsior''s mobile layouts have been enhanced. Controls have been upgraded as well. Swipe left or right to move between card category tabs without having to reach for the types filter. Press and hold on decks cycle through the selected characters and location.',
        'characters/invisible_man.webp',
        '2026-06-28 12:00:00',
        '2026-06-28 12:00:00'
    );
