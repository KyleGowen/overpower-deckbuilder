import type { CatalogCard, CatalogType } from '../api/types';
import type { CatalogCardWithType } from '../catalog/useAllCatalogCards';
import { resolveDefaultCardForDeckAdd } from '../catalog/defaultCatalogCards';
import type { FoilCardMapLookup } from '../catalog/foilCatalog';
import { normalizeTournamentName } from './nameAliases';

function cardNameOf(card: CatalogCard): string {
  const n = card.name ?? card.card_name;
  return typeof n === 'string' ? n.trim() : '';
}

export interface ResolvedTournamentCard {
  card: CatalogCard;
  catalogType: CatalogType;
}

export interface ResolveTournamentCardOptions {
  foilLookup?: Pick<FoilCardMapLookup, 'foilToBase' | 'baseToFoil'>;
}

/**
 * Resolve a tournament canonical name to the default non-foil catalog printing
 * (same rules as deck add / DBV default representative).
 */
export function resolveTournamentCard(
  allCards: CatalogCardWithType[],
  canonicalName: string,
  expectedType?: CatalogType,
  options: ResolveTournamentCardOptions = {},
): ResolvedTournamentCard | null {
  const name = normalizeTournamentName(canonicalName);
  if (!name) return null;

  const tryTypes: CatalogType[] = expectedType
    ? [expectedType, 'characters', 'locations', 'special-cards']
    : ['characters', 'locations', 'special-cards'];

  const seen = new Set<CatalogType>();
  for (const type of tryTypes) {
    if (seen.has(type)) continue;
    seen.add(type);

    const hit = allCards.find(
      (row) => row.catalogType === type && cardNameOf(row.card) === name,
    );
    if (!hit) continue;

    const catalogSlice = allCards
      .filter((row) => row.catalogType === type)
      .map((row) => row.card);

    const card = resolveDefaultCardForDeckAdd(
      hit.card,
      type,
      catalogSlice,
      options.foilLookup,
    );

    return { card, catalogType: type };
  }

  return null;
}

export function isTournamentCardClickable(
  allCards: CatalogCardWithType[],
  name: string,
  catalogType: CatalogType,
): boolean {
  return resolveTournamentCard(allCards, name, catalogType) !== null;
}
