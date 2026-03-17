/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';

function execFrontendScript(relPathFromRepoRoot: string) {
  const scriptPath = path.join(__dirname, '../..', relPathFromRepoRoot);
  const code = fs.readFileSync(scriptPath, 'utf8');
  (window as any).eval(code);
}

function flushPromises() {
  return Promise.resolve();
}

function waitForDebounce() {
  return new Promise((resolve) => setTimeout(resolve, 350));
}

describe('Special Cards function toggle integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table id="special-cards-table">
        <thead>
          <tr>
            <th>Image</th><th></th><th>Name</th><th>Character</th><th>Card Effect</th><th>Function</th>
          </tr>
          <tr class="filter-row">
            <th><button class="clear-filters-btn" onclick="clearSpecialCardFilters()">Clear All Filters</button></th>
            <th></th>
            <th><input type="text" class="header-filter" data-column="name"></th>
            <th><input type="text" class="header-filter" data-column="character"></th>
            <th><input type="text" class="header-filter" data-column="card_effect"></th>
            <th>
              <button type="button" class="function-filter-toggle" data-icon-field="icon_offensive_swords" aria-pressed="false"></button>
              <button type="button" class="function-filter-toggle" data-icon-field="icon_defensive_shield" aria-pressed="false"></button>
              <button type="button" class="function-filter-toggle" data-icon-field="icon_astral_plane" aria-pressed="false"></button>
            </th>
          </tr>
        </thead>
      </table>
    `;

    (window as any).displaySpecialCards = jest.fn();
    (globalThis as any).displaySpecialCards = (window as any).displaySpecialCards;
    (window as any).loadSpecialCards = jest.fn().mockResolvedValue(undefined);
    (globalThis as any).loadSpecialCards = (window as any).loadSpecialCards;
    (window as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        data: [
          { id: 'off', name: 'Offense', character: 'A', card_effect: 'effect', icon_offensive_swords: true, icon_astral_plane: false, icon_defensive_shield: false },
          { id: 'def', name: 'Defense', character: 'B', card_effect: 'effect', icon_offensive_swords: false, icon_astral_plane: false, icon_defensive_shield: true },
          { id: 'ast', name: 'Astral', character: 'C', card_effect: 'effect', icon_offensive_swords: false, icon_astral_plane: true, icon_defensive_shield: false }
        ]
      })
    });
    (globalThis as any).fetch = (window as any).fetch;

    execFrontendScript('public/js/search-filter-functions.js');
    execFrontendScript('public/js/filter-functions.js');
    (window as any).setupSpecialCardSearch();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).displaySpecialCards;
    delete (window as any).loadSpecialCards;
    delete (window as any).fetch;
    delete (globalThis as any).displaySpecialCards;
    delete (globalThis as any).loadSpecialCards;
    delete (globalThis as any).fetch;
  });

  it('applies OR filtering across active function toggles and resets on clear', async () => {
    const offenseToggle = document.querySelector('.function-filter-toggle[data-icon-field="icon_offensive_swords"]') as HTMLButtonElement;
    const astralToggle = document.querySelector('.function-filter-toggle[data-icon-field="icon_astral_plane"]') as HTMLButtonElement;
    const nameInput = document.querySelector('#special-cards-table .header-filter[data-column="name"]') as HTMLInputElement;

    offenseToggle.click();
    astralToggle.click();
    await waitForDebounce();
    await flushPromises();

    const orFiltered = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0] ?? [];
    expect(orFiltered.map((card: any) => card.id)).toEqual(['off', 'ast']);

    nameInput.value = 'astr';
    nameInput.dispatchEvent(new window.Event('input'));
    await waitForDebounce();
    await flushPromises();

    const textAndIconFiltered = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0] ?? [];
    expect(textAndIconFiltered.map((card: any) => card.id)).toEqual(['ast']);

    (window as any).clearSpecialCardFilters();
    expect(offenseToggle.classList.contains('is-active')).toBe(false);
    expect(astralToggle.classList.contains('is-active')).toBe(false);
    expect(nameInput.value).toBe('');
    expect((globalThis as any).loadSpecialCards).toHaveBeenCalled();
  });

  it('wires Clear All Filters button click to reset text/toggles', async () => {
    const clearButton = document.querySelector('#special-cards-table .clear-filters-btn') as HTMLButtonElement;
    const offenseToggle = document.querySelector('.function-filter-toggle[data-icon-field="icon_offensive_swords"]') as HTMLButtonElement;
    const nameInput = document.querySelector('#special-cards-table .header-filter[data-column="name"]') as HTMLInputElement;

    expect(clearButton).toBeTruthy();

    offenseToggle.classList.add('is-active');
    offenseToggle.setAttribute('aria-pressed', 'true');
    nameInput.value = 'offense';

    clearButton.click();
    await flushPromises();

    expect(offenseToggle.classList.contains('is-active')).toBe(false);
    expect(offenseToggle.getAttribute('aria-pressed')).toBe('false');
    expect(nameInput.value).toBe('');
    expect((globalThis as any).loadSpecialCards).toHaveBeenCalled();
  });
});
