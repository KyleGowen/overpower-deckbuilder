import {
  DECK_EDITOR_SECTION_ORDER,
  deckEditorCatalogTypes,
  deckEditorSectionIndex,
} from '../../frontend/src/lib/decks/deckEditorSectionOrder';

describe('deckEditorSectionOrder', () => {
  it('orders Characters → Location → Battleground → Special → Power → Mission → Event before universe types', () => {
    const labels = deckEditorCatalogTypes().map((m) => m.label);
    expect(labels.slice(0, 7)).toEqual([
      'Characters',
      'Locations',
      'Battlegrounds',
      'Special Cards',
      'Power Cards',
      'Missions',
      'Events',
    ]);
  });

  it('includes every deck card type exactly once', () => {
    expect(deckEditorCatalogTypes()).toHaveLength(DECK_EDITOR_SECTION_ORDER.length);
    const deckTypes = deckEditorCatalogTypes().map((m) => m.deckType);
    expect(new Set(deckTypes).size).toBe(deckTypes.length);
  });

  it('deckEditorSectionIndex returns stable sort keys', () => {
    expect(deckEditorSectionIndex('character')).toBeLessThan(deckEditorSectionIndex('location'));
    expect(deckEditorSectionIndex('location')).toBeLessThan(deckEditorSectionIndex('battleground'));
    expect(deckEditorSectionIndex('battleground')).toBeLessThan(deckEditorSectionIndex('special'));
    expect(deckEditorSectionIndex('special')).toBeLessThan(deckEditorSectionIndex('power'));
    expect(deckEditorSectionIndex('unknown-type')).toBe(DECK_EDITOR_SECTION_ORDER.length);
  });
});
