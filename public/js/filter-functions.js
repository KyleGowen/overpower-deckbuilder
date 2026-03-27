/* ========================================
 * PHASE 11C & 12: FILTER FUNCTIONS
 * ========================================
 * 
 * This file contains filter-related functions and utilities extracted from
 * index.html during Phase 11C and 12 of the refactoring project.
 * 
 * Purpose: Filter-related functions and utilities
 * Created: Phase 11C & 12 of 12-phase refactoring project
 * Contains:
 *   - isGuestUser() - Guest user detection
 *   - clearLocationFilters() - Location filter clearing
 *   - clearSpecialCardFilters() - Special card filter clearing
 *   - clearAdvancedUniverseFilters() - Advanced universe filter clearing
 *   - clearAspectsFilters() - Aspects filter clearing
 *   - clearMissionsFilters() - Missions filter clearing
 *   - clearEventsFilters() - Events filter clearing
 *   - clearTeamworkFilters() - Teamwork filter clearing
 *   - clearAllyUniverseFilters() - Ally universe filter clearing
 *   - clearTrainingFilters() - Training filter clearing
 *   - clearBasicUniverseFilters() - Basic universe filter clearing
 *   - clearPowerCardFilters() - Power card filter clearing
 *   - toggleFortificationsColumn() - Fortifications column toggle
 *   - ensureTwoPaneLayout() - Two-pane layout enforcement
 *   - updateDeckStats() - Deck statistics updates
 *   - toggleCategory() - Category toggle functionality
 * 
 * ======================================== */

// User utility functions
function isGuestUser() {
    const currentUser = getCurrentUser();
    const isGuest = currentUser && currentUser.role === 'GUEST';
    return isGuest;
}

// Clear filter functions for different card types
function clearLocationFilters() {
    // Clear location-specific filters
    const locationThreatMin = document.getElementById('location-threat-min');
    const locationThreatMax = document.getElementById('location-threat-max');
    
    if (locationThreatMin) locationThreatMin.value = '';
    if (locationThreatMax) locationThreatMax.value = '';
    
    // Clear location special ability search input
    const abilitySearchInput = document.querySelector('#locations-table .header-filter[data-column="special_ability"]');
    if (abilitySearchInput) {
        abilitySearchInput.value = '';
    }

    const nameSearchInput = document.querySelector('#locations-table .header-filter[data-column="name"]');
    if (nameSearchInput) {
        nameSearchInput.value = '';
    }
    
    // Reload all locations
    if (typeof loadLocations === 'function') {
        loadLocations();
    }
}

function clearSpecialCardFilters() {
    // Clear special card search inputs
    const nameSearchInput = document.querySelector('#special-cards-table .header-filter[data-column="name"]');
    const characterSearchInput = document.querySelector('#special-cards-table .header-filter[data-column="character"]');
    const effectSearchInput = document.querySelector('#special-cards-table .header-filter[data-column="card_effect"]');
    const valueEqualsInput = document.getElementById('special-value-equals');
    const valueMinInput = document.getElementById('special-value-min');
    const valueMaxInput = document.getElementById('special-value-max');
    const noValueToggle = document.getElementById('special-no-value-toggle');
    
    if (nameSearchInput) nameSearchInput.value = '';
    if (characterSearchInput) characterSearchInput.value = '';
    if (effectSearchInput) effectSearchInput.value = '';
    if (valueEqualsInput) valueEqualsInput.value = '';
    if (valueMinInput) valueMinInput.value = '';
    if (valueMaxInput) valueMaxInput.value = '';
    if (noValueToggle) noValueToggle.checked = false;
    [valueEqualsInput, valueMinInput, valueMaxInput].forEach(input => {
        if (input) {
            input.disabled = false;
        }
    });

    const functionFilterToggles = document.querySelectorAll('#special-cards-table .function-filter-toggle');
    functionFilterToggles.forEach(toggle => {
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-pressed', 'false');
    });

    const powerTypeFilterToggles = document.querySelectorAll('#special-cards-table .power-type-filter-toggle');
    powerTypeFilterToggles.forEach(toggle => {
        toggle.classList.remove('is-active', 'is-disabled');
        toggle.setAttribute('aria-pressed', 'false');
        toggle.disabled = false;
    });
    const noIconToggle = document.getElementById('special-no-icon-toggle');
    if (noIconToggle) noIconToggle.checked = false;
    
    // Reload all special cards
    if (typeof loadSpecialCards === 'function') {
        loadSpecialCards();
    }
}

function clearAdvancedUniverseFilters() {
    // Clear advanced universe character search input
    const characterSearchInput = document.querySelector('#advanced-universe-table .header-filter[data-column="character"]');
    if (characterSearchInput) {
        characterSearchInput.value = '';
    }

    // Clear advanced universe card effect search input
    const effectSearchInput = document.querySelector('#advanced-universe-table .header-filter[data-column="card_effect"]');
    if (effectSearchInput) {
        effectSearchInput.value = '';
    }
    
    // Reload all advanced universe cards
    if (typeof loadAdvancedUniverse === 'function') {
        loadAdvancedUniverse();
    }
}

function clearAspectsFilters() {
    const nameSearchInput = document.querySelector('#aspects-table .header-filter[data-column="card_name"]');
    const locationSearchInput = document.querySelector('#aspects-table .header-filter[data-column="location"]');
    const effectSearchInput = document.querySelector('#aspects-table .header-filter[data-column="card_effect"]');
    if (nameSearchInput) nameSearchInput.value = '';
    if (locationSearchInput) locationSearchInput.value = '';
    if (effectSearchInput) effectSearchInput.value = '';

    document.querySelectorAll('#aspects-table .power-type-filter-toggle').forEach(btn => {
        btn.classList.remove('is-active', 'is-disabled');
        btn.setAttribute('aria-pressed', 'false');
        btn.disabled = false;
    });

    const noIconToggle = document.getElementById('aspect-no-icon-toggle');
    if (noIconToggle) noIconToggle.checked = false;

    ['aspect-value-equals', 'aspect-value-min', 'aspect-value-max'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.disabled = false; }
    });

    const noValueToggle = document.getElementById('aspect-no-value-toggle');
    if (noValueToggle) noValueToggle.checked = false;

    if (typeof loadAspects === 'function') loadAspects();
}


function clearMissionsFilters() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    const missionSetSelect = document.getElementById('missions-mission-set-filter');
    if (missionSetSelect) missionSetSelect.value = '';

    const missionCardNameFilter = document.getElementById('missions-mobile-card-name-filter');
    if (missionCardNameFilter) missionCardNameFilter.value = '';

    const missionHeaderCardNameFilter = document.getElementById('missions-header-card-name-filter');
    if (missionHeaderCardNameFilter) missionHeaderCardNameFilter.value = '';

    if (typeof loadMissions === 'function') {
        loadMissions();
    } else if (typeof applyMissionFilters === 'function') {
        applyMissionFilters();
    }
}

function clearEventsFilters() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    const gameEffectSearchInput = document.querySelector('#events-table .header-filter[data-column="game_effect"]');
    if (gameEffectSearchInput) gameEffectSearchInput.value = '';

    document.querySelectorAll('#events-tab input[type="checkbox"]').forEach((cb) => {
        cb.checked = true;
    });

    const missionSetSelect = document.getElementById('events-mission-set-filter');
    if (missionSetSelect) missionSetSelect.value = '';

    if (typeof loadEvents === 'function') {
        loadEvents();
    } else if (typeof applyEventsFilters === 'function') {
        applyEventsFilters();
    }
}

function clearTeamworkFilters() {
    document.querySelectorAll('#teamwork-table thead .power-type-filter-toggle').forEach((btn) => {
        btn.classList.remove('is-active', 'is-disabled');
        btn.setAttribute('aria-pressed', 'false');
        btn.disabled = false;
    });
    [
        'teamwork-to-use-equals',
        'teamwork-to-use-min',
        'teamwork-to-use-max',
        'teamwork-first-bonus-equals',
        'teamwork-first-bonus-min',
        'teamwork-first-bonus-max',
        'teamwork-second-bonus-equals',
        'teamwork-second-bonus-min',
        'teamwork-second-bonus-max'
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
        }
    });
    document
        .querySelectorAll(
            '#teamwork-tab .teamwork-mobile-to-use-equals, #teamwork-tab .teamwork-mobile-to-use-min, #teamwork-tab .teamwork-mobile-to-use-max'
        )
        .forEach((el) => {
            el.value = '';
        });
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    if (typeof loadTeamwork === 'function') {
        loadTeamwork();
    }
}

function clearAllyUniverseFilters() {
    document.querySelectorAll('#ally-universe-table thead .power-type-filter-toggle').forEach((btn) => {
        btn.classList.remove('is-active', 'is-disabled');
        btn.setAttribute('aria-pressed', 'false');
        btn.disabled = false;
    });
    const nameF = document.getElementById('ally-card-name-filter');
    if (nameF) nameF.value = '';
    document.querySelectorAll('#ally-universe-tab .ally-universe-mobile-card-name-filter').forEach((el) => {
        el.value = '';
    });
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    if (typeof loadAllyUniverse === 'function') {
        loadAllyUniverse();
    }
}

function clearTrainingFilters() {
    document.querySelectorAll('#training-table .power-type-filter-toggle').forEach((btn) => {
        btn.classList.remove('is-active', 'is-disabled');
        btn.setAttribute('aria-pressed', 'false');
        btn.disabled = false;
    });
    const nameF = document.getElementById('training-card-name-filter');
    if (nameF) {
        nameF.value = '';
    }
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    if (typeof loadTraining === 'function') {
        loadTraining();
    }
}

function clearBasicUniverseFilters() {
    document.querySelectorAll('#basic-universe-tab .power-type-filter-toggle').forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
    });
    document.querySelectorAll('#basic-universe-tab input[type="number"]').forEach((input) => {
        input.value = '';
    });
    const basicNameFilter = document.getElementById('basic-universe-card-name-filter');
    if (basicNameFilter) {
        basicNameFilter.value = '';
    }
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    if (typeof loadBasicUniverse === 'function') {
        loadBasicUniverse();
    }
}

// Simple debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/** Prefer desktop filter input value, else mobile (same field). */
function powerFilterNumericOrNull(desktopEl, mobileEl) {
    const d = desktopEl && String(desktopEl.value || '').trim();
    const m = mobileEl && String(mobileEl.value || '').trim();
    const raw = d || m;
    if (raw === '' || Number.isNaN(Number(raw))) return null;
    return parseInt(raw, 10);
}

// Power Cards filtering functions
window.applyPowerCardFilters = async function applyPowerCardFilters() {
    try {
        const resp = await fetch('/api/power-cards');
        const data = await resp.json();
        if (!data.success) return;

        let filtered = data.data;

        // Filter by power type — active toggle buttons
        const selectedTypes = Array.from(document.querySelectorAll('#power-cards-tab .power-type-filter-toggle.is-active'))
            .map((btn) => btn.dataset.powerType)
            .filter(Boolean);

        if (selectedTypes.length > 0) {
            filtered = filtered.filter((card) => selectedTypes.includes(card.power_type));
        }

        const eqEl = document.getElementById('power-value-equals');
        const eqMobile = document.getElementById('power-value-equals-mobile');
        const equalsNum = powerFilterNumericOrNull(eqEl, eqMobile);

        if (equalsNum !== null) {
            filtered = filtered.filter((card) => Number(card.value) === equalsNum);
        } else {
            const minNum = powerFilterNumericOrNull(
                document.getElementById('power-value-min'),
                document.getElementById('power-value-min-mobile')
            );
            const maxNum = powerFilterNumericOrNull(
                document.getElementById('power-value-max'),
                document.getElementById('power-value-max-mobile')
            );
            if (minNum !== null) {
                filtered = filtered.filter((card) => Number(card.value) >= minNum);
            }
            if (maxNum !== null) {
                filtered = filtered.filter((card) => Number(card.value) <= maxNum);
            }
        }

        if (window.displayPowerCards) {
            window.displayPowerCards(filtered);
        } else {
            console.error('displayPowerCards function not found');
        }
    } catch (err) {
        console.error('Error applying power card filters:', err);
    }
}

window.setupPowerCardsSearch = function setupPowerCardsSearch() {
    const tab = document.getElementById('power-cards-tab');
    if (!tab || tab.dataset.powerFiltersBound === 'true') {
        return;
    }
    tab.dataset.powerFiltersBound = 'true';

    document.querySelectorAll('#power-cards-tab .power-type-filter-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            const typeKey = btn.dataset.powerType;
            const nextActive = !btn.classList.contains('is-active');
            document.querySelectorAll('#power-cards-tab .power-type-filter-toggle').forEach((b) => {
                if (b.dataset.powerType !== typeKey) return;
                b.classList.toggle('is-active', nextActive);
                b.setAttribute('aria-pressed', String(nextActive));
            });
            applyPowerCardFilters();
        });
    });

    const debouncedApply = debounce(applyPowerCardFilters, 300);
    [
        'power-value-equals',
        'power-value-min',
        'power-value-max',
        'power-value-equals-mobile',
        'power-value-min-mobile',
        'power-value-max-mobile',
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', debouncedApply);
    });

    const valueClear = document.getElementById('power-value-clear');
    if (valueClear) {
        valueClear.addEventListener('click', () => {
            [
                'power-value-equals',
                'power-value-min',
                'power-value-max',
                'power-value-equals-mobile',
                'power-value-min-mobile',
                'power-value-max-mobile',
            ].forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            applyPowerCardFilters();
        });
    }

    applyPowerCardFilters();
}

window.clearPowerCardFilters = function clearPowerCardFilters() {
    document.querySelectorAll('#power-cards-tab .power-type-filter-toggle').forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
    });

    [
        'power-value-equals',
        'power-value-min',
        'power-value-max',
        'power-value-equals-mobile',
        'power-value-min-mobile',
        'power-value-max-mobile',
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    applyPowerCardFilters();
}


// Layout utility functions
function ensureTwoPaneLayout() {
    const layout = document.querySelector('.deck-editor-layout');
    if (layout) {
        // Only add the class if we're not in read-only mode
        if (!isReadOnlyMode) {
            layout.classList.add('force-two-pane');
        } else {
            layout.classList.remove('force-two-pane');
        }
    }
}

// Deck utility functions
function updateDeckStats() {
    // Statistics elements were removed as requested, so this function is now a no-op
    // but we keep it to avoid breaking other functions that call it
}

// UI utility functions
function toggleCategory(headerElement) {
    const category = headerElement.closest('.card-category');
    const content = category.querySelector('.card-category-content');
    const icon = headerElement.querySelector('.collapse-icon');
    
    if (headerElement.classList.contains('collapsed')) {
        // Expand
        headerElement.classList.remove('collapsed');
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        icon.textContent = '▼';
    } else {
        // Collapse
        headerElement.classList.add('collapsed');
        content.classList.add('collapsed');
        content.classList.remove('expanded');
        icon.textContent = '▶';
    }
}
