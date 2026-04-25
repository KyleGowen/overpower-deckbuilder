/**
 * @jest-environment jsdom
 */

/**
 * Tests for the All-tab filter + text-search functionality in
 * public/js/all-cards-display.js. Covers:
 *   - cardMatchesQuery (name / text fields / type slug / type label / sub-types)
 *   - applyAllCardsFilters (combining checkbox set + text query)
 *   - initializeAllCardsFilters (rendering 12 checkboxes, restoring from
 *     localStorage, persisting state, debounced search wiring, idempotency)
 *
 * The real production source is loaded via window.eval so we test the actual
 * code paths instead of a parallel re-implementation.
 */
import fs from 'fs';
import path from 'path';

declare global {
    // Augment jsdom's window with the helpers exposed by all-cards-display.js
    // so the tests can call them with proper typing.
    interface Window {
        loadAllCards: () => Promise<any[]>;
        displayAllCards: (cards?: any[] | null) => void;
        filterAllCardsByType: () => void;
        applyAllCardsFilters: () => void;
        initializeAllCardsFilters: () => void;
        loadAndDisplayAllCards: () => Promise<void>;
        getCardName: (card: any) => string;
        sortAllCardsData: (cards: any[]) => any[];
        // Exposed by the eval-tail patch below for direct unit testing:
        cardMatchesQuery: (card: any, query: string) => boolean;
        persistAllCardsFilterState: () => void;
        allCardsData: any[];
        // Stubs below that all-cards-display.js calls into.
        getCardImagePath?: any;
        getCardImagePathForDisplay?: any;
        getCurrentUser?: any;
        isGuestUser?: any;
        addCardToCollectionFromDatabase?: any;
        removeOneFromCollection?: any;
        showDeckSelection?: any;
        showCardHoverModal?: any;
        hideCardHoverModal?: any;
        openModal?: any;
        refreshDatabaseViewCollectionButtons?: any;
        catalogListPayload?: any;
    }
}

const SCRIPT_PATH = path.join(__dirname, '../../public/js/all-cards-display.js');

/** Build a minimal DOM that mirrors public/index.html's All-tab structure. */
function setupDom(): void {
    document.body.innerHTML = `
        <div id="all-cards-tab">
            <div id="all-cards-filter-container">
                <input type="search" id="all-cards-search-input" />
                <div id="all-cards-type-filters"></div>
            </div>
            <div id="all-cards-grid-container"></div>
        </div>
    `;
}

/** Stub all the cross-module helpers that all-cards-display.js calls. */
function installStubs(): void {
    window.getCardImagePath = (card: any, type: string) =>
        `/img/${type}/${card.image_path || card.image || 'placeholder.webp'}`;
    window.getCardImagePathForDisplay = window.getCardImagePath;
    window.getCurrentUser = () => null;
    window.isGuestUser = () => false;
    window.addCardToCollectionFromDatabase = jest.fn();
    window.removeOneFromCollection = jest.fn();
    window.showDeckSelection = jest.fn();
    window.showCardHoverModal = jest.fn();
    window.hideCardHoverModal = jest.fn();
    window.openModal = jest.fn();
    window.refreshDatabaseViewCollectionButtons = jest.fn();
    window.catalogListPayload = (response: any, json: any) => {
        const ok = response?.ok !== false && Array.isArray(json?.data);
        return { ok, rows: ok ? json.data : [] };
    };
    // Make rendering synchronous so insertAdjacentHTML happens before assertions.
    (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
    };
    // Quiet the chatty console.log statements; keep warn/error visible if needed.
    jest.spyOn(console, 'log').mockImplementation(() => {});
}

/**
 * Loaded exactly once. all-cards-display.js calls
 * Object.defineProperty(window, 'allCardsData', ...) which makes the property
 * non-configurable, so re-evaluating the script in the same window throws.
 */
function loadProductionScriptOnce(): void {
    let code = fs.readFileSync(SCRIPT_PATH, 'utf8');
    // Expose the otherwise-private helpers on window so the tests can drive
    // them directly. We append after the original script so the closures
    // capture the same module-scoped bindings.
    code += `
        ;window.cardMatchesQuery = cardMatchesQuery;
        ;window.persistAllCardsFilterState = persistAllCardsFilterState;
    `;
    window.eval(code);
}

beforeAll(() => {
    installStubs();
    setupDom();
    loadProductionScriptOnce();
});

beforeEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    setupDom();
    // Re-install stubs in case a prior test mocked them.
    installStubs();
    // Reset the script's module-scope arrays via the exposed setter.
    window.allCardsData = [];
});

afterEach(() => {
    jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// cardMatchesQuery
// ---------------------------------------------------------------------------

describe('cardMatchesQuery', () => {
    it('returns true for empty query (matches every card)', () => {
        const card = { cardType: 'character', name: 'Anything' };
        expect(window.cardMatchesQuery(card, '')).toBe(true);
        expect(window.cardMatchesQuery(card, '' as any)).toBe(true);
    });

    it('returns false for null/undefined card with a non-empty query', () => {
        expect(window.cardMatchesQuery(null, 'lancelot')).toBe(false);
        expect(window.cardMatchesQuery(undefined, 'lancelot')).toBe(false);
    });

    it('matches the display name, case-insensitive', () => {
        const card = { cardType: 'character', name: 'Lancelot the Brave' };
        expect(window.cardMatchesQuery(card, 'lancelot')).toBe(true);
        // cardMatchesQuery expects pre-lowercased queries (applyAllCardsFilters
        // lower-cases before calling), so verify the lowercase contract.
        expect(window.cardMatchesQuery(card, 'brave')).toBe(true);
        expect(window.cardMatchesQuery(card, 'merlin')).toBe(false);
    });

    it('matches against text-search fields like special_abilities and card_text', () => {
        const card = {
            cardType: 'special',
            name: 'Round Table Strike',
            special_abilities: 'When played alongside Lancelot, double damage.'
        };
        expect(window.cardMatchesQuery(card, 'lancelot')).toBe(true);

        const eventCard = {
            cardType: 'event',
            name: 'Surprise Visit',
            card_text: 'Search for any character named Lancelot.'
        };
        expect(window.cardMatchesQuery(eventCard, 'lancelot')).toBe(true);
    });

    it('matches against flavor_text and other free-form text fields', () => {
        const fields: Record<string, string>[] = [
            { flavor_text: 'For honor and Lancelot.' },
            { game_effect: 'Trigger when Lancelot enters play.' },
            { card_effect: 'Lancelot may attack twice.' },
            { card_description: 'Lancelot in disguise.' },
            { aspect_description: 'A reflection of Lancelot.' },
            { bonus: 'Lancelot bonus' },
            { to_use: 'Pair with Lancelot' }
        ];
        for (const extra of fields) {
            const card: any = { cardType: 'event', name: 'Trinket', ...extra };
            expect(window.cardMatchesQuery(card, 'lancelot')).toBe(true);
        }
    });

    it('matches against the high-level type slug (e.g. "character")', () => {
        const card = { cardType: 'character', name: 'Bedivere' };
        expect(window.cardMatchesQuery(card, 'character')).toBe(true);
    });

    it('matches against the human-readable type label (e.g. "Special Cards")', () => {
        const card = { cardType: 'special', name: 'Excalibur' };
        expect(window.cardMatchesQuery(card, 'special cards')).toBe(true);

        const universeCard = { cardType: 'advanced-universe', name: 'Camelot' };
        expect(window.cardMatchesQuery(universeCard, 'universe: advanced')).toBe(true);
        expect(window.cardMatchesQuery(universeCard, 'advanced')).toBe(true);
    });

    it('matches against sub-type fields (power_type, card_type, attack_type, mission_set...)', () => {
        const power: any = { cardType: 'power', value: '7', power_type: 'Cataclysm' };
        expect(window.cardMatchesQuery(power, 'cataclysm')).toBe(true);

        const teamwork: any = { cardType: 'teamwork', name: 'Combo', card_type: 'Assist' };
        expect(window.cardMatchesQuery(teamwork, 'assist')).toBe(true);

        const aspect: any = { cardType: 'aspect', card_name: 'Inner Strength', type_1: 'Energy' };
        expect(window.cardMatchesQuery(aspect, 'energy')).toBe(true);

        const mission: any = { cardType: 'mission', name: 'Expedition', mission_set: 'Quest Arc' };
        expect(window.cardMatchesQuery(mission, 'quest arc')).toBe(true);

        const character: any = { cardType: 'character', name: 'Brawler', attack_type: 'Melee' };
        expect(window.cardMatchesQuery(character, 'melee')).toBe(true);
    });

    it('returns false when nothing matches', () => {
        const card = {
            cardType: 'character',
            name: 'Arthur',
            special_abilities: 'Pulls swords from stones.'
        };
        expect(window.cardMatchesQuery(card, 'lancelot')).toBe(false);
    });

    it('ignores undefined/null sub-type and text fields without throwing', () => {
        const card = {
            cardType: 'character',
            name: 'Galahad',
            card_text: null,
            power_type: undefined,
            type_1: ''
        };
        expect(() => window.cardMatchesQuery(card, 'galahad')).not.toThrow();
        expect(window.cardMatchesQuery(card, 'galahad')).toBe(true);
        expect(window.cardMatchesQuery(card, 'nonexistent')).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// initializeAllCardsFilters
// ---------------------------------------------------------------------------

describe('initializeAllCardsFilters', () => {
    it('renders one checkbox per known card type (12 total)', () => {
        window.initializeAllCardsFilters();

        const cbs = document.querySelectorAll<HTMLInputElement>('.card-type-filter-cb');
        expect(cbs.length).toBe(12);

        const types = Array.from(cbs).map(cb => cb.getAttribute('data-card-type'));
        expect(types).toEqual([
            'character', 'special', 'advanced-universe', 'location',
            'aspect', 'mission', 'event', 'teamwork',
            'ally-universe', 'training', 'basic-universe', 'power'
        ]);
    });

    it('renders human-readable labels next to each checkbox', () => {
        window.initializeAllCardsFilters();

        const labels = Array.from(document.querySelectorAll('.card-type-filter span'))
            .map(el => el.textContent?.trim());
        expect(labels).toContain('Characters');
        expect(labels).toContain('Special Cards');
        expect(labels).toContain('Universe: Advanced');
        expect(labels).toContain('Universe: Ally');
        expect(labels).toContain('Universe: Basic');
        expect(labels).toContain('Universe: Training');
        expect(labels).toContain('Universe: Teamwork');
        expect(labels).toContain('Power Cards');
    });

    it('defaults every checkbox to checked when no localStorage state is present', () => {
        window.initializeAllCardsFilters();

        const cbs = document.querySelectorAll<HTMLInputElement>('.card-type-filter-cb');
        cbs.forEach(cb => expect(cb.checked).toBe(true));
    });

    it('restores checkbox state from localStorage (false stays unchecked, true/missing → checked)', () => {
        localStorage.setItem(
            'all-cards-filter-state',
            JSON.stringify({ character: true, special: false, power: false })
        );

        window.initializeAllCardsFilters();

        const get = (type: string) =>
            document.querySelector<HTMLInputElement>(
                `.card-type-filter-cb[data-card-type="${type}"]`
            );
        expect(get('character')!.checked).toBe(true);
        expect(get('special')!.checked).toBe(false);
        expect(get('power')!.checked).toBe(false);
        // Types not in stored state default back to checked.
        expect(get('event')!.checked).toBe(true);
        expect(get('mission')!.checked).toBe(true);
    });

    it('handles a corrupt localStorage payload by treating state as empty (all checked)', () => {
        localStorage.setItem('all-cards-filter-state', '{not json');

        expect(() => window.initializeAllCardsFilters()).not.toThrow();

        const cbs = document.querySelectorAll<HTMLInputElement>('.card-type-filter-cb');
        expect(cbs.length).toBe(12);
        cbs.forEach(cb => expect(cb.checked).toBe(true));
    });

    it('persists state and re-applies filters when a checkbox changes', () => {
        window.allCardsData = [
            { id: 'c1', cardType: 'character', name: 'Lancelot' },
            { id: 's1', cardType: 'special', name: 'Camelot Charge' }
        ];
        window.initializeAllCardsFilters();
        window.applyAllCardsFilters();

        const characterCb = document.querySelector<HTMLInputElement>(
            '.card-type-filter-cb[data-card-type="character"]'
        )!;
        characterCb.checked = false;
        characterCb.dispatchEvent(new Event('change'));

        // Persisted state reflects the unchecked Character box.
        const stored = JSON.parse(localStorage.getItem('all-cards-filter-state') || '{}');
        expect(stored.character).toBe(false);
        expect(stored.special).toBe(true);

        // Grid only renders the special card now.
        const grid = document.getElementById('all-cards-grid-container')!;
        expect(grid.innerHTML).toContain('Camelot Charge');
        expect(grid.innerHTML).not.toContain('Lancelot');
    });

    it('debounces text-search input and fires applyAllCardsFilters once', () => {
        jest.useFakeTimers();
        // useFakeTimers replaces requestAnimationFrame; re-install the
        // synchronous stub so renderCardsInBatches paints immediately.
        (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
            cb(0);
            return 0;
        };
        window.allCardsData = [
            { id: 'c1', cardType: 'character', name: 'Lancelot' },
            { id: 'c2', cardType: 'character', name: 'Arthur' }
        ];
        window.initializeAllCardsFilters();
        window.applyAllCardsFilters();

        const grid = document.getElementById('all-cards-grid-container')!;
        const input = document.getElementById('all-cards-search-input') as HTMLInputElement;
        input.value = 'lancelot';
        input.dispatchEvent(new Event('input'));

        // Before the debounce fires, the grid still shows everything.
        expect(grid.innerHTML).toContain('Arthur');
        expect(grid.innerHTML).toContain('Lancelot');

        // Advance past the 150ms debounce window.
        jest.advanceTimersByTime(160);

        expect(grid.innerHTML).toContain('Lancelot');
        expect(grid.innerHTML).not.toContain('Arthur');
    });

    it('coalesces rapid typing into a single filter pass via the debounce', () => {
        jest.useFakeTimers();
        (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
            cb(0);
            return 0;
        };
        window.allCardsData = [
            { id: 'c1', cardType: 'character', name: 'Lancelot' },
            { id: 'c2', cardType: 'character', name: 'Arthur' }
        ];
        window.initializeAllCardsFilters();
        window.applyAllCardsFilters();

        const input = document.getElementById('all-cards-search-input') as HTMLInputElement;
        const grid = document.getElementById('all-cards-grid-container')!;

        for (const ch of ['l', 'la', 'lan', 'lance', 'lancelot']) {
            input.value = ch;
            input.dispatchEvent(new Event('input'));
            jest.advanceTimersByTime(50); // each shorter than the 150ms debounce
        }
        // No filter should have fired yet because every keystroke reset the timer.
        expect(grid.innerHTML).toContain('Arthur');

        jest.advanceTimersByTime(200);
        expect(grid.innerHTML).toContain('Lancelot');
        expect(grid.innerHTML).not.toContain('Arthur');
    });

    it('is idempotent: a second call does not double-bind the search input', () => {
        jest.useFakeTimers();
        (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
            cb(0);
            return 0;
        };
        window.allCardsData = [
            { id: 'c1', cardType: 'character', name: 'Lancelot' }
        ];
        window.initializeAllCardsFilters();
        window.initializeAllCardsFilters(); // call again
        window.applyAllCardsFilters();

        const input = document.getElementById('all-cards-search-input') as HTMLInputElement;
        // The dataset flag from the first init is preserved across re-renders
        // because the search input lives outside #all-cards-type-filters.
        expect(input.dataset.allCardsSearchBound).toBe('1');

        // Still works: typing fires exactly one filter run after debounce.
        const spy = jest.spyOn(window, 'applyAllCardsFilters');
        input.value = 'lancelot';
        input.dispatchEvent(new Event('input'));
        jest.advanceTimersByTime(160);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('exits gracefully when the type-filters container is missing', () => {
        document.getElementById('all-cards-type-filters')!.remove();
        expect(() => window.initializeAllCardsFilters()).not.toThrow();
        expect(document.querySelectorAll('.card-type-filter-cb').length).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// applyAllCardsFilters
// ---------------------------------------------------------------------------

describe('applyAllCardsFilters', () => {
    function setCheckbox(type: string, checked: boolean): void {
        const cb = document.querySelector<HTMLInputElement>(
            `.card-type-filter-cb[data-card-type="${type}"]`
        );
        if (cb) cb.checked = checked;
    }

    function setQuery(q: string): void {
        const input = document.getElementById('all-cards-search-input') as HTMLInputElement;
        input.value = q;
    }

    beforeEach(() => {
        window.allCardsData = [
            { id: '1', cardType: 'character', name: 'Lancelot the Brave' },
            { id: '2', cardType: 'character', name: 'Arthur Pendragon' },
            { id: '3', cardType: 'special', name: 'Round Table Strike',
              special_abilities: 'Played alongside Lancelot for double damage.' },
            { id: '4', cardType: 'special', name: 'Excalibur Draw' },
            { id: '5', cardType: 'event', name: 'Royal Council',
              card_text: 'Recall any Lancelot card.' },
            { id: '6', cardType: 'power', value: '7', power_type: 'Cataclysm' },
            { id: '7', cardType: 'aspect', card_name: 'Strength', type_1: 'Energy' }
        ];
        window.initializeAllCardsFilters();
    });

    it('renders all cards when every checkbox is checked and the query is empty', () => {
        window.applyAllCardsFilters();

        const grid = document.getElementById('all-cards-grid-container')!;
        for (const c of window.allCardsData) {
            const expected = c.name || c.card_name || `${c.value} - ${c.power_type}`;
            expect(grid.innerHTML).toContain(expected);
        }
    });

    it('hides cards whose type checkbox is unchecked', () => {
        setCheckbox('character', false);
        window.applyAllCardsFilters();

        const grid = document.getElementById('all-cards-grid-container')!;
        expect(grid.innerHTML).not.toContain('Lancelot the Brave');
        expect(grid.innerHTML).not.toContain('Arthur Pendragon');
        expect(grid.innerHTML).toContain('Round Table Strike');
        expect(grid.innerHTML).toContain('Excalibur Draw');
    });

    it('renders zero cards when no checkboxes are checked', () => {
        document.querySelectorAll<HTMLInputElement>('.card-type-filter-cb')
            .forEach(cb => { cb.checked = false; });

        window.applyAllCardsFilters();

        const grid = document.getElementById('all-cards-grid-container')!;
        // Every cell wrapper would contain 'all-cards-cell'; with no rows the
        // grid is empty.
        expect(grid.innerHTML).not.toContain('all-cards-cell');
    });

    it('searches "Lancelot" across name AND text fields when all types are checked', () => {
        setQuery('Lancelot');
        window.applyAllCardsFilters();

        const grid = document.getElementById('all-cards-grid-container')!;
        // Direct name hits:
        expect(grid.innerHTML).toContain('Lancelot the Brave');
        // special_abilities hit:
        expect(grid.innerHTML).toContain('Round Table Strike');
        // card_text hit:
        expect(grid.innerHTML).toContain('Royal Council');
        // Should NOT appear:
        expect(grid.innerHTML).not.toContain('Arthur Pendragon');
        expect(grid.innerHTML).not.toContain('Excalibur Draw');
    });

    it('searches case-insensitively and trims whitespace', () => {
        setQuery('   LANCELOT   ');
        window.applyAllCardsFilters();

        const grid = document.getElementById('all-cards-grid-container')!;
        expect(grid.innerHTML).toContain('Lancelot the Brave');
        expect(grid.innerHTML).toContain('Round Table Strike');
        expect(grid.innerHTML).not.toContain('Arthur Pendragon');
    });

    it('combines text query with checkbox filter (AND semantics)', () => {
        // Only Special Cards is enabled; query "Lancelot" should match the
        // Special card whose ability mentions Lancelot, but NOT the character
        // Lancelot card (different type).
        document.querySelectorAll<HTMLInputElement>('.card-type-filter-cb')
            .forEach(cb => { cb.checked = false; });
        setCheckbox('special', true);
        setQuery('lancelot');
        window.applyAllCardsFilters();

        const grid = document.getElementById('all-cards-grid-container')!;
        expect(grid.innerHTML).toContain('Round Table Strike');
        expect(grid.innerHTML).not.toContain('Lancelot the Brave');
        expect(grid.innerHTML).not.toContain('Excalibur Draw'); // no Lancelot mention
    });

    it('matches sub-type values like "Cataclysm" and "Energy"', () => {
        setQuery('cataclysm');
        window.applyAllCardsFilters();
        let grid = document.getElementById('all-cards-grid-container')!;
        expect(grid.innerHTML).toContain('7 - Cataclysm');
        expect(grid.innerHTML).not.toContain('Lancelot the Brave');

        setQuery('energy');
        window.applyAllCardsFilters();
        grid = document.getElementById('all-cards-grid-container')!;
        expect(grid.innerHTML).toContain('Strength');
    });

    it('matches the type label "Special Cards" when typed in search', () => {
        setQuery('special cards');
        window.applyAllCardsFilters();

        const grid = document.getElementById('all-cards-grid-container')!;
        expect(grid.innerHTML).toContain('Round Table Strike');
        expect(grid.innerHTML).toContain('Excalibur Draw');
        expect(grid.innerHTML).not.toContain('Lancelot the Brave');
        expect(grid.innerHTML).not.toContain('Arthur Pendragon');
    });

    it('returns no matches when query has no hits across any field', () => {
        setQuery('zzzzzz-no-match');
        window.applyAllCardsFilters();

        const grid = document.getElementById('all-cards-grid-container')!;
        expect(grid.innerHTML).not.toContain('all-cards-cell');
    });

    it('exposes filterAllCardsByType as an alias for applyAllCardsFilters', () => {
        expect(window.filterAllCardsByType).toBe(window.applyAllCardsFilters);
    });
});

// ---------------------------------------------------------------------------
// persistAllCardsFilterState
// ---------------------------------------------------------------------------

describe('persistAllCardsFilterState', () => {
    it('writes a JSON map of every checkbox state to localStorage', () => {
        window.initializeAllCardsFilters();

        const cb = document.querySelector<HTMLInputElement>(
            '.card-type-filter-cb[data-card-type="power"]'
        )!;
        cb.checked = false;

        window.persistAllCardsFilterState();

        const raw = localStorage.getItem('all-cards-filter-state');
        expect(raw).not.toBeNull();
        const state = JSON.parse(raw!);
        expect(state.power).toBe(false);
        expect(state.character).toBe(true);
        expect(Object.keys(state).length).toBe(12);
    });

    it('does not throw if localStorage.setItem rejects (e.g. quota exceeded)', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const setItem = jest.spyOn(Storage.prototype, 'setItem')
            .mockImplementation(() => { throw new Error('quota exceeded'); });

        window.initializeAllCardsFilters();
        expect(() => window.persistAllCardsFilterState()).not.toThrow();
        expect(warn).toHaveBeenCalled();

        setItem.mockRestore();
    });
});
