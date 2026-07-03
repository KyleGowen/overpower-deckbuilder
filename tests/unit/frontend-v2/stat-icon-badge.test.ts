import {
  STAT_ICON_LABELS,
  STAT_ICON_PATHS,
  buildStatIconBadgeLabel,
  type StatIconType,
} from '../../../frontend/src/lib/icons/statIconTypes';

describe('statIconTypes', () => {
  it('maps primary stat keys to icon PNG paths', () => {
    expect(STAT_ICON_PATHS.energy).toContain('energy.png');
    expect(STAT_ICON_PATHS.combat).toContain('combat.png');
    expect(STAT_ICON_PATHS.brute_force).toContain('brute_force.png');
    expect(STAT_ICON_PATHS.intelligence).toContain('intelligence.png');
    expect(STAT_ICON_PATHS.threat_level).toContain('threat.png');
  });

  it('provides human-readable labels for StatIconType keys', () => {
    const types: StatIconType[] = [
      'energy',
      'combat',
      'brute_force',
      'intelligence',
      'threat_level',
    ];
    types.forEach((type) => {
      expect(STAT_ICON_LABELS[type]).toBeTruthy();
    });
  });
});

describe('buildStatIconBadgeLabel', () => {
  it('formats aria labels as Label: value', () => {
    expect(buildStatIconBadgeLabel('combat', 6)).toBe('Combat: 6');
    expect(buildStatIconBadgeLabel('intelligence', 5)).toBe('Intelligence: 5');
    expect(buildStatIconBadgeLabel('threat_level', 74)).toBe('Threat: 74');
  });

  it('supports string values for capped threat display', () => {
    expect(buildStatIconBadgeLabel('threat_level', '74/76')).toBe('Threat: 74/76');
  });
});
