import {
  buildPages,
  MAX_COLLAPSED_PAGE_SLOTS,
  normalizePageSlots,
  type PageSlot,
} from '../../frontend/src/components/Pagination/paginationUtils';

describe('pagination', () => {
  describe('buildPages', () => {
    it('returns all pages when total is 7 or fewer', () => {
      expect(buildPages(1, 1)).toEqual([1]);
      expect(buildPages(2, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(buildPages(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('collapses with ellipses when total exceeds 7', () => {
      expect(buildPages(1, 12)).toEqual([1, 2, 'ellipsis', 12]);
      expect(buildPages(2, 12)).toEqual([1, 2, 3, 'ellipsis', 12]);
      expect(buildPages(3, 12)).toEqual([1, 2, 3, 4, 'ellipsis', 12]);
      expect(buildPages(4, 12)).toEqual([1, 'ellipsis', 3, 4, 5, 'ellipsis', 12]);
      expect(buildPages(11, 12)).toEqual([1, 'ellipsis', 10, 11, 12]);
      expect(buildPages(12, 12)).toEqual([1, 'ellipsis', 11, 12]);
    });
  });

  describe('normalizePageSlots', () => {
    it('returns unpadded slots when totalPages is 7 or fewer', () => {
      expect(normalizePageSlots(2, 5)).toEqual([
        { type: 'page', value: 1 },
        { type: 'page', value: 2 },
        { type: 'page', value: 3 },
        { type: 'page', value: 4 },
        { type: 'page', value: 5 },
      ]);
    });

    it('pads to exactly 7 slots when totalPages exceeds 7', () => {
      expect(normalizePageSlots(1, 12)).toHaveLength(MAX_COLLAPSED_PAGE_SLOTS);
      expect(normalizePageSlots(4, 12)).toHaveLength(MAX_COLLAPSED_PAGE_SLOTS);
    });

    it('pads symmetrically for 5-slot collapsed layouts', () => {
      const slots = normalizePageSlots(1, 12);
      expect(slots[0]).toEqual({ type: 'empty' });
      expect(slots[1]).toEqual({ type: 'page', value: 1 });
      expect(slots[2]).toEqual({ type: 'page', value: 2 });
      expect(slots[3]).toEqual({ type: 'ellipsis' });
      expect(slots[4]).toEqual({ type: 'page', value: 12 });
      expect(slots[5]).toEqual({ type: 'empty' });
      expect(slots[6]).toEqual({ type: 'empty' });
    });

    it('does not pad when collapsed layout already has 7 slots', () => {
      const slots = normalizePageSlots(4, 12);
      expect(slots.filter((s: PageSlot) => s.type === 'empty')).toHaveLength(0);
      expect(slots).toEqual([
        { type: 'page', value: 1 },
        { type: 'ellipsis' },
        { type: 'page', value: 3 },
        { type: 'page', value: 4 },
        { type: 'page', value: 5 },
        { type: 'ellipsis' },
        { type: 'page', value: 12 },
      ]);
    });
  });
});
