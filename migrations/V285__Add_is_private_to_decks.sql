-- Add deck visibility flag. NOTE: this is independent of is_limited (deck-building
-- format) and is_valid (legality). is_private controls whether a deck appears in
-- other users' profiles and the community feed.
-- All existing decks default to private so nothing becomes public on migration.

ALTER TABLE decks ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN decks.is_private IS 'Deck visibility. TRUE = private (owner only). FALSE = public (visible in community feed and on the owner public profile). Independent of is_limited and is_valid.';

-- Partial index to speed public-feed / public-profile reads (only public rows).
CREATE INDEX IF NOT EXISTS idx_decks_public_updated_at
    ON decks(updated_at DESC)
    WHERE is_private = FALSE;
