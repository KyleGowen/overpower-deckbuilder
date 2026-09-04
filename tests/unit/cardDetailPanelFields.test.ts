import type { CatalogCard } from '../../frontend/src/lib/api/types';
import {
  isMoreCardDetailField,
  shouldShowCardDetailField,
} from '../../frontend/src/components/CardDetailPanel/cardDetailFields';

const specialCard = (overrides: Partial<CatalogCard> = {}): CatalogCard => ({
  id: 'special-1',
  name: 'Test Special',
  character: 'Batman',
  is_cataclysm: false,
  is_assist: false,
  is_ambush: false,
  ...overrides,
});

describe('isMoreCardDetailField', () => {
  it.each([
    'one_per_deck',
    'is_one_per_deck',
    'icon_offensive_swords',
    'icon_defensive_shield',
    'icon_remainder_of_battle',
    'icon_remainder_of_game',
    'icon_attached_paperclip',
    'icon_astral_plane',
    'icon_first_action_only',
    'banned',
  ])('places %s in the collapsed More section', (field) => {
    expect(isMoreCardDetailField(field)).toBe(true);
  });

  it.each(['character', 'set_number', 'rarity', 'is_cataclysm'])('keeps %s visible', (field) => {
    expect(isMoreCardDetailField(field)).toBe(false);
  });
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
