/** @jest-environment jsdom */

/**
 * Exercises applyAllyUniverseFilters with a minimal #ally-universe-table DOM.
 */
import fs from 'fs';
import path from 'path';

function loadSearchFilterFunctions(): void {
    const code = fs.readFileSync(path.join(__dirname, '../../public/js/search-filter-functions.js'), 'utf8');
    const run = new Function(code);
    run();
}

function allyTableShell(): string {
    return `
<div id="ally-universe-tab" style="display:block">
  <table id="ally-universe-table">
    <thead>
      <tr><th colspan="7"></th></tr>
      <tr class="ally-desktop-filter-row">
        <th></th><th></th>
        <th><input type="text" id="ally-card-name-filter" class="header-filter" /></th>
        <th></th>
        <th>
          <div class="special-power-filter-toggles ally-stat-type-filter-toggles" data-ally-filter-role="stat">
            <button type="button" class="power-type-filter-toggle" data-power-type="Energy"></button>
            <button type="button" class="power-type-filter-toggle" data-power-type="Combat"></button>
          </div>
        </th>
        <th>
          <div class="special-power-filter-toggles ally-attack-type-filter-toggles" data-ally-filter-role="attack">
            <button type="button" class="power-type-filter-toggle" data-power-type="Energy"></button>
            <button type="button" class="power-type-filter-toggle" data-power-type="Brute Force"></button>
          </div>
        </th>
        <th></th>
      </tr>
    </thead>
  </table>
</div>
<input type="text" id="search-input" />
`;
}

function baseCard(over: Record<string, unknown> = {}) {
    return {
        id: '1',
        card_name: 'Ally One',
        card_type: 'ally',
        stat_to_use: '5 or less',
        stat_type_to_use: 'Energy',
        attack_value: '3',
        attack_type: 'Energy',
        card_text: 'Teammate must play 1 Special card.',
        ...over,
    };
}

describe('applyAllyUniverseFilters', () => {
    beforeEach(() => {
        document.body.innerHTML = allyTableShell();
        loadSearchFilterFunctions();
        (window as unknown as { displayAllyUniverse: jest.Mock }).displayAllyUniverse = jest.fn();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('filters by card name column (AND with pool)', () => {
        (window as unknown as { allyUniverseData: unknown[] }).allyUniverseData = [
            baseCard({ card_name: 'Hera' }),
            baseCard({ id: '2', card_name: 'Zeus' }),
        ];
        (document.getElementById('ally-card-name-filter') as HTMLInputElement).value = 'her';
        (window as unknown as { applyAllyUniverseFilters: () => void }).applyAllyUniverseFilters();
        const mockDisp = (window as unknown as { displayAllyUniverse: jest.Mock }).displayAllyUniverse;
        expect(mockDisp).toHaveBeenCalledTimes(1);
        expect(mockDisp.mock.calls[0][0]).toHaveLength(1);
        expect(mockDisp.mock.calls[0][0][0].card_name).toBe('Hera');
    });

    it('filters by selected stat type (Energy)', () => {
        (window as unknown as { allyUniverseData: unknown[] }).allyUniverseData = [
            baseCard({ stat_type_to_use: 'Energy' }),
            baseCard({ id: '2', stat_type_to_use: 'Combat' }),
        ];
        const energyBtn = document.querySelector(
            '.ally-stat-type-filter-toggles .power-type-filter-toggle[data-power-type="Energy"]'
        ) as HTMLButtonElement;
        energyBtn.classList.add('is-active');
        (window as unknown as { applyAllyUniverseFilters: () => void }).applyAllyUniverseFilters();
        const mockDisp = (window as unknown as { displayAllyUniverse: jest.Mock }).displayAllyUniverse;
        expect(mockDisp.mock.calls[0][0]).toHaveLength(1);
        expect(mockDisp.mock.calls[0][0][0].stat_type_to_use).toBe('Energy');
    });

    it('filters by selected attack type independently of stat type', () => {
        (window as unknown as { allyUniverseData: unknown[] }).allyUniverseData = [
            baseCard({ stat_type_to_use: 'Energy', attack_type: 'Brute Force' }),
            baseCard({ id: '2', stat_type_to_use: 'Energy', attack_type: 'Energy' }),
        ];
        const bfBtn = document.querySelector(
            '.ally-attack-type-filter-toggles .power-type-filter-toggle[data-power-type="Brute Force"]'
        ) as HTMLButtonElement;
        bfBtn.classList.add('is-active');
        (window as unknown as { applyAllyUniverseFilters: () => void }).applyAllyUniverseFilters();
        const mockDisp = (window as unknown as { displayAllyUniverse: jest.Mock }).displayAllyUniverse;
        expect(mockDisp.mock.calls[0][0]).toHaveLength(1);
        expect(mockDisp.mock.calls[0][0][0].attack_type).toBe('Brute Force');
    });
});
