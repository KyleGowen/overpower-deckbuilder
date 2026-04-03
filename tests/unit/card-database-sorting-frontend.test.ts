/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';

function execFrontendScript(relPathFromRepoRoot: string) {
  const scriptPath = path.join(__dirname, '../..', relPathFromRepoRoot);
  const code = fs.readFileSync(scriptPath, 'utf8');
  // Execute in window context (scripts attach APIs to window and/or define globals)
  new Function(code)();
}

function loadAlphabetization() {
  execFrontendScript('public/js/alphabetization.js');
  return (window as any).Alphabetization;
}

function ensureMinimalImageHelpers() {
  // Used by card display templates at render time.
  (globalThis as any).mapImagePathToActualFile = (p: string) => p;
}

function execDbvBeforeCardDisplay() {
  execFrontendScript('public/js/dbv/dbv-layout-context.js');
  execFrontendScript('public/js/dbv/dbv-render-shared.js');
}

describe('Card Database frontend sorting (All/Special/Locations)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete (window as any).Alphabetization;
    delete (window as any).loadAllCards;
    delete (window as any).displaySpecialCards;
    delete (window as any).displayLocations;
    delete (globalThis as any).fetch;
    delete (globalThis as any).mapImagePathToActualFile;
  });

  it('All tab sorting: sorts by set then set_number (numerically); cards without a number sort last', async () => {
    loadAlphabetization();

    // Silence the performance logs in tests.
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    execFrontendScript('public/js/catalog-v1-envelope.js');
    // Load All tab implementation (defines window.loadAllCards)
    execFrontendScript('public/js/all-cards-display.js');
    expect(typeof (window as any).loadAllCards).toBe('function');

    const characters = [
      { id: 'c1', name: 'Tarzan',       set: 'MA', set_number: '2', image: 'tarzan.webp' },
      { id: 'c2', name: 'The Mummy',    set: 'MA', set_number: '1', image: 'mummy.webp' },
      { id: 'c3', name: 'Morgan le Fay',set: 'MA', set_number: '3', image: 'morgan.webp' }
    ];

    const specials = [
      {
        id: 's1',
        name: 'Ancient Wisdom',
        character: 'The Mummy',
        universe: 'MA',
        set_number: '10',
        image: 'ancient.webp',
        card_effect: ''
      },
      {
        id: 's2',
        name: 'Wildcard Heal',
        character: 'Any Character',
        universe: 'MA',
        set_number: '11',
        image: 'any.webp',
        card_effect: ''
      },
      {
        id: 's3',
        name: 'No Number Card',
        character: 'Tarzan',
        universe: 'MA',
        set_number: null,
        image: 'nonumber.webp',
        card_effect: ''
      }
    ];

    // Mock fetch for all card-type endpoints
    (globalThis as any).fetch = jest.fn(async (url: string) => {
      const dataByUrl: Record<string, any[]> = {
        '/api/v1/catalog/characters': characters,
        '/api/v1/catalog/special-cards': specials
      };
      return {
        ok: true,
        async json() {
          return { success: true, data: dataByUrl[url] || [] };
        }
      } as any;
    });

    const loaded = await (window as any).loadAllCards();
    expect(Array.isArray(loaded)).toBe(true);

    // Cards should be ordered by set_number numerically within the same set.
    // MA/1 (The Mummy), MA/2 (Tarzan), MA/3 (Morgan le Fay), MA/10 (Ancient Wisdom), MA/11 (Wildcard Heal), then null (No Number Card)
    const numbers = loaded.map((c: any) => c.set_number);

    const numberedCards = loaded.filter((c: any) => c.set_number != null);
    const unnumberedCards = loaded.filter((c: any) => c.set_number == null);

    // All numbered cards come before unnumbered ones
    if (unnumberedCards.length > 0 && numberedCards.length > 0) {
      const lastNumberedIdx = loaded.lastIndexOf(numberedCards[numberedCards.length - 1]);
      const firstUnnumberedIdx = loaded.indexOf(unnumberedCards[0]);
      expect(lastNumberedIdx).toBeLessThan(firstUnnumberedIdx);
    }

    // Numbered cards are in ascending numeric order
    const numberedSetNumbers = numberedCards.map((c: any) => parseInt(c.set_number, 10));
    for (let i = 1; i < numberedSetNumbers.length; i++) {
      expect(numberedSetNumbers[i]).toBeGreaterThanOrEqual(numberedSetNumbers[i - 1]);
    }

    // Sanity: The Mummy (1) before Tarzan (2) before Morgan le Fay (3)
    const mummyIdx    = loaded.findIndex((c: any) => c.name === 'The Mummy');
    const tarzanIdx   = loaded.findIndex((c: any) => c.name === 'Tarzan');
    const morganIdx   = loaded.findIndex((c: any) => c.name === 'Morgan le Fay');
    expect(mummyIdx).toBeLessThan(tarzanIdx);
    expect(tarzanIdx).toBeLessThan(morganIdx);
  });

  it('Special Cards tab: groups remain intact but are ordered by character name (Alphabetization, "The" ignored) and "Any Character" last', () => {
    loadAlphabetization();
    ensureMinimalImageHelpers();

    execDbvBeforeCardDisplay();
    execFrontendScript('public/js/card-display.js');
    expect(typeof (window as any).displaySpecialCards).toBe('function');

    document.body.innerHTML = `<table><tbody id="special-cards-tbody"></tbody></table>`;

    const specialCards = [
      { id: 's1', name: '3 Quick Strokes', character: 'Zorro', universe: 'MA', image_path: 'a.webp', card_effect: '' },
      { id: 's2', name: 'Ancient Wisdom', character: 'The Mummy', universe: 'MA', image_path: 'b.webp', card_effect: '' },
      { id: 's3', name: 'A Jealous God', character: 'Zeus', universe: 'MA', image_path: 'c.webp', card_effect: '' },
      { id: 's4', name: 'Mob Mentality', character: 'Angry Mob (Middle Ages)', universe: 'MA', image_path: 'd.webp', card_effect: '' },
      { id: 's5', name: 'Preternatural Healing', character: 'Any Character', universe: 'MA', image_path: 'e.webp', card_effect: '' }
    ];

    (window as any).displaySpecialCards(specialCards);

    const rows = Array.from(document.querySelectorAll('#special-cards-tbody tr'));
    expect(rows.length).toBe(5);

    const rowData = rows.map((tr) => {
      const cells = tr.querySelectorAll('td');
      return {
        name: (cells[2]?.textContent || '').trim(),
        character: (cells[3]?.textContent || '').trim()
      };
    });

    const charactersInOrder = rowData.map((r) => r.character);

    // "Any Character" forced last
    expect(charactersInOrder[charactersInOrder.length - 1]).toBe('Any Character');

    // "The Mummy" should sort under M, after Angry Mob (A...) and before Zeus/Zorro (Z...)
    expect(charactersInOrder.indexOf('Angry Mob (Middle Ages)')).toBeLessThan(charactersInOrder.indexOf('The Mummy'));
    expect(charactersInOrder.indexOf('The Mummy')).toBeLessThan(charactersInOrder.indexOf('Zeus'));
    expect(charactersInOrder.indexOf('The Mummy')).toBeLessThan(charactersInOrder.indexOf('Zorro'));
  });

  it('Locations tab: sorts location names using Alphabetization (leading "The" ignored)', () => {
    loadAlphabetization();
    ensureMinimalImageHelpers();

    execDbvBeforeCardDisplay();
    execFrontendScript('public/js/card-display.js');
    expect(typeof (window as any).displayLocations).toBe('function');

    document.body.innerHTML = `<table><tbody id="locations-tbody"></tbody></table>`;

    const locations = [
      { id: 'l1', name: 'The Round Table', threat_level: 0, special_ability: '', image: 'rt.webp' },
      { id: 'l2', name: 'Spartan Training Ground', threat_level: 0, special_ability: '', image: 'stg.webp' },
      { id: 'l3', name: 'Event Horizon: The Future', threat_level: 0, special_ability: '', image: 'eh.webp' },
      { id: 'l4', name: 'Barsoom', threat_level: 0, special_ability: '', image: 'bar.webp' }
    ];

    (window as any).displayLocations(locations);

    const names = Array.from(document.querySelectorAll('#locations-tbody tr td:nth-child(3)')).map((td) =>
      (td.textContent || '').trim()
    );

    // Expected alpha order using our global scheme:
    // Barsoom (B), Event Horizon (E), The Round Table (R...), Spartan (S)
    expect(names).toEqual(['Barsoom', 'Event Horizon: The Future', 'The Round Table', 'Spartan Training Ground']);
  });

  it('Characters tab: sorts character names using Alphabetization (leading "The" ignored)', () => {
    loadAlphabetization();
    ensureMinimalImageHelpers();

    execDbvBeforeCardDisplay();
    execFrontendScript('public/js/card-display.js');
    expect(typeof (window as any).displayCharacters).toBe('function');

    document.body.innerHTML = `<table><tbody id="characters-tbody"></tbody></table><div id="characters-tab" style="display:block;"></div>`;

    const characters = [
      { id: 'c1', name: 'Tarzan', universe: 'MA', threat_level: 10, energy: 1, combat: 1, brute_force: 1, intelligence: 1, image: 't.webp' },
      { id: 'c2', name: 'The Mummy', universe: 'MA', threat_level: 10, energy: 1, combat: 1, brute_force: 1, intelligence: 1, image: 'm.webp' },
      { id: 'c3', name: 'Morgan le Fay', universe: 'MA', threat_level: 10, energy: 1, combat: 1, brute_force: 1, intelligence: 1, image: 'mlf.webp' },
      { id: 'c4', name: 'Zebra', universe: 'MA', threat_level: 10, energy: 1, combat: 1, brute_force: 1, intelligence: 1, image: 'z.webp' }
    ];

    (window as any).displayCharacters(characters);

    const names = Array.from(document.querySelectorAll('#characters-tbody tr td:nth-child(3)')).map((td) =>
      (td.textContent || '').trim()
    );

    // Alphabetization ignores leading "The " for sorting:
    // Morgan (Morg...), The Mummy (Mummy...), Tarzan (T...), Zebra (Z...)
    expect(names).toEqual(['Morgan le Fay', 'The Mummy', 'Tarzan', 'Zebra']);
  });
});

