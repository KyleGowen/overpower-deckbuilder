import { COLLECTION_DEFAULT_TAB } from '../../../frontend/src/features/collection/collectionDefaults';

describe('Collection default tab', () => {
  it('opens the Collection page on the All tab', () => {
    expect(COLLECTION_DEFAULT_TAB).toBe('all');
  });
});
