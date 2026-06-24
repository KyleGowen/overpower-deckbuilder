import type { CatalogCard } from '../../frontend/src/lib/api/types';
import { shouldShowCardDetailField } from '../../frontend/src/components/CardDetailPanel/cardDetailFields';

const specialCard = (overrides: Partial<CatalogCard> = {}): CatalogCard => ({
  id: 'special-1',
  name: 'Test Special',
  character: 'Batman',
  is_cataclysm: false,
  is_assist: false,
  is_ambush: false,
  ...overrides,
});

describe('shouldShowCardDetailField', () => {
  it('hides cataclysm/assist/ambush for character-linked specials', () => {
    const card = specialCard({ character: 'Batman' });
    expect(shouldShowCardDetailField('is_cataclysm', 'special-cards', card)).toBe(false);
    expect(shouldShowCardDetailField('is_assist', 'special-cards', card)).toBe(false);
    expect(shouldShowCardDetailField('is_ambush', 'special-cards', card)).toBe(false);
  });

  it('shows cataclysm/assist/ambush for Any Character specials', () => {
    const card = specialCard({ character: 'Any Character' });
    expect(shouldShowCardDetailField('is_cataclysm', 'special-cards', card)).toBe(true);
    expect(shouldShowCardDetailField('is_assist', 'special-cards', card)).toBe(true);
    expect(shouldShowCardDetailField('is_ambush', 'special-cards', card)).toBe(true);
  });

  it('shows cataclysm when true on Any Character specials', () => {
    const card = specialCard({ character: 'Any Character', is_cataclysm: true });
    expect(shouldShowCardDetailField('is_cataclysm', 'special-cards', card)).toBe(true);
  });

  it('hides cataclysm/assist/ambush for non-special card types', () => {
    const card = specialCard({ character: 'Any Character' });
    expect(shouldShowCardDetailField('is_cataclysm', 'characters', card)).toBe(false);
  });

  it('always shows unrelated detail fields', () => {
    const card = specialCard({ character: 'Batman' });
    expect(shouldShowCardDetailField('character', 'special-cards', card)).toBe(true);
    expect(shouldShowCardDetailField('set_number', 'special-cards', card)).toBe(true);
  });
});
