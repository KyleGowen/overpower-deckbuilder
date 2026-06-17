import {
  buildDeckCardIndex,
  deckCardDisplayName,
  normalizeDeckCardType,
  resolveDeckCatalogCard,
} from '../../frontend/src/lib/decks/deckCardCatalog';
import type { CatalogCard } from '../../frontend/src/lib/api/types';

const sampleCard = {
  id: 'abc-123',
  name: 'Silent Running',
  image_path: 'specials/silent_running.webp',
} as CatalogCard;

describe('deckCardCatalog', () => {
  it('normalizes underscore universe deck types', () => {
    expect(normalizeDeckCardType('ally_universe')).toBe('ally-universe');
    expect(normalizeDeckCardType('power')).toBe('power');
  });

  it('resolves catalog by normalized type, raw type, or id-only', () => {
    const index = buildDeckCardIndex(['ally-universe'], [[sampleCard]]);
    const entry = { type: 'ally_universe', cardId: 'abc-123' };

    expect(resolveDeckCatalogCard(entry, index)).toEqual(sampleCard);
    expect(resolveDeckCatalogCard({ type: 'power', cardId: 'abc-123' }, index)).toEqual(sampleCard);
  });

  it('uses a descriptive label when catalog row is missing', () => {
    const index = buildDeckCardIndex([], []);
    const entry = { type: 'teamwork', cardId: 'missing-id' };

    expect(deckCardDisplayName(entry, index)).toBe('Unknown Teamwork card');
  });

  it('prefers entry.name then catalog name', () => {
    const index = buildDeckCardIndex(['special'], [[sampleCard]]);
    expect(
      deckCardDisplayName({ type: 'special', cardId: 'abc-123', name: 'Saved name' }, index),
    ).toBe('Saved name');
    expect(deckCardDisplayName({ type: 'special', cardId: 'abc-123' }, index)).toBe('Silent Running');
  });
});
