import { DeckListService } from '../../../../src/api/services/deckListService';
import type { Deck } from '../../../../src/types';

describe('DeckListService', () => {
  const sampleDeck: Deck = {
    id: 'deck-1',
    user_id: 'user-1',
    name: 'Test Deck',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  };

  it('getTransformedListForUser uses default created_at ordering', async () => {
    const repo = {
      getDecksByUserId: jest.fn().mockResolvedValue([sampleDeck]),
      getPublicLegalDecksByUserId: jest.fn(),
    };
    const service = new DeckListService(repo);
    const list = await service.getTransformedListForUser('user-1');
    expect(repo.getDecksByUserId).toHaveBeenCalledWith('user-1');
    expect(list[0].metadata.name).toBe('Test Deck');
  });

  it('getTransformedCommunityListForUser requests public legal decks with updated_at ordering', async () => {
    const repo = {
      getDecksByUserId: jest.fn(),
      getPublicLegalDecksByUserId: jest.fn().mockResolvedValue([sampleDeck]),
    };
    const service = new DeckListService(repo);
    await service.getTransformedCommunityListForUser('community-user');
    expect(repo.getPublicLegalDecksByUserId).toHaveBeenCalledWith('community-user', 'updated_at');
    expect(repo.getDecksByUserId).not.toHaveBeenCalled();
  });

  it('getTransformedTournamentListForUser requests public legal decks with updated_at ordering', async () => {
    const repo = {
      getDecksByUserId: jest.fn(),
      getPublicLegalDecksByUserId: jest.fn().mockResolvedValue([sampleDeck]),
    };
    const service = new DeckListService(repo);
    await service.getTransformedTournamentListForUser('tournament-user');
    expect(repo.getPublicLegalDecksByUserId).toHaveBeenCalledWith('tournament-user', 'updated_at');
    expect(repo.getDecksByUserId).not.toHaveBeenCalled();
  });
});
