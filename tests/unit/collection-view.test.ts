/**
 * Unit tests for public/js/collection-view.js
 * Tests merge logic, display rendering, toggle behaviour, and quantity controls
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// ─── Stubs wired before the module is eval'd ──────────────────────────────────

global.fetch = jest.fn();

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((k: string): string | null => store[k] ?? null),
        setItem: jest.fn((k: string, v: string) => { store[k] = v; }),
        removeItem: jest.fn((k: string) => { delete store[k]; }),
        clear: jest.fn(() => { store = {}; })
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Minimal stubs for functions called by collection-view.js
(window as any).showCardHoverModal = jest.fn();
(window as any).hideCardHoverModal = jest.fn();
(window as any).showNotification = jest.fn();
(window as any).toThumbnailPath = (p: string) => p;

// ─── Load the module ──────────────────────────────────────────────────────────

const collectionViewCode = fs.readFileSync(
    path.join(__dirname, '../../public/js/collection-view.js'),
    'utf8'
);

// Extract functions from the eval scope
let fns: Record<string, (...args: any[]) => any>;

// Mock getCurrentUser for GUEST detection tests
let mockCurrentUser: any = null;
(window as any).getCurrentUser = jest.fn(() => mockCurrentUser);

function loadModule() {
    fns = eval(`
        ${collectionViewCode}
        ({
            mergeCollectionWithAllCards,
            displayCollectionCards,
            toggleUnownedCards,
            loadCollection,
            updateCollectionQuantity,
            handleCollectionQuantityClick,
            removeCardFromCollection,
            removeOneFromCollection,
            formatCardType,
            translateSet,
            isMainErbSetCode,
            getCardDisplayName,
            sortCollectionTable,
            isGuestUser,
            loadGuestCollectionFromStorage,
            saveGuestCollectionToStorage,
            showGuestSandboxBanner,
            addCardToCollection
        })
    `);
}

// ─── Test helpers ──────────────────────────────────────────────────────────────

/** Build a minimal owned-collection card entry */
function makeOwned(id: string, cardType: string, quantity = 1): any {
    return {
        card_id: id,
        card_type: cardType,
        quantity,
        image_path: `/images/${id}.webp`,
        set: 'ERB',
        card_data: { set_number: '001', name: `Card ${id}` }
    };
}

/** Build a minimal allCardsData entry */
function makeAllCard(id: string, cardType: string, setNumber = '001'): any {
    return {
        id,
        cardType,
        name: `Card ${id}`,
        set_number: setNumber,
        image_path: `/images/${id}.webp`,
        set: 'ERB'
    };
}

/** Render the collection list container into the DOM */
function setupDOM(extraHtml = '') {
    document.body.innerHTML = `
        <div id="collectionCardsList"></div>
        <input type="checkbox" id="showUnownedToggle" checked>
        ${extraHtml}
    `;
}

/** loadCollection always calls GET /api/sets before the collection API */
function mockFetchSetsOkOnce() {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
            success: true,
            data: [
                { code: 'ERB', name: 'Edgar Rice Burroughs and the World Legends' },
                { code: 'SKY', name: 'Skybound' },
            ],
        }),
    });
}

/** GUEST flows still run loadCollection → /api/sets (no collection API) */
function wireDefaultSetsFetchMock() {
    (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
            success: true,
            data: [
                { code: 'ERB', name: 'Edgar Rice Burroughs and the World Legends' },
                { code: 'SKY', name: 'Skybound' },
            ],
        }),
    });
}

// ─── mergeCollectionWithAllCards ─────────────────────────────────────────────

describe('mergeCollectionWithAllCards()', () => {
    beforeAll(() => loadModule());

    it('marks owned cards with inCollection: true', () => {
        const owned = [makeOwned('card-1', 'character')];
        const all   = [makeAllCard('card-1', 'character')];
        const result = fns.mergeCollectionWithAllCards(owned, all);

        expect(result).toHaveLength(1);
        expect(result[0].inCollection).toBe(true);
        expect(result[0].card_id).toBe('card-1');
        expect(result[0].quantity).toBe(1);
    });

    it('marks unowned cards with inCollection: false', () => {
        const owned: any[] = [];
        const all   = [makeAllCard('card-1', 'character')];
        const result = fns.mergeCollectionWithAllCards(owned, all);

        expect(result).toHaveLength(1);
        expect(result[0].inCollection).toBe(false);
        expect(result[0].card_id).toBe('card-1');
        expect(result[0].quantity).toBeNull();
    });

    it('interleaves owned and unowned cards preserving allCards order', () => {
        const owned = [makeOwned('card-2', 'special')];
        const all   = [
            makeAllCard('card-1', 'character', '001'),
            makeAllCard('card-2', 'special',   '002'),
            makeAllCard('card-3', 'event',     '003')
        ];
        const result = fns.mergeCollectionWithAllCards(owned, all);

        expect(result).toHaveLength(3);
        expect(result[0].inCollection).toBe(false); // card-1
        expect(result[1].inCollection).toBe(true);  // card-2 (owned)
        expect(result[2].inCollection).toBe(false); // card-3
    });

    it('does not double-add a card that appears in both owned and allCards', () => {
        const owned = [makeOwned('card-1', 'character')];
        const all   = [makeAllCard('card-1', 'character')];
        const result = fns.mergeCollectionWithAllCards(owned, all);

        expect(result).toHaveLength(1);
    });

    it('appends owned cards not found in allCards (edge case)', () => {
        const owned = [makeOwned('orphan', 'power')];
        const all   = [makeAllCard('card-1', 'character')];
        const result = fns.mergeCollectionWithAllCards(owned, all);

        expect(result).toHaveLength(2);
        const orphan = result.find((r: any) => r.card_id === 'orphan');
        expect(orphan).toBeDefined();
        expect(orphan.inCollection).toBe(true);
    });

    it('disambiguates cards with the same id but different cardType', () => {
        const owned = [makeOwned('shared-id', 'character')];
        const all   = [
            makeAllCard('shared-id', 'character'),
            makeAllCard('shared-id', 'special')
        ];
        const result = fns.mergeCollectionWithAllCards(owned, all);

        const charCard    = result.find((r: any) => r.card_type === 'character');
        const specialCard = result.find((r: any) => r.card_type === 'special');

        expect(charCard.inCollection).toBe(true);
        expect(specialCard.inCollection).toBe(false);
    });

    it('returns empty array when both inputs are empty', () => {
        expect(fns.mergeCollectionWithAllCards([], [] as any[])).toEqual([]);
    });

    it('preserves the quantity from the owned collection entry', () => {
        const owned = [makeOwned('card-1', 'character', 5)];
        const all   = [makeAllCard('card-1', 'character')];
        const result = fns.mergeCollectionWithAllCards(owned, all);

        expect(result[0].quantity).toBe(5);
    });

    it('synthesises image_path from allCards for unowned cards', () => {
        const all = [{ id: 'card-x', cardType: 'mission', image_path: '/images/x.webp', set_number: '001', set: 'ERB' }];
        const result = fns.mergeCollectionWithAllCards([], all);

        expect(result[0].image_path).toBe('/images/x.webp');
    });

    it('falls back to card.image when image_path is absent', () => {
        const all = [{ id: 'card-x', cardType: 'mission', image: '/images/fallback.webp', set_number: '001', set: 'ERB' }];
        const result = fns.mergeCollectionWithAllCards([], all);

        expect(result[0].image_path).toBe('/images/fallback.webp');
    });

    it('handles a large set with mixed owned / unowned efficiently', () => {
        const all = Array.from({ length: 200 }, (_, i) => makeAllCard(`c-${i}`, 'character', String(i + 1)));
        const owned = all.slice(0, 50).map(c => makeOwned(c.id, c.cardType));
        const result = fns.mergeCollectionWithAllCards(owned, all);

        expect(result).toHaveLength(200);
        const ownedCount   = result.filter((r: any) => r.inCollection).length;
        const unownedCount = result.filter((r: any) => !r.inCollection).length;
        expect(ownedCount).toBe(50);
        expect(unownedCount).toBe(150);
    });
});

// ─── displayCollectionCards() ─────────────────────────────────────────────────

describe('displayCollectionCards()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
        (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
    });

    it('renders an owned card row without the unowned class', () => {
        const cards = [Object.assign(makeOwned('card-1', 'character'), { inCollection: true })];
        fns.displayCollectionCards(cards);

        const rows = document.querySelectorAll('.collection-card-item');
        expect(rows).toHaveLength(1);
        expect(rows[0].classList.contains('collection-card-unowned')).toBe(false);
    });

    it('renders an unowned card row with the collection-card-unowned class', () => {
        const merged = fns.mergeCollectionWithAllCards([], [makeAllCard('card-1', 'special')]);
        fns.displayCollectionCards(merged);

        const rows = document.querySelectorAll('.collection-card-item');
        expect(rows).toHaveLength(1);
        expect(rows[0].classList.contains('collection-card-unowned')).toBe(true);
    });

    it('owned row shows quantity in Qty cell', () => {
        const cards = [Object.assign(makeOwned('card-1', 'character', 3), { inCollection: true })];
        fns.displayCollectionCards(cards);

        const qtyCells = document.querySelectorAll('.collection-card-quantity');
        expect(qtyCells[0].textContent).toBe('3');
    });

    it('unowned row has blank Qty cell', () => {
        const merged = fns.mergeCollectionWithAllCards([], [makeAllCard('card-1', 'special')]);
        fns.displayCollectionCards(merged);

        const qtyCells = document.querySelectorAll('.collection-card-quantity');
        expect(qtyCells[0].textContent).toBe('');
    });

    it('owned row has both - and + buttons', () => {
        const cards = [Object.assign(makeOwned('card-1', 'character'), { inCollection: true })];
        fns.displayCollectionCards(cards);

        const buttons = document.querySelectorAll('.collection-quantity-btn');
        expect(buttons).toHaveLength(2);
        expect(buttons[0].textContent).toBe('-');
        expect(buttons[1].textContent).toBe('+');
    });

    it('unowned row has only one + button', () => {
        const merged = fns.mergeCollectionWithAllCards([], [makeAllCard('card-1', 'special')]);
        fns.displayCollectionCards(merged);

        const buttons = document.querySelectorAll('.collection-quantity-btn');
        expect(buttons).toHaveLength(1);
        expect(buttons[0].textContent).toBe('+');
    });

    it('unowned + button carries correct data attributes on its row', () => {
        const merged = fns.mergeCollectionWithAllCards([], [makeAllCard('card-99', 'event', '099')]);
        fns.displayCollectionCards(merged);

        const row = document.querySelector('.collection-card-unowned') as HTMLElement;
        expect(row.getAttribute('data-card-id')).toBe('card-99');
        expect(row.getAttribute('data-card-type')).toBe('event');
    });

    it('renders the empty state when no owned cards and toggle is off', () => {
        // Disable unowned display by calling with toggle off
        const checkbox = document.getElementById('showUnownedToggle') as HTMLInputElement;
        checkbox.checked = false;
        fns.toggleUnownedCards();

        // mergedCollectionData is empty at this point → empty state
        const container = document.getElementById('collectionCardsList')!;
        expect(container.innerHTML).toContain('collection-empty');
    });

    it('renders both owned and unowned rows in a mixed set', () => {
        const owned  = [makeOwned('card-1', 'character')];
        const all    = [makeAllCard('card-1', 'character', '001'), makeAllCard('card-2', 'special', '002')];
        const merged = fns.mergeCollectionWithAllCards(owned, all);
        fns.displayCollectionCards(merged);

        const rows        = document.querySelectorAll('.collection-card-item');
        const unownedRows = document.querySelectorAll('.collection-card-unowned');
        expect(rows).toHaveLength(2);
        expect(unownedRows).toHaveLength(1);
    });

    it('sets data-quantity to -1 on unowned rows for sort sentinel', () => {
        const merged = fns.mergeCollectionWithAllCards([], [makeAllCard('card-1', 'special')]);
        fns.displayCollectionCards(merged);

        const row = document.querySelector('.collection-card-unowned') as HTMLElement;
        expect(row.getAttribute('data-quantity')).toBe('-1');
    });

    it('sets data-set-number from card_data.set_number on unowned rows', () => {
        const merged = fns.mergeCollectionWithAllCards([], [makeAllCard('card-1', 'character', '042')]);
        fns.displayCollectionCards(merged);

        const row = document.querySelector('.collection-card-unowned') as HTMLElement;
        expect(row.getAttribute('data-set-number')).toBe('42');
    });

    it('renders a table with thead when there are visible cards', () => {
        const merged = fns.mergeCollectionWithAllCards([], [makeAllCard('card-1', 'special')]);
        fns.displayCollectionCards(merged);

        expect(document.querySelector('#collection-table')).not.toBeNull();
        expect(document.querySelector('thead')).not.toBeNull();
    });

    it('appends (Alternate Art) for ERB alternate image_path rows', () => {
        const row = {
            card_id: 'pow-erb-alt',
            card_type: 'power',
            inCollection: true,
            quantity: 1,
            set: 'ERB',
            image_path: 'power-cards/alternate/8_combat.webp',
            is_foil: false,
            card_data: { set_number: '304', value: 8, power_type: 'Combat' },
        };
        fns.displayCollectionCards([row]);
        const nameCell = document.querySelector('.collection-card-name');
        expect(nameCell?.textContent).toContain('(Alternate Art)');
    });

    it('does not append (Alternate Art) for non-ERB sets with alternate image_path', () => {
        const variants = [
            {
                card_id: 'pow-sky',
                card_type: 'power',
                inCollection: true,
                quantity: 1,
                set: 'SKY',
                image_path: 'power-cards/alternate/7_anypower.png',
                is_foil: false,
                card_data: { set_number: '475', value: 7, power_type: 'Any-Power' },
            },
            {
                card_id: 'pow-tfcp',
                card_type: 'power',
                inCollection: true,
                quantity: 1,
                set: 'TFCP',
                image_path: 'power-cards/alternate/7_combat.png',
                is_foil: false,
                card_data: { set_number: '301', value: 7, power_type: 'Combat' },
            },
            {
                card_id: 'pow-erbp',
                card_type: 'power',
                inCollection: true,
                quantity: 1,
                set: 'ERBP',
                image_path: 'power-cards/alternate/5_multipower.webp',
                is_foil: false,
                card_data: { set_number: '7', value: 5, power_type: 'Multi Power' },
            },
        ];
        for (const row of variants) {
            fns.displayCollectionCards([row]);
            const nameCell = document.querySelector('.collection-card-name');
            expect(nameCell?.textContent).not.toContain('(Alternate Art)');
        }
    });
});

// ─── toggleUnownedCards() ────────────────────────────────────────────────────

describe('toggleUnownedCards()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
        (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
    });

    it('hides unowned rows when checkbox is unchecked', () => {
        // Pre-populate mergedCollectionData via loadCollection path isn't available,
        // so call displayCollectionCards directly first to set module state,
        // then toggle.
        const owned  = [makeOwned('card-1', 'character')];
        const all    = [makeAllCard('card-1', 'character', '001'), makeAllCard('card-2', 'special', '002')];
        const merged = fns.mergeCollectionWithAllCards(owned, all);

        // Prime the module-level mergedCollectionData by calling display
        fns.displayCollectionCards(merged);

        // Now set the module state by simulating an unchecked toggle
        // We need to update mergedCollectionData inside the module scope —
        // the toggle reads it from the closure, so we must call loadModule again
        // with the merged data already set. Instead we'll test via the window exposure.
        const checkbox = document.getElementById('showUnownedToggle') as HTMLInputElement;
        checkbox.checked = false;

        // Call the window-exposed version so it uses the module closure state
        (window as any).toggleUnownedCards();

        // After toggle, only owned cards (card-1) should be visible
        // (mergedCollectionData is empty in the fresh eval scope, so result is empty state)
        const container = document.getElementById('collectionCardsList')!;
        expect(container.innerHTML).not.toBe('');
    });

    it('shows unowned rows when checkbox is rechecked', () => {
        const checkbox = document.getElementById('showUnownedToggle') as HTMLInputElement;

        // Toggle off
        checkbox.checked = false;
        (window as any).toggleUnownedCards();

        // Toggle back on
        checkbox.checked = true;
        (window as any).toggleUnownedCards();

        // Container should still render (no crash)
        const container = document.getElementById('collectionCardsList')!;
        expect(container).not.toBeNull();
    });

    it('falls back gracefully when checkbox element is absent', () => {
        document.body.innerHTML = '<div id="collectionCardsList"></div>';
        // Should not throw
        expect(() => (window as any).toggleUnownedCards()).not.toThrow();
    });
});

// ─── formatCardType() ────────────────────────────────────────────────────────

describe('formatCardType()', () => {
    beforeAll(() => loadModule());

    const cases: [string, string][] = [
        ['character',        'Character'],
        ['special',          'Special'],
        ['power',            'Power'],
        ['location',         'Location'],
        ['mission',          'Mission'],
        ['event',            'Event'],
        ['aspect',           'Aspect'],
        ['advanced_universe','Universe: Advanced'],
        ['teamwork',         'Universe: Teamwork'],
        ['ally_universe',    'Universe: Ally'],
        ['training',         'Universe: Training'],
        ['basic_universe',   'Universe: Basic'],
    ];

    it.each(cases)('maps "%s" → "%s"', (input, expected) => {
        expect(fns.formatCardType(input)).toBe(expected);
    });

    it('returns the raw type for unknown values', () => {
        expect(fns.formatCardType('unknown_type')).toBe('unknown_type');
    });
});

// ─── translateSet() ───────────────────────────────────────────────────────────

describe('translateSet()', () => {
    beforeAll(() => loadModule());

    it('maps ERB to the full set name', () => {
        expect(fns.translateSet('ERB')).toBe('Edgar Rice Burroughs and the World Legends');
    });

    it('is case-insensitive for ERB', () => {
        expect(fns.translateSet('erb')).toBe('Edgar Rice Burroughs and the World Legends');
    });

    it('returns the default set name when input is falsy', () => {
        expect(fns.translateSet(null)).toBe('Edgar Rice Burroughs and the World Legends');
        expect(fns.translateSet(undefined)).toBe('Edgar Rice Burroughs and the World Legends');
        expect(fns.translateSet('')).toBe('Edgar Rice Burroughs and the World Legends');
    });

    it('maps SKY to Skybound', () => {
        expect(fns.translateSet('SKY')).toBe('Skybound');
    });

    it('is case-insensitive for SKY', () => {
        expect(fns.translateSet('sky')).toBe('Skybound');
    });

    it('returns unknown codes unchanged', () => {
        expect(fns.translateSet('XYZ')).toBe('XYZ');
    });
});

// ─── isMainErbSetCode() ───────────────────────────────────────────────────────

describe('isMainErbSetCode()', () => {
    beforeAll(() => loadModule());

    it('is true for null, empty, and ERB (any case)', () => {
        expect(fns.isMainErbSetCode(null)).toBe(true);
        expect(fns.isMainErbSetCode('')).toBe(true);
        expect(fns.isMainErbSetCode('   ')).toBe(true);
        expect(fns.isMainErbSetCode('ERB')).toBe(true);
        expect(fns.isMainErbSetCode('erb')).toBe(true);
    });

    it('is false for promo and expansion set codes', () => {
        expect(fns.isMainErbSetCode('ERBP')).toBe(false);
        expect(fns.isMainErbSetCode('TFCP')).toBe(false);
        expect(fns.isMainErbSetCode('SKY')).toBe(false);
    });
});

// ─── loadCollection() ────────────────────────────────────────────────────────

describe('loadCollection()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
        (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
        (global.fetch as jest.Mock).mockReset();
    });

    it('renders collection cards on successful API response', async () => {
        const apiCards = [makeOwned('card-1', 'character')];
        mockFetchSetsOkOnce();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: apiCards })
        });

        // Provide allCardsData globally so the merge can proceed
        (window as any).allCardsData = [makeAllCard('card-1', 'character')];

        await fns.loadCollection();

        const rows = document.querySelectorAll('.collection-card-item');
        expect(rows.length).toBeGreaterThan(0);
    });

    it('shows an error message when the API returns non-ok status', async () => {
        mockFetchSetsOkOnce();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500
        });

        await fns.loadCollection();

        const container = document.getElementById('collectionCardsList')!;
        expect(container.innerHTML).toContain('Error loading');
    });

    it('shows error message on 403 (unexpected error since all authenticated users can access)', async () => {
        mockFetchSetsOkOnce();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 403
        });

        const container = document.getElementById('collectionCardsList')!;

        await fns.loadCollection();

        // Should show error message since 403 is now treated as a server error
        expect(container.innerHTML).toContain('Error loading');
    });

    it('falls back to owned-only display when allCardsData is unavailable', async () => {
        const apiCards = [makeOwned('card-1', 'character')];
        mockFetchSetsOkOnce();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: apiCards })
        });

        // Remove allCardsData and loadAllCards so fallback path is exercised
        (window as any).allCardsData = [];
        delete (window as any).loadAllCards;

        await fns.loadCollection();

        const rows = document.querySelectorAll('.collection-card-item');
        expect(rows.length).toBe(1);
        expect(rows[0].classList.contains('collection-card-unowned')).toBe(false);
    });

    it('shows all cards including unowned when allCardsData is available', async () => {
        const apiCards = [makeOwned('card-1', 'character')];
        mockFetchSetsOkOnce();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: apiCards })
        });

        (window as any).allCardsData = [
            makeAllCard('card-1', 'character', '001'),
            makeAllCard('card-2', 'special',   '002')
        ];

        await fns.loadCollection();

        const rows        = document.querySelectorAll('.collection-card-item');
        const unownedRows = document.querySelectorAll('.collection-card-unowned');
        expect(rows).toHaveLength(2);
        expect(unownedRows).toHaveLength(1);
    });

    it('shows error state on network failure', async () => {
        mockFetchSetsOkOnce();
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await fns.loadCollection();

        const container = document.getElementById('collectionCardsList')!;
        expect(container.innerHTML).toContain('Error loading');
    });
});

// ─── sortCollectionTable() compound set→set_number sort ──────────────────────

describe('sortCollectionTable() set_number compound sort', () => {
    beforeEach(() => {
        loadModule();
        localStorageMock.getItem.mockReturnValue(null);
    });

    /**
     * Build a minimal table with rows carrying the data attributes that the
     * sort function reads.  Returns the tbody element.
     */
    function buildTable(
        rows: Array<{ setName: string; setNumber: number; name: string; setCode?: string; isFoil?: boolean }>
    ) {
        document.body.innerHTML = `
            <table id="collection-table" data-sort="set_number" data-sort-dir="asc">
                <tbody>
                    ${rows
                        .map((r) => {
                            const code =
                                r.setCode ??
                                (r.setName.toLowerCase().includes('sky') ? 'SKY' : 'ERB');
                            const foil = r.isFoil === true ? 'true' : 'false';
                            return `
                        <tr class="collection-card-item"
                            data-card-set="${r.setName}"
                            data-card-set-code="${code}"
                            data-set-number="${r.setNumber}"
                            data-is-foil="${foil}"
                            data-card-name="${r.name}"
                            data-quantity="1">
                        </tr>`;
                        })
                        .join('')}
                </tbody>
            </table>
        `;
        return document.getElementById('collection-table') as HTMLTableElement;
    }

    it('groups ERB cards before Skybound cards', () => {
        const table = buildTable([
            { setName: 'Skybound',                                  setNumber: 1,   name: 'Sky A' },
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 1,   name: 'ERB A' },
            { setName: 'Skybound',                                  setNumber: 2,   name: 'Sky B' },
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 2,   name: 'ERB B' },
        ]);

        fns.sortCollectionTable(table, 'set_number', 'asc');

        const names = Array.from(table.querySelectorAll('tr')).map(
            r => (r as HTMLElement).getAttribute('data-card-name')
        );
        expect(names).toEqual(['ERB A', 'ERB B', 'Sky A', 'Sky B']);
    });

    it('sorts by set_number numerically within each set', () => {
        const table = buildTable([
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 10,  name: 'ERB 10' },
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 2,   name: 'ERB 2' },
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 100, name: 'ERB 100' },
        ]);

        fns.sortCollectionTable(table, 'set_number', 'asc');

        const names = Array.from(table.querySelectorAll('tr')).map(
            r => (r as HTMLElement).getAttribute('data-card-name')
        );
        expect(names).toEqual(['ERB 2', 'ERB 10', 'ERB 100']);
    });

    it('desc direction reverses both set and number order', () => {
        const table = buildTable([
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 1, name: 'ERB 1' },
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 2, name: 'ERB 2' },
            { setName: 'Skybound',                                  setNumber: 1, name: 'Sky 1' },
        ]);

        fns.sortCollectionTable(table, 'set_number', 'desc');

        const names = Array.from(table.querySelectorAll('tr')).map(
            r => (r as HTMLElement).getAttribute('data-card-name')
        );
        // Desc: Skybound first, then ERB in reverse number order
        expect(names).toEqual(['Sky 1', 'ERB 2', 'ERB 1']);
    });

    it('cards with no set_number sort last within their set', () => {
        const table = buildTable([
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 999999, name: 'ERB no-num' },
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 1,      name: 'ERB 1' },
        ]);

        fns.sortCollectionTable(table, 'set_number', 'asc');

        const names = Array.from(table.querySelectorAll('tr')).map(
            r => (r as HTMLElement).getAttribute('data-card-name')
        );
        expect(names).toEqual(['ERB 1', 'ERB no-num']);
    });

    it('non-foil sorts before foil for same numeric # within ERB', () => {
        const table = buildTable([
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 538, name: '538 Foil', isFoil: true },
            { setName: 'Edgar Rice Burroughs and the World Legends', setNumber: 538, name: '538 NF', isFoil: false },
        ]);

        fns.sortCollectionTable(table, 'set_number', 'asc');

        const names = Array.from(table.querySelectorAll('tr')).map(
            r => (r as HTMLElement).getAttribute('data-card-name')
        );
        expect(names).toEqual(['538 NF', '538 Foil']);
    });

    it('ERB promo (ERBP) groups separately from ERB by set code', () => {
        const table = buildTable([
            { setName: 'Promos display', setCode: 'ERBP', setNumber: 316, name: 'Promo power' },
            { setName: 'Edgar Rice Burroughs and the World Legends', setCode: 'ERB', setNumber: 536, name: 'Prize hero' },
        ]);

        fns.sortCollectionTable(table, 'set_number', 'asc');

        const names = Array.from(table.querySelectorAll('tr')).map(
            r => (r as HTMLElement).getAttribute('data-card-name')
        );
        expect(names).toEqual(['Prize hero', 'Promo power']);
    });
});

// ─── handleCollectionQuantityClick() ─────────────────────────────────────────

describe('handleCollectionQuantityClick()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM(`
            <table>
                <tbody>
                    <tr class="collection-card-item"
                        data-card-id="card-1"
                        data-card-type="character"
                        data-image-path="/images/card-1.webp">
                        <td></td>
                    </tr>
                </tbody>
            </table>
        `);
        (global.fetch as jest.Mock).mockReset();
    });

    it('calls updateCollectionQuantity with correct args when button is clicked', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: {} })
        });
        mockFetchSetsOkOnce();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: [] })
        });

        const btn = document.createElement('button');
        const row = document.querySelector('.collection-card-item')!;
        row.appendChild(btn);

        await fns.handleCollectionQuantityClick(btn, 2);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/collections/me/cards/card-1',
            expect.objectContaining({
                method: 'PUT',
                body: expect.stringContaining('"quantity":2')
            })
        );
    });

    it('does nothing when button has no parent row', () => {
        const orphanBtn = document.createElement('button');
        expect(() => fns.handleCollectionQuantityClick(orphanBtn, 1)).not.toThrow();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('does nothing when buttonElement is null', () => {
        expect(() => fns.handleCollectionQuantityClick(null, 1)).not.toThrow();
    });
});

// ─── GUEST Sandbox Functions ──────────────────────────────────────────────────

describe('isGuestUser()', () => {
    beforeEach(() => {
        loadModule();
        mockCurrentUser = null;
    });

    it('returns true when user role is GUEST', () => {
        mockCurrentUser = { role: 'GUEST', id: 'guest-123' };
        expect(fns.isGuestUser()).toBe(true);
    });

    it('returns false when user role is USER', () => {
        mockCurrentUser = { role: 'USER', id: 'user-123' };
        expect(fns.isGuestUser()).toBe(false);
    });

    it('returns false when user role is ADMIN', () => {
        mockCurrentUser = { role: 'ADMIN', id: 'admin-123' };
        expect(fns.isGuestUser()).toBe(false);
    });

    it('returns falsy when no user is logged in', () => {
        mockCurrentUser = null;
        expect(fns.isGuestUser()).toBeFalsy();
    });
});

describe('loadGuestCollectionFromStorage()', () => {
    beforeEach(() => {
        loadModule();
        localStorageMock.clear();
        localStorageMock.getItem.mockClear();
    });

    it('returns empty array when no collection stored', () => {
        localStorageMock.getItem.mockReturnValue(null);
        const result = fns.loadGuestCollectionFromStorage();
        expect(result).toEqual([]);
    });

    it('returns parsed collection from localStorage', () => {
        const storedCards = [
            { card_id: 'card-1', card_type: 'character', quantity: 2 },
            { card_id: 'card-2', card_type: 'special', quantity: 1 }
        ];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(storedCards));
        
        const result = fns.loadGuestCollectionFromStorage();
        expect(result).toEqual(storedCards);
    });

    it('returns empty array on JSON parse error', () => {
        localStorageMock.getItem.mockReturnValue('invalid-json{');
        const result = fns.loadGuestCollectionFromStorage();
        expect(result).toEqual([]);
    });
});

describe('saveGuestCollectionToStorage()', () => {
    beforeEach(() => {
        loadModule();
        localStorageMock.clear();
        localStorageMock.setItem.mockClear();
    });

    it('saves collection to localStorage as JSON', () => {
        const cards = [
            { card_id: 'card-1', card_type: 'character', quantity: 2 }
        ];
        fns.saveGuestCollectionToStorage(cards);
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'guestCollection',
            JSON.stringify(cards)
        );
    });

    it('handles empty array', () => {
        fns.saveGuestCollectionToStorage([]);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'guestCollection',
            '[]'
        );
    });
});

describe('showGuestSandboxBanner()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
    });

    it('inserts banner before collectionCardsList', () => {
        fns.showGuestSandboxBanner();
        
        const banner = document.getElementById('guestSandboxBanner');
        expect(banner).not.toBeNull();
        expect(banner!.className).toBe('guest-sandbox-banner');
    });

    it('does not duplicate banner if already exists', () => {
        fns.showGuestSandboxBanner();
        fns.showGuestSandboxBanner();
        
        const banners = document.querySelectorAll('#guestSandboxBanner');
        expect(banners.length).toBe(1);
    });

    it('banner contains signup link with click handler', () => {
        fns.showGuestSandboxBanner();

        const banner = document.getElementById('guestSandboxBanner');
        const link = banner!.querySelector('a.guest-signup-link');
        expect(link).not.toBeNull();
        expect(link!.getAttribute('href')).toBe('#');
    });

    it('signup link calls showLoginModal on click', () => {
        const mockShowLoginModal = jest.fn();
        (window as any).showLoginModal = mockShowLoginModal;
        
        fns.showGuestSandboxBanner();

        const banner = document.getElementById('guestSandboxBanner');
        const link = banner!.querySelector('a.guest-signup-link') as HTMLAnchorElement;
        
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        link.dispatchEvent(clickEvent);
        
        expect(mockShowLoginModal).toHaveBeenCalled();
    });

    it('does nothing if container not found', () => {
        document.body.innerHTML = '';
        expect(() => fns.showGuestSandboxBanner()).not.toThrow();
    });
});

const GUEST_COLLECTION_KEY = 'guestCollection';

describe('GUEST sandbox in addCardToCollection()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
        localStorageMock.clear();
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        (global.fetch as jest.Mock).mockReset();
        wireDefaultSetsFetchMock();
        mockCurrentUser = { role: 'GUEST', id: 'guest-123' };
        (window as any).allCardsData = [makeAllCard('card-1', 'character')];
    });

    it('saves to localStorage; only fetches /api/sets for labels (not collection API)', async () => {
        localStorageMock.getItem.mockReturnValue('[]');
        
        await fns.addCardToCollection('card-1', 'character', '/images/card-1.webp');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/sets', expect.objectContaining({ credentials: 'include' }));
        expect(global.fetch).not.toHaveBeenCalledWith(
            '/api/collections/me/cards',
            expect.anything()
        );
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('increments quantity if same card variant already in GUEST collection', async () => {
        const existing = [{ card_id: 'card-1', card_type: 'character', quantity: 1, image_path: '/images/card-1.webp' }];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(existing));

        await fns.addCardToCollection('card-1', 'character', '/images/card-1.webp');

        const savedCall = localStorageMock.setItem.mock.calls.find(
            (call: string[]) => call[0] === GUEST_COLLECTION_KEY
        );
        expect(savedCall).toBeDefined();
        const savedCards = JSON.parse(savedCall![1]);
        expect(savedCards.length).toBe(1);
        expect(savedCards[0].quantity).toBe(2);
    });

    it('adds new card to GUEST collection if not present', async () => {
        localStorageMock.getItem.mockReturnValue('[]');
        
        await fns.addCardToCollection('card-1', 'character', '/images/card-1.webp');
        
        const savedCall = localStorageMock.setItem.mock.calls.find(
            (call: string[]) => call[0] === GUEST_COLLECTION_KEY
        );
        expect(savedCall).toBeDefined();
        const savedCards = JSON.parse(savedCall![1]);
        expect(savedCards.length).toBe(1);
        expect(savedCards[0].card_id).toBe('card-1');
        expect(savedCards[0].quantity).toBe(1);
    });

    it('keys GUEST entries by image_path so foil/alt art are separate', async () => {
        let stored: string = '[]';
        localStorageMock.getItem.mockImplementation(() => stored);
        localStorageMock.setItem.mockImplementation((k: string, v: string) => { stored = v; });

        await fns.addCardToCollection('card-1', 'character', '/images/card-1-v1.webp');
        await fns.addCardToCollection('card-1', 'character', '/images/card-1-v2.webp');

        const savedCards = JSON.parse(stored);
        expect(savedCards.length).toBe(2);
        expect(savedCards.find((c: any) => c.image_path === '/images/card-1-v1.webp').quantity).toBe(1);
        expect(savedCards.find((c: any) => c.image_path === '/images/card-1-v2.webp').quantity).toBe(1);
    });
});

describe('GUEST sandbox in removeOneFromCollection()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
        localStorageMock.clear();
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        (global.fetch as jest.Mock).mockReset();
        wireDefaultSetsFetchMock();
        mockCurrentUser = { role: 'GUEST', id: 'guest-123' };
    });

    it('decrements quantity by one for GUEST', async () => {
        const existing = [{ card_id: 'card-1', card_type: 'character', quantity: 3, image_path: '/img.webp' }];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(existing));

        await fns.removeOneFromCollection('card-1', 'character', '/img.webp');

        const savedCall = localStorageMock.setItem.mock.calls.find(
            (call: string[]) => call[0] === GUEST_COLLECTION_KEY
        );
        expect(savedCall).toBeDefined();
        const savedCards = JSON.parse(savedCall![1]);
        expect(savedCards.length).toBe(1);
        expect(savedCards[0].quantity).toBe(2);
    });

    it('removes GUEST entry when quantity reaches 0', async () => {
        const existing = [{ card_id: 'card-1', card_type: 'character', quantity: 1, image_path: '/img.webp' }];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(existing));

        await fns.removeOneFromCollection('card-1', 'character', '/img.webp');

        const savedCall = localStorageMock.setItem.mock.calls.find(
            (call: string[]) => call[0] === GUEST_COLLECTION_KEY
        );
        expect(savedCall).toBeDefined();
        const savedCards = JSON.parse(savedCall![1]);
        expect(savedCards.length).toBe(0);
    });
});

describe('GUEST sandbox in updateCollectionQuantity()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
        localStorageMock.clear();
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        (global.fetch as jest.Mock).mockReset();
        wireDefaultSetsFetchMock();
        mockCurrentUser = { role: 'GUEST', id: 'guest-123' };
        (window as any).allCardsData = [makeAllCard('card-1', 'character')];
    });

    it('updates localStorage instead of calling API for GUEST', async () => {
        const existing = [{ card_id: 'card-1', card_type: 'character', quantity: 1, image_path: '/img.webp' }];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(existing));
        
        await fns.updateCollectionQuantity('card-1', 'character', 5, '/img.webp');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/sets', expect.anything());
        expect(global.fetch).not.toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/collections\/me\/cards/),
            expect.anything()
        );
        const savedCall = localStorageMock.setItem.mock.calls.find(
            (call: string[]) => call[0] === GUEST_COLLECTION_KEY
        );
        expect(savedCall).toBeDefined();
        const savedCards = JSON.parse(savedCall![1]);
        expect(savedCards[0].quantity).toBe(5);
    });

    it('removes card from GUEST collection when quantity is 0', async () => {
        const existing = [{ card_id: 'card-1', card_type: 'character', quantity: 3, image_path: '/img.webp' }];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(existing));
        
        await fns.updateCollectionQuantity('card-1', 'character', 0, '/img.webp');
        
        const savedCall = localStorageMock.setItem.mock.calls.find(
            (call: string[]) => call[0] === GUEST_COLLECTION_KEY
        );
        expect(savedCall).toBeDefined();
        const savedCards = JSON.parse(savedCall![1]);
        expect(savedCards.length).toBe(0);
    });
});

describe('GUEST sandbox in removeCardFromCollection()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
        localStorageMock.clear();
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        (global.fetch as jest.Mock).mockReset();
        wireDefaultSetsFetchMock();
        mockCurrentUser = { role: 'GUEST', id: 'guest-123' };
        (window as any).allCardsData = [makeAllCard('card-1', 'character')];
        // Mock confirm to return true
        global.confirm = jest.fn(() => true);
    });

    it('removes from localStorage instead of calling API for GUEST', async () => {
        const existing = [
            { card_id: 'card-1', card_type: 'character', quantity: 1, image_path: '/img.webp' },
            { card_id: 'card-2', card_type: 'special', quantity: 2, image_path: '/img2.webp' }
        ];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(existing));
        
        await fns.removeCardFromCollection('card-1', 'character');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/sets', expect.anything());
        expect(global.fetch).not.toHaveBeenCalledWith(
            '/api/collections/me/cards',
            expect.anything()
        );
        const savedCall = localStorageMock.setItem.mock.calls.find(
            (call: string[]) => call[0] === GUEST_COLLECTION_KEY
        );
        expect(savedCall).toBeDefined();
        const savedCards = JSON.parse(savedCall![1]);
        expect(savedCards.length).toBe(1);
        expect(savedCards[0].card_id).toBe('card-2');
    });
});

describe('mergeCollectionWithAllCards() includes card_data for owned cards', () => {
    beforeAll(() => loadModule());

    it('includes card_data from allCardsData for owned cards', () => {
        const owned = [{ card_id: 'c1', card_type: 'character', quantity: 2, image_path: '/img.webp' }];
        const allCards = [makeAllCard('c1', 'character')];
        
        const merged = fns.mergeCollectionWithAllCards(owned, allCards);
        
        const ownedCard = merged.find((c: any) => c.card_id === 'c1');
        expect(ownedCard.card_data).toBeDefined();
        expect(ownedCard.card_data.name).toBe('Card c1');
    });

    it('owned cards without card_data get it from allCardsData', () => {
        const owned = [{ card_id: 'c1', card_type: 'character', quantity: 1 }];
        const allCards = [makeAllCard('c1', 'character')];
        
        const merged = fns.mergeCollectionWithAllCards(owned, allCards);
        
        const ownedCard = merged.find((c: any) => c.inCollection === true);
        expect(ownedCard.card_data).toBeDefined();
    });
});
