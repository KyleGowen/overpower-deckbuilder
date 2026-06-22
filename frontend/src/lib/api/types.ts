/**
 * Shared API/data types for the Excelsior SPA.
 *
 * These mirror the backend `/api/v1` response shapes documented in API_V1.md.
 * Catalog rows vary per card type, so `CatalogCard` keeps the common fields
 * typed and allows arbitrary extra fields (used by the detail slide-out, which
 * shows every available field for a card).
 */

export type UserRole = 'GUEST' | 'USER' | 'ADMIN';

export interface AppUser {
  id: string;
  username: string;
  email?: string | null;
  role: UserRole;
  lastLoginAt?: string | null;
  authProvider?: string | null;
}

export interface AppConfig {
  cdnBase: string;
  communityDecksUserId?: string | null;
  tournamentDecksUserId?: string | null;
}

export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | (string & {});

/** Catalog endpoint slugs (the `/api/v1/catalog/<slug>` path segment). */
export type CatalogType =
  | 'characters'
  | 'special-cards'
  | 'power-cards'
  | 'locations'
  | 'missions'
  | 'events'
  | 'aspects'
  | 'advanced-universe'
  | 'teamwork'
  | 'ally-universe'
  | 'training'
  | 'basic-universe';

/** Deck `card_type` values (hyphenated form used by deck APIs). */
export type DeckCardType =
  | 'character'
  | 'special'
  | 'power'
  | 'location'
  | 'mission'
  | 'event'
  | 'aspect'
  | 'advanced-universe'
  | 'teamwork'
  | 'ally-universe'
  | 'training'
  | 'basic-universe';

/** Collection `card_type` values (underscored form used by collection APIs). */
export type CollectionCardType =
  | 'character'
  | 'special'
  | 'power'
  | 'location'
  | 'mission'
  | 'event'
  | 'aspect'
  | 'advanced_universe'
  | 'teamwork'
  | 'ally_universe'
  | 'training'
  | 'basic_universe';

export interface CatalogCard {
  id: string;
  /** Characters/specials/power/missions/events use `name`. */
  name?: string;
  /** Special cards: linked character (`character_name` in DB). */
  character?: string;
  /** Aspects/ally/training/basic-universe use `card_name`. */
  card_name?: string;
  set?: string;
  set_number?: string | null;
  rarity?: CardRarity | null;
  image?: string;
  image_path?: string;
  is_foil?: boolean;

  /* Character / stat fields */
  energy?: number;
  combat?: number;
  brute_force?: number;
  intelligence?: number;
  threat_level?: number;
  special_abilities?: string;

  /* Common per-type ability/effect text */
  special_ability?: string;
  card_effect?: string;
  game_effect?: string;
  flavor_text?: string;
  card_text?: string;

  one_per_deck?: boolean;
  is_one_per_deck?: boolean;

  /** Per-type extra fields (e.g. acts_as, to_use, value, icons...). */
  [key: string]: unknown;
}

export interface SetInfo {
  code: string;
  name: string;
}

export interface DeckCardEntry {
  id?: string;
  type: DeckCardType;
  cardId: string;
  quantity: number;
  /** Client-only deck-editor tile id (one tile per instance; not sent to API). */
  instanceId?: string;
  exclude_from_draw?: boolean;
  name?: string;
  defaultImage?: string;
  is_foil?: boolean;
}

export interface DeckMetadata {
  id: string;
  name: string;
  description?: string | null;
  created?: string;
  lastModified?: string;
  cardCount: number;
  threat?: number;
  is_valid?: boolean;
  userId: string;
  isOwner: boolean;
  is_limited?: boolean;
  reserve_character?: string | null;
  display_mission_card_id?: string | null;
  background_image_path?: string | null;
  uiPreferences?: Record<string, unknown> | null;
}

export interface DeckDetail {
  metadata: DeckMetadata;
  cards: DeckCardEntry[];
}

/** Deck list tiles include a small preview-card array (characters etc.). */
export type DeckListItem = DeckDetail;

export interface CollectionCard {
  id: string;
  collection_id: string;
  card_id: string;
  card_type: CollectionCardType;
  quantity: number;
  image_path: string;
  card_name?: string;
  set?: string;
  card_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface DeckValidationResult {
  valid: boolean;
  message?: string;
  validationErrors?: string[];
}

/** Home screen "Recent Updates" card from `GET /api/v1/recent-updates`. */
export interface RecentUpdate {
  id: string;
  title: string;
  type: string;
  description: string;
  cardImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
