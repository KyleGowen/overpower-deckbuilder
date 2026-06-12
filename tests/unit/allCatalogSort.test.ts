import type { CatalogCard } from '../../frontend/src/lib/api/types';
import { compareAllCatalogCards, sortAllCatalogCards } from '../../frontend/src/lib/catalog/allCatalogSort';

function card(partial: Partial<CatalogCard> & { id: string }): CatalogCard {
  return partial as CatalogCard;
}

describe('compareAllCatalogCards', () => {
  it('sorts by set code alphabetically', () => {
    const a = card({ id: '1', name: 'Z', set: 'ERB', set_number: '1' });
    const b = card({ id: '2', name: 'A', set: 'SKY', set_number: '1' });
    expect(compareAllCatalogCards(a, b)).toBeLessThan(0);
  });

  it('uses universe fallback when set is missing', () => {
    const a = card({ id: '1', name: 'A', universe: 'ERB', set_number: '1' });
    const b = card({ id: '2', name: 'B', set: 'SKY', set_number: '1' });
    expect(compareAllCatalogCards(a, b)).toBeLessThan(0);
  });

  it('sorts foil after non-foil within the same set', () => {
    const base = card({ id: '1', name: 'Card', set: 'ERB', set_number: '1', is_foil: false });
    const foil = card({ id: '2', name: 'Card', set: 'ERB', set_number: '1', is_foil: true });
    const sorted = sortAllCatalogCards([foil, base]);
    expect(sorted[0].is_foil).toBe(false);
    expect(sorted[1].is_foil).toBe(true);
  });

  it('sorts by set_number numerically within the same set', () => {
    const c10 = card({ id: '1', name: 'Ten', set: 'ERB', set_number: '10' });
    const c2 = card({ id: '2', name: 'Two', set: 'ERB', set_number: '2' });
    const sorted = sortAllCatalogCards([c10, c2]);
    expect(sorted[0].set_number).toBe('2');
    expect(sorted[1].set_number).toBe('10');
  });

  it('places cards without set_number after numbered cards in the same set', () => {
    const numbered = card({ id: '1', name: 'Numbered', set: 'ERB', set_number: '5' });
    const unnumbered = card({ id: '2', name: 'NoNum', set: 'ERB' });
    const sorted = sortAllCatalogCards([unnumbered, numbered]);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });

  it('tie-breaks by display name', () => {
    const a = card({ id: '1', name: 'Alpha', set: 'ERB', set_number: '1' });
    const b = card({ id: '2', name: 'Beta', set: 'ERB', set_number: '1' });
    expect(compareAllCatalogCards(a, b)).toBeLessThan(0);
  });
});
