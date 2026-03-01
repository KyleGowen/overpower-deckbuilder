/**
 * @jest-environment jsdom
 *
 * Unit tests for foil display logic in all-cards-display.js and card-display.js.
 *
 * - sortAllCardsData: foil cards sort after non-foil within same set
 * - groupCardsByVariant: cards with is_foil: true are excluded from groups
 */

import fs from 'fs';
import path from 'path';

function execFrontendScript(relPathFromRepoRoot: string) {
  const scriptPath = path.join(__dirname, '../..', relPathFromRepoRoot);
  const code = fs.readFileSync(scriptPath, 'utf8');
  new Function(code)();
}

describe('sortAllCardsData foil ordering', () => {
  beforeAll(() => {
    (window as any).Alphabetization = {
      compare: (a: string, b: string) => String(a ?? '').localeCompare(String(b ?? '')),
    };
    execFrontendScript('public/js/all-cards-display.js');
  });

  it('should sort foil cards after non-foil within same set', () => {
    const cards = [
      { id: '1', name: 'Card A', set: 'ERB', set_number: '001', is_foil: true },
      { id: '2', name: 'Card A', set: 'ERB', set_number: '001', is_foil: false },
      { id: '3', name: 'Card B', set: 'ERB', set_number: '002', is_foil: false },
    ];
    const sorted = (window as any).sortAllCardsData(cards);
    expect(sorted[0].is_foil).toBe(false);
    expect(sorted[1].is_foil).toBe(false);
    expect(sorted[2].is_foil).toBe(true);
  });

  it('should keep foil cards after non-foil when same set_number', () => {
    const cards = [
      { id: 'f1', name: 'Foil', set: 'ERB', set_number: '010', is_foil: true },
      { id: 'b1', name: 'Base', set: 'ERB', set_number: '010', is_foil: false },
    ];
    const sorted = (window as any).sortAllCardsData(cards);
    expect(sorted[0].id).toBe('b1');
    expect(sorted[1].id).toBe('f1');
  });
});

describe('groupCardsByVariant foil exclusion', () => {
  beforeEach(() => {
    execFrontendScript('public/js/card-display.js');
  });

  it('should exclude cards with is_foil from groups', () => {
    const cards = [
      { id: '1', name: 'Card A', set: 'ERB', card_type: 'power', is_foil: false },
      { id: '2', name: 'Card A', set: 'ERB', card_type: 'power', is_foil: true },
    ];
    const grouped = (window as any).groupCardsByVariant(cards, 'name', 'universe');
    const key = 'Card A|ERB|power';
    const group = grouped.get(key);
    expect(group).toBeDefined();
    expect(group).toHaveLength(1);
    expect(group[0].is_foil).toBe(false);
  });

  it('should not include foil cards in any group', () => {
    const cards = [
      { id: '1', name: 'Only Foil', set: 'ERB', card_type: 'power', is_foil: true },
    ];
    const grouped = (window as any).groupCardsByVariant(cards, 'name', 'universe');
    expect(grouped.size).toBe(0);
  });
});
