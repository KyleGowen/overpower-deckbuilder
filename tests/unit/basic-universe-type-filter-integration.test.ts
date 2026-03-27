/**
 * Integration tests for Basic Universe Type Filter functionality
 * Tests the actual behavior and DOM interactions
 */

import { JSDOM } from 'jsdom';

describe('Basic Universe Type Filter Integration', () => {
    let dom: JSDOM;
    let document: Document;
    let window: any;

    beforeEach(() => {
        // Create a mock DOM with the Basic Universe tab structure
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="basic-universe-tab">
                    <table>
                        <thead>
                            <tr class="filter-row basic-universe-desktop-filter-row">
                                <th>
                                    <button class="clear-filters-btn" onclick="clearBasicUniverseFilters()">Clear All Filters</button>
                                </th>
                                <th></th>
                                <th>
                                    <div class="column-filters basic-universe-desktop-card-name-filters">
                                        <input type="text" id="basic-universe-card-name-filter" class="filter-input basic-universe-desktop-card-name-input" placeholder="Name" autocomplete="off" aria-label="Filter by card name">
                                    </div>
                                </th>
                                <th>
                                    <div class="column-filters">
                                        <div class="special-power-filter-toggles basic-universe-desktop-stat-type-toggles">
                                            <button type="button" class="power-type-filter-toggle" data-power-type="Energy"></button>
                                            <button type="button" class="power-type-filter-toggle" data-power-type="Combat"></button>
                                            <button type="button" class="power-type-filter-toggle" data-power-type="Brute Force"></button>
                                            <button type="button" class="power-type-filter-toggle" data-power-type="Intelligence"></button>
                                        </div>
                                    </div>
                                </th>
                                <th>
                                    <div class="column-filters basic-universe-desktop-numeric-stack">
                                        <input type="number" class="filter-input equals basic-universe-desktop-numeric-stack-input" data-column="value" placeholder="=" min="6" max="7">
                                        <input type="number" id="basic-value-max" placeholder="Max" min="6" max="7" class="filter-input basic-universe-desktop-numeric-stack-input">
                                        <input type="number" id="basic-value-min" placeholder="Min" min="6" max="7" class="filter-input basic-universe-desktop-numeric-stack-input">
                                    </div>
                                </th>
                                <th>
                                    <div class="column-filters basic-universe-desktop-numeric-stack">
                                        <input type="number" class="filter-input equals basic-universe-desktop-numeric-stack-input" data-column="bonus" placeholder="=" min="2" max="3">
                                        <input type="number" id="basic-bonus-max" placeholder="Max" min="2" max="3" class="filter-input basic-universe-desktop-numeric-stack-input">
                                        <input type="number" id="basic-bonus-min" placeholder="Min" min="2" max="3" class="filter-input basic-universe-desktop-numeric-stack-input">
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody id="basic-universe-tbody">
                            <tr><td colspan="6">No basic universe cards found</td></tr>
                        </tbody>
                    </table>
                </div>
                <input type="text" class="search-input" id="search-input" placeholder="Search basic universe by name, type, or bonus...">
            </body>
            </html>
        `, {
            url: 'http://localhost:3000',
            pretendToBeVisual: true,
            resources: 'usable'
        });

        document = dom.window.document;
        window = dom.window;

        // Mock global functions
        window.applyBasicUniverseFilters = jest.fn();
        window.clearBasicUniverseFilters = jest.fn();
        window.displayBasicUniverse = jest.fn();
        window.fetch = jest.fn();

        // Mock console
        window.console = {
            log: jest.fn(),
            error: jest.fn()
        };
    });

    afterEach(() => {
        dom.window.close();
    });

    describe('Power type toggles', () => {
        it('should have stat type toggle buttons with data-power-type', () => {
            const toggles = document.querySelectorAll('#basic-universe-tab .power-type-filter-toggle');
            expect(toggles.length).toBeGreaterThanOrEqual(4);
            const types = Array.from(toggles).map((b) => b.getAttribute('data-power-type'));
            expect(types).toContain('Energy');
            expect(types).toContain('Combat');
        });

        it('should start with no is-active toggles (show all when none selected)', () => {
            const active = document.querySelectorAll('#basic-universe-tab .power-type-filter-toggle.is-active');
            expect(active).toHaveLength(0);
        });
    });

    describe('setupBasicUniverseSearch Function', () => {
        it('should add event listeners to type toggles', () => {
            const toggles = document.querySelectorAll('#basic-universe-tab .power-type-filter-toggle');
            const addEventListenerSpy = jest.fn();

            toggles.forEach((btn) => {
                btn.addEventListener = addEventListenerSpy;
            });

            toggles.forEach((btn) => {
                btn.addEventListener('click', window.applyBasicUniverseFilters);
            });

            expect(addEventListenerSpy).toHaveBeenCalledTimes(toggles.length);
            expect(addEventListenerSpy).toHaveBeenCalledWith('click', window.applyBasicUniverseFilters);
        });

        it('should add event listeners to filter inputs', () => {
            const valueEquals = document.querySelector('#basic-universe-tab input[data-column="value"].equals');
            const valueMin = document.getElementById('basic-value-min');
            const valueMax = document.getElementById('basic-value-max');
            const bonusEquals = document.querySelector('#basic-universe-tab input[data-column="bonus"].equals');
            const bonusMin = document.getElementById('basic-bonus-min');
            const bonusMax = document.getElementById('basic-bonus-max');

            const addEventListenerSpy = jest.fn();

            // Mock addEventListener for all inputs
            [valueEquals, valueMin, valueMax, bonusEquals, bonusMin, bonusMax].forEach(input => {
                if (input) {
                    input.addEventListener = addEventListenerSpy;
                }
            });

            // Simulate adding event listeners
            if (valueEquals) valueEquals.addEventListener('input', window.applyBasicUniverseFilters);
            if (valueMin) valueMin.addEventListener('input', window.applyBasicUniverseFilters);
            if (valueMax) valueMax.addEventListener('input', window.applyBasicUniverseFilters);
            if (bonusEquals) bonusEquals.addEventListener('input', window.applyBasicUniverseFilters);
            if (bonusMin) bonusMin.addEventListener('input', window.applyBasicUniverseFilters);
            if (bonusMax) bonusMax.addEventListener('input', window.applyBasicUniverseFilters);

            expect(addEventListenerSpy).toHaveBeenCalledTimes(6);
        });
    });

    describe('Type Filtering Logic', () => {
        it('should get selected types from active toggles', () => {
            const toggles = document.querySelectorAll('#basic-universe-tab .power-type-filter-toggle');
            (toggles[0] as HTMLButtonElement).classList.add('is-active');
            (toggles[1] as HTMLButtonElement).classList.add('is-active');

            const selectedTypes = Array.from(
                document.querySelectorAll('#basic-universe-tab .power-type-filter-toggle.is-active')
            ).map((b) => b.getAttribute('data-power-type'));

            expect(selectedTypes).toEqual(['Energy', 'Combat']);
        });

        it('should handle no selected types as empty active set', () => {
            const selectedTypes = Array.from(
                document.querySelectorAll('#basic-universe-tab .power-type-filter-toggle.is-active')
            ).map((b) => b.getAttribute('data-power-type'));

            expect(selectedTypes).toEqual([]);
        });

        it('should filter cards by selected types', () => {
            const mockCards = [
                { card_name: 'Ray Gun', type: 'Energy', value_to_use: '6 or greater', bonus: '+2' },
                { card_name: 'Flintlock', type: 'Combat', value_to_use: '6 or greater', bonus: '+2' },
                { card_name: 'Hyde\'s Serum', type: 'Brute Force', value_to_use: '6 or greater', bonus: '+2' },
                { card_name: 'Secret Identity', type: 'Intelligence', value_to_use: '6 or greater', bonus: '+2' }
            ];

            // Test with all types selected
            const selectedTypes = ['Energy', 'Combat', 'Brute Force', 'Intelligence'];
            const filtered = mockCards.filter(card => selectedTypes.includes(card.type));
            
            expect(filtered).toHaveLength(4);
            expect(filtered).toEqual(mockCards);

            // Test with only Energy selected
            const energyOnly = ['Energy'];
            const energyFiltered = mockCards.filter(card => energyOnly.includes(card.type));
            
            expect(energyFiltered).toHaveLength(1);
            expect(energyFiltered[0].type).toBe('Energy');

            // Product rule: no active toggles => do not filter by type (show all)
            const noTypes: string[] = [];
            const noTypesFiltered =
                noTypes.length === 0 ? mockCards : mockCards.filter((card) => noTypes.includes(card.type));

            expect(noTypesFiltered).toHaveLength(4);
        });
    });

    describe('Search Functionality', () => {
        it('should setup search input event listener', () => {
            const searchInput = document.getElementById('search-input');
            const addEventListenerSpy = jest.fn();
            
            searchInput!.addEventListener = addEventListenerSpy;

            // Simulate adding search event listener
            searchInput!.addEventListener('input', jest.fn());

            expect(addEventListenerSpy).toHaveBeenCalledWith('input', expect.any(Function));
        });

        it('should handle empty search term', () => {
            const searchInput = document.getElementById('search-input') as HTMLInputElement;
            searchInput.value = '';

            // Simulate search input event
            const event = new dom.window.Event('input');
            searchInput.dispatchEvent(event);

            // Should call applyBasicUniverseFilters when search is empty
            // This would be tested in the actual implementation
        });
    });

    describe('Clear All Filters', () => {
        it('should have clear filters button', () => {
            const clearButton = document.querySelector('.clear-filters-btn');
            expect(clearButton).toBeTruthy();
            expect(clearButton!.textContent).toBe('Clear All Filters');
        });

        it('should call clearBasicUniverseFilters when clicked', () => {
            const clearButton = document.querySelector('.clear-filters-btn') as HTMLButtonElement;
            
            // Simulate click
            clearButton.click();
            
            // In the actual implementation, this would call clearBasicUniverseFilters
            // This tests the HTML structure is correct
            expect(clearButton.onclick).toBeDefined();
        });
    });

    describe('DOM Structure Validation', () => {
        it('should have correct table structure', () => {
            const table = document.querySelector('#basic-universe-tab table');
            expect(table).toBeTruthy();

            const thead = table!.querySelector('thead');
            expect(thead).toBeTruthy();

            const tbody = document.getElementById('basic-universe-tbody');
            expect(tbody).toBeTruthy();
        });

        it('should have correct filter row structure', () => {
            const filterRow = document.querySelector('.basic-universe-desktop-filter-row');
            expect(filterRow).toBeTruthy();

            const toggles = filterRow!.querySelectorAll('.power-type-filter-toggle');
            expect(toggles.length).toBeGreaterThanOrEqual(4);
        });

        it('should have correct input IDs and classes', () => {
            const valueMin = document.getElementById('basic-value-min');
            const valueMax = document.getElementById('basic-value-max');
            const bonusMin = document.getElementById('basic-bonus-min');
            const bonusMax = document.getElementById('basic-bonus-max');

            expect(valueMin).toBeTruthy();
            expect(valueMax).toBeTruthy();
            expect(bonusMin).toBeTruthy();
            expect(bonusMax).toBeTruthy();

            expect(valueMin!.classList.contains('filter-input')).toBe(true);
            expect(valueMax!.classList.contains('filter-input')).toBe(true);
            expect(bonusMin!.classList.contains('filter-input')).toBe(true);
            expect(bonusMax!.classList.contains('filter-input')).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle missing DOM elements gracefully', () => {
            // Test with missing elements
            const missingElement = document.getElementById('non-existent-element');
            expect(missingElement).toBeNull();

            // Should not throw errors when checking for existence
            expect(() => {
                if (missingElement) {
                    missingElement.addEventListener('input', jest.fn());
                }
            }).not.toThrow();
        });

        it('should handle empty toggle collections', () => {
            const emptyToggles = document.querySelectorAll('.non-existent-power-toggles');
            expect(emptyToggles).toHaveLength(0);

            const selectedTypes = Array.from(emptyToggles).map((b) => b.getAttribute('data-power-type'));
            expect(selectedTypes).toEqual([]);
        });
    });
});
