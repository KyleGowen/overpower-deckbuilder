import type { CatalogType } from '../../../lib/api/types';
import { POWER_TYPE_LABELS } from './dbvFilterTypes';
import type { DbvTypeFilterConfig } from './dbvFilterTypes';

const PRIMARY_STATS = [
  { key: 'energy', label: 'Energy', icon: 'energy', min: 1, max: 8 },
  { key: 'combat', label: 'Combat', icon: 'combat', min: 1, max: 8 },
  { key: 'brute_force', label: 'Brute Force', icon: 'brute_force', min: 1, max: 8 },
  { key: 'intelligence', label: 'Intelligence', icon: 'intelligence', min: 1, max: 8 },
  { key: 'threat_level', label: 'Threat', icon: 'threat_level', min: 15, max: 24 },
];

const POWER_CARD_NUMERIC = [
  { key: POWER_TYPE_LABELS.Energy, label: 'Energy', icon: 'Energy', min: 1, max: 8 },
  { key: POWER_TYPE_LABELS.Combat, label: 'Combat', icon: 'Combat', min: 1, max: 8 },
  { key: POWER_TYPE_LABELS.BruteForce, label: 'Brute Force', icon: 'Brute Force', min: 1, max: 8 },
  { key: POWER_TYPE_LABELS.Intelligence, label: 'Intelligence', icon: 'Intelligence', min: 1, max: 8 },
  { key: POWER_TYPE_LABELS.MultiPower, label: 'Multi-Power', min: 1, max: 5 },
  { key: POWER_TYPE_LABELS.AnyPower, label: 'Any-Power', icon: 'Any-Power', min: 5, max: 8 },
];

const POWER_FOUR = [
  POWER_TYPE_LABELS.Energy,
  POWER_TYPE_LABELS.Combat,
  POWER_TYPE_LABELS.BruteForce,
  POWER_TYPE_LABELS.Intelligence,
];

const POWER_FIVE_WITH_MP = [...POWER_FOUR, POWER_TYPE_LABELS.MultiPower];
const POWER_FIVE_WITH_AP = [...POWER_FOUR, POWER_TYPE_LABELS.AnyPower];
const POWER_SIX_WITH_AP = [...POWER_FIVE_WITH_MP, POWER_TYPE_LABELS.AnyPower];

export const DBV_FILTER_CONFIG: Record<CatalogType, DbvTypeFilterConfig> = {
  characters: { groups: ['numeric'], numericFields: PRIMARY_STATS },
  'special-cards': { groups: ['powerTypes', 'functionIcons'], powerTypeKeys: POWER_SIX_WITH_AP },
  'power-cards': { groups: ['numeric'], numericFields: POWER_CARD_NUMERIC },
  locations: {
    groups: ['numeric'],
    numericFields: [{ key: 'threat_level', label: 'Threat', icon: 'threat_level', min: 0, max: 3 }],
  },
  battlegrounds: { groups: [] },
  missions: { groups: ['missionSet'] },
  events: { groups: ['missionSet'] },
  aspects: { groups: ['powerTypes'], powerTypeKeys: POWER_FIVE_WITH_MP },
  'advanced-universe': { groups: ['functionIcons'] },
  teamwork: { groups: ['powerTypes'], powerTypeKeys: [...POWER_FOUR, POWER_TYPE_LABELS.AnyPower] },
  'ally-universe': { groups: ['powerTypes'], powerTypeKeys: POWER_FOUR },
  training: { groups: ['powerTypes'], powerTypeKeys: POWER_FIVE_WITH_AP },
  'basic-universe': { groups: ['powerTypes'], powerTypeKeys: POWER_FOUR },
};

export function getDbvFilterConfig(type: CatalogType): DbvTypeFilterConfig {
  return DBV_FILTER_CONFIG[type];
}
