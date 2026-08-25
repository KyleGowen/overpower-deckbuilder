/** Shared types for deck JSON import (v2.0 export contract). */

export interface ImportCardEntry {
  name: string;
  type: string;
  followup_attack_types?: string;
  stat_to_use?: string | null;
  stat_type_to_use?: string | null;
  type_1?: string | null;
  type_2?: string | null;
  bonus?: string | null;
  type_field?: string | null;
  value_to_use?: string | null;
}

export interface ImportDeckCardsJson {
  characters?: string[];
  special_cards?: Record<string, string[]>;
  locations?: string[];
  battlegrounds?: string[];
  missions?: Record<string, string[]>;
  events?: Record<string, string[]>;
  aspects?: string[];
  advanced_universe?: Record<string, string[]>;
  teamwork?: string[];
  allies?: string[];
  training?: string[];
  basic_universe?: string[];
  power_cards?: string[];
}

export interface ImportDeckJson {
  name?: string;
  description?: string;
  limited?: boolean;
  reserve_character?: string | null;
  cards: ImportDeckCardsJson;
}

export interface ResolvedImportCard {
  cardType: string;
  cardId: string;
  quantity: number;
}

export interface ResolveImportCardsResult {
  resolved: ResolvedImportCard[];
  unresolved: ImportCardEntry[];
}

export type ImportCatalogMap = Map<string, Record<string, unknown>>;
