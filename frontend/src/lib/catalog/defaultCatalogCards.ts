import type { CatalogCard, CatalogType } from '../api/types';
import { cardCharacterName, cardDisplayName } from './catalogTypeMap';
import { dedupeFoilCatalogCards } from './foilCatalog';

export interface DefaultCatalogCardsResult {
  cards: CatalogCard[];
  /** Representative card id → all variant ids in the group (including representative). */
  variantIdsByRepresentative: Map<string, string[]>;
}

function cardImagePath(card: CatalogCard): string {
  return String(card.image_path ?? card.image ?? '');
}

/** True when the card row uses alternate art (path contains `alternate/`). */
export function isAlternateArtCard(card: CatalogCard): boolean {
  return cardImagePath(card).includes('alternate/');
}

function normalizeSet(set: string | undefined): string {
  const trimmed = (set ?? 'ERB').trim() || 'ERB';
  return trimmed === 'ERBP' ? 'ERB' : trimmed;
}

function compareDefaultRepresentative(a: CatalogCard, b: CatalogCard, catalogType: CatalogType): number {
  if (catalogType === 'power-cards') {
    const aSet = normalizeSet(a.set as string | undefined);
    const bSet = normalizeSet(b.set as string | undefined);
    const aIsErb = aSet === 'ERB';
    const bIsErb = bSet === 'ERB';
    if (aIsErb !== bIsErb) return aIsErb ? -1 : 1;
  }

  const aIsAlternate = isAlternateArtCard(a);
  const bIsAlternate = isAlternateArtCard(b);
  if (aIsAlternate !== bIsAlternate) return aIsAlternate ? 1 : -1;

  return 0;
}

function variantGroupKey(card: CatalogCard, catalogType: CatalogType): string | null {
  const name = cardDisplayName(card).trim();
  if (!name) return null;

  switch (catalogType) {
    case 'characters':
      return `${name}|${normalizeSet(card.set as string | undefined)}`;
    case 'special-cards': {
      const character = cardCharacterName(card) || 'Any Character';
      return `${character}|${name}`;
    }
    case 'power-cards': {
      const powerType = String(card.power_type ?? '').trim();
      const value = String(card.value ?? '').trim();
      if (!powerType) return null;
      return `${powerType}|${value}`;
    }
    case 'locations':
      return name;
    default:
      return `${name}|${normalizeSet(card.set as string | undefined)}`;
  }
}

function pickDefaultRepresentative(group: CatalogCard[], catalogType: CatalogType): CatalogCard {
  return group.slice().sort((a, b) => compareDefaultRepresentative(a, b, catalogType))[0];
}

/**
 * One row per logical card: keep the default (non-alternate) representative per variant group.
 */
export function dedupeToDefaultCatalogCards(
  cards: CatalogCard[],
  catalogType: CatalogType,
): DefaultCatalogCardsResult {
  const groups = new Map<string, CatalogCard[]>();

  for (const card of cards) {
    const key = variantGroupKey(card, catalogType);
    if (!key) continue;
    const list = groups.get(key);
    if (list) {
      list.push(card);
    } else {
      groups.set(key, [card]);
    }
  }

  const result: CatalogCard[] = [];
  const variantIdsByRepresentative = new Map<string, string[]>();

  for (const group of groups.values()) {
    const representative = pickDefaultRepresentative(group, catalogType);
    const variantIds = group.map((c) => c.id);
    result.push(representative);
    variantIdsByRepresentative.set(representative.id, variantIds);
  }

  return { cards: result, variantIdsByRepresentative };
}

/**
 * Foil dedup then alternate-art dedup for Add Cards catalog lists.
 */
export function prepareAddCardsCatalogList(
  cards: CatalogCard[],
  catalogType: CatalogType,
  foilToBase: Map<string, string>,
): DefaultCatalogCardsResult {
  const foilDeduped = dedupeFoilCatalogCards(cards, foilToBase);
  return dedupeToDefaultCatalogCards(foilDeduped, catalogType);
}

/** Sum deck quantities for any variant id in the representative's group. */
export function qtyInDeckForRepresentative(
  representative: CatalogCard,
  catalogType: CatalogType,
  deckCards: { type: string; cardId: string; quantity: number }[],
  deckType: string,
  variantIdsByRepresentative: Map<string, string[]>,
): number {
  const variantIds = variantIdsByRepresentative.get(representative.id) ?? [representative.id];
  const variantSet = new Set(variantIds);
  return deckCards
    .filter((c) => c.type === deckType && variantSet.has(c.cardId))
    .reduce((sum, c) => sum + c.quantity, 0);
}
