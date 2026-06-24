import type { CatalogCard } from '../../frontend/src/lib/api/types';
import {
  cardMatchesSearchQuery,
  compareCatalogCards,
  parseSearchTokens,
} from '../../frontend/src/lib/catalog/catalogTypeMap';

describe('cardMatchesSearchQuery foil keyword', () => {
  const foilCard: CatalogCard = {
    id: 'foil-1',
    name: 'Tarzan',
    is_foil: true,
  };
  const baseCard: CatalogCard = {
    id: 'base-1',
    name: 'Tarzan',
    is_foil: false,
  };

  it('parseSearchTokens detects foil keyword and strips it', () => {
    expect(parseSearchTokens('foil')).toEqual({ textQuery: '', requireFoil: true });
    expect(parseSearchTokens('foil tarzan')).toEqual({ textQuery: 'tarzan', requireFoil: true });
    expect(parseSearchTokens('tarzan foil')).toEqual({ textQuery: 'tarzan', requireFoil: true });
    expect(parseSearchTokens('tarzan')).toEqual({ textQuery: 'tarzan', requireFoil: false });
  });

  it('matches all foil cards when query is foil only', () => {
    expect(cardMatchesSearchQuery(foilCard, 'foil')).toBe(true);
    expect(cardMatchesSearchQuery(baseCard, 'foil')).toBe(false);
  });

  it('combines foil keyword with text search', () => {
    expect(cardMatchesSearchQuery(foilCard, 'foil tarzan')).toBe(true);
    expect(cardMatchesSearchQuery(baseCard, 'foil tarzan')).toBe(false);
    expect(cardMatchesSearchQuery(foilCard, 'foil batman')).toBe(false);
  });

  it('does not require foil for plain text queries', () => {
    expect(cardMatchesSearchQuery(baseCard, 'tarzan')).toBe(true);
    expect(cardMatchesSearchQuery(foilCard, 'tarzan')).toBe(true);
  });
});

describe('compareCatalogCards power-cards', () => {
  const card = (id: string, power_type: string, value: number): CatalogCard => ({
    id,
    name: `${value} - ${power_type}`,
    power_type,
    value,
  });

  it('sorts by power type order then ascending value', () => {
    const unsorted: CatalogCard[] = [
      card('any7', 'Any-Power', 7),
      card('int3', 'Intelligence', 3),
      card('combat2', 'Combat', 2),
      card('energy1', 'Energy', 1),
      card('bf4', 'Brute Force', 4),
      card('mp5', 'Multi-Power', 5),
      card('energy3', 'Energy', 3),
      card('combat6', 'Combat', 6),
    ];

    const sorted = [...unsorted].sort((a, b) => compareCatalogCards(a, b, 'power-cards'));

    expect(sorted.map((c) => c.id)).toEqual([
      'energy1',
      'energy3',
      'combat2',
      'combat6',
      'bf4',
      'int3',
      'mp5',
      'any7',
    ]);
  });

  it('treats hyphen and space power type spellings as equivalent', () => {
    const a = card('mp1', 'Multi Power', 3);
    const b = card('mp2', 'Multi-Power', 4);
    expect(compareCatalogCards(a, b, 'power-cards')).toBeLessThan(0);
    expect(compareCatalogCards(b, a, 'power-cards')).toBeGreaterThan(0);
  });
});
