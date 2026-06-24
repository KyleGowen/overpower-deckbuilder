import { DBV_TAB_ORDER } from '../../frontend/src/lib/catalog/catalogTypeMap';
import { stepCyclicalIndex } from '../../frontend/src/lib/layout/cyclicalIndex';

function tabAfterSwipe(tab: (typeof DBV_TAB_ORDER)[number], delta: 1 | -1) {
  const idx = DBV_TAB_ORDER.indexOf(tab);
  return DBV_TAB_ORDER[stepCyclicalIndex(idx >= 0 ? idx : 0, DBV_TAB_ORDER.length, delta)];
}

describe('DBV_TAB_ORDER', () => {
  it('lists All first then catalog types in CATALOG_TYPES order', () => {
    expect(DBV_TAB_ORDER).toHaveLength(13);
    expect(DBV_TAB_ORDER[0]).toBe('all');
    expect(DBV_TAB_ORDER[12]).toBe('basic-universe');
    expect(DBV_TAB_ORDER[1]).toBe('characters');
  });
});

describe('DBV mobile tab swipe cycling', () => {
  it('swipe right from All wraps to Basic', () => {
    expect(tabAfterSwipe('all', -1)).toBe('basic-universe');
  });

  it('swipe left from Basic wraps to All', () => {
    expect(tabAfterSwipe('basic-universe', 1)).toBe('all');
  });

  it('swipe left from Characters goes to Special Cards', () => {
    expect(tabAfterSwipe('characters', 1)).toBe('special-cards');
  });

  it('swipe left from All goes to Characters', () => {
    expect(tabAfterSwipe('all', 1)).toBe('characters');
  });
});
