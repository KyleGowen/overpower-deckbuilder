/** Canonical power-type and threat icon keys for PNG badges. */
export type StatIconType =
  | 'energy'
  | 'combat'
  | 'brute_force'
  | 'intelligence'
  | 'threat_level';

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

export const STAT_ICON_LABELS: Record<StatIconType, string> = {
  energy: 'Energy',
  combat: 'Combat',
  brute_force: 'Brute Force',
  intelligence: 'Intelligence',
  threat_level: 'Threat',
};

export function buildStatIconBadgeLabel(type: StatIconType, value: number | string): string {
  return `${STAT_ICON_LABELS[type]}: ${String(value)}`;
}
