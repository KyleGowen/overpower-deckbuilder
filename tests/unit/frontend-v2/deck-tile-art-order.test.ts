import { deckArtSlides } from '../../../frontend/src/lib/decks/deckTileArtSlides';
import type { DeckListItem } from '../../../frontend/src/lib/api/types';

function deckWithCards(cards: DeckListItem['cards']): DeckListItem {
  return {
    metadata: {
      id: 'deck-1',
      name: 'Preview order',
      cardCount: 0,
      userId: 'user-1',
      isOwner: true,
    },
    cards,
  };
}

describe('DeckTile art order', () => {
  it('cycles the first four characters, location, then battleground', () => {
    const deck = deckWithCards([
      ...['c3', 'c1', 'c4', 'c2', 'c5'].map((cardId) => ({
        type: 'character' as const,
        cardId,
        quantity: 1,
        defaultImage: `${cardId}.webp`,
      })),
      { type: 'mission', cardId: 'm1', quantity: 1, defaultImage: 'm1.webp' },
      { type: 'location', cardId: 'l1', quantity: 1, defaultImage: 'l1.webp' },
      { type: 'battleground', cardId: 'b1', quantity: 1, defaultImage: 'b1.webp' },
    ]);

    expect(deckArtSlides(deck).map((slide) => slide.cardId)).toEqual([
      'c3', 'c1', 'c4', 'c2', 'l1', 'b1',
    ]);
  });
});
