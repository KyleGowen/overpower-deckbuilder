/**
 * DBV mission set <select> for Missions and Events tabs (DTV + MV).
 * Filter math stays in search-filter-functions.js; this module owns DOM shape, populate, and change → apply*.
 *
 * @see DBV_MISSION_SET_FILTER.md
 */
(function () {
    'use strict';

    const PRESETS = {
        /**
         * @param {HTMLElement} container
         */
        missions(container) {
            const label = document.createElement('label');
            label.className = 'missions-mobile-set-label';
            label.setAttribute('for', 'missions-mission-set-filter');
            label.textContent = 'Mission set';
            container.appendChild(label);
            const sel = document.createElement('select');
            sel.id = 'missions-mission-set-filter';
            sel.className = 'missions-mission-set-filter';
            sel.setAttribute('aria-label', 'Filter by mission set');
            const allOpt = document.createElement('option');
            allOpt.value = '';
            allOpt.textContent = 'All';
            sel.appendChild(allOpt);
            container.appendChild(sel);
        },
        /**
         * @param {HTMLElement} container
         */
        events(container) {
            const label = document.createElement('label');
            label.className = 'events-mobile-set-label';
            label.setAttribute('for', 'events-mission-set-filter');
            label.textContent = 'Mission set';
            container.appendChild(label);
            const row = document.createElement('div');
            row.className = 'events-mobile-set-select-clear-row';
            const sel = document.createElement('select');
            sel.id = 'events-mission-set-filter';
            sel.className = 'events-mission-set-filter';
            sel.setAttribute('aria-label', 'Filter events by mission set');
            const allOpt = document.createElement('option');
            allOpt.value = '';
            allOpt.textContent = 'All';
            sel.appendChild(allOpt);
            row.appendChild(sel);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'clear-events-filters-mobile';
            btn.className = 'clear-filters-btn clear-filters-btn--events-mobile-inline';
            btn.textContent = 'Clear filters';
            btn.addEventListener('click', () => {
                if (typeof window.clearEventsFilters === 'function') {
                    window.clearEventsFilters();
                }
            });
            row.appendChild(btn);
            container.appendChild(row);
        },
    };

    /**
     * @param {HTMLElement} container
     * @param {string} key
     */
    function renderPresetIntoContainer(container, key) {
        const fn = PRESETS[key];
        if (typeof fn !== 'function') {
            console.warn('[dbv-mission-set-filter] Unknown preset:', key);
            return;
        }
        fn(container);
    }

    function bindMissionSetChangeListeners() {
        const missionSetSelect = document.getElementById('missions-mission-set-filter');
        if (missionSetSelect && !missionSetSelect.dataset.missionFilterBound) {
            missionSetSelect.addEventListener('change', () => {
                if (typeof window.applyMissionFilters === 'function') {
                    window.applyMissionFilters();
                }
            });
            missionSetSelect.dataset.missionFilterBound = 'true';
        }

        const eventsSetSelect = document.getElementById('events-mission-set-filter');
        if (eventsSetSelect && !eventsSetSelect.dataset.eventsMissionFilterBound) {
            eventsSetSelect.addEventListener('change', () => {
                if (typeof window.applyEventsFilters === 'function') {
                    window.applyEventsFilters();
                }
            });
            eventsSetSelect.dataset.eventsMissionFilterBound = 'true';
        }
    }

    /**
     * Fill every `[data-dbv-mission-set-filter]` host once (unless force). Loads after search-filter-functions so apply* exists before change handlers run.
     * @param {{ force?: boolean }} [options]
     */
    function initDbvMissionSetFilters(options) {
        const force = Boolean(options && options.force);
        document.querySelectorAll('[data-dbv-mission-set-filter]').forEach((el) => {
            if (!(el instanceof HTMLElement)) {
                return;
            }
            if (!force && el.dataset.dbvMissionSetInitialized === '1') {
                return;
            }
            const key = el.getAttribute('data-dbv-mission-set-filter');
            if (!key) {
                return;
            }
            el.textContent = '';
            delete el.dataset.dbvMissionSetInitialized;
            renderPresetIntoContainer(el, key);
            el.dataset.dbvMissionSetInitialized = '1';
        });
        bindMissionSetChangeListeners();
    }

    /**
     * @param {string} selectId
     * @param {Array<{ mission_set?: string }>} dataArray
     */
    function populateMissionSetSelect(selectId, dataArray) {
        const sel = document.getElementById(selectId);
        if (!sel || !Array.isArray(dataArray)) {
            return;
        }
        const prev = sel.value;
        const sets = [...new Set(dataArray.map((row) => row.mission_set).filter(Boolean))].sort((a, b) =>
            a.localeCompare(b)
        );
        sel.innerHTML = '';
        const allOpt = document.createElement('option');
        allOpt.value = '';
        allOpt.textContent = 'All';
        sel.appendChild(allOpt);
        sets.forEach((s) => {
            const o = document.createElement('option');
            o.value = s;
            o.textContent = s;
            sel.appendChild(o);
        });
        if (prev && sets.includes(prev)) {
            sel.value = prev;
        } else {
            sel.value = '';
        }
    }

    function populateMissionsMissionSetSelect() {
        populateMissionSetSelect('missions-mission-set-filter', window.missionsData || []);
    }

    function populateEventsMissionSetSelect() {
        populateMissionSetSelect('events-mission-set-filter', window.eventsData || []);
    }

    window.initDbvMissionSetFilters = initDbvMissionSetFilters;
    window.populateMissionsMissionSetSelect = populateMissionsMissionSetSelect;
    window.populateEventsMissionSetSelect = populateEventsMissionSetSelect;

    function runInit() {
        initDbvMissionSetFilters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runInit);
    } else {
        runInit();
    }
})();
