import type { CatalogCard, CatalogType } from '../../lib/api/types';
import { cardCharacterName, isAnyCharacterName } from '../../lib/catalog/catalogTypeMap';

/** Cataclysm / Assist / Ambush apply only to Any Character specials. */
const ANY_CHARACTER_ONLY_FIELDS = new Set(['is_cataclysm', 'is_assist', 'is_ambush']);

/** Secondary rule/administrative metadata collapsed under "More" in the drawer. */
const MORE_DETAIL_FIELDS = new Set([
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
]);

export function isMoreCardDetailField(key: string): boolean {
  return MORE_DETAIL_FIELDS.has(key);
}

export function shouldShowCardDetailField(
  key: string,
  type: CatalogType | null,
  card: CatalogCard,
): boolean {
  if (!ANY_CHARACTER_ONLY_FIELDS.has(key)) return true;
  return type === 'special-cards' && isAnyCharacterName(cardCharacterName(card));
}
