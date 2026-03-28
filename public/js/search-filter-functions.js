// Search and Filter Functions
// Extracted from index.html as part of Phase 10C refactoring

// When evaluated without dbv-icon-filter-logic.js (isolated unit tests), mirror that file's window helpers.
(function ensureDbvFilterHelpers() {
    if (typeof window === 'undefined') {
        return;
    }
    if (typeof window.setDbvPowerTypeToggleButtonsDisabled !== 'function') {
        window.setDbvPowerTypeToggleButtonsDisabled = function (toggles, isDisabled) {
            toggles.forEach((btn) => {
                btn.disabled = isDisabled;
                btn.classList.toggle('is-disabled', isDisabled);
            });
        };
    }
    if (typeof window.matchesIconsPowerTypeFilters !== 'function') {
        window.matchesIconsPowerTypeFilters = function (icons, noIconOnly, selectedPowerTypes) {
            if (noIconOnly) {
                return !icons || icons.length === 0;
            }
            if (!selectedPowerTypes || selectedPowerTypes.length === 0) {
                return true;
            }
            const multiPowerSelected = selectedPowerTypes.includes('Multi-Power');
            const specificTypes = selectedPowerTypes.filter((t) => t !== 'Multi-Power');
            const matchesMultiPower = multiPowerSelected && Array.isArray(icons) && icons.length >= 2;
            const matchesSpecificType =
                specificTypes.length > 0 &&
                Array.isArray(icons) &&
                icons.some((icon) => specificTypes.includes(icon));
            return matchesMultiPower || matchesSpecificType;
        };
    }
})();

// Debounce function for search input
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

// Main search functionality for characters
function performMainSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const activeTab = document.querySelector('.table-container[style*="block"]');
    
    if (!activeTab) return;
    
    const rows = activeTab.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (searchTerm.length === 0) {
            // Show all rows when search is empty
            row.style.display = '';
        } else {
            // Filter rows based on search term
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        }
    });
}

// Search and filter setup functions
function setupSearch() {
    // Only target header filters within the characters tab, not all header filters
    const headerFilters = document.querySelectorAll('#characters-tab .header-filter');
    // Only target filter inputs within the characters tab, not all filter inputs
    const filterInputs = document.querySelectorAll('#characters-tab .filter-input');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const clearFiltersMobileBtn = document.getElementById('clear-filters-mobile');
    const hasInherentAbilityToggle = document.getElementById('has-inherent-ability');
    const hasNoInherentAbilityToggle = document.getElementById('has-no-inherent-ability');
    
    // Setup main search input functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performMainSearch, 300));
    }
    
    // Setup header text search filters - only for characters tab
    headerFilters.forEach(input => {
        input.addEventListener('input', applyFilters);
    });
    
    // Setup numeric filters - only for character filters
    filterInputs.forEach(input => {
        input.addEventListener('input', applyFilters);
    });
    
    // Setup inherent ability toggles
    if (hasInherentAbilityToggle) {
        hasInherentAbilityToggle.addEventListener('change', applyFilters);
    }
    if (hasNoInherentAbilityToggle) {
        hasNoInherentAbilityToggle.addEventListener('change', applyFilters);
    }
    
    // Setup clear filters button (desktop + mobile inline in stat row)
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    if (clearFiltersMobileBtn) {
        clearFiltersMobileBtn.addEventListener('click', clearAllFilters);
    }
}

function setupLocationSearch() {
    // Set up main search input functionality (if it exists)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length === 0) {
                // Reload all locations
                await loadLocations();
                return;
            }

            try {
                const response = await fetch('/api/locations');
                const data = await response.json();
                
                if (data.success) {
                    const filteredLocations = data.data.filter(location => 
                        location.name.toLowerCase().includes(searchTerm) ||
                        location.special_ability.toLowerCase().includes(searchTerm)
                    );
                    displayLocations(filteredLocations);
                }
            } catch (error) {
                console.error('Error searching locations:', error);
            }
        });
    }

    // Set up special ability search input functionality
    const abilitySearchInput = document.querySelector('#locations-table .header-filter[data-column="special_ability"]');
    if (abilitySearchInput) {
        abilitySearchInput.addEventListener('input', async (e) => {
            const abilityTerm = e.target.value.toLowerCase();

            if (abilityTerm.length === 0) {
                await loadLocations();
                return;
            }

            try {
                const response = await fetch('/api/locations');
                const data = await response.json();

                if (data.success) {
                    const filteredLocations = data.data.filter(location =>
                        (location.special_ability || '').toLowerCase().includes(abilityTerm)
                    );
                    displayLocations(filteredLocations);
                }
            } catch (error) {
                console.error('Error searching locations by special ability:', error);
            }
        });
    }

    const nameSearchInput = document.querySelector('#locations-table .header-filter[data-column="name"]');
    if (nameSearchInput) {
        nameSearchInput.addEventListener('input', async (e) => {
            const nameTerm = e.target.value.toLowerCase();

            if (nameTerm.length === 0) {
                await loadLocations();
                return;
            }

            try {
                const response = await fetch('/api/locations');
                const data = await response.json();

                if (data.success) {
                    const filteredLocations = data.data.filter((location) =>
                        (location.name || '').toLowerCase().includes(nameTerm)
                    );
                    displayLocations(filteredLocations);
                }
            } catch (error) {
                console.error('Error searching locations by name:', error);
            }
        });
    }

    if (typeof window.syncLocationThreatFilterPlaceholders === 'function') {
        window.syncLocationThreatFilterPlaceholders();
    }
}

function setupAspectSearch() {
    const nameSearchInput = document.querySelector('#aspects-table .header-filter[data-column="card_name"]');
    const locationSearchInput = document.querySelector('#aspects-table .header-filter[data-column="location"]');
    const effectSearchInput = document.querySelector('#aspects-table .header-filter[data-column="card_effect"]');
    const valueEqualsInput = document.getElementById('aspect-value-equals');
    const valueMinInput = document.getElementById('aspect-value-min');
    const valueMaxInput = document.getElementById('aspect-value-max');
    const noValueToggle = document.getElementById('aspect-no-value-toggle');
    const noIconToggle = document.getElementById('aspect-no-icon-toggle');
    const powerTypeFilterToggles = document.querySelectorAll('#aspects-table .power-type-filter-toggle');

    function setAspectValueInputsDisabled(isDisabled) {
        [valueEqualsInput, valueMinInput, valueMaxInput].forEach(input => {
            if (input) input.disabled = isDisabled;
        });
    }

    function setAspectPowerTypeTogglesDisabled(isDisabled) {
        window.setDbvPowerTypeToggleButtonsDisabled(powerTypeFilterToggles, isDisabled);
    }

    function getSelectedAspectPowerTypes() {
        return Array.from(powerTypeFilterToggles)
            .filter(btn => btn.classList.contains('is-active'))
            .map(btn => btn.getAttribute('data-power-type'))
            .filter(Boolean);
    }

    async function performAspectSearch() {
        const nameTerm = nameSearchInput ? nameSearchInput.value.toLowerCase() : '';
        const locationTerm = locationSearchInput ? locationSearchInput.value.toLowerCase() : '';
        const effectTerm = effectSearchInput ? effectSearchInput.value.toLowerCase() : '';
        const noValueOnly = Boolean(noValueToggle && noValueToggle.checked);
        const noIconOnly = Boolean(noIconToggle && noIconToggle.checked);
        const equalsValue = valueEqualsInput && valueEqualsInput.value !== '' ? parseInt(valueEqualsInput.value, 10) : null;
        const minValue = valueMinInput && valueMinInput.value !== '' ? parseInt(valueMinInput.value, 10) : null;
        const maxValue = valueMaxInput && valueMaxInput.value !== '' ? parseInt(valueMaxInput.value, 10) : null;
        const selectedPowerTypes = noIconOnly ? [] : getSelectedAspectPowerTypes();

        if (
            nameTerm.length === 0 &&
            locationTerm.length === 0 &&
            effectTerm.length === 0 &&
            !noValueOnly &&
            !noIconOnly &&
            equalsValue === null &&
            minValue === null &&
            maxValue === null &&
            selectedPowerTypes.length === 0
        ) {
            await loadAspects();
            return;
        }

        try {
            const response = await fetch('/api/aspects');
            const data = await response.json();
            if (data.success) {
                const filtered = data.data.filter(aspect => {
                    const nameMatch = nameTerm.length === 0 || (aspect.card_name || '').toLowerCase().includes(nameTerm);
                    const locationMatch = locationTerm.length === 0 || (aspect.location || '').toLowerCase().includes(locationTerm);
                    const effectText = (aspect.aspect_description || aspect.card_effect || '').toString();
                    const effectMatch = effectTerm.length === 0 || effectText.toLowerCase().includes(effectTerm);

                    let valueMatch = true;
                    if (noValueOnly) {
                        valueMatch = aspect.value == null;
                    } else {
                        const hasNumericValue = aspect.value != null;
                        if (equalsValue !== null) valueMatch = valueMatch && hasNumericValue && aspect.value === equalsValue;
                        if (minValue !== null) valueMatch = valueMatch && hasNumericValue && aspect.value >= minValue;
                        if (maxValue !== null) valueMatch = valueMatch && hasNumericValue && aspect.value <= maxValue;
                    }

                    const iconTypeMatch = window.matchesIconsPowerTypeFilters(
                        aspect.icons,
                        noIconOnly,
                        selectedPowerTypes
                    );

                    return nameMatch && locationMatch && effectMatch && valueMatch && iconTypeMatch;
                });
                displayAspects(filtered);
            }
        } catch (error) {
            console.error('Error searching aspects:', error);
        }
    }

    const debouncedAspectSearch = debounce(performAspectSearch, 300);

    const aspectsTableRoot = document.getElementById('aspects-table');
    if (aspectsTableRoot && aspectsTableRoot.dataset.aspectLayoutModeBound !== '1') {
        aspectsTableRoot.dataset.aspectLayoutModeBound = '1';
        window.addEventListener('layout-mode-change', () => {
            const aspectsTab = document.getElementById('aspects-tab');
            if (aspectsTab && aspectsTab.style.display !== 'none') {
                void performAspectSearch();
            }
        });
    }

    [nameSearchInput, locationSearchInput, effectSearchInput].forEach(input => {
        if (input && !input.dataset.aspectSearchBound) {
            input.addEventListener('input', debouncedAspectSearch);
            input.dataset.aspectSearchBound = 'true';
        }
    });
    [valueEqualsInput, valueMinInput, valueMaxInput].forEach(input => {
        if (input && !input.dataset.aspectSearchBound) {
            input.addEventListener('input', debouncedAspectSearch);
            input.dataset.aspectSearchBound = 'true';
        }
    });
    if (noValueToggle && !noValueToggle.dataset.aspectSearchBound) {
        noValueToggle.addEventListener('change', () => {
            setAspectValueInputsDisabled(noValueToggle.checked);
            debouncedAspectSearch();
        });
        noValueToggle.dataset.aspectSearchBound = 'true';
    }
    powerTypeFilterToggles.forEach(btn => {
        if (btn.dataset.aspectSearchBound) return;
        btn.addEventListener('click', () => {
            btn.classList.toggle('is-active');
            btn.setAttribute('aria-pressed', String(btn.classList.contains('is-active')));
            debouncedAspectSearch();
        });
        btn.dataset.aspectSearchBound = 'true';
    });
    if (noIconToggle && !noIconToggle.dataset.aspectSearchBound) {
        noIconToggle.addEventListener('change', () => {
            setAspectPowerTypeTogglesDisabled(noIconToggle.checked);
            debouncedAspectSearch();
        });
        noIconToggle.dataset.aspectSearchBound = 'true';
    }

    setAspectValueInputsDisabled(Boolean(noValueToggle && noValueToggle.checked));
    setAspectPowerTypeTogglesDisabled(Boolean(noIconToggle && noIconToggle.checked));
}

function setupAdvancedUniverseSearch() {
    // Set up main search input functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length === 0) {
                // Reload all advanced universe
                await loadAdvancedUniverse();
                return;
            }

            try {
                const response = await fetch('/api/advanced-universe');
                const data = await response.json();
                
                if (data.success) {
                    const filteredAdvancedUniverse = data.data.filter(card => 
                        card.name.toLowerCase().includes(searchTerm) ||
                        card.character.toLowerCase().includes(searchTerm) ||
                        (card.card_description && card.card_description.toLowerCase().includes(searchTerm)) ||
                        (card.card_effect && card.card_effect.toLowerCase().includes(searchTerm))
                    );
                    displayAdvancedUniverse(filteredAdvancedUniverse);
                }
            } catch (error) {
                console.error('Error searching advanced universe:', error);
            }
        });
    }

    // Set up character search input functionality
    const characterSearchInput = document.querySelector('#advanced-universe-table .header-filter[data-column="character"]');
    if (characterSearchInput) {
        characterSearchInput.addEventListener('input', async (e) => {
            const characterTerm = e.target.value.toLowerCase();
            
            if (characterTerm.length === 0) {
                // Reload all advanced universe
                await loadAdvancedUniverse();
                return;
            }

            try {
                const response = await fetch('/api/advanced-universe');
                const data = await response.json();
                
                if (data.success) {
                    const filteredAdvancedUniverse = data.data.filter(card => 
                        card.character.toLowerCase().includes(characterTerm)
                    );
                    displayAdvancedUniverse(filteredAdvancedUniverse);
                }
            } catch (error) {
                console.error('Error searching advanced universe by character:', error);
            }
        });
    }

    // Set up card effect search input functionality
    const effectSearchInput = document.querySelector('#advanced-universe-table .header-filter[data-column="card_effect"]');
    if (effectSearchInput) {
        effectSearchInput.addEventListener('input', async (e) => {
            const effectTerm = e.target.value.toLowerCase();
            
            if (effectTerm.length === 0) {
                // Reload all advanced universe
                await loadAdvancedUniverse();
                return;
            }

            try {
                const response = await fetch('/api/advanced-universe');
                const data = await response.json();
                
                if (data.success) {
                    const filteredAdvancedUniverse = data.data.filter(card => {
                        const effectText = (card.card_description || card.card_effect || '').toString();
                        return effectText.toLowerCase().includes(effectTerm);
                    });
                    displayAdvancedUniverse(filteredAdvancedUniverse);
                }
            } catch (error) {
                console.error('Error searching advanced universe by card effect:', error);
            }
        });
    }
}

function teamworkFilterPowerTypeMatches(actual, selected) {
    if (!actual || !selected) {
        return false;
    }
    if (selected === 'Multi-Power') {
        return actual === 'Multi Power' || actual === 'Multi-Power';
    }
    return actual === selected;
}

function teamworkBonusColumnPasses(bonusNum, equalsVal, minVal, maxVal) {
    if (equalsVal !== null && !Number.isNaN(equalsVal)) {
        return bonusNum !== null && bonusNum === equalsVal;
    }
    if (minVal !== null && !Number.isNaN(minVal)) {
        if (bonusNum === null || bonusNum < minVal) {
            return false;
        }
    }
    if (maxVal !== null && !Number.isNaN(maxVal)) {
        if (bonusNum === null || bonusNum > maxVal) {
            return false;
        }
    }
    return true;
}

function teamworkHasAnyBonusFilterInput(equalsVal, minVal, maxVal) {
    return (
        (equalsVal !== null && !Number.isNaN(equalsVal)) ||
        (minVal !== null && !Number.isNaN(minVal)) ||
        (maxVal !== null && !Number.isNaN(maxVal))
    );
}

function syncTeamworkToUseToggleState(clickedBtn) {
    const tbl = document.getElementById('teamwork-table');
    if (!tbl) {
        return;
    }
    const t = clickedBtn.getAttribute('data-power-type');
    if (!t) {
        return;
    }
    const willBeActive = !clickedBtn.classList.contains('is-active');
    tbl.querySelectorAll(
        '.teamwork-desktop-to-use-toggles .power-type-filter-toggle, .teamwork-to-use-power-toggles .power-type-filter-toggle'
    ).forEach((b) => {
        if (b.getAttribute('data-power-type') === t) {
            b.classList.toggle('is-active', willBeActive);
            b.setAttribute('aria-pressed', willBeActive ? 'true' : 'false');
        }
    });
}

function applyTeamworkFilters() {
    const pool = window.teamworkData;
    if (!pool || pool.length === 0) {
        if (typeof loadTeamwork === 'function') {
            loadTeamwork();
        }
        return;
    }

    const searchInput = document.getElementById('search-input');
    const rawTerm = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';

    const numFrom =
        typeof window.teamworkNumericFromToUse === 'function'
            ? window.teamworkNumericFromToUse
            : (toUse) => {
                  const m = String(toUse || '').trim().match(/^(\d+)/);
                  return m ? parseInt(m[1], 10) : null;
              };
    const powerFrom =
        typeof window.teamworkPowerTypeFromValue === 'function'
            ? window.teamworkPowerTypeFromValue
            : (v) => String(v || '').trim().replace(/^\d+\s+/, '').trim();

    const equalsEl = document.getElementById('teamwork-to-use-equals');
    const minEl = document.getElementById('teamwork-to-use-min');
    const maxEl = document.getElementById('teamwork-to-use-max');
    const equalsVal = equalsEl && equalsEl.value !== '' ? parseInt(equalsEl.value, 10) : null;
    const minVal = minEl && minEl.value !== '' ? parseInt(minEl.value, 10) : null;
    const maxVal = maxEl && maxEl.value !== '' ? parseInt(maxEl.value, 10) : null;

    const toUseTypeSet = new Set();
    document
        .querySelectorAll(
            '#teamwork-table .teamwork-desktop-to-use-toggles .power-type-filter-toggle.is-active, #teamwork-table .teamwork-to-use-power-toggles .power-type-filter-toggle.is-active'
        )
        .forEach((b) => {
            const pt = b.getAttribute('data-power-type');
            if (pt) {
                toUseTypeSet.add(pt);
            }
        });
    const selectedToUseTypes = [...toUseTypeSet];

    const selectedActsAsTypes = Array.from(
        document.querySelectorAll('#teamwork-table .teamwork-desktop-acts-as-toggles .power-type-filter-toggle.is-active')
    )
        .map((b) => b.getAttribute('data-power-type'))
        .filter(Boolean);

    const selectedFollowupTypes = Array.from(
        document.querySelectorAll('#teamwork-table .teamwork-desktop-followup-toggles .power-type-filter-toggle.is-active')
    )
        .map((b) => b.getAttribute('data-power-type'))
        .filter(Boolean);

    const firstEqEl = document.getElementById('teamwork-first-bonus-equals');
    const firstMinEl = document.getElementById('teamwork-first-bonus-min');
    const firstMaxEl = document.getElementById('teamwork-first-bonus-max');
    const firstEqualsVal = firstEqEl && firstEqEl.value !== '' ? parseInt(firstEqEl.value, 10) : null;
    const firstMinVal = firstMinEl && firstMinEl.value !== '' ? parseInt(firstMinEl.value, 10) : null;
    const firstMaxVal = firstMaxEl && firstMaxEl.value !== '' ? parseInt(firstMaxEl.value, 10) : null;

    const secondEqEl = document.getElementById('teamwork-second-bonus-equals');
    const secondMinEl = document.getElementById('teamwork-second-bonus-min');
    const secondMaxEl = document.getElementById('teamwork-second-bonus-max');
    const secondEqualsVal = secondEqEl && secondEqEl.value !== '' ? parseInt(secondEqEl.value, 10) : null;
    const secondMinVal = secondMinEl && secondMinEl.value !== '' ? parseInt(secondMinEl.value, 10) : null;
    const secondMaxVal = secondMaxEl && secondMaxEl.value !== '' ? parseInt(secondMaxEl.value, 10) : null;

    const bonusNumFn =
        typeof window.teamworkBonusNumericFromField === 'function'
            ? window.teamworkBonusNumericFromField
            : (raw) => {
                  const m = String(raw ?? '').trim().match(/(\d+)/);
                  return m ? parseInt(m[1], 10) : null;
              };
    const parseFollowup =
        typeof window.parseTeamworkFollowupTokens === 'function'
            ? window.parseTeamworkFollowupTokens
            : () => [];

    const safeLower = (v) => String(v ?? '').toLowerCase();

    const filtered = pool.filter((card) => {
        if (rawTerm) {
            const match =
                safeLower(card.card_type).includes(rawTerm) ||
                safeLower(card.to_use).includes(rawTerm) ||
                safeLower(card.acts_as).includes(rawTerm) ||
                safeLower(card.followup_attack_types).includes(rawTerm) ||
                safeLower(card.first_attack_bonus).includes(rawTerm) ||
                safeLower(card.second_attack_bonus).includes(rawTerm);
            if (!match) {
                return false;
            }
        }

        if (selectedToUseTypes.length > 0) {
            const p = powerFrom(card.to_use);
            const ok = selectedToUseTypes.some((sel) => teamworkFilterPowerTypeMatches(p, sel));
            if (!ok) {
                return false;
            }
        }

        const n = numFrom(card.to_use);
        if (equalsVal !== null && !Number.isNaN(equalsVal)) {
            if (n === null || n !== equalsVal) {
                return false;
            }
        }
        if (minVal !== null && !Number.isNaN(minVal)) {
            if (n === null || n < minVal) {
                return false;
            }
        }
        if (maxVal !== null && !Number.isNaN(maxVal)) {
            if (n === null || n > maxVal) {
                return false;
            }
        }

        if (selectedActsAsTypes.length > 0) {
            const actsType =
                typeof window.teamworkActsAsPowerTypeForFilter === 'function'
                    ? window.teamworkActsAsPowerTypeForFilter(card)
                    : null;
            if (!actsType || !selectedActsAsTypes.some((sel) => teamworkFilterPowerTypeMatches(actsType, sel))) {
                return false;
            }
        }

        if (selectedFollowupTypes.length > 0) {
            const rawFu = card.followup_attack_types || card.follow_up_attack_types;
            const tokens = parseFollowup(rawFu);
            const ok = tokens.some((tok) =>
                selectedFollowupTypes.some((sel) => teamworkFilterPowerTypeMatches(tok, sel))
            );
            if (!ok) {
                return false;
            }
        }

        if (teamworkHasAnyBonusFilterInput(firstEqualsVal, firstMinVal, firstMaxVal)) {
            const b1 = bonusNumFn(card.first_attack_bonus);
            if (!teamworkBonusColumnPasses(b1, firstEqualsVal, firstMinVal, firstMaxVal)) {
                return false;
            }
        }
        if (teamworkHasAnyBonusFilterInput(secondEqualsVal, secondMinVal, secondMaxVal)) {
            const b2 = bonusNumFn(card.second_attack_bonus);
            if (!teamworkBonusColumnPasses(b2, secondEqualsVal, secondMinVal, secondMaxVal)) {
                return false;
            }
        }

        return true;
    });

    if (typeof displayTeamwork === 'function') {
        displayTeamwork(filtered);
    }
}

function clearTeamworkToUseValueFilters() {
    ['teamwork-to-use-equals', 'teamwork-to-use-min', 'teamwork-to-use-max'].forEach((id) => {
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
    applyTeamworkFilters();
}

function setupTeamworkTableFilters() {
    const root = document.getElementById('teamwork-table');
    if (!root || root.dataset.teamworkFiltersBound === 'true') {
        return;
    }
    root.dataset.teamworkFiltersBound = 'true';

    let debounceT = null;
    const debouncedApply = () => {
        clearTimeout(debounceT);
        debounceT = setTimeout(() => applyTeamworkFilters(), 150);
    };

    root
        .querySelectorAll(
            '.teamwork-desktop-to-use-toggles .power-type-filter-toggle, .teamwork-to-use-power-toggles .power-type-filter-toggle'
        )
        .forEach((btn) => {
            btn.addEventListener('click', () => {
                syncTeamworkToUseToggleState(btn);
                applyTeamworkFilters();
            });
        });

    root.querySelectorAll('.teamwork-desktop-acts-as-toggles .power-type-filter-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('is-active');
            btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
            applyTeamworkFilters();
        });
    });

    root.querySelectorAll('.teamwork-desktop-followup-toggles .power-type-filter-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('is-active');
            btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
            applyTeamworkFilters();
        });
    });

    const onDesktopToUseNum = () => {
        if (typeof window.syncTeamworkDesktopNumericToMobile === 'function') {
            window.syncTeamworkDesktopNumericToMobile();
        }
        debouncedApply();
    };
    const onMobileToUseNum = () => {
        if (typeof window.syncTeamworkMobileNumericToDesktop === 'function') {
            window.syncTeamworkMobileNumericToDesktop();
        }
        debouncedApply();
    };

    ['teamwork-to-use-equals', 'teamwork-to-use-min', 'teamwork-to-use-max'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', onDesktopToUseNum);
        }
    });

    const teamworkTab = document.getElementById('teamwork-tab');
    if (teamworkTab) {
        teamworkTab
            .querySelectorAll('.teamwork-mobile-to-use-equals, .teamwork-mobile-to-use-min, .teamwork-mobile-to-use-max')
            .forEach((el) => {
                el.addEventListener('input', onMobileToUseNum);
            });
    }

    const bonusIds = [
        'teamwork-first-bonus-equals',
        'teamwork-first-bonus-min',
        'teamwork-first-bonus-max',
        'teamwork-second-bonus-equals',
        'teamwork-second-bonus-min',
        'teamwork-second-bonus-max'
    ];
    bonusIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', debouncedApply);
        }
    });

    const vClear = document.getElementById('teamwork-to-use-value-clear');
    if (vClear) {
        vClear.addEventListener('click', () => clearTeamworkToUseValueFilters());
    }

    window.addEventListener('layout-mode-change', () => {
        if (typeof window.syncTeamworkDesktopNumericToMobile === 'function') {
            window.syncTeamworkDesktopNumericToMobile();
        }
        const t = document.getElementById('teamwork-tab');
        if (t && t.style.display !== 'none' && window.teamworkData && window.teamworkData.length > 0) {
            applyTeamworkFilters();
        }
    });
}

function setupTeamworkSearch() {
    setupTeamworkTableFilters();

    const searchInput = document.getElementById('search-input');
    if (!searchInput || searchInput.dataset.teamworkSearchBound === 'true') {
        return;
    }
    searchInput.dataset.teamworkSearchBound = 'true';

    searchInput.addEventListener('input', async () => {
        if (!window.teamworkData || window.teamworkData.length === 0) {
            if (typeof loadTeamwork === 'function') {
                await loadTeamwork();
            }
            applyTeamworkFilters();
            return;
        }
        applyTeamworkFilters();
    });
}

function getSelectedSpecialFunctionFilterFields(root = document) {
    return Array.from(root.querySelectorAll('#special-cards-table .function-filter-toggle.is-active'))
        .map(toggle => toggle.getAttribute('data-icon-field'))
        .filter(Boolean);
}

function cardMatchesFunctionIconFilters(card, selectedIconFields) {
    if (!selectedIconFields || selectedIconFields.length === 0) {
        return true;
    }

    return selectedIconFields.some(field => Boolean(card[field]));
}

function setupSpecialCardSearch() {
    // Set up column-specific search inputs
    const nameSearchInput = document.querySelector('#special-cards-table .header-filter[data-column="name"]');
    const characterSearchInput = document.querySelector('#special-cards-table .header-filter[data-column="character"]');
    const effectSearchInput = document.querySelector('#special-cards-table .header-filter[data-column="card_effect"]');
    const valueEqualsInput = document.getElementById('special-value-equals');
    const valueMinInput = document.getElementById('special-value-min');
    const valueMaxInput = document.getElementById('special-value-max');
    const noValueToggle = document.getElementById('special-no-value-toggle');
    const functionFilterToggles = document.querySelectorAll('#special-cards-table .function-filter-toggle');
    const powerTypeFilterToggles = document.querySelectorAll('#special-cards-table .power-type-filter-toggle');
    const noIconToggle = document.getElementById('special-no-icon-toggle');

    function setSpecialValueInputsDisabled(isDisabled) {
        [valueEqualsInput, valueMinInput, valueMaxInput].forEach(input => {
            if (input) {
                input.disabled = isDisabled;
            }
        });
    }

    function setPowerTypeTogglesDisabled(isDisabled) {
        window.setDbvPowerTypeToggleButtonsDisabled(powerTypeFilterToggles, isDisabled);
    }

    function getSelectedPowerTypes() {
        return Array.from(powerTypeFilterToggles)
            .filter(btn => btn.classList.contains('is-active'))
            .map(btn => btn.getAttribute('data-power-type'))
            .filter(Boolean);
    }
    
    // Function to perform search with current filter values
    async function performSpecialCardSearch() {
        const nameTerm = nameSearchInput ? nameSearchInput.value.toLowerCase() : '';
        const characterTerm = characterSearchInput ? characterSearchInput.value.toLowerCase() : '';
        const effectTerm = effectSearchInput ? effectSearchInput.value.toLowerCase() : '';
        const noValueOnly = Boolean(noValueToggle && noValueToggle.checked);
        const noIconOnly = Boolean(noIconToggle && noIconToggle.checked);
        const equalsValue = valueEqualsInput && valueEqualsInput.value !== '' ? parseInt(valueEqualsInput.value, 10) : null;
        const minValue = valueMinInput && valueMinInput.value !== '' ? parseInt(valueMinInput.value, 10) : null;
        const maxValue = valueMaxInput && valueMaxInput.value !== '' ? parseInt(valueMaxInput.value, 10) : null;
        const selectedIconFields = getSelectedSpecialFunctionFilterFields();
        const selectedPowerTypes = noIconOnly ? [] : getSelectedPowerTypes();
        
        // If all search terms are empty, reload all cards
        if (
            nameTerm.length === 0 &&
            characterTerm.length === 0 &&
            effectTerm.length === 0 &&
            !noValueOnly &&
            !noIconOnly &&
            equalsValue === null &&
            minValue === null &&
            maxValue === null &&
            selectedIconFields.length === 0 &&
            selectedPowerTypes.length === 0
        ) {
            await loadSpecialCards();
            return;
        }

        try {
            const response = await fetch('/api/special-cards');
            const data = await response.json();
            
            if (data.success) {
                const filteredSpecialCards = data.data.filter(card => {
                    const nameMatch = nameTerm.length === 0 || (card.name || '').toLowerCase().includes(nameTerm);
                    const characterMatch = characterTerm.length === 0 || (card.character || '').toLowerCase().includes(characterTerm);
                    const effectMatch = effectTerm.length === 0 || (card.card_effect || '').toLowerCase().includes(effectTerm);
                    const functionIconMatch = cardMatchesFunctionIconFilters(card, selectedIconFields);
                    let valueMatch = true;

                    if (noValueOnly) {
                        valueMatch = card.value == null;
                    } else {
                        const hasNumericValue = card.value != null;
                        if (equalsValue !== null) {
                            valueMatch = valueMatch && hasNumericValue && card.value === equalsValue;
                        }
                        if (minValue !== null) {
                            valueMatch = valueMatch && hasNumericValue && card.value >= minValue;
                        }
                        if (maxValue !== null) {
                            valueMatch = valueMatch && hasNumericValue && card.value <= maxValue;
                        }
                    }

                    const iconTypeMatch = window.matchesIconsPowerTypeFilters(
                        card.icons,
                        noIconOnly,
                        selectedPowerTypes
                    );
                    
                    return nameMatch && characterMatch && effectMatch && valueMatch && functionIconMatch && iconTypeMatch;
                });
                
                // Check if displaySpecialCards function exists
                if (typeof displaySpecialCards === 'function') {
                    displaySpecialCards(filteredSpecialCards);
                } else {
                    console.error('❌ displaySpecialCards function does not exist!');
                }
            }
        } catch (error) {
            console.error('Error searching special cards:', error);
        }
    }

    const debouncedSpecialSearch = debounce(performSpecialCardSearch, 300);
    
    // Add event listeners to each search input
    if (nameSearchInput && !nameSearchInput.dataset.specialSearchBound) {
        nameSearchInput.addEventListener('input', debouncedSpecialSearch);
        nameSearchInput.dataset.specialSearchBound = 'true';
    }
    if (characterSearchInput && !characterSearchInput.dataset.specialSearchBound) {
        characterSearchInput.addEventListener('input', debouncedSpecialSearch);
        characterSearchInput.dataset.specialSearchBound = 'true';
    }
    if (effectSearchInput && !effectSearchInput.dataset.specialSearchBound) {
        effectSearchInput.addEventListener('input', debouncedSpecialSearch);
        effectSearchInput.dataset.specialSearchBound = 'true';
    }
    [valueEqualsInput, valueMinInput, valueMaxInput].forEach(input => {
        if (input && !input.dataset.specialSearchBound) {
            input.addEventListener('input', debouncedSpecialSearch);
            input.dataset.specialSearchBound = 'true';
        }
    });
    if (noValueToggle && !noValueToggle.dataset.specialSearchBound) {
        noValueToggle.addEventListener('change', () => {
            setSpecialValueInputsDisabled(noValueToggle.checked);
            debouncedSpecialSearch();
        });
        noValueToggle.dataset.specialSearchBound = 'true';
    }

    powerTypeFilterToggles.forEach(toggle => {
        if (toggle.dataset.specialSearchBound) {
            return;
        }
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('is-active');
            toggle.setAttribute('aria-pressed', toggle.classList.contains('is-active') ? 'true' : 'false');
            debouncedSpecialSearch();
        });
        toggle.dataset.specialSearchBound = 'true';
    });

    if (noIconToggle && !noIconToggle.dataset.specialSearchBound) {
        noIconToggle.addEventListener('change', () => {
            setPowerTypeTogglesDisabled(noIconToggle.checked);
            debouncedSpecialSearch();
        });
        noIconToggle.dataset.specialSearchBound = 'true';
    }

    functionFilterToggles.forEach(toggle => {
        if (toggle.dataset.specialSearchBound) {
            return;
        }
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('is-active');
            toggle.setAttribute('aria-pressed', toggle.classList.contains('is-active') ? 'true' : 'false');
            debouncedSpecialSearch();
        });
        toggle.dataset.specialSearchBound = 'true';
    });

    setSpecialValueInputsDisabled(Boolean(noValueToggle && noValueToggle.checked));
    setPowerTypeTogglesDisabled(Boolean(noIconToggle && noIconToggle.checked));
}

window.getSelectedSpecialFunctionFilterFields = getSelectedSpecialFunctionFilterFields;
window.cardMatchesFunctionIconFilters = cardMatchesFunctionIconFilters;
window.setupSpecialCardSearch = setupSpecialCardSearch;

/** True in mobile layout — use mobile card-name field; mission set always uses `#missions-mission-set-filter` (DTV + MV). */
function missionsFilterUsesMobileSelect() {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('layout-mobile')) {
        return true;
    }
    if (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 900px)').matches) {
        return true;
    }
    return false;
}

function setupMissionSearch() {
    const missionsTableRoot = document.getElementById('missions-table');
    if (missionsTableRoot && missionsTableRoot.dataset.missionLayoutModeBound !== '1') {
        missionsTableRoot.dataset.missionLayoutModeBound = '1';
        window.addEventListener('layout-mode-change', () => {
            const tab = document.getElementById('missions-tab');
            if (
                tab &&
                tab.style.display !== 'none' &&
                window.missionsData &&
                window.missionsData.length > 0 &&
                typeof applyMissionFilters === 'function'
            ) {
                applyMissionFilters();
            }
        });
    }

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', async () => {
        if (!window.missionsData || window.missionsData.length === 0) {
            if (typeof loadMissions === 'function') {
                await loadMissions();
            }
            return;
        }
        applyMissionFilters();
    });

    const missionCardNameInput = document.getElementById('missions-mobile-card-name-filter');
    if (missionCardNameInput && !missionCardNameInput.dataset.missionNameFilterBound) {
        missionCardNameInput.dataset.missionNameFilterBound = 'true';
        missionCardNameInput.addEventListener('input', () => {
            if (!window.missionsData || window.missionsData.length === 0) {
                return;
            }
            applyMissionFilters();
        });
    }

    const missionHeaderCardNameInput = document.getElementById('missions-header-card-name-filter');
    if (missionHeaderCardNameInput && !missionHeaderCardNameInput.dataset.missionHeaderNameFilterBound) {
        missionHeaderCardNameInput.dataset.missionHeaderNameFilterBound = 'true';
        missionHeaderCardNameInput.addEventListener('input', () => {
            if (!window.missionsData || window.missionsData.length === 0) {
                return;
            }
            applyMissionFilters();
        });
    }
}

function applyMissionFilters() {
    const missions = window.missionsData || [];
    const searchInput = document.getElementById('search-input');
    const rawTerm = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';
    let pool = missions;
    if (rawTerm) {
        pool = missions.filter(
            (mission) =>
                (mission.mission_set && mission.mission_set.toLowerCase().includes(rawTerm)) ||
                (mission.card_name && mission.card_name.toLowerCase().includes(rawTerm))
        );
    }

    if (missionsFilterUsesMobileSelect()) {
        const nameEl = document.getElementById('missions-mobile-card-name-filter');
        const nameTerm = nameEl && nameEl.value ? nameEl.value.trim().toLowerCase() : '';
        if (nameTerm) {
            pool = pool.filter(
                (mission) => mission.card_name && mission.card_name.toLowerCase().includes(nameTerm)
            );
        }
    } else {
        const headerNameEl = document.getElementById('missions-header-card-name-filter');
        const headerNameTerm = headerNameEl && headerNameEl.value ? headerNameEl.value.trim().toLowerCase() : '';
        if (headerNameTerm) {
            pool = pool.filter(
                (mission) => mission.card_name && mission.card_name.toLowerCase().includes(headerNameTerm)
            );
        }
    }

    const sel = document.getElementById('missions-mission-set-filter');
    const v = sel && sel.value ? sel.value : '';
    if (!v) {
        displayMissions(pool);
        return;
    }
    displayMissions(pool.filter((m) => m.mission_set === v));
}

window.applyMissionFilters = applyMissionFilters;

function setupEventSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput && !searchInput.dataset.eventsDbvSearchBound) {
        searchInput.dataset.eventsDbvSearchBound = 'true';
        searchInput.addEventListener('input', async () => {
            if (!document.querySelector('.tab-button.active[data-tab="events"]')) {
                return;
            }
            if (!window.eventsData || window.eventsData.length === 0) {
                if (typeof loadEvents === 'function') {
                    await loadEvents();
                }
                return;
            }
            applyEventsFilters();
        });
    }

    const gameEffectSearchInput = document.querySelector('#events-table .header-filter[data-column="game_effect"]');
    if (gameEffectSearchInput && !gameEffectSearchInput.dataset.eventsGameEffectBound) {
        gameEffectSearchInput.dataset.eventsGameEffectBound = 'true';
        gameEffectSearchInput.addEventListener('input', async () => {
            if (!window.eventsData || window.eventsData.length === 0) {
                if (typeof loadEvents === 'function') {
                    await loadEvents();
                }
                return;
            }
            applyEventsFilters();
        });
    }

}

function applyEventsFilters() {
    if (!document.getElementById('events-tbody')) {
        return;
    }

    const events = window.eventsData || [];
    const searchInput = document.getElementById('search-input');
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

    const gameEffectInput = document.querySelector('#events-table .header-filter[data-column="game_effect"]');
    const effectTerm = gameEffectInput && gameEffectInput.value ? gameEffectInput.value.trim().toLowerCase() : '';
    if (effectTerm) {
        pool = pool.filter((event) => {
            const ge = (event.game_effect && String(event.game_effect).toLowerCase()) || '';
            return ge.includes(effectTerm);
        });
    }

    const sel = document.getElementById('events-mission-set-filter');
    const v = sel && sel.value ? sel.value : '';
    if (!v) {
        displayEvents(pool);
        return;
    }
    displayEvents(pool.filter((e) => e.mission_set === v));
}

window.applyEventsFilters = applyEventsFilters;

function allyPowerTypeMatchesSel(sel, typeStr) {
    const t = String(typeStr || '').trim();
    if (sel === 'Multi Power' || sel === 'Multi-Power') {
        return t === 'Multi Power' || t === 'Multi-Power';
    }
    return t === sel;
}

function allyUniqueActivePowerTypes(buttonSelector) {
    const set = new Set();
    document.querySelectorAll(buttonSelector).forEach((btn) => {
        if (btn.classList.contains('is-active')) {
            const t = btn.getAttribute('data-power-type');
            if (t) set.add(t);
        }
    });
    return Array.from(set);
}

function allyCardNameColumnTerm() {
    const tab = document.getElementById('ally-universe-tab');
    const d = document.getElementById('ally-card-name-filter');
    const m = tab && tab.querySelector('.ally-universe-mobile-card-name-filter');
    const raw = (d && d.value) || (m && m.value) || '';
    return String(raw).trim().toLowerCase();
}

function syncAllyUniverseDesktopFiltersToMobile() {
    const tab = document.getElementById('ally-universe-tab');
    if (!tab) return;
    const dName = document.getElementById('ally-card-name-filter');
    const mName = tab.querySelector('.ally-universe-mobile-card-name-filter');
    if (dName && mName) mName.value = dName.value;
}

function syncAllyUniverseMobileFiltersToDesktop() {
    const tab = document.getElementById('ally-universe-tab');
    if (!tab) return;
    const dName = document.getElementById('ally-card-name-filter');
    const mName = tab.querySelector('.ally-universe-mobile-card-name-filter');
    if (dName && mName) dName.value = mName.value;
}

function applyAllyUniverseFilters() {
    const pool = window.allyUniverseData;
    if (!pool || pool.length === 0) {
        if (typeof loadAllyUniverse === 'function') {
            loadAllyUniverse();
        }
        return;
    }

    const searchInput = document.getElementById('search-input');
    const rawTerm = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';
    const nameColTerm = allyCardNameColumnTerm();

    const selectedStatTypes = allyUniqueActivePowerTypes(
        '#ally-universe-table .ally-stat-type-filter-toggles .power-type-filter-toggle'
    );
    const selectedAttackTypes = allyUniqueActivePowerTypes(
        '#ally-universe-table .ally-attack-type-filter-toggles .power-type-filter-toggle'
    );

    const safeLower = (v) => String(v ?? '').toLowerCase();

    const filtered = pool.filter((card) => {
        if (nameColTerm) {
            const nm = card.card_name && safeLower(card.card_name);
            if (!nm || !nm.includes(nameColTerm)) {
                return false;
            }
        }

        if (rawTerm) {
            const match =
                (card.card_name && safeLower(card.card_name).includes(rawTerm)) ||
                (card.card_type && safeLower(card.card_type).includes(rawTerm)) ||
                (card.stat_to_use && safeLower(card.stat_to_use).includes(rawTerm)) ||
                (card.stat_type_to_use && safeLower(card.stat_type_to_use).includes(rawTerm)) ||
                (card.attack_value != null && safeLower(String(card.attack_value)).includes(rawTerm)) ||
                (card.attack_type && safeLower(card.attack_type).includes(rawTerm)) ||
                (card.card_text && safeLower(card.card_text).includes(rawTerm));
            if (!match) {
                return false;
            }
        }

        if (selectedStatTypes.length > 0) {
            const t = String(card.stat_type_to_use || '').trim();
            const ok = selectedStatTypes.some((sel) => allyPowerTypeMatchesSel(sel, t));
            if (!ok) {
                return false;
            }
        }

        if (selectedAttackTypes.length > 0) {
            const t = String(card.attack_type || '').trim();
            const ok = selectedAttackTypes.some((sel) => allyPowerTypeMatchesSel(sel, t));
            if (!ok) {
                return false;
            }
        }

        return true;
    });

    if (typeof displayAllyUniverse === 'function') {
        displayAllyUniverse(filtered);
    }
}

function setupAllyUniverseTableFilters() {
    const root = document.getElementById('ally-universe-table');
    if (!root || root.dataset.allyUniverseFiltersBound === 'true') {
        return;
    }
    root.dataset.allyUniverseFiltersBound = 'true';

    root.querySelectorAll('[data-ally-filter-role] .power-type-filter-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            const roleHost = btn.closest('[data-ally-filter-role]');
            const role = roleHost && roleHost.getAttribute('data-ally-filter-role');
            if (!role) return;
            const type = btn.getAttribute('data-power-type');
            const willBeActive = !btn.classList.contains('is-active');
            document
                .querySelectorAll(`#ally-universe-tab [data-ally-filter-role="${role}"] .power-type-filter-toggle`)
                .forEach((b) => {
                    if (b.getAttribute('data-power-type') === type) {
                        b.classList.toggle('is-active', willBeActive);
                        b.setAttribute('aria-pressed', String(willBeActive));
                    }
                });
            applyAllyUniverseFilters();
        });
    });

    let debounceAlly = null;
    const debouncedApplyAlly = () => {
        clearTimeout(debounceAlly);
        debounceAlly = setTimeout(() => applyAllyUniverseFilters(), 180);
    };

    const tab = document.getElementById('ally-universe-tab');
    const nameDesktop = document.getElementById('ally-card-name-filter');
    if (nameDesktop) {
        nameDesktop.addEventListener('input', () => {
            syncAllyUniverseDesktopFiltersToMobile();
            debouncedApplyAlly();
        });
    }
    if (tab) {
        tab.querySelectorAll('.ally-universe-mobile-card-name-filter').forEach((el) => {
            el.addEventListener('input', () => {
                syncAllyUniverseMobileFiltersToDesktop();
                debouncedApplyAlly();
            });
        });
    }

    window.addEventListener('layout-mode-change', () => {
        syncAllyUniverseDesktopFiltersToMobile();
        const t = document.getElementById('ally-universe-tab');
        if (t && t.style.display !== 'none' && window.allyUniverseData && window.allyUniverseData.length > 0) {
            applyAllyUniverseFilters();
        }
    });

    syncAllyUniverseDesktopFiltersToMobile();
}

function setupAllyUniverseSearch() {
    setupAllyUniverseTableFilters();

    const searchInput = document.getElementById('search-input');
    if (!searchInput || searchInput.dataset.allyUniverseSearchBound === 'true') {
        return;
    }
    searchInput.dataset.allyUniverseSearchBound = 'true';

    searchInput.addEventListener('input', async () => {
        if (!window.allyUniverseData || window.allyUniverseData.length === 0) {
            if (typeof loadAllyUniverse === 'function') {
                await loadAllyUniverse();
            }
            applyAllyUniverseFilters();
            return;
        }
        applyAllyUniverseFilters();
    });
}

function trainingTypeCellMatchesSel(sel, typeStr) {
    const t = String(typeStr || '').trim();
    if (sel === 'Multi-Power') {
        return t === 'Multi Power' || t === 'Multi-Power';
    }
    return t === sel;
}

function trainingCardMatchesSelectedTypes(card, selectedTypes) {
    if (selectedTypes.length === 0) {
        return true;
    }
    return selectedTypes.some(
        (sel) =>
            trainingTypeCellMatchesSel(sel, card.type_1) || trainingTypeCellMatchesSel(sel, card.type_2)
    );
}

function trainingCardNameColumnTerm() {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('layout-mobile')) {
        return '';
    }
    const d = document.getElementById('training-card-name-filter');
    const raw = d && d.value ? d.value : '';
    return String(raw).trim().toLowerCase();
}

function applyTrainingFilters() {
    const pool = window.trainingData;
    if (!pool || pool.length === 0) {
        if (typeof loadTraining === 'function') {
            loadTraining();
        }
        return;
    }

    const isMobile =
        typeof document !== 'undefined' && document.documentElement.classList.contains('layout-mobile');

    const searchInput = document.getElementById('search-input');
    const rawTerm = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';

    const toggles = document.querySelectorAll(
        '#training-table .training-stat-type-toggles .power-type-filter-toggle.is-active'
    );
    const selectedTypesMobile = Array.from(toggles)
        .map((b) => b.getAttribute('data-power-type'))
        .filter(Boolean);

    const nameColTerm = trainingCardNameColumnTerm();
    const selectedType1 = isMobile
        ? []
        : allyUniqueActivePowerTypes('#training-table .training-type-1-filter-toggles .power-type-filter-toggle');
    const selectedType2 = isMobile
        ? []
        : allyUniqueActivePowerTypes('#training-table .training-type-2-filter-toggles .power-type-filter-toggle');

    const safeLower = (v) => String(v ?? '').toLowerCase();

    const filtered = pool.filter((card) => {
        if (!isMobile && nameColTerm) {
            const nm = card.card_name && safeLower(card.card_name);
            if (!nm || !nm.includes(nameColTerm)) {
                return false;
            }
        }

        if (rawTerm) {
            const match =
                (card.card_name && safeLower(card.card_name).includes(rawTerm)) ||
                (card.type_1 && safeLower(card.type_1).includes(rawTerm)) ||
                (card.type_2 && safeLower(card.type_2).includes(rawTerm)) ||
                (card.value_to_use != null && safeLower(String(card.value_to_use)).includes(rawTerm)) ||
                (card.bonus != null && safeLower(String(card.bonus)).includes(rawTerm));
            if (!match) {
                return false;
            }
        }

        if (isMobile) {
            if (!trainingCardMatchesSelectedTypes(card, selectedTypesMobile)) {
                return false;
            }
        } else {
            if (selectedType1.length > 0) {
                const ok = selectedType1.some((sel) => trainingTypeCellMatchesSel(sel, card.type_1));
                if (!ok) {
                    return false;
                }
            }
            if (selectedType2.length > 0) {
                const ok = selectedType2.some((sel) => trainingTypeCellMatchesSel(sel, card.type_2));
                if (!ok) {
                    return false;
                }
            }
        }
        return true;
    });

    if (typeof displayTraining === 'function') {
        displayTraining(filtered);
    }
}

function setupTrainingTableFilters() {
    const root = document.getElementById('training-table');
    if (!root || root.dataset.trainingFiltersBound === 'true') {
        return;
    }
    root.dataset.trainingFiltersBound = 'true';

    const bindToggle = (btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('is-active');
            btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
            applyTrainingFilters();
        });
    };

    root.querySelectorAll('.training-stat-type-toggles .power-type-filter-toggle').forEach(bindToggle);

    root
        .querySelectorAll(
            '.training-type-1-filter-toggles .power-type-filter-toggle, .training-type-2-filter-toggles .power-type-filter-toggle'
        )
        .forEach(bindToggle);

    let debounceTrainingName = null;
    const debouncedApplyTraining = () => {
        clearTimeout(debounceTrainingName);
        debounceTrainingName = setTimeout(() => applyTrainingFilters(), 180);
    };
    const nameDesktop = document.getElementById('training-card-name-filter');
    if (nameDesktop) {
        nameDesktop.addEventListener('input', debouncedApplyTraining);
    }

    window.addEventListener('layout-mode-change', () => {
        const t = document.getElementById('training-tab');
        if (t && t.style.display !== 'none' && window.trainingData && window.trainingData.length > 0) {
            applyTrainingFilters();
        }
    });
}

function setupTrainingSearch() {
    setupTrainingTableFilters();

    const searchInput = document.getElementById('search-input');
    if (!searchInput || searchInput.dataset.trainingSearchBound === 'true') {
        return;
    }
    searchInput.dataset.trainingSearchBound = 'true';

    searchInput.addEventListener('input', async () => {
        if (!window.trainingData || window.trainingData.length === 0) {
            if (typeof loadTraining === 'function') {
                await loadTraining();
            }
            applyTrainingFilters();
            return;
        }
        applyTrainingFilters();
    });
}

function setupPowerCardsSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', async (e) => {
        const term = e.target.value.toLowerCase();
        if (term.length === 0) { 
            await applyPowerCardFilters(); 
            return; 
        }
        try {
            const resp = await fetch('/api/power-cards');
            const data = await resp.json();
            if (data.success) {
                const filtered = data.data.filter(c =>
                    c.power_type.toLowerCase().includes(term) ||
                    String(c.value).includes(term)
                );
                displayPowerCards(filtered);
            }
        } catch (err) { console.error('Error searching power cards:', err); }
    });
}

window.applyTeamworkFilters = applyTeamworkFilters;
window.applyAllyUniverseFilters = applyAllyUniverseFilters;
window.applyTrainingFilters = applyTrainingFilters;
window.clearTeamworkToUseValueFilters = clearTeamworkToUseValueFilters;
