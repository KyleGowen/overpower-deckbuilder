import type { CatalogCard } from '../../frontend/src/lib/api/types';
import {
  buildDeckUsabilityContext,
  deckCatalogIndexKey,
} from '../../frontend/src/lib/deck-usability';
import {
  filterAndSortTypeCardsWithOptions,
  type AddCardsFilterOptions,
} from '../../frontend/src/features/deck-editor/addCardsFilters';

describe('addCardsFilters hide unusables', () => {
  const spiderMan: CatalogCard = {
    id: 'char-1',
    name: 'Spider-Man',
    energy: 5,
    combat: 6,
    brute_force: 4,
    intelligence: 5,
  };

  it('does not wipe power cards when hideUnusables uses deckCatalogIndex on empty tab catalog', () => {
    const deckCatalogIndex = new Map<string, CatalogCard>([
      [deckCatalogIndexKey('character', 'char-1'), spiderMan],
    ]);
    const ctx = buildDeckUsabilityContext(
      [{ type: 'character', cardId: 'char-1', quantity: 1 }],
      {},
      { deckCatalogIndex },
    );
    const powerCards: CatalogCard[] = [
      { id: 'p1', name: 'Combat 6', power_type: 'Combat', value: 6 },
      { id: 'p2', name: 'Combat 7', power_type: 'Combat', value: 7 },
      { id: 'mp', name: 'MP', power_type: 'Multi Power', value: 8 },
    ];
    const options: AddCardsFilterOptions = {
      searchQuery: '',
      setFilter: '',
      hideUnusables: true,
      usabilityCtx: ctx,
    };

    const filtered = filterAndSortTypeCardsWithOptions(powerCards, 'power-cards', options);

    expect(filtered.map((c) => c.id)).toEqual(['p1', 'mp']);
  });
});
