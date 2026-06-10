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

/** Resolve the display name across the differing name fields. */
export function cardDisplayName(card: Partial<CatalogCard> | null | undefined): string {
  if (!card) return '';
  return (card.name as string) || (card.card_name as string) || '(Unnamed card)';
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
