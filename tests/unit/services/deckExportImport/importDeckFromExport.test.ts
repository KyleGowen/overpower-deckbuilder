import { COMMUNITY_DECKS_USER_ID } from '../../../../src/constants/communityDecksUser';
import { TOURNAMENT_DECKS_USER_ID } from '../../../../src/constants/tournamentDecksUser';
import { importDeckFromExport } from '../../../../src/services/deckExportImport/importDeckFromExport';

jest.mock('../../../../src/services/deckExportImport/loadDeckCatalogBundle', () => ({
  loadDeckCatalogBundle: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../../../src/services/deckExportImport/resolveExportCardIds', () => ({
  resolveExportCardIds: jest.fn().mockReturnValue({
    resolved: [{ cardType: 'character', cardId: 'c1', quantity: 1 }],
    unresolved: [],
  }),
}));

jest.mock('../../../../src/services/deckValidationService', () => ({
  DeckValidationService: jest.fn().mockImplementation(() => ({
    validateDeck: jest.fn().mockResolvedValue([]),
  })),
}));

describe('importDeckFromExport', () => {
  const exportData = {
    name: 'Test Curated Deck',
    cards: { characters: ['Zeus'] },
  };

  function stubDeckRepository() {
    return {
      createDeck: jest.fn().mockResolvedValue({ id: 'deck-new', name: 'Test Curated Deck' }),
      replaceAllCardsInDeck: jest.fn().mockResolvedValue(undefined),
      updateDeck: jest.fn().mockResolvedValue(undefined),
    };
  }

  const cardRepository = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets is_private=false when importing for tournament_decks account', async () => {
    const deckRepository = stubDeckRepository();
    await importDeckFromExport(
      deckRepository as never,
      cardRepository as never,
      exportData,
      TOURNAMENT_DECKS_USER_ID
    );

    expect(deckRepository.updateDeck).toHaveBeenCalledWith(
      'deck-new',
      expect.objectContaining({ is_private: false, is_valid: true })
    );
  });

  it('sets is_private=false when importing for community_decks account', async () => {
    const deckRepository = stubDeckRepository();
    await importDeckFromExport(
      deckRepository as never,
      cardRepository as never,
      exportData,
      COMMUNITY_DECKS_USER_ID
    );

    expect(deckRepository.updateDeck).toHaveBeenCalledWith(
      'deck-new',
      expect.objectContaining({ is_private: false })
    );
  });

  it('does not set is_private when importing for a regular user', async () => {
    const deckRepository = stubDeckRepository();
    await importDeckFromExport(
      deckRepository as never,
      cardRepository as never,
      exportData,
      '00000000-0000-0000-0000-000000000099'
    );

    const updates = deckRepository.updateDeck.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(updates).not.toHaveProperty('is_private');
  });
});
