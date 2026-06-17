import type { CatalogCard } from '../../frontend/src/lib/api/types';
import {
  deckCardQuantityMax,
  deckCardUsesTrashOnlyRemoval,
  isOnePerDeckCatalogCard,
} from '../../frontend/src/lib/decks/deckCardControls';

describe('deckCardControls', () => {
  describe('deckCardUsesTrashOnlyRemoval', () => {
    it('returns true for character, location, and mission', () => {
      expect(deckCardUsesTrashOnlyRemoval('character')).toBe(true);
      expect(deckCardUsesTrashOnlyRemoval('location')).toBe(true);
      expect(deckCardUsesTrashOnlyRemoval('mission')).toBe(true);
    });

    it('returns false for multi-copy draw-pile types', () => {
      expect(deckCardUsesTrashOnlyRemoval('power')).toBe(false);
      expect(deckCardUsesTrashOnlyRemoval('special')).toBe(false);
      expect(deckCardUsesTrashOnlyRemoval('event')).toBe(false);
    });
  });

  describe('isOnePerDeckCatalogCard', () => {
    it('detects one_per_deck and is_one_per_deck', () => {
      expect(isOnePerDeckCatalogCard({ id: '1', one_per_deck: true } as CatalogCard)).toBe(true);
      expect(isOnePerDeckCatalogCard({ id: '2', is_one_per_deck: true } as CatalogCard)).toBe(true);
      expect(isOnePerDeckCatalogCard({ id: '3' } as CatalogCard)).toBe(false);
    });
  });

  describe('deckCardQuantityMax', () => {
    it('caps OPD catalog cards at 1 for stepper types', () => {
      const opdSpecial = { id: 's1', one_per_deck: true } as CatalogCard;
      expect(deckCardQuantityMax('special', opdSpecial)).toBe(1);
    });

    it('allows 99 for non-OPD stepper types', () => {
      const power = { id: 'p1', one_per_deck: false } as CatalogCard;
      expect(deckCardQuantityMax('power', power)).toBe(99);
    });

    it('returns 1 for trash-only types regardless of catalog', () => {
      expect(deckCardQuantityMax('character', { id: 'c1' } as CatalogCard)).toBe(1);
    });
  });
});
