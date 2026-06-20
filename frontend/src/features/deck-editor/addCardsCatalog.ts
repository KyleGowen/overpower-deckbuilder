import type { CatalogCard, CatalogType } from '../../lib/api/types';
import {
  CATALOG_TYPES,
  cardMatchesSearchQuery,
  compareCatalogCards,
  isLandscapeCatalogType,
  type CatalogTypeMeta,
} from '../../lib/catalog/catalogTypeMap';

export const ADD_CARDS_GRID_COLUMNS_PORTRAIT = 3;
export const ADD_CARDS_GRID_COLUMNS_LANDSCAPE = 2;
export const ADD_CARDS_PAGE_ROWS = 8;

/** Mobile: 8 rows × 1 column (single-column grids under `.layout-mobile`). */
export const ADD_CARDS_PAGE_SIZE_MOBILE = ADD_CARDS_PAGE_ROWS;

/** Portrait types: 8 rows × 3 columns. */
export const ADD_CARDS_PAGE_SIZE_GRID = ADD_CARDS_PAGE_ROWS * ADD_CARDS_GRID_COLUMNS_PORTRAIT;
/** Landscape types (characters, locations, events): 8 rows × 2 columns. */
export const ADD_CARDS_PAGE_SIZE_LANDSCAPE = ADD_CARDS_PAGE_ROWS * ADD_CARDS_GRID_COLUMNS_LANDSCAPE;
/** All tab: 8 rows at landscape width (2 cols) — avoids 48-card pages that stack 24 character rows. */
export const ADD_CARDS_PAGE_SIZE_ALL = ADD_CARDS_PAGE_SIZE_LANDSCAPE;

export function addCardsPageSizeForType(catalogType: CatalogType, isMobile = false): number {
  if (isMobile) return ADD_CARDS_PAGE_SIZE_MOBILE;
  return isLandscapeCatalogType(catalogType)
    ? ADD_CARDS_PAGE_SIZE_LANDSCAPE
    : ADD_CARDS_PAGE_SIZE_GRID;
}

export function addCardsPageSizeAll(isMobile = false): number {
  return isMobile ? ADD_CARDS_PAGE_SIZE_MOBILE : ADD_CARDS_PAGE_SIZE_ALL;
}

export function addCardsGridClassName(catalogType: CatalogType): string {
  return isLandscapeCatalogType(catalogType)
    ? 'add-cards__grid add-cards__grid--landscape'
    : 'add-cards__grid add-cards__grid--portrait';
}

export interface AddCardsSection {
  meta: CatalogTypeMeta;
  cards: CatalogCard[];
}

export interface AddCardsFlatItem {
  catalogType: CatalogType;
  card: CatalogCard;
}

export interface AddCardsPageBlock {
  meta: CatalogTypeMeta;
  cards: CatalogCard[];
}

/** Filter and sort cards for a single catalog type tab. */
export function filterAndSortTypeCards(
  cards: CatalogCard[],
  catalogType: CatalogType,
  searchQuery: string,
): CatalogCard[] {
  const q = searchQuery.trim();
  const result = cards.filter((c) => cardMatchesSearchQuery(c, q));
  result.sort((a, b) => compareCatalogCards(a, b, catalogType));
  return result;
}

/**
 * Build non-empty type sections in catalog order for the All tab.
 * Each section has its own isolated grid so portrait/landscape rows do not mix across types.
 */
export function buildAddCardsSections(
  cardsByType: Partial<Record<CatalogType, CatalogCard[]>>,
  searchQuery: string,
): AddCardsSection[] {
  const q = searchQuery.trim();
  const sections: AddCardsSection[] = [];

  for (const meta of CATALOG_TYPES) {
    const raw = cardsByType[meta.type] ?? [];
    const filtered = raw.filter((c) => cardMatchesSearchQuery(c, q));
    if (filtered.length === 0) continue;
    filtered.sort((a, b) => compareCatalogCards(a, b, meta.type));
    sections.push({ meta, cards: filtered });
  }

  return sections;
}

/** Flatten sections into a single list preserving catalog type order. */
export function flattenAddCardsSections(sections: AddCardsSection[]): AddCardsFlatItem[] {
  const items: AddCardsFlatItem[] = [];
  for (const section of sections) {
    for (const card of section.cards) {
      items.push({ catalogType: section.meta.type, card });
    }
  }
  return items;
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const maxPage = Math.max(1, Math.ceil(items.length / pageSize));
  const effectivePage = Math.min(Math.max(1, page), maxPage);
  const start = (effectivePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/** Regroup a page slice into consecutive type blocks for rendering isolated grids. */
export function groupPageItemsByType(pageItems: AddCardsFlatItem[]): AddCardsPageBlock[] {
  const blocks: AddCardsPageBlock[] = [];

  for (const item of pageItems) {
    const last = blocks[blocks.length - 1];
    if (last && last.meta.type === item.catalogType) {
      last.cards.push(item.card);
    } else {
      const meta = CATALOG_TYPES.find((m) => m.type === item.catalogType);
      if (!meta) continue;
      blocks.push({ meta, cards: [item.card] });
    }
  }

  return blocks;
}

/** Group flat catalog items (from useAllCatalogCards) into per-type arrays. */
export function groupAllCatalogByType(
  items: { card: CatalogCard; catalogType: CatalogType }[],
): Partial<Record<CatalogType, CatalogCard[]>> {
  const map: Partial<Record<CatalogType, CatalogCard[]>> = {};
  for (const { card, catalogType } of items) {
    if (!map[catalogType]) map[catalogType] = [];
    map[catalogType]!.push(card);
  }
  return map;
}
