import {
  characterOrderPosition,
  moveCharacterBy,
  reorderCharacterTo,
} from '../../../frontend/src/lib/decks/characterOrder';
import type { DeckCardEntry } from '../../../frontend/src/lib/api/types';

const cards: DeckCardEntry[] = [
  { type: 'character', cardId: 'a', quantity: 1, instanceId: 'a' },
  { type: 'power', cardId: 'p', quantity: 1, instanceId: 'p' },
  { type: 'character', cardId: 'b', quantity: 1, instanceId: 'b' },
  { type: 'location', cardId: 'l', quantity: 1, instanceId: 'l' },
  { type: 'character', cardId: 'c', quantity: 1, instanceId: 'c' },
];

describe('character preview order', () => {
  it('moves a character between character slots without moving other card types', () => {
    const reordered = reorderCharacterTo(cards, 'a', 'c');

    expect(reordered.map((card) => card.instanceId)).toEqual(['b', 'p', 'c', 'l', 'a']);
  });

  it('moves by one slot and keeps boundary moves as no-ops', () => {
    expect(moveCharacterBy(cards, 'b', -1).map((card) => card.instanceId)).toEqual([
      'b', 'p', 'a', 'l', 'c',
    ]);
    expect(moveCharacterBy(cards, 'a', -1)).toBe(cards);
  });

  it('reports the zero-based slot used to enable move controls', () => {
    expect(characterOrderPosition(cards, 'b')).toEqual({ position: 1, total: 3 });
  });
});
