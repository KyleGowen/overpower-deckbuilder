import type { CatalogCard, DeckCardEntry } from '../../frontend/src/lib/api/types';
import {
  buildDeckCardIndex,
  compareDeckSpecialEntries,
  sortDeckSpecialEntries,
} from '../../frontend/src/lib/decks/deckCardCatalog';

function specialEntry(cardId: string, instanceId: string): DeckCardEntry {
  return { type: 'special', cardId, quantity: 1, instanceId };
}

describe('deck special sort', () => {
  const catalog: CatalogCard[] = [
    { id: 's1', name: 'Zap', character: 'Zatanna' } as CatalogCard,
    { id: 's2', name: 'Wild', character: 'Any Character' } as CatalogCard,
    { id: 's3', name: 'Bolt', character: 'Aquaman' } as CatalogCard,
    { id: 's4', name: 'Alpha', character: 'Aquaman' } as CatalogCard,
  ];
  const index = buildDeckCardIndex(['special'], [catalog]);

  it('sortDeckSpecialEntries orders by character then special name (Any Character last)', () => {
    const sorted = sortDeckSpecialEntries(
      [
        specialEntry('s1', 'i1'),
        specialEntry('s2', 'i2'),
        specialEntry('s3', 'i3'),
        specialEntry('s4', 'i4'),
      ],
      index,
    );
    expect(sorted.map((e) => e.cardId)).toEqual(['s4', 's3', 's1', 's2']);
  });

  it('compareDeckSpecialEntries sorts names within the same character', () => {
    expect(
      compareDeckSpecialEntries(specialEntry('s4', 'a'), specialEntry('s3', 'b'), index),
    ).toBeLessThan(0);
  });
});
