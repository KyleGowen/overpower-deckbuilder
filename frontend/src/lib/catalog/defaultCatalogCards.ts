import type { CatalogCard, CatalogType } from '../api/types';
import { cardCharacterName, cardDisplayName } from './catalogTypeMap';
import { dedupeFoilCatalogCards, isFoilCard, type FoilCardMapLookup } from './foilCatalog';

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

/** Sort key for checklist # (209, 519, 519F). Missing # sorts last. */
function setNumberSortTuple(setNumRaw: string | null | undefined): [number, number, string] {
  const s = setNumRaw != null ? String(setNumRaw).trim().toUpperCase() : '';
  if (!s) return [Number.MAX_SAFE_INTEGER, 1, ''];
  const foil = s.endsWith('F');
  const core = foil ? s.slice(0, -1) : s;
  const n = parseInt(core, 10);
  const num = Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
  const foilOrder = foil ? 1 : 0;
  return [num, foilOrder, s];
}

function compareDefaultRepresentative(a: CatalogCard, b: CatalogCard, catalogType: CatalogType): number {
  const aFoil = isFoilCard(a);
  const bFoil = isFoilCard(b);
  if (aFoil !== bFoil) return aFoil ? 1 : -1;

  const aIsAlternate = isAlternateArtCard(a);
  const bIsAlternate = isAlternateArtCard(b);
  if (aIsAlternate !== bIsAlternate) return aIsAlternate ? 1 : -1;

  const [numA, foilSuffixA, rawA] = setNumberSortTuple(a.set_number as string | null | undefined);
  const [numB, foilSuffixB, rawB] = setNumberSortTuple(b.set_number as string | null | undefined);
  if (numA !== numB) return numA - numB;
  if (foilSuffixA !== foilSuffixB) return foilSuffixA - foilSuffixB;
  const numCmp = rawA.localeCompare(rawB);
  if (numCmp !== 0) return numCmp;

  if (catalogType === 'power-cards') {
    const aSet = normalizeSet(a.set as string | undefined);
    const bSet = normalizeSet(b.set as string | undefined);
    const aIsErb = aSet === 'ERB';
    const bIsErb = bSet === 'ERB';
    if (aIsErb !== bIsErb) return aIsErb ? -1 : 1;
  }

  return 0;
}

/** Logical variant group key for alternate-art / cross-set printings. */
export function variantGroupKey(card: CatalogCard, catalogType: CatalogType): string | null {
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
    case 'teamwork': {
      const toUse = String(card.to_use ?? name).trim();
      const followup = String(
        card.followup_attack_types ?? card.follow_up_attack_types ?? '',
      ).trim();
      if (!toUse) return null;
      return `${toUse}|${followup}`;
    }
    default:
      return `${name}|${normalizeSet(card.set as string | undefined)}`;
  }
}

function pickDefaultRepresentative(group: CatalogCard[], catalogType: CatalogType): CatalogCard {
  return group.slice().sort((a, b) => compareDefaultRepresentative(a, b, catalogType))[0];
}

/**
 * Resolve the catalog row to store when adding a card to a deck: non-foil when available,
 * otherwise foil-only; prefer default (non-alternate) art; lowest checklist # among ties.
 */
export function resolveDefaultCardForDeckAdd(
  card: CatalogCard,
  catalogType: CatalogType,
  allCatalogCards: CatalogCard[],
  foilLookup?: Pick<FoilCardMapLookup, 'foilToBase' | 'baseToFoil'>,
): CatalogCard {
  const foilToBase = foilLookup?.foilToBase ?? new Map<string, string>();
  const baseToFoil = foilLookup?.baseToFoil ?? new Map<string, string>();

  const anchor = (() => {
    if (isFoilCard(card)) {
      const baseId = foilToBase.get(card.id);
      if (baseId) {
        const base = allCatalogCards.find((c) => c.id === baseId);
        if (base) return base;
      }
      return card;
    }
    return card;
  })();

  const key = variantGroupKey(anchor, catalogType);
  if (!key) return card;

  const group: CatalogCard[] = [];
  const seen = new Set<string>();
  const add = (row: CatalogCard | undefined) => {
    if (!row || seen.has(row.id)) return;
    seen.add(row.id);
    group.push(row);
  };

  for (const row of allCatalogCards) {
    if (variantGroupKey(row, catalogType) === key) {
      add(row);
    }
  }

  for (const row of [...group]) {
    if (!isFoilCard(row)) {
      add(allCatalogCards.find((c) => c.id === baseToFoil.get(row.id)));
    }
  }

  if (group.length === 0) return card;
  return pickDefaultRepresentative(group, catalogType);
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
