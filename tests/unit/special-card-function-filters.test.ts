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

const mockSpecialCards = [
  {
    id: 's1',
    name: 'Mob Mentality',
    character: 'Angry Mob',
    value: 4,
    card_effect: 'Acts as a level 4 Combat attack.',
    icon_offensive_swords: true,
    icon_defensive_shield: false,
    icon_remainder_of_battle: false,
    icon_remainder_of_game: false,
    icon_attached_paperclip: false,
    icon_astral_plane: false,
    icon_first_action_only: false
  },
  {
    id: 's2',
    name: 'Defensive Position',
    character: 'Angry Mob',
    value: 2,
    card_effect: 'Use as a defensive action only.',
    icon_offensive_swords: false,
    icon_defensive_shield: true,
    icon_remainder_of_battle: false,
    icon_remainder_of_game: false,
    icon_attached_paperclip: false,
    icon_astral_plane: false,
    icon_first_action_only: false
  },
  {
    id: 's3',
    name: 'Astral Sentinel',
    character: 'Merlin',
    value: null,
    card_effect: 'Place into Astral Plane for duration.',
    icon_offensive_swords: false,
    icon_defensive_shield: false,
    icon_remainder_of_battle: false,
    icon_remainder_of_game: true,
    icon_attached_paperclip: false,
    icon_astral_plane: true,
    icon_first_action_only: false
  }
];

describe('Special card function filters', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table id="special-cards-table">
        <thead>
          <tr>
            <th>Image</th><th></th><th>Name</th><th>Character</th><th>Card Effect</th><th>Value</th><th>Function</th>
          </tr>
          <tr class="filter-row">
            <th><button class="clear-filters-btn">Clear</button></th>
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
                  <input type="checkbox" id="special-no-value-toggle">
                  <span>No value</span>
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
      json: async () => ({ success: true, data: mockSpecialCards })
    });
    (globalThis as any).fetch = (window as any).fetch;

    execFrontendScript('public/js/search-filter-functions.js');
    execFrontendScript('public/js/filter-functions.js');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).setupSpecialCardSearch;
    delete (window as any).getSelectedSpecialFunctionFilterFields;
    delete (window as any).cardMatchesFunctionIconFilters;
    delete (window as any).displaySpecialCards;
    delete (window as any).loadSpecialCards;
    delete (window as any).fetch;
    delete (globalThis as any).displaySpecialCards;
    delete (globalThis as any).loadSpecialCards;
    delete (globalThis as any).fetch;
  });

  it('returns selected icon fields from active toggle buttons', () => {
    const toggles = document.querySelectorAll('.function-filter-toggle');
    toggles[0].classList.add('is-active');
    toggles[2].classList.add('is-active');

    const selected = (window as any).getSelectedSpecialFunctionFilterFields();
    expect(selected).toEqual(['icon_offensive_swords', 'icon_astral_plane']);
  });

  it('uses OR logic for selected icon fields', () => {
    expect((window as any).cardMatchesFunctionIconFilters(mockSpecialCards[0], ['icon_offensive_swords', 'icon_astral_plane'])).toBe(true);
    expect((window as any).cardMatchesFunctionIconFilters(mockSpecialCards[2], ['icon_offensive_swords', 'icon_astral_plane'])).toBe(true);
    expect((window as any).cardMatchesFunctionIconFilters(mockSpecialCards[1], ['icon_offensive_swords', 'icon_astral_plane'])).toBe(false);
  });

  it('filters by icon toggle selection and combines with text filters', async () => {
    (window as any).setupSpecialCardSearch();

    const nameInput = document.querySelector('#special-cards-table .header-filter[data-column="name"]') as HTMLInputElement;
    const offensiveToggle = document.querySelector('.function-filter-toggle[data-icon-field="icon_offensive_swords"]') as HTMLButtonElement;
    const astralToggle = document.querySelector('.function-filter-toggle[data-icon-field="icon_astral_plane"]') as HTMLButtonElement;

    nameInput.value = 'mob';
    nameInput.dispatchEvent(new window.Event('input'));
    await waitForDebounce();
    await flushPromises();

    expect((globalThis as any).displaySpecialCards).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 's1' })
    ]);

    offensiveToggle.click();
    await waitForDebounce();
    await flushPromises();

    expect((globalThis as any).displaySpecialCards).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 's1' })
    ]);

    nameInput.value = '';
    nameInput.dispatchEvent(new window.Event('input'));
    astralToggle.click();
    await waitForDebounce();
    await flushPromises();

    const lastCallArg = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0];
    expect(lastCallArg.map((card: any) => card.id)).toEqual(['s1', 's3']);
  });

  it('clearSpecialCardFilters resets text inputs and icon toggles', () => {
    const nameInput = document.querySelector('#special-cards-table .header-filter[data-column="name"]') as HTMLInputElement;
    const characterInput = document.querySelector('#special-cards-table .header-filter[data-column="character"]') as HTMLInputElement;
    const valueEqualsInput = document.getElementById('special-value-equals') as HTMLInputElement;
    const noValueToggle = document.getElementById('special-no-value-toggle') as HTMLInputElement;
    const toggles = document.querySelectorAll('.function-filter-toggle');

    nameInput.value = 'test';
    characterInput.value = 'angry';
    valueEqualsInput.value = '4';
    valueEqualsInput.disabled = true;
    noValueToggle.checked = true;
    toggles[0].classList.add('is-active');
    toggles[0].setAttribute('aria-pressed', 'true');

    (window as any).clearSpecialCardFilters();

    expect(nameInput.value).toBe('');
    expect(characterInput.value).toBe('');
    expect(valueEqualsInput.value).toBe('');
    expect(valueEqualsInput.disabled).toBe(false);
    expect(noValueToggle.checked).toBe(false);
    expect(toggles[0].classList.contains('is-active')).toBe(false);
    expect(toggles[0].getAttribute('aria-pressed')).toBe('false');
    expect((globalThis as any).loadSpecialCards).toHaveBeenCalled();
  });

  it('filters by value equals/min/max when no value toggle is off', async () => {
    (window as any).setupSpecialCardSearch();
    const equalsInput = document.getElementById('special-value-equals') as HTMLInputElement;
    const minInput = document.getElementById('special-value-min') as HTMLInputElement;
    const maxInput = document.getElementById('special-value-max') as HTMLInputElement;

    equalsInput.value = '4';
    equalsInput.dispatchEvent(new window.Event('input'));
    await waitForDebounce();
    await flushPromises();
    let lastCallArg = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0];
    expect(lastCallArg.map((card: any) => card.id)).toEqual(['s1']);

    equalsInput.value = '';
    minInput.value = '3';
    minInput.dispatchEvent(new window.Event('input'));
    await waitForDebounce();
    await flushPromises();
    lastCallArg = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0];
    expect(lastCallArg.map((card: any) => card.id)).toEqual(['s1']);

    minInput.value = '';
    maxInput.value = '2';
    maxInput.dispatchEvent(new window.Event('input'));
    await waitForDebounce();
    await flushPromises();
    lastCallArg = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0];
    expect(lastCallArg.map((card: any) => card.id)).toEqual(['s2']);
  });

  it('no value toggle disables numeric inputs and filters to null values only', async () => {
    (window as any).setupSpecialCardSearch();
    const equalsInput = document.getElementById('special-value-equals') as HTMLInputElement;
    const minInput = document.getElementById('special-value-min') as HTMLInputElement;
    const maxInput = document.getElementById('special-value-max') as HTMLInputElement;
    const noValueToggle = document.getElementById('special-no-value-toggle') as HTMLInputElement;

    equalsInput.value = '4';
    minInput.value = '1';
    maxInput.value = '5';
    noValueToggle.checked = true;
    noValueToggle.dispatchEvent(new window.Event('change'));

    await waitForDebounce();
    await flushPromises();

    expect(equalsInput.disabled).toBe(true);
    expect(minInput.disabled).toBe(true);
    expect(maxInput.disabled).toBe(true);

    const lastCallArg = ((globalThis as any).displaySpecialCards as jest.Mock).mock.calls.at(-1)?.[0];
    expect(lastCallArg.map((card: any) => card.id)).toEqual(['s3']);
  });
});
