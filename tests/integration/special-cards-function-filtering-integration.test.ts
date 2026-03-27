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
            <th>Image</th><th></th><th>Name</th><th>Character</th><th>Card Effect</th><th>Value</th><th>Function</th>
          </tr>
          <tr class="filter-row">
            <th><button class="clear-filters-btn" onclick="clearSpecialCardFilters()">Clear All Filters</button></th>
            <th></th>
            <th><input type="text" class="header-filter" data-column="name"></th>
            <th><input type="text" class="header-filter" data-column="character"></th>
            <th><input type="text" class="header-filter" data-column="card_effect"></th>
            <th>
              <div class="column-filters">
                <input type="number" id="special-value-equals" class="filter-input equals" data-column="value">
                <input type="number" id="special-value-min" class="filter-input min" data-column="value">
                <input type="number" id="special-value-max" class="filter-input max" data-column="value">
                <label class="special-no-value-toggle-label">
                  <input type="checkbox" id="special-no-value-toggle" class="visually-hidden" aria-label="No value">
                  <span class="special-no-value-toggle-face" aria-hidden="true"></span>
                </label>
              </div>
            </th>
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
          { id: 'off', name: 'Offense', character: 'A', value: 4, card_effect: 'effect', icon_offensive_swords: true, icon_astral_plane: false, icon_defensive_shield: false },
          { id: 'def', name: 'Defense', character: 'B', value: 2, card_effect: 'effect', icon_offensive_swords: false, icon_astral_plane: false, icon_defensive_shield: true },
          { id: 'ast', name: 'Astral', character: 'C', value: null, card_effect: 'effect', icon_offensive_swords: false, icon_astral_plane: true, icon_defensive_shield: false }
        ]
      })
    });
    (globalThis as any).fetch = (window as any).fetch;

    execFrontendScript('public/js/dbv-icon-filter-logic.js');
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

  it('applies value filters and supports no value toggle behavior', async () => {
    const equalsInput = document.getElementById('special-value-equals') as HTMLInputElement;
    const minInput = document.getElementById('special-value-min') as HTMLInputElement;
    const maxInput = document.getElementById('special-value-max') as HTMLInputElement;
    const noValueToggle = document.getElementById('special-no-value-toggle') as HTMLInputElement;

    equalsInput.value = '4';
    equalsInput.dispatchEvent(new window.Event('input'));
    await waitForDebounce();
    await flushPromises();
    let filtered = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0] ?? [];
    expect(filtered.map((card: any) => card.id)).toEqual(['off']);

    equalsInput.value = '';
    minInput.value = '2';
    maxInput.value = '4';
    maxInput.dispatchEvent(new window.Event('input'));
    await waitForDebounce();
    await flushPromises();
    filtered = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0] ?? [];
    expect(filtered.map((card: any) => card.id)).toEqual(['off', 'def']);

    noValueToggle.checked = true;
    noValueToggle.dispatchEvent(new window.Event('change'));
    await waitForDebounce();
    await flushPromises();
    expect(equalsInput.disabled).toBe(true);
    expect(minInput.disabled).toBe(true);
    expect(maxInput.disabled).toBe(true);
    filtered = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0] ?? [];
    expect(filtered.map((card: any) => card.id)).toEqual(['ast']);
  });
});
