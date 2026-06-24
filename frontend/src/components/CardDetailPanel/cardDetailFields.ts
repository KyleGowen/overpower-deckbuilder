import type { CatalogCard, CatalogType } from '../../lib/api/types';
import { cardCharacterName, isAnyCharacterName } from '../../lib/catalog/catalogTypeMap';

/** Cataclysm / Assist / Ambush apply only to Any Character specials. */
const ANY_CHARACTER_ONLY_FIELDS = new Set(['is_cataclysm', 'is_assist', 'is_ambush']);

export function shouldShowCardDetailField(
  key: string,
  type: CatalogType | null,
  card: CatalogCard,
): boolean {
  if (!ANY_CHARACTER_ONLY_FIELDS.has(key)) return true;
  return type === 'special-cards' && isAnyCharacterName(cardCharacterName(card));
}
