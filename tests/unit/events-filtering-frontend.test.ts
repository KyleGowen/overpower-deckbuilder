/**
 * Unit tests for DBV Events filtering (mission set, game effect, search).
 * Logic mirrors public/js/search-filter-functions.js applyEventsFilters / setupEventSearch.
 */

import { JSDOM } from 'jsdom';

const dom = new JSDOM(
    `<!DOCTYPE html>
<html><head></head><body>
  <button class="tab-button active" data-tab="events"></button>
  <input type="text" id="search-input" value="">
  <div id="events-tab"></div>
  <table id="events-table">
    <thead><tr><th><input type="text" class="header-filter" data-column="game_effect" value=""></th></tr></thead>
  </table>
  <select id="events-mission-set-filter"><option value="">All</option></select>
  <table><tbody id="events-tbody"></tbody></table>
</body></html>`
);

global.window = dom.window as any;
global.document = dom.window.document;

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() })),
});

interface TestWindow extends Window {
    eventsData?: any[];
    displayEvents?: jest.Mock;
    loadEvents?: jest.Mock;
}

const testWindow = global.window as TestWindow;

testWindow.displayEvents = jest.fn();
testWindow.loadEvents = jest.fn();

testWindow.eventsData = [
    { name: 'Event 1', mission_set: 'King of the Jungle', game_effect: 'Test effect 1' },
    { name: 'Event 2', mission_set: 'The Call of Cthulhu', game_effect: 'Test effect 2' },
    { name: 'Event 3', mission_set: 'Time Wars: Rise of the Gods', game_effect: 'Test effect 3' },
    { name: 'Event 4', mission_set: 'The Warlord of Mars', game_effect: 'Test effect 4' },
];

function applyEventsFilters() {
    if (!document.getElementById('events-tbody')) {
        return;
    }

    const events = testWindow.eventsData || [];
    const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
    const rawTerm = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';
    let pool = events;

    if (rawTerm) {
        pool = events.filter((event) => {
            const n = (event.name && String(event.name).toLowerCase()) || '';
            const ms = (event.mission_set && String(event.mission_set).toLowerCase()) || '';
            const ge = (event.game_effect && String(event.game_effect).toLowerCase()) || '';
            return n.includes(rawTerm) || ms.includes(rawTerm) || ge.includes(rawTerm);
        });
    }

    const gameEffectInput = document.querySelector(
        '#events-table .header-filter[data-column="game_effect"]'
    ) as HTMLInputElement | null;
    const effectTerm = gameEffectInput && gameEffectInput.value ? gameEffectInput.value.trim().toLowerCase() : '';
    if (effectTerm) {
        pool = pool.filter((event) => {
            const ge = (event.game_effect && String(event.game_effect).toLowerCase()) || '';
            return ge.includes(effectTerm);
        });
    }

    const sel = document.getElementById('events-mission-set-filter') as HTMLSelectElement | null;
    const v = sel && sel.value ? sel.value : '';
    if (!v) {
        testWindow.displayEvents!(pool);
        return;
    }
    testWindow.displayEvents!(pool.filter((e) => e.mission_set === v));
}

function setupEventSearch() {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput && !searchInput.dataset.eventsDbvSearchBound) {
        searchInput.dataset.eventsDbvSearchBound = 'true';
        searchInput.addEventListener('input', async () => {
            if (!document.querySelector('.tab-button.active[data-tab="events"]')) {
                return;
            }
            if (!testWindow.eventsData || testWindow.eventsData.length === 0) {
                await testWindow.loadEvents!();
                return;
            }
            applyEventsFilters();
        });
    }

    const gameEffectSearchInput = document.querySelector(
        '#events-table .header-filter[data-column="game_effect"]'
    ) as HTMLInputElement;
    if (gameEffectSearchInput && !gameEffectSearchInput.dataset.eventsGameEffectBound) {
        gameEffectSearchInput.dataset.eventsGameEffectBound = 'true';
        gameEffectSearchInput.addEventListener('input', async () => {
            if (!testWindow.eventsData || testWindow.eventsData.length === 0) {
                await testWindow.loadEvents!();
                return;
            }
            applyEventsFilters();
        });
    }

    const missionSetSelect = document.getElementById('events-mission-set-filter') as HTMLSelectElement;
    if (missionSetSelect && !missionSetSelect.dataset.eventsMissionFilterBound) {
        missionSetSelect.dataset.eventsMissionFilterBound = 'true';
        missionSetSelect.addEventListener('change', applyEventsFilters);
    }
}

describe('Events DBV filtering', () => {
    beforeEach(() => {
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        searchInput.value = '';
        const ge = document.querySelector('#events-table .header-filter[data-column="game_effect"]') as HTMLInputElement;
        ge.value = '';
        const sel = document.getElementById('events-mission-set-filter') as HTMLSelectElement;
        sel.innerHTML = '<option value="">All</option>';
        sel.value = '';
        document.documentElement.classList.remove('layout-mobile');
        jest.clearAllMocks();
    });

    describe('applyEventsFilters (mission set select)', () => {
        it('shows all events when select is All', () => {
            applyEventsFilters();
            expect(testWindow.displayEvents).toHaveBeenCalledWith(testWindow.eventsData);
        });

        it('filters by selected mission set', () => {
            const sel = document.getElementById('events-mission-set-filter') as HTMLSelectElement;
            sel.innerHTML =
                '<option value="">All</option><option value="The Call of Cthulhu">The Call of Cthulhu</option>';
            sel.value = 'The Call of Cthulhu';

            applyEventsFilters();

            expect(testWindow.displayEvents).toHaveBeenCalledWith([
                { name: 'Event 2', mission_set: 'The Call of Cthulhu', game_effect: 'Test effect 2' },
            ]);
        });

        it('applies game effect substring filter with All mission sets', () => {
            (document.querySelector('#events-table .header-filter[data-column="game_effect"]') as HTMLInputElement).value =
                'effect 2';
            applyEventsFilters();
            expect(testWindow.displayEvents).toHaveBeenCalledWith([
                { name: 'Event 2', mission_set: 'The Call of Cthulhu', game_effect: 'Test effect 2' },
            ]);
        });

        it('combines search input with mission set select', () => {
            (document.getElementById('search-input') as HTMLInputElement).value = 'cthulhu';
            const sel = document.getElementById('events-mission-set-filter') as HTMLSelectElement;
            sel.innerHTML =
                '<option value="">All</option><option value="The Call of Cthulhu">The Call of Cthulhu</option>';
            sel.value = 'The Call of Cthulhu';
            applyEventsFilters();
            expect(testWindow.displayEvents).toHaveBeenCalledWith([
                { name: 'Event 2', mission_set: 'The Call of Cthulhu', game_effect: 'Test effect 2' },
            ]);
        });

        it('narrows by mission set after search pool', () => {
            (document.getElementById('search-input') as HTMLInputElement).value = 'event';
            const sel = document.getElementById('events-mission-set-filter') as HTMLSelectElement;
            sel.innerHTML =
                '<option value="">All</option><option value="King of the Jungle">King of the Jungle</option>';
            sel.value = 'King of the Jungle';
            applyEventsFilters();
            expect(testWindow.displayEvents).toHaveBeenCalledWith([
                { name: 'Event 1', mission_set: 'King of the Jungle', game_effect: 'Test effect 1' },
            ]);
        });
    });

    describe('applyEventsFilters (layout-mobile)', () => {
        it('still uses mission set select when layout-mobile', () => {
            document.documentElement.classList.add('layout-mobile');
            const sel = document.getElementById('events-mission-set-filter') as HTMLSelectElement;
            sel.innerHTML =
                '<option value="">All</option><option value="The Call of Cthulhu">The Call of Cthulhu</option>';
            sel.value = 'The Call of Cthulhu';

            applyEventsFilters();

            expect(testWindow.displayEvents).toHaveBeenCalledWith([
                { name: 'Event 2', mission_set: 'The Call of Cthulhu', game_effect: 'Test effect 2' },
            ]);
        });
    });

    describe('setupEventSearch', () => {
        it('binds mission set select change once', () => {
            const sel = document.getElementById('events-mission-set-filter') as HTMLSelectElement;
            const spy = jest.spyOn(sel, 'addEventListener');
            setupEventSearch();
            expect(spy).toHaveBeenCalledWith('change', expect.any(Function));
            spy.mockRestore();
        });

        it('search input triggers applyEventsFilters on events tab with data', async () => {
            setupEventSearch();
            const searchInput = document.getElementById('search-input') as HTMLInputElement;
            searchInput.value = 'Event 1';
            searchInput.dispatchEvent(new dom.window.Event('input'));
            await Promise.resolve();
            expect(testWindow.loadEvents).not.toHaveBeenCalled();
            expect(testWindow.displayEvents).toHaveBeenCalled();
        });

        it('search input calls loadEvents when eventsData empty', async () => {
            const saved = testWindow.eventsData ?? [];
            testWindow.eventsData = [];
            setupEventSearch();
            const searchInput = document.getElementById('search-input') as HTMLInputElement;
            searchInput.value = 'x';
            searchInput.dispatchEvent(new dom.window.Event('input'));
            await Promise.resolve();
            expect(testWindow.loadEvents).toHaveBeenCalled();
            testWindow.eventsData = [...saved];
        });
    });
});
