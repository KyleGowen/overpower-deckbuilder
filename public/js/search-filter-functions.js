// Search and Filter Functions
// Extracted from index.html as part of Phase 10C refactoring

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
        powerTypeFilterToggles.forEach(btn => {
            btn.disabled = isDisabled;
            btn.classList.toggle('is-disabled', isDisabled);
        });
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

                    let iconTypeMatch = true;
                    if (noIconOnly) {
                        iconTypeMatch = !aspect.icons || aspect.icons.length === 0;
                    } else if (selectedPowerTypes.length > 0) {
                        const multiPowerSelected = selectedPowerTypes.includes('Multi-Power');
                        const specificTypes = selectedPowerTypes.filter(t => t !== 'Multi-Power');
                        const matchesMultiPower = multiPowerSelected && Array.isArray(aspect.icons) && aspect.icons.length >= 2;
                        const matchesSpecificType = specificTypes.length > 0 && Array.isArray(aspect.icons) && aspect.icons.some(icon => specificTypes.includes(icon));
                        iconTypeMatch = matchesMultiPower || matchesSpecificType;
                    }

                    return nameMatch && locationMatch && effectMatch && valueMatch && iconTypeMatch;
                });
                displayAspects(filtered);
            }
        } catch (error) {
            console.error('Error searching aspects:', error);
        }
    }

    const debouncedAspectSearch = debounce(performAspectSearch, 300);

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

    const toggles = document.querySelectorAll(
        '#teamwork-table .teamwork-to-use-power-toggles .power-type-filter-toggle.is-active'
    );
    const selectedPowerTypes = Array.from(toggles)
        .map((b) => b.getAttribute('data-power-type'))
        .filter(Boolean);

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

        if (selectedPowerTypes.length > 0) {
            const p = powerFrom(card.to_use);
            const ok = selectedPowerTypes.some((sel) => {
                if (sel === 'Multi-Power') {
                    return p === 'Multi Power' || p === 'Multi-Power';
                }
                return p === sel;
            });
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

    root.querySelectorAll('.teamwork-to-use-power-toggles .power-type-filter-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('is-active');
            btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
            applyTeamworkFilters();
        });
    });

    ['teamwork-to-use-equals', 'teamwork-to-use-min', 'teamwork-to-use-max'].forEach((id) => {
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
        powerTypeFilterToggles.forEach(btn => {
            btn.disabled = isDisabled;
            if (isDisabled) {
                btn.classList.add('is-disabled');
            } else {
                btn.classList.remove('is-disabled');
            }
        });
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
                    let iconTypeMatch = true;

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

                    if (noIconOnly) {
                        iconTypeMatch = !card.icons || card.icons.length === 0;
                    } else if (selectedPowerTypes.length > 0) {
                        const multiPowerSelected = selectedPowerTypes.includes('Multi-Power');
                        const specificTypes = selectedPowerTypes.filter(t => t !== 'Multi-Power');
                        const matchesMultiPower = multiPowerSelected && Array.isArray(card.icons) && card.icons.length >= 2;
                        const matchesSpecificType = specificTypes.length > 0 && Array.isArray(card.icons) && card.icons.some(icon => specificTypes.includes(icon));
                        iconTypeMatch = matchesMultiPower || matchesSpecificType;
                    }
                    
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

/** True when the mobile mission-set &lt;select&gt; is the active filter UI (matches mobile-layout.css). */
function missionsFilterUsesMobileSelect() {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('layout-mobile')) {
        return true;
    }
    if (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 900px)').matches) {
        return true;
    }
    return false;
}

function populateMissionsMissionSetSelect() {
    const sel = document.getElementById('missions-mission-set-filter');
    if (!sel) return;
    const data = window.missionsData || [];
    const prev = sel.value;
    const sets = [...new Set(data.map((m) => m.mission_set).filter(Boolean))].sort((a, b) => a.localeCompare(b));
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

window.populateMissionsMissionSetSelect = populateMissionsMissionSetSelect;

function populateEventsMissionSetSelect() {
    const sel = document.getElementById('events-mission-set-filter');
    if (!sel) return;
    const data = window.eventsData || [];
    const prev = sel.value;
    const sets = [...new Set(data.map((e) => e.mission_set).filter(Boolean))].sort((a, b) => a.localeCompare(b));
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

window.populateEventsMissionSetSelect = populateEventsMissionSetSelect;

function setupMissionSearch() {
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

    document.querySelectorAll('#missions-tab input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener('change', applyMissionFilters);
    });

    const missionSetSelect = document.getElementById('missions-mission-set-filter');
    if (missionSetSelect && !missionSetSelect.dataset.missionFilterBound) {
        missionSetSelect.addEventListener('change', applyMissionFilters);
        missionSetSelect.dataset.missionFilterBound = 'true';
    }
}

function applyMissionFilters() {
    const tbody = document.getElementById('missions-tbody');
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
        const sel = document.getElementById('missions-mission-set-filter');
        const v = sel && sel.value ? sel.value : '';
        if (!v) {
            displayMissions(pool);
            return;
        }
        displayMissions(pool.filter((m) => m.mission_set === v));
        return;
    }

    const selectedMissionSets = Array.from(document.querySelectorAll('#missions-tab input[type="checkbox"]:checked')).map(
        (checkbox) => checkbox.value
    );

    if (selectedMissionSets.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="4" class="no-results">No mission sets selected</td></tr>';
        return;
    }

    displayMissions(pool.filter((mission) => selectedMissionSets.includes(mission.mission_set)));
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

    document.querySelectorAll('#events-tab input[type="checkbox"]').forEach((checkbox) => {
        if (checkbox.dataset.eventsFilterBound) {
            return;
        }
        checkbox.dataset.eventsFilterBound = 'true';
        checkbox.addEventListener('change', applyEventsFilters);
    });

    const missionSetSelect = document.getElementById('events-mission-set-filter');
    if (missionSetSelect && !missionSetSelect.dataset.eventsMissionFilterBound) {
        missionSetSelect.dataset.eventsMissionFilterBound = 'true';
        missionSetSelect.addEventListener('change', applyEventsFilters);
    }
}

function applyEventsFilters() {
    const tbody = document.getElementById('events-tbody');
    if (!tbody) {
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

    if (missionsFilterUsesMobileSelect()) {
        const sel = document.getElementById('events-mission-set-filter');
        const v = sel && sel.value ? sel.value : '';
        if (!v) {
            displayEvents(pool);
            return;
        }
        displayEvents(pool.filter((e) => e.mission_set === v));
        return;
    }

    const selectedMissionSets = Array.from(
        document.querySelectorAll('#events-tab input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    if (selectedMissionSets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-results">No mission sets selected</td></tr>';
        return;
    }

    displayEvents(pool.filter((event) => selectedMissionSets.includes(event.mission_set)));
}

window.applyEventsFilters = applyEventsFilters;

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

    const toggles = document.querySelectorAll(
        '#ally-universe-table .ally-stat-type-to-use-toggles .power-type-filter-toggle.is-active'
    );
    const selectedTypes = Array.from(toggles)
        .map((b) => b.getAttribute('data-power-type'))
        .filter(Boolean);

    const safeLower = (v) => String(v ?? '').toLowerCase();

    const filtered = pool.filter((card) => {
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

        if (selectedTypes.length > 0) {
            const t = String(card.stat_type_to_use || '').trim();
            const ok = selectedTypes.some((sel) => {
                if (sel === 'Multi-Power') {
                    return t === 'Multi Power' || t === 'Multi-Power';
                }
                return t === sel;
            });
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

    root.querySelectorAll('.ally-stat-type-to-use-toggles .power-type-filter-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('is-active');
            btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
            applyAllyUniverseFilters();
        });
    });

    window.addEventListener('layout-mode-change', () => {
        const t = document.getElementById('ally-universe-tab');
        if (t && t.style.display !== 'none' && window.allyUniverseData && window.allyUniverseData.length > 0) {
            applyAllyUniverseFilters();
        }
    });
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

function applyTrainingFilters() {
    const pool = window.trainingData;
    if (!pool || pool.length === 0) {
        if (typeof loadTraining === 'function') {
            loadTraining();
        }
        return;
    }

    const searchInput = document.getElementById('search-input');
    const rawTerm = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';

    const toggles = document.querySelectorAll(
        '#training-table .training-stat-type-toggles .power-type-filter-toggle.is-active'
    );
    const selectedTypes = Array.from(toggles)
        .map((b) => b.getAttribute('data-power-type'))
        .filter(Boolean);

    const safeLower = (v) => String(v ?? '').toLowerCase();

    const filtered = pool.filter((card) => {
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

        if (!trainingCardMatchesSelectedTypes(card, selectedTypes)) {
            return false;
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

    root.querySelectorAll('.training-stat-type-toggles .power-type-filter-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('is-active');
            btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
            applyTrainingFilters();
        });
    });

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

function setupBasicUniverseSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length === 0) { await applyBasicUniverseFilters(); return; }
        try {
            const resp = await fetch('/api/basic-universe');
            const data = await resp.json();
            if (data.success) {
                const filtered = data.data.filter(card =>
                    (card.card_name && card.card_name.toLowerCase().includes(searchTerm)) ||
                    (card.type && card.type.toLowerCase().includes(searchTerm)) ||
                    (card.value_to_use && String(card.value_to_use).toLowerCase().includes(searchTerm)) ||
                    (card.bonus && String(card.bonus).toLowerCase().includes(searchTerm))
                );
                displayBasicUniverse(filtered);
            }
        } catch (err) { console.error('Error searching basic universe:', err); }
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
