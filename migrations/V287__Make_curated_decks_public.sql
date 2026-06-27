-- V285 defaulted ALL existing decks to is_private = TRUE. The curated tournament
-- and community accounts exist specifically to share decks publicly (Home rails +
-- the /community feed/favorites). Flip their decks back to public so they appear in
-- the community feed and can be favorited (favorites filter out private decks).
--
-- Account IDs match src/constants/{tournamentDecksUser,communityDecksUser}.ts.

UPDATE decks
SET is_private = FALSE
WHERE user_id IN (
    '00000000-0000-0000-0000-000000000002', -- community_decks
    '00000000-0000-0000-0000-000000000003'  -- tournament_decks
);
