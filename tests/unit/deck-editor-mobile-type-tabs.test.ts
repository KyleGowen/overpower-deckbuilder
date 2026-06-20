import {
  resolveMobileDeckTypeTab,
  stepCyclicalIndex,
} from '../../frontend/src/lib/layout/cyclicalIndex';
import { CATALOG_TYPES } from '../../frontend/src/lib/catalog/catalogTypeMap';
import type { DeckCardType } from '../../frontend/src/lib/api/types';

function deckTypesInCatalogOrder(typesPresent: DeckCardType[]): string[] {
  return CATALOG_TYPES.filter((meta) => typesPresent.includes(meta.deckType)).map(
    (meta) => meta.type,
  );
}

describe('stepCyclicalIndex', () => {
  it('returns 0 for empty length', () => {
    expect(stepCyclicalIndex(0, 0, 1)).toBe(0);
    expect(stepCyclicalIndex(3, 0, -1)).toBe(0);
  });

  it('returns same index for length 1', () => {
    expect(stepCyclicalIndex(0, 1, 1)).toBe(0);
    expect(stepCyclicalIndex(0, 1, -1)).toBe(0);
  });

  it('steps forward and wraps to start', () => {
    expect(stepCyclicalIndex(0, 3, 1)).toBe(1);
    expect(stepCyclicalIndex(2, 3, 1)).toBe(0);
  });

  it('steps backward and wraps to end', () => {
    expect(stepCyclicalIndex(1, 3, -1)).toBe(0);
    expect(stepCyclicalIndex(0, 3, -1)).toBe(2);
  });
});

describe('resolveMobileDeckTypeTab', () => {
  const types = ['characters', 'special-cards', 'power-cards'] as const;

  it('returns null when no types', () => {
    expect(resolveMobileDeckTypeTab('characters', [])).toBeNull();
  });

  it('keeps prev when still valid', () => {
    expect(resolveMobileDeckTypeTab('special-cards', types)).toBe('special-cards');
  });

  it('falls back to first type when prev is missing', () => {
    expect(resolveMobileDeckTypeTab(null, types)).toBe('characters');
    expect(resolveMobileDeckTypeTab('missions', types)).toBe('characters');
  });
});

describe('deck mobile type tab list', () => {
  it('lists only non-empty types in CATALOG_TYPES order', () => {
    const present: DeckCardType[] = ['power', 'character', 'special'];
    expect(deckTypesInCatalogOrder(present)).toEqual([
      'characters',
      'special-cards',
      'power-cards',
    ]);
  });

  it('omits types not in the deck', () => {
    const present: DeckCardType[] = ['mission', 'event'];
    expect(deckTypesInCatalogOrder(present)).toEqual(['missions', 'events']);
  });
});
