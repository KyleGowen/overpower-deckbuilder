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
            <th>Image</th><th></th><th>Name</th><th>Character</th><th>Card Effect</th><th>Function</th>
          </tr>
          <tr class="filter-row">
            <th><button class="clear-filters-btn">Clear</button></th>
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
    const toggles = document.querySelectorAll('.function-filter-toggle');

    nameInput.value = 'test';
    characterInput.value = 'angry';
    toggles[0].classList.add('is-active');
    toggles[0].setAttribute('aria-pressed', 'true');

    (window as any).clearSpecialCardFilters();

    expect(nameInput.value).toBe('');
    expect(characterInput.value).toBe('');
    expect(toggles[0].classList.contains('is-active')).toBe(false);
    expect(toggles[0].getAttribute('aria-pressed')).toBe('false');
    expect((globalThis as any).loadSpecialCards).toHaveBeenCalled();
  });
});
