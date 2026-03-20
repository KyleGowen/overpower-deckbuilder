import {
  normalizeRarityForDb,
  parseChecklistMarkdown,
  parsePowerFromChecklist,
} from '../../scripts/data-maintenance/populate-rarity-from-checklist';

describe('checklist rarity parse helpers', () => {
  it('parseChecklistMarkdown skips header and parses a row', () => {
    const md = `
|  | # | Card Name | Card Special | Rarity | # | Location |
| --- | --- | --- | --- | --- | --- | --- |
| FALSE | 292 | 8 Energy | Power Card | Common | 292 | Starter |
`;
    const rows = parseChecklistMarkdown(md);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      setNum: '292',
      cardName: '8 Energy',
      cardSpecial: 'Power Card',
      rarity: 'Common',
    });
  });

  it('parsePowerFromChecklist handles standard and variant power rows', () => {
    expect(parsePowerFromChecklist('8 Energy', 'Power Card')).toEqual({
      name: '8 - Energy',
      power_type: 'Energy',
      value: 8,
    });
    expect(parsePowerFromChecklist('5 Any-Power', 'Any-Power Power Card')).toEqual({
      name: '5 - Any-Power',
      power_type: 'Any-Power',
      value: 5,
    });
    expect(parsePowerFromChecklist('3 MultiPower', 'MultiPower Power Card')).toEqual({
      name: '3 - Multi Power',
      power_type: 'Multi Power',
      value: 3,
    });
    expect(parsePowerFromChecklist('5 Brute Force', 'Power Card')).toEqual({
      name: '5 - Brute Force',
      power_type: 'Brute Force',
      value: 5,
    });
    expect(parsePowerFromChecklist('foo', 'Power Card')).toBeNull();
  });

  it('normalizeRarityForDb maps checklist and legacy strings to canonical tiers', () => {
    expect(normalizeRarityForDb('Common')).toBe('Common');
    expect(normalizeRarityForDb('COMMON')).toBe('Common');
    expect(normalizeRarityForDb('Common slot, rare drop')).toBe('Common');
    expect(normalizeRarityForDb('*RARE')).toBe('Rare');
    expect(normalizeRarityForDb('*ULTRA RARE')).toBe('Ultra Rare');
    expect(normalizeRarityForDb('*Uncommon slot, rare drop')).toBe('Uncommon');
    expect(normalizeRarityForDb('ultra-rare')).toBe('Ultra Rare');
    expect(normalizeRarityForDb('ultrarare')).toBe('Ultra Rare');
    expect(normalizeRarityForDb('')).toBeNull();
    expect(normalizeRarityForDb('   ')).toBeNull();
    expect(normalizeRarityForDb('Mythic')).toBeNull();
  });
});
