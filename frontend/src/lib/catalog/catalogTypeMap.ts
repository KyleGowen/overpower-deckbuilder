/**
 * Single source of truth for card-type mapping across the three vocabularies:
 *  - catalog slug   : `/api/v1/catalog/<slug>` path + tab identity
 *  - deck cardType  : hyphenated, used by deck APIs
 *  - collection type: underscored, used by collection APIs
 * plus user-facing labels and display helpers.
 */
import type {
  CatalogType,
  DeckCardType,
  CollectionCardType,
  CatalogCard,
} from '../api/types';

/** Per-type catalog tab or cross-type All list tab. */
export type CatalogTabSelection = CatalogType | 'all';

export interface CatalogTypeMeta {
  type: CatalogType;
  label: string;
  /** Short label for compact UIs (chips/tabs). */
  shortLabel: string;
  deckType: DeckCardType;
  collectionType: CollectionCardType;
}

export const CATALOG_TYPES: CatalogTypeMeta[] = [
  { type: 'characters', label: 'Characters', shortLabel: 'Characters', deckType: 'character', collectionType: 'character' },
  { type: 'special-cards', label: 'Special Cards', shortLabel: 'Special', deckType: 'special', collectionType: 'special' },
  { type: 'power-cards', label: 'Power Cards', shortLabel: 'Power', deckType: 'power', collectionType: 'power' },
  { type: 'locations', label: 'Locations', shortLabel: 'Locations', deckType: 'location', collectionType: 'location' },
  { type: 'missions', label: 'Missions', shortLabel: 'Missions', deckType: 'mission', collectionType: 'mission' },
  { type: 'events', label: 'Events', shortLabel: 'Events', deckType: 'event', collectionType: 'event' },
  { type: 'aspects', label: 'Aspects', shortLabel: 'Aspects', deckType: 'aspect', collectionType: 'aspect' },
  { type: 'advanced-universe', label: 'Universe: Advanced', shortLabel: 'Advanced', deckType: 'advanced-universe', collectionType: 'advanced_universe' },
  { type: 'teamwork', label: 'Universe: Teamwork', shortLabel: 'Teamwork', deckType: 'teamwork', collectionType: 'teamwork' },
  { type: 'ally-universe', label: 'Universe: Ally', shortLabel: 'Ally', deckType: 'ally-universe', collectionType: 'ally_universe' },
  { type: 'training', label: 'Universe: Training', shortLabel: 'Training', deckType: 'training', collectionType: 'training' },
  { type: 'basic-universe', label: 'Universe: Basic', shortLabel: 'Basic', deckType: 'basic-universe', collectionType: 'basic_universe' },
];

export const CATALOG_TYPE_BY_SLUG: Record<CatalogType, CatalogTypeMeta> = CATALOG_TYPES.reduce(
  (acc, meta) => {
    acc[meta.type] = meta;
    return acc;
  },
  {} as Record<CatalogType, CatalogTypeMeta>,
);

const DECK_TYPE_TO_META: Record<string, CatalogTypeMeta> = CATALOG_TYPES.reduce(
  (acc, meta) => {
    acc[meta.deckType] = meta;
    return acc;
  },
  {} as Record<string, CatalogTypeMeta>,
);

export function metaForDeckType(deckType: string): CatalogTypeMeta | undefined {
  return DECK_TYPE_TO_META[deckType];
}

export function labelForCatalogType(type: CatalogType): string {
  return CATALOG_TYPE_BY_SLUG[type]?.label ?? type;
}

/** Characters have explicit stats; this gates stat columns / panels. */
export function isStatCardType(type: CatalogType): boolean {
  return type === 'characters';
}

/** Character, location, and event art use landscape tiles in the database grid. */
export function isLandscapeCatalogType(type: CatalogType): boolean {
  return type === 'characters' || type === 'locations' || type === 'events';
}

/**
 * Portrait DB tabs (5:7 tiles) use portrait preset thumbs (350×490 contain) in progressive load.
 * Landscape tabs (characters, locations, events) use landscape thumbs.
 */
export function catalogTypeUsesPortraitThumb(type: CatalogType): boolean {
  return !isLandscapeCatalogType(type);
}

/** Resolve the display name across the differing name fields. */
export function cardDisplayName(card: Partial<CatalogCard> | null | undefined): string {
  if (!card) return '';
  return (card.name as string) || (card.card_name as string) || '(Unnamed card)';
}

/** Linked character on special cards (`character` in the v1 API). */
export function cardCharacterName(card: Partial<CatalogCard> | null | undefined): string {
  if (!card) return '';
  return String((card.character as string) ?? (card.character_name as string) ?? '').trim();
}

function isAnyCharacterName(value: string): boolean {
  return value.trim().toLowerCase() === 'any character';
}

export function compareCharacterNames(a: string, b: string): number {
  const aIsAny = isAnyCharacterName(a);
  const bIsAny = isAnyCharacterName(b);
  if (aIsAny !== bIsAny) return aIsAny ? 1 : -1;
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

/** Default database grid sort order per catalog tab (no user sort control). */
export function compareCatalogCards(a: CatalogCard, b: CatalogCard, type: CatalogType): number {
  if (type === 'special-cards') {
    const setCmp = String(a.set ?? '').localeCompare(String(b.set ?? ''), undefined, { sensitivity: 'base' });
    if (setCmp !== 0) return setCmp;

    const charCmp = compareCharacterNames(cardCharacterName(a), cardCharacterName(b));
    if (charCmp !== 0) return charCmp;

    return cardDisplayName(a).localeCompare(cardDisplayName(b), undefined, { sensitivity: 'base' });
  }

  return cardDisplayName(a).localeCompare(cardDisplayName(b), undefined, { sensitivity: 'base' });
}

export interface StatLine {
  energy: number;
  combat: number;
  bruteForce: number;
  intelligence: number;
  total: number;
}

export function cardStats(card: Partial<CatalogCard> | null | undefined): StatLine | null {
  if (!card) return null;
  const has =
    card.energy !== undefined ||
    card.combat !== undefined ||
    card.brute_force !== undefined ||
    card.intelligence !== undefined;
  if (!has) return null;
  const energy = Number(card.energy ?? 0);
  const combat = Number(card.combat ?? 0);
  const bruteForce = Number(card.brute_force ?? 0);
  const intelligence = Number(card.intelligence ?? 0);
  return {
    energy,
    combat,
    bruteForce,
    intelligence,
    total: energy + combat + bruteForce + intelligence,
  };
}

/** Best-effort inherent/ability text shown in lists + detail. */
export function cardAbilityText(card: Partial<CatalogCard> | null | undefined): string {
  if (!card) return '';
  return (
    (card.special_abilities as string) ||
    (card.special_ability as string) ||
    (card.card_effect as string) ||
    (card.game_effect as string) ||
    (card.card_text as string) ||
    ''
  );
}

/** Fields scanned by the database view top search bar (name, character, text, abilities). */
const DBV_SEARCH_TEXT_FIELDS: (keyof CatalogCard)[] = [
  'special_abilities',
  'special_ability',
  'card_effect',
  'card_text',
  'card_description',
  'aspect_description',
  'game_effect',
];

function cardSearchTextFields(card: Partial<CatalogCard>): string[] {
  return DBV_SEARCH_TEXT_FIELDS.map((key) => String(card[key] ?? '').trim()).filter(Boolean);
}

/** Lowercase haystack for DBV text search across name, character, and card text/abilities. */
export function cardSearchHaystack(card: Partial<CatalogCard> | null | undefined): string {
  if (!card) return '';
  return [
    cardDisplayName(card),
    cardCharacterName(card),
    ...cardSearchTextFields(card),
  ]
    .join(' ')
    .toLowerCase();
}

export function cardMatchesSearchQuery(
  card: Partial<CatalogCard> | null | undefined,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return cardSearchHaystack(card).includes(q);
}
