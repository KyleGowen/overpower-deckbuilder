import type { DeckCardEntry } from '../../frontend/src/lib/api/types';
import {
  buildDrawPile,
  canDrawHand,
  countPlayableCards,
  drawRandomHand,
} from '../../frontend/src/lib/decks/drawHand';

function entry(
  type: DeckCardEntry['type'],
  cardId: string,
  overrides: Partial<DeckCardEntry> = {},
): DeckCardEntry {
  return { type, cardId, quantity: 1, ...overrides };
}

function power(id: string, overrides: Partial<DeckCardEntry> = {}): DeckCardEntry {
  return entry('power', id, overrides);
}

describe('drawHand (v2)', () => {
  describe('countPlayableCards / canDrawHand', () => {
    it('counts playable types only', () => {
      const cards = [
        entry('character', 'c1'),
        entry('location', 'l1'),
        entry('mission', 'm1'),
        power('p1'),
        power('p2'),
      ];
      expect(countPlayableCards(cards)).toBe(2);
    });

    it('sums quantity for enable threshold', () => {
      const cards = Array.from({ length: 7 }, (_, i) => power(`p${i}`));
      expect(canDrawHand(cards)).toBe(false);
      cards.push(power('p7'));
      expect(canDrawHand(cards)).toBe(true);
    });

    it('includes exclude_from_draw cards in enable count', () => {
      const cards = Array.from({ length: 7 }, (_, i) => power(`p${i}`));
      cards.push(power('excluded', { exclude_from_draw: true }));
      expect(countPlayableCards(cards)).toBe(8);
      expect(canDrawHand(cards)).toBe(true);
    });
  });

  describe('buildDrawPile', () => {
    it('excludes character, location, mission', () => {
      const cards = [
        entry('character', 'c1'),
        entry('location', 'l1'),
        entry('mission', 'm1'),
        power('p1'),
      ];
      expect(buildDrawPile(cards)).toHaveLength(1);
      expect(buildDrawPile(cards)[0].cardId).toBe('p1');
    });

    it('omits exclude_from_draw from pile', () => {
      const cards = [power('p1'), power('p2', { exclude_from_draw: true })];
      const pile = buildDrawPile(cards);
      expect(pile).toHaveLength(1);
      expect(pile[0].cardId).toBe('p1');
    });

    it('expands quantity into separate pile slots', () => {
      const cards = [power('p1', { quantity: 3 })];
      expect(buildDrawPile(cards)).toHaveLength(3);
    });
  });

  describe('drawRandomHand', () => {
    it('returns empty array when pile is empty', () => {
      expect(drawRandomHand([entry('character', 'c1')])).toEqual([]);
    });

    it('draws at most pile size when fewer than 8 cards', () => {
      const cards = Array.from({ length: 5 }, (_, i) => power(`p${i}`));
      let call = 0;
      const hand = drawRandomHand(cards, {
        random: () => (call++ + 0.01) / 5,
      });
      expect(hand).toHaveLength(5);
    });

    it('draws exactly 8 from pile of 8+', () => {
      const cards = Array.from({ length: 12 }, (_, i) => power(`p${i}`));
      const sequence = [0, 0.09, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63];
      let i = 0;
      const hand = drawRandomHand(cards, {
        random: () => sequence[i++ % sequence.length],
      });
      expect(hand).toHaveLength(8);
      const ids = new Set(hand.map((c) => c.cardId));
      expect(ids.size).toBe(8);
    });

    it('draws 9th card when event in first 8 and pile > 8', () => {
      const cards = [
        entry('event', 'e1'),
        ...Array.from({ length: 10 }, (_, i) => power(`p${i}`)),
      ];
      const pileLen = 11;
      const picks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      let i = 0;
      const hand = drawRandomHand(cards, {
        random: () => (picks[i++] + 0.01) / pileLen,
      });
      expect(hand.some((c) => c.type === 'event')).toBe(true);
      expect(hand).toHaveLength(9);
    });

    it('does not infinite loop on small piles', () => {
      const cards = [power('only')];
      expect(() => drawRandomHand(cards)).not.toThrow();
      expect(drawRandomHand(cards)).toHaveLength(1);
    });
  });
});
