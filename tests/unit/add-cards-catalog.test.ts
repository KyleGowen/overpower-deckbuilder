import type { CatalogCard } from '../../frontend/src/lib/api/types';
import {
  ADD_CARDS_PAGE_SIZE_ALL,
  addCardsGridClassName,
  addCardsPageSizeForType,
  buildAddCardsSections,
  filterAndSortTypeCards,
  flattenAddCardsSections,
  groupPageItemsByType,
  paginateItems,
} from '../../frontend/src/features/deck-editor/addCardsCatalog';

function card(id: string, name: string, extra: Partial<CatalogCard> = {}): CatalogCard {
  return { id, name, ...extra } as CatalogCard;
}

describe('addCardsCatalog', () => {
  describe('buildAddCardsSections', () => {
    it('returns sections in catalog order with empty types omitted', () => {
      const sections = buildAddCardsSections(
        {
          characters: [card('c1', 'Zeus')],
          'power-cards': [card('p1', 'Energy 5')],
        },
        '',
      );

      expect(sections.map((s) => s.meta.type)).toEqual(['characters', 'power-cards']);
      expect(sections[0].cards).toHaveLength(1);
      expect(sections[1].cards).toHaveLength(1);
    });

    it('filters by cardMatchesSearchQuery across types', () => {
      const sections = buildAddCardsSections(
        {
          characters: [card('c1', 'Zeus'), card('c2', 'Anubis')],
          'special-cards': [card('s1', 'Magic Ring', { special_abilities: 'Zeus only' })],
        },
        'zeus',
      );

      expect(sections).toHaveLength(2);
      expect(sections[0].cards.map((c) => c.id)).toEqual(['c1']);
      expect(sections[1].cards.map((c) => c.id)).toEqual(['s1']);
    });

    it('sorts cards within each section by display name', () => {
      const sections = buildAddCardsSections(
        {
          characters: [card('c2', 'Zeus'), card('c1', 'Anubis')],
        },
        '',
      );

      expect(sections[0].cards.map((c) => c.name)).toEqual(['Anubis', 'Zeus']);
    });
  });

  describe('flattenAddCardsSections', () => {
    it('preserves catalog type order when flattening', () => {
      const sections = buildAddCardsSections(
        {
          characters: [card('c1', 'A')],
          missions: [card('m1', 'B')],
          events: [card('e1', 'C')],
        },
        '',
      );
      const flat = flattenAddCardsSections(sections);

      expect(flat.map((i) => i.catalogType)).toEqual(['characters', 'missions', 'events']);
    });
  });

  describe('paginateItems', () => {
    it('returns the correct page slice', () => {
      const items = Array.from({ length: 50 }, (_, i) => i + 1);
      expect(paginateItems(items, 1, ADD_CARDS_PAGE_SIZE_ALL)).toHaveLength(16);
      expect(paginateItems(items, 4, ADD_CARDS_PAGE_SIZE_ALL)).toEqual([49, 50]);
    });

    it('clamps page to valid range', () => {
      const items = [1, 2, 3];
      expect(paginateItems(items, 99, 2)).toEqual([3]);
    });
  });

  describe('groupPageItemsByType', () => {
    it('groups consecutive items of the same type into one block', () => {
      const flat = flattenAddCardsSections(
        buildAddCardsSections(
          {
            characters: [card('c1', 'A'), card('c2', 'B')],
            'power-cards': [card('p1', 'C')],
          },
          '',
        ),
      );
      const pageItems = paginateItems(flat, 1, 10);
      const blocks = groupPageItemsByType(pageItems);

      expect(blocks).toHaveLength(2);
      expect(blocks[0].meta.type).toBe('characters');
      expect(blocks[0].cards).toHaveLength(2);
      expect(blocks[1].meta.type).toBe('power-cards');
      expect(blocks[1].cards).toHaveLength(1);
    });

    it('splits blocks when the same type reappears after another type on a page', () => {
      const pageItems = [
        { catalogType: 'characters' as const, card: card('c1', 'A') },
        { catalogType: 'power-cards' as const, card: card('p1', 'B') },
        { catalogType: 'characters' as const, card: card('c2', 'C') },
      ];
      const blocks = groupPageItemsByType(pageItems);

      expect(blocks).toHaveLength(3);
      expect(blocks.map((b) => b.meta.type)).toEqual(['characters', 'power-cards', 'characters']);
    });
  });

  describe('filterAndSortTypeCards', () => {
    it('filters and sorts a single type list', () => {
      const result = filterAndSortTypeCards(
        [card('2', 'Zeus'), card('1', 'Anubis')],
        'characters',
        'zeus',
      );

      expect(result.map((c) => c.id)).toEqual(['2']);
    });
  });

  describe('addCardsPageSizeForType', () => {
    it('uses 24 (8×3) for portrait catalog types', () => {
      expect(addCardsPageSizeForType('power-cards')).toBe(24);
    });

    it('uses 16 (8×2) for landscape catalog types', () => {
      expect(addCardsPageSizeForType('locations')).toBe(16);
      expect(addCardsPageSizeForType('characters')).toBe(16);
      expect(addCardsPageSizeForType('events')).toBe(16);
    });
  });

  describe('addCardsGridClassName', () => {
    it('returns landscape modifier for landscape types', () => {
      expect(addCardsGridClassName('locations')).toContain('add-cards__grid--landscape');
    });

    it('returns portrait modifier for portrait types', () => {
      expect(addCardsGridClassName('special-cards')).toContain('add-cards__grid--portrait');
    });
  });
});
