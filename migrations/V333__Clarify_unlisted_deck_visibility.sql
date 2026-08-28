-- `is_private` is a discovery/listing setting, not an access-control setting.
-- Persistent decks are link-readable; TRUE excludes them from Community, public profiles,
-- and favorites. Guest-session decks remain session-scoped in application code.

COMMENT ON COLUMN decks.is_private IS 'Deck listing. TRUE = unlisted from Community, public profiles, and favorites, but readable by direct URL. FALSE = public. Independent of is_limited and is_valid.';
