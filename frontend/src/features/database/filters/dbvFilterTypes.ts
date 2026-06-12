import type { CatalogType } from '../../../lib/api/types';

export type CompareOp = 'eq' | 'gte' | 'lte';

export interface NumericConstraint {
  field: string;
  op: CompareOp;
  value: number;
}

export type FunctionIconField =
  | 'icon_offensive_swords'
  | 'icon_defensive_shield'
  | 'icon_remainder_of_battle'
  | 'icon_remainder_of_game'
  | 'icon_astral_plane';

export interface DbvFilterState {
  numeric: NumericConstraint[];
  powerTypes: string[];
  functionIcons: FunctionIconField[];
  missionSet: string;
}

export const EMPTY_DBV_FILTER_STATE: DbvFilterState = {
  numeric: [],
  powerTypes: [],
  functionIcons: [],
  missionSet: '',
};

export type DbvFilterGroupKind = 'numeric' | 'powerTypes' | 'functionIcons' | 'missionSet';

export interface NumericFieldDef {
  key: string;
  label: string;
  icon?: string;
  min: number;
  max: number;
}

export interface DbvTypeFilterConfig {
  groups: DbvFilterGroupKind[];
  numericFields?: NumericFieldDef[];
  powerTypeKeys?: string[];
}

export interface FilterChip {
  id: string;
  label: string;
  kind: 'numeric' | 'powerType' | 'functionIcon' | 'missionSet';
  removeKey: string;
}

export const POWER_TYPE_LABELS = {
  Energy: 'Energy',
  Combat: 'Combat',
  BruteForce: 'Brute Force',
  Intelligence: 'Intelligence',
  MultiPower: 'Multi-Power',
  AnyPower: 'Any-Power',
} as const;

export const STAT_ICON_PATHS: Record<string, string> = {
  energy: '/src/resources/images/icons/energy.png',
  combat: '/src/resources/images/icons/combat.png',
  brute_force: '/src/resources/images/icons/brute_force.png',
  intelligence: '/src/resources/images/icons/intelligence.png',
  threat_level: '/src/resources/images/icons/threat.png',
  Energy: '/src/resources/images/icons/energy.png',
  Combat: '/src/resources/images/icons/combat.png',
  'Brute Force': '/src/resources/images/icons/brute_force.png',
  Intelligence: '/src/resources/images/icons/intelligence.png',
  'Any-Power': '/src/resources/images/icons/any-power.png',
};

export const FUNCTION_ICON_DEFS: {
  field: FunctionIconField;
  label: string;
  img: string;
}[] = [
  { field: 'icon_offensive_swords', label: 'Offensive', img: '/src/resources/images/icons/function/offensive_action.png' },
  { field: 'icon_defensive_shield', label: 'Defensive', img: '/src/resources/images/icons/function/defensive_action.png' },
  { field: 'icon_remainder_of_battle', label: 'Remainder of Battle', img: '/src/resources/images/icons/function/reminder_of_battle.png' },
  { field: 'icon_remainder_of_game', label: 'Remainder of Game', img: '/src/resources/images/icons/function/reminder_of_game.png' },
  { field: 'icon_astral_plane', label: 'Astral Plane', img: '/src/resources/images/icons/function/astral_plane.png' },
];

export const OP_LABELS: Record<CompareOp, string> = {
  eq: '=',
  gte: '≥',
  lte: '≤',
};

export type { CatalogType };
