import { CommunityService } from '../../../../src/api/services/communityService';
import type { Deck, User } from '../../../../src/types';

const deckA: Deck = {
  id: 'deck-a',
  user_id: 'owner-1',
  name: 'Alpha',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
  is_private: false,
};

const deckB: Deck = {
  id: 'deck-b',
  user_id: 'owner-2',
  name: 'Bravo',
  created_at: '2026-01-03T00:00:00.000Z',
  updated_at: '2026-01-04T00:00:00.000Z',
  is_private: false,
};

const owner1: User = { id: 'owner-1', name: 'alice', email: 'a@b.com', role: 'USER' };
const owner2: User = {
  id: 'owner-2',
  name: 'bob-login',
  email: 'bob@b.com',
  role: 'USER',
  displayName: 'Bob the Builder',
};

function stubDeckRepo(over: Partial<Record<string, jest.Mock>> = {}) {
  return {
    getCommunityFeedDecks: jest.fn().mockResolvedValue([deckA, deckB]),
    searchCommunityDecks: jest.fn().mockResolvedValue([deckA]),
    getPublicDecksByUserId: jest.fn().mockResolvedValue([deckA]),
    getFavoriteDecksForUser: jest.fn().mockResolvedValue([deckA]),
    getDeckById: jest.fn().mockResolvedValue(deckA),
    addDeckFavorite: jest.fn().mockResolvedValue(true),
    removeDeckFavorite: jest.fn().mockResolvedValue(true),
    getFavoritedDeckIds: jest.fn().mockResolvedValue(new Set<string>()),
    ...over,
  };
}

function stubUserLookup(users: User[] = [owner1, owner2]) {
  return { getUsersByIds: jest.fn().mockResolvedValue(users) };
}

describe('CommunityService', () => {
  describe('getCommunityDecks', () => {
    it('returns the 20 most-recent feed when no search term is given', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup(), ['curated-1']);
      const result = await service.getCommunityDecks(null);
      expect(repo.getCommunityFeedDecks).toHaveBeenCalledWith({
        limit: 20,
        excludeUserIds: ['curated-1'],
      });
      expect(repo.searchCommunityDecks).not.toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('routes to search when a term is given (trimmed)', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup(), ['curated-1']);
      const result = await service.getCommunityDecks('viewer-1', '  spider  ');
      expect(repo.searchCommunityDecks).toHaveBeenCalledWith({
        search: 'spider',
        excludeUserIds: ['curated-1'],
      });
      expect(repo.getCommunityFeedDecks).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('treats a whitespace-only search as no search', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup());
      await service.getCommunityDecks(null, '   ');
      expect(repo.getCommunityFeedDecks).toHaveBeenCalled();
      expect(repo.searchCommunityDecks).not.toHaveBeenCalled();
    });

    it('enriches items with resolved owner display name', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup());
      const result = await service.getCommunityDecks(null);
      const a = result.find((d) => d.metadata.id === 'deck-a');
      const b = result.find((d) => d.metadata.id === 'deck-b');
      expect(a?.metadata.ownerDisplayName).toBe('alice'); // password user → username
      expect(b?.metadata.ownerDisplayName).toBe('Bob the Builder'); // displayName wins
    });

    it('marks favorite state for the viewer', async () => {
      const repo = stubDeckRepo({
        getFavoritedDeckIds: jest.fn().mockResolvedValue(new Set(['deck-b'])),
      });
      const service = new CommunityService(repo, stubUserLookup());
      const result = await service.getCommunityDecks('viewer-1');
      expect(repo.getFavoritedDeckIds).toHaveBeenCalledWith('viewer-1', ['deck-a', 'deck-b']);
      expect(result.find((d) => d.metadata.id === 'deck-a')?.metadata.isFavorited).toBe(false);
      expect(result.find((d) => d.metadata.id === 'deck-b')?.metadata.isFavorited).toBe(true);
    });

    it('does not query favorites for guests (viewer null)', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup());
      const result = await service.getCommunityDecks(null);
      expect(repo.getFavoritedDeckIds).not.toHaveBeenCalled();
      expect(result.every((d) => d.metadata.isFavorited === false)).toBe(true);
    });
  });

  describe('getPublicDecksForUser', () => {
    it('fetches the target user public decks and enriches them', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup());
      const result = await service.getPublicDecksForUser('owner-1', 'viewer-1');
      expect(repo.getPublicDecksByUserId).toHaveBeenCalledWith('owner-1');
      expect(result[0].metadata.ownerDisplayName).toBe('alice');
    });
  });

  describe('getFavorites', () => {
    it('returns the viewer favorited decks', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup());
      const result = await service.getFavorites('viewer-1');
      expect(repo.getFavoriteDecksForUser).toHaveBeenCalledWith('viewer-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('addFavorite', () => {
    it('404 when the deck does not exist', async () => {
      const repo = stubDeckRepo({ getDeckById: jest.fn().mockResolvedValue(undefined) });
      const service = new CommunityService(repo, stubUserLookup());
      const result = await service.addFavorite('viewer-1', 'missing');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('DECK_NOT_FOUND');
      expect(repo.addDeckFavorite).not.toHaveBeenCalled();
    });

    it('400 when favoriting your own deck', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup());
      const result = await service.addFavorite('owner-1', 'deck-a');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('CANNOT_FAVORITE_OWN');
      expect(repo.addDeckFavorite).not.toHaveBeenCalled();
    });

    it('adds the favorite for a non-owner', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup());
      const result = await service.addFavorite('viewer-1', 'deck-a');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toEqual({ deckId: 'deck-a', isFavorited: true });
      expect(repo.addDeckFavorite).toHaveBeenCalledWith('viewer-1', 'deck-a');
    });
  });

  describe('removeFavorite', () => {
    it('removes the favorite and reports isFavorited false', async () => {
      const repo = stubDeckRepo();
      const service = new CommunityService(repo, stubUserLookup());
      const result = await service.removeFavorite('viewer-1', 'deck-a');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toEqual({ deckId: 'deck-a', isFavorited: false });
      expect(repo.removeDeckFavorite).toHaveBeenCalledWith('viewer-1', 'deck-a');
    });
  });
});
