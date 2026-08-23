/**
 * Typed interfaces for catalog item rows returned by the v1 catalog endpoints.
 * All fields match the database column / transform output exactly; nullable
 * columns are typed `string | null` or `number | null`.
 *
 * These interfaces are consumed by the catalog DTO types and can be imported by
 * frontend SDK generators, integration tests, or the OpenAPI spec.
 */

export interface CatalogCharacterItem {
  id: string;
  name: string;
  set: string;
  set_number: string | null;
  rarity: string | null;
  energy: number;
  combat: number;
  brute_force: number;
  intelligence: number;
  threat_level: number;
  special_abilities: string;
  image: string;
  image_path: string;
  reverse_image_path: string | null;
  is_foil: boolean;
}

export interface CatalogLocationItem {
  id: string;
  name: string;
  threat_level: number;
  special_ability: string;
  image: string;
  image_path: string;
  set: string;
  set_number: string | null;
  rarity: string | null;
}

/** Shared shape for special-cards, events, aspects, UA, TW, Ally, Training, Basic Universe. */
export interface CatalogSpecialCardItem {
  id: string;
  name: string;
  character: string;
  card_effect: string;
  image: string;
  image_path: string;
  set: string;
  set_number: string | null;
  rarity: string | null;
  icons: string[];
  value: number | null;
  is_cataclysm: boolean;
  is_assist: boolean;
  is_ambush: boolean;
  one_per_deck: boolean;
  icon_offensive_swords: boolean;
  icon_defensive_shield: boolean;
  icon_remainder_of_battle: boolean;
  icon_remainder_of_game: boolean;
  icon_attached_paperclip: boolean;
  icon_astral_plane: boolean;
  icon_first_action_only: boolean;
  banned: boolean;
  is_foil: boolean;
}

export interface CatalogMissionItem {
  id: string;
  mission_set: string;
  card_name: string;
  name: string;
  image: string;
  image_path: string;
  set: string;
  set_number: string | null;
  rarity: string | null;
  is_foil: boolean;
}

export interface CatalogPowerCardItem {
  id: string;
  name: string;
  power_type: string;
  value: number;
  image: string;
  image_path: string;
  set: string;
  set_number: string | null;
  rarity: string | null;
  set_name: string;
  one_per_deck: boolean;
  is_foil: boolean;
}

export interface CatalogFoilCardMapItem {
  foilCardId: string;
  baseCardId: string;
  cardType: string;
}
