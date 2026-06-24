import {
  DBV_SWIPE_BLOCK_SELECTOR,
  DECK_EDITOR_SWIPE_BLOCK_SELECTOR,
} from '../../frontend/src/lib/layout/useHorizontalSwipe';

describe('DECK_EDITOR_SWIPE_BLOCK_SELECTOR', () => {
  it('blocks footer, tabs, and header controls', () => {
    expect(DECK_EDITOR_SWIPE_BLOCK_SELECTOR).toContain('.deck-editor__card-footer');
    expect(DECK_EDITOR_SWIPE_BLOCK_SELECTOR).toContain('.deck-editor__type-tabs');
    expect(DECK_EDITOR_SWIPE_BLOCK_SELECTOR).toContain('.deck-editor__topbar');
  });

  it('does not block card image buttons so swipe works on card art', () => {
    expect(DECK_EDITOR_SWIPE_BLOCK_SELECTOR).not.toContain('deck-editor__card-img');
    expect(DECK_EDITOR_SWIPE_BLOCK_SELECTOR).not.toContain('button');
  });
});

describe('DBV_SWIPE_BLOCK_SELECTOR', () => {
  it('blocks type tabs, header, filter rail, and pagination', () => {
    expect(DBV_SWIPE_BLOCK_SELECTOR).toContain('.db__types');
    expect(DBV_SWIPE_BLOCK_SELECTOR).toContain('.db__header');
    expect(DBV_SWIPE_BLOCK_SELECTOR).toContain('.dbv-filter-rail');
    expect(DBV_SWIPE_BLOCK_SELECTOR).toContain('.pagination');
  });

  it('does not blanket-block buttons so swipe works on card tiles', () => {
    expect(DBV_SWIPE_BLOCK_SELECTOR).not.toContain('button');
  });
});
