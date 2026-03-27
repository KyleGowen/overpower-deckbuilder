/**
 * @jest-environment jsdom
 *
 * Unit tests for groupCardsByVariant to ensure locations default to main art before alternate.
 * Regression: alternate paths like "alternate/221_b_baker_st.png" were not detected
 * (check used /alternate/ which doesn't match), causing non-deterministic ordering.
 */

import fs from 'fs';
import path from 'path';

function execFrontendScript(relPathFromRepoRoot: string) {
  const scriptPath = path.join(__dirname, '../..', relPathFromRepoRoot);
  const code = fs.readFileSync(scriptPath, 'utf8');
  new Function(code)();
}

describe('groupCardsByVariant location ordering', () => {
  beforeEach(() => {
    execFrontendScript('public/js/alphabetization.js');
    execFrontendScript('public/js/dbv/dbv-layout-context.js');
    execFrontendScript('public/js/dbv/dbv-render-shared.js');
    execFrontendScript('public/js/card-display.js');
  });

  it('puts default location before alternate when path is alternate/xxx', () => {
    const locations = [
      { id: 'a1', name: '221-B Baker St.', set: 'ERB', image_path: 'alternate/221_b_baker_st.png' },
      { id: 'd1', name: '221-B Baker St.', set: 'ERB', image_path: '221_b_baker_st.webp' }
    ];
    const grouped = (window as any).groupCardsByVariant(locations, 'name', 'set');
    const key = '221-B Baker St.|ERB|character'; // card_type defaults to 'character' when not set
    const group = grouped.get(key);
    expect(group).toBeDefined();
    expect(group).toHaveLength(2);
    expect(group[0].image_path).not.toContain('alternate/');
    expect(group[0].image_path).toBe('221_b_baker_st.webp');
    expect(group[1].image_path).toContain('alternate/');
    expect(group[1].image_path).toBe('alternate/221_b_baker_st.png');
  });

  it('puts default before alternate when path uses full locations/alternate/ format', () => {
    const locations = [
      { id: 'a1', name: "Dracula's Armory", set: 'ERB', image_path: 'locations/alternate/draculas_armory.png' },
      { id: 'd1', name: "Dracula's Armory", set: 'ERB', image_path: 'draculas_armory.webp' }
    ];
    const grouped = (window as any).groupCardsByVariant(locations, 'name', 'set');
    const key = "Dracula's Armory|ERB|character";
    const group = grouped.get(key);
    expect(group).toBeDefined();
    expect(group[0].image_path).not.toContain('alternate/');
    expect(group[1].image_path).toContain('alternate/');
  });

  it('merges ERB base and ERBP alternate into one group when mergeAcrossSets is true', () => {
    const locations = [
      { id: 'erbp', name: 'Asclepieion', set: 'ERBP', image_path: 'alternate/asclepieion.png' },
      { id: 'erb', name: 'Asclepieion', set: 'ERB', image_path: 'asclepieion.webp' }
    ];
    const grouped = (window as any).groupCardsByVariant(locations, 'name', 'set', { mergeAcrossSets: true });
    const key = 'Asclepieion|character';
    const group = grouped.get(key);
    expect(group).toBeDefined();
    expect(group).toHaveLength(2);
    expect(group[0].set).toBe('ERB');
    expect(group[0].image_path).not.toContain('alternate/');
    expect(group[1].set).toBe('ERBP');
    expect(group[1].image_path).toContain('alternate/');
  });
});
