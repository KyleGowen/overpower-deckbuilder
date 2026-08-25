/**
 * Unit tests: deck tile preview image catalog fallback.
 */
import {
  buildDeckPreviewCatalogImages,
  enrichDeckListItemPreviewImages,
  enrichDeckListPreviewImages,
} from '../../frontend/src/lib/decks/deckPreviewImages';
import type { DeckListItem } from '../../frontend/src/lib/api/types';

describe('deckPreviewImages', () => {
  const catalogImages = buildDeckPreviewCatalogImages(
    [
      {
        id: 'char-1',
        name: 'Time Traveler',
        image_path: 'characters/time_traveler.webp',
      },
    ],
    [
      {
        id: 'loc-1',
        name: '221-B Baker St.',
        image_path: '221_b_baker_st.webp',
      },
    ],
    [
      {
        id: 'bg-1',
        name: 'Global Defense Agency',
        image_path: 'battlegrounds/global_defense_agency.webp',
      },
    ],
  );

  const baseDeck: DeckListItem = {
    metadata: {
      id: 'deck-1',
      name: 'Test Deck',
      created: '2026-01-01T00:00:00.000Z',
      lastModified: '2026-01-01T00:00:00.000Z',
      cardCount: 2,
      threat: 18,
      is_valid: false,
      is_private: true,
      userId: 'user-1',
      isOwner: true,
    },
    cards: [
      {
        id: 'char1_deck-1',
        type: 'character',
        cardId: 'char-1',
        quantity: 1,
        name: 'Time Traveler',
      },
      {
        id: 'loc_deck-1',
        type: 'location',
        cardId: 'loc-1',
        quantity: 1,
        name: '221-B Baker St.',
      },
      {
        id: 'bg_deck-1',
        type: 'battleground',
        cardId: 'bg-1',
        quantity: 1,
        name: 'Global Defense Agency',
      },
    ],
  };

  it('fills missing character defaultImage from catalog', () => {
    const enriched = enrichDeckListItemPreviewImages(baseDeck, catalogImages);
    const character = enriched.cards?.find((c) => c.type === 'character');
    expect(character?.defaultImage).toBe('characters/time_traveler.webp');
  });

  it('fills missing location defaultImage from catalog', () => {
    const enriched = enrichDeckListItemPreviewImages(baseDeck, catalogImages);
    const location = enriched.cards?.find((c) => c.type === 'location');
    expect(location?.defaultImage).toBe('221_b_baker_st.webp');
  });

  it('fills missing battleground defaultImage from catalog', () => {
    const enriched = enrichDeckListItemPreviewImages(baseDeck, catalogImages);
    const battleground = enriched.cards?.find((c) => c.type === 'battleground');
    expect(battleground?.defaultImage).toBe('battlegrounds/global_defense_agency.webp');
  });

  it('preserves existing defaultImage values', () => {
    const deck: DeckListItem = {
      ...baseDeck,
      cards: [
        {
          id: 'char1_deck-1',
          type: 'character',
          cardId: 'char-1',
          quantity: 1,
          defaultImage: 'characters/custom.webp',
        },
      ],
    };
    const enriched = enrichDeckListItemPreviewImages(deck, catalogImages);
    expect(enriched.cards?.[0]?.defaultImage).toBe('characters/custom.webp');
  });

  it('batch-enriches multiple decks', () => {
    const enriched = enrichDeckListPreviewImages([baseDeck, baseDeck], catalogImages);
    expect(enriched).toHaveLength(2);
    enriched.forEach((deck) => {
      const character = deck.cards?.find((c) => c.type === 'character');
      expect(character?.defaultImage).toBe('characters/time_traveler.webp');
    });
  });
});
