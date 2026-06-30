import {
  ADD_CARDS_SWIPE_BLOCK_SELECTOR,
  COLLECTION_SWIPE_BLOCK_SELECTOR,
  DBV_SWIPE_BLOCK_SELECTOR,
  DECK_EDITOR_SWIPE_BLOCK_SELECTOR,
} from '../../frontend/src/lib/layout/swipeBlockSelectors';

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

describe('COLLECTION_SWIPE_BLOCK_SELECTOR', () => {
  it('blocks type tabs, header, pagination, and quantity steppers', () => {
    expect(COLLECTION_SWIPE_BLOCK_SELECTOR).toContain('.col__types');
    expect(COLLECTION_SWIPE_BLOCK_SELECTOR).toContain('.col__header');
    expect(COLLECTION_SWIPE_BLOCK_SELECTOR).toContain('.pagination');
    expect(COLLECTION_SWIPE_BLOCK_SELECTOR).toContain('.qty-stepper');
  });

  it('does not blanket-block buttons so swipe works on card tiles', () => {
    expect(COLLECTION_SWIPE_BLOCK_SELECTOR).not.toContain('button');
  });
});

describe('ADD_CARDS_SWIPE_BLOCK_SELECTOR', () => {
  it('blocks type tabs, search, filters, pagination, and slide-out chrome', () => {
    expect(ADD_CARDS_SWIPE_BLOCK_SELECTOR).toContain('.add-cards__types');
    expect(ADD_CARDS_SWIPE_BLOCK_SELECTOR).toContain('.add-cards__search');
    expect(ADD_CARDS_SWIPE_BLOCK_SELECTOR).toContain('.add-cards__filters');
    expect(ADD_CARDS_SWIPE_BLOCK_SELECTOR).toContain('.add-cards__pagination');
    expect(ADD_CARDS_SWIPE_BLOCK_SELECTOR).toContain('.add-cards__qty');
    expect(ADD_CARDS_SWIPE_BLOCK_SELECTOR).toContain('.add-cards__add');
    expect(ADD_CARDS_SWIPE_BLOCK_SELECTOR).toContain('.slideout__header');
    expect(ADD_CARDS_SWIPE_BLOCK_SELECTOR).toContain('.slideout__footer');
  });

  it('does not blanket-block buttons so swipe works on card tiles', () => {
    expect(ADD_CARDS_SWIPE_BLOCK_SELECTOR).not.toContain('button');
  });
});
