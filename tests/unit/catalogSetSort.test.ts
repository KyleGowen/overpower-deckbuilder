import type { CatalogCard } from '../../frontend/src/lib/api/types';
import {
  compareSetThenSetNumber,
  parseSetNumber,
  setCodeForCard,
} from '../../frontend/src/lib/catalog/catalogSetSort';

function card(partial: Partial<CatalogCard> & { id: string }): CatalogCard {
  return partial as CatalogCard;
}

describe('catalogSetSort', () => {
  describe('setCodeForCard', () => {
    it('uses set when present', () => {
      expect(setCodeForCard(card({ id: '1', set: 'SKY' }))).toBe('SKY');
    });

    it('falls back to universe then ERB', () => {
      expect(setCodeForCard(card({ id: '1', universe: 'ERB' }))).toBe('ERB');
      expect(setCodeForCard(card({ id: '1' }))).toBe('ERB');
    });
  });

  describe('parseSetNumber', () => {
    it('parses numeric set_number', () => {
      expect(parseSetNumber(card({ id: '1', set_number: '12' }))).toBe(12);
    });

    it('returns null for missing or non-numeric values', () => {
      expect(parseSetNumber(card({ id: '1' }))).toBeNull();
      expect(parseSetNumber(card({ id: '1', set_number: 'abc' }))).toBeNull();
    });
  });

  describe('compareSetThenSetNumber', () => {
    it('sorts by set code alphabetically', () => {
      const a = card({ id: '1', name: 'Z', set: 'ERB', set_number: '1' });
      const b = card({ id: '2', name: 'A', set: 'SKY', set_number: '1' });
      expect(compareSetThenSetNumber(a, b)).toBeLessThan(0);
    });

    it('uses universe fallback when set is missing', () => {
      const a = card({ id: '1', name: 'A', universe: 'ERB', set_number: '1' });
      const b = card({ id: '2', name: 'B', set: 'SKY', set_number: '1' });
      expect(compareSetThenSetNumber(a, b)).toBeLessThan(0);
    });

    it('sorts by set_number numerically within the same set', () => {
      const c10 = card({ id: '1', name: 'Ten', set: 'ERB', set_number: '10' });
      const c2 = card({ id: '2', name: 'Two', set: 'ERB', set_number: '2' });
      expect(compareSetThenSetNumber(c10, c2)).toBeGreaterThan(0);
      expect(compareSetThenSetNumber(c2, c10)).toBeLessThan(0);
    });

    it('places cards without set_number after numbered cards in the same set', () => {
      const numbered = card({ id: '1', name: 'Numbered', set: 'ERB', set_number: '5' });
      const unnumbered = card({ id: '2', name: 'NoNum', set: 'ERB' });
      expect(compareSetThenSetNumber(unnumbered, numbered)).toBeGreaterThan(0);
      expect(compareSetThenSetNumber(numbered, unnumbered)).toBeLessThan(0);
    });

    it('returns 0 when set and set_number match', () => {
      const a = card({ id: '1', name: 'Alpha', set: 'ERB', set_number: '1' });
      const b = card({ id: '2', name: 'Beta', set: 'ERB', set_number: '1' });
      expect(compareSetThenSetNumber(a, b)).toBe(0);
    });
  });
});
