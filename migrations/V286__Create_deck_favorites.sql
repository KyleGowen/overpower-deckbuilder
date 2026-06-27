-- Per-user deck favorites. A user can favorite any deck they can see (typically a
-- public deck owned by someone else). Deletes cascade when either the user or the
-- deck is removed; private decks are filtered out at query time (not deleted here).

CREATE TABLE IF NOT EXISTS deck_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, deck_id)
);

-- Fast lookup of a user's favorites.
CREATE INDEX IF NOT EXISTS idx_deck_favorites_user_id ON deck_favorites(user_id);
