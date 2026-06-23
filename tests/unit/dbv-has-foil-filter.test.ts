import type { CatalogCard } from '../../frontend/src/lib/api/types';
import { matchesHasFoilFilter } from '../../frontend/src/lib/catalog/foilCatalog';

function card(overrides: Partial<CatalogCard> & { id: string }): CatalogCard {
  return { name: 'Test', set: 'ERB', ...overrides } as CatalogCard;
}

describe('matchesHasFoilFilter', () => {
  const baseToFoil = new Map<string, string>([
    ['base-1', 'foil-1'],
  ]);

  it('passes all cards when filter is disabled', () => {
    const plain = card({ id: 'plain-1' });
    expect(matchesHasFoilFilter(plain, baseToFoil, false)).toBe(true);
  });

  it('passes base cards with a foil counterpart when enabled', () => {
    const base = card({ id: 'base-1', is_foil: false });
    expect(matchesHasFoilFilter(base, baseToFoil, true)).toBe(true);
  });

  it('rejects base cards without a foil counterpart when enabled', () => {
    const plain = card({ id: 'plain-1', is_foil: false });
    expect(matchesHasFoilFilter(plain, baseToFoil, true)).toBe(false);
  });

  it('passes foil-only rows when enabled', () => {
    const foilOnly = card({ id: 'foil-only', is_foil: true });
    expect(matchesHasFoilFilter(foilOnly, baseToFoil, true)).toBe(true);
  });
});
