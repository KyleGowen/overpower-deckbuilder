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

function setupTeamworkSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm.length === 0) {
            // Reload all teamwork
            await loadTeamwork();
            return;
        }

        try {
            const response = await fetch('/api/teamwork');
            const data = await response.json();
            
            if (data.success) {
                const filteredTeamwork = data.data.filter(card => 
                    card.card_type.toLowerCase().includes(searchTerm) ||
                    card.to_use.toLowerCase().includes(searchTerm) ||
                    card.acts_as.toLowerCase().includes(searchTerm) ||
                    card.followup_attack_types.toLowerCase().includes(searchTerm) ||
                    card.first_attack_bonus.toLowerCase().includes(searchTerm) ||
                    card.second_attack_bonus.toLowerCase().includes(searchTerm)
                );
                displayTeamwork(filteredTeamwork);
            }
        } catch (error) {
            console.error('Error searching teamwork:', error);
        }
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

function setupMissionSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm.length === 0) {
            // Reload all missions
            await loadMissions();
            return;
        }

        try {
            const response = await fetch('/api/missions');
            const data = await response.json();
            
            if (data.success) {
                const filteredMissions = data.data.filter(mission => 
                    mission.mission_set.toLowerCase().includes(searchTerm) ||
                    mission.card_name.toLowerCase().includes(searchTerm)
                );
                displayMissions(filteredMissions);
            }
        } catch (error) {
            console.error('Error searching missions:', error);
        }
    });

    // Set up checkbox event listeners for mission set filtering
    document.querySelectorAll('#missions-tab input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyMissionFilters);
    });
}

function applyMissionFilters() {
    const selectedMissionSets = Array.from(document.querySelectorAll('#missions-tab input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedMissionSets.length === 0) {
        // If no mission sets selected, show none
        document.getElementById('missions-tbody').innerHTML = '<tr><td colspan="3" class="no-results">No mission sets selected</td></tr>';
        return;
    }
    
    // Filter missions based on selected mission sets
    const missions = window.missionsData || [];
    const filteredMissions = missions.filter(mission => 
        selectedMissionSets.includes(mission.mission_set)
    );
    
    displayMissions(filteredMissions);
}

function setupEventSearch() {
    // Set up main search input functionality (if it exists)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length === 0) {
                // Reload all events
                await loadEvents();
                return;
            }

            try {
                const response = await fetch('/api/events');
                const data = await response.json();
                
                if (data.success) {
                    const filteredEvents = data.data.filter(event => 
                        event.name.toLowerCase().includes(searchTerm) ||
                        event.mission_set.toLowerCase().includes(searchTerm) ||
                        event.game_effect.toLowerCase().includes(searchTerm)
                    );
                    displayEvents(filteredEvents);
                }
            } catch (error) {
                console.error('Error searching events:', error);
            }
        });
    }

    // Set up Game Effect search input functionality
    const gameEffectSearchInput = document.querySelector('#events-table .header-filter[data-column="game_effect"]');
    if (gameEffectSearchInput) {
        gameEffectSearchInput.addEventListener('input', async (e) => {
            const effectTerm = e.target.value.toLowerCase();

            if (effectTerm.length === 0) {
                await loadEvents();
                return;
            }

            try {
                const response = await fetch('/api/events');
                const data = await response.json();

                if (data.success) {
                    const filteredEvents = data.data.filter(event =>
                        event.game_effect.toLowerCase().includes(effectTerm)
                    );
                    displayEvents(filteredEvents);
                }
            } catch (error) {
                console.error('Error searching events by game effect:', error);
            }
        });
    }

    // Set up checkbox event listeners for mission set filtering
    document.querySelectorAll('#events-tab input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyEventsFilters);
    });
}

function applyEventsFilters() {
    const selectedMissionSets = Array.from(document.querySelectorAll('#events-tab input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedMissionSets.length === 0) {
        // If no mission sets selected, show none
        document.getElementById('events-tbody').innerHTML = '<tr><td colspan="5" class="no-results">No mission sets selected</td></tr>';
        return;
    }
    
    // Filter events based on selected mission sets
    const events = window.eventsData || [];
    const filteredEvents = events.filter(event => 
        selectedMissionSets.includes(event.mission_set)
    );
    
    displayEvents(filteredEvents);
}

function setupAllyUniverseSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length === 0) {
            await loadAllyUniverse();
            return;
        }
        try {
            const response = await fetch('/api/ally-universe');
            const data = await response.json();
            if (data.success) {
                const filtered = data.data.filter(card =>
                    (card.card_name && card.card_name.toLowerCase().includes(searchTerm)) ||
                    (card.card_type && card.card_type.toLowerCase().includes(searchTerm)) ||
                    (card.stat_to_use && card.stat_to_use.toLowerCase().includes(searchTerm)) ||
                    (card.stat_type_to_use && card.stat_type_to_use.toLowerCase().includes(searchTerm)) ||
                    (card.attack_value && String(card.attack_value).toLowerCase().includes(searchTerm)) ||
                    (card.attack_type && card.attack_type.toLowerCase().includes(searchTerm)) ||
                    (card.card_text && card.card_text.toLowerCase().includes(searchTerm))
                );
                displayAllyUniverse(filtered);
            }
        } catch (error) {
            console.error('Error searching ally universe:', error);
        }
    });
}

function setupTrainingSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length === 0) { await loadTraining(); return; }
        try {
            const resp = await fetch('/api/training');
            const data = await resp.json();
            if (data.success) {
                        const filtered = data.data.filter(card =>
                            (card.card_name && card.card_name.toLowerCase().includes(searchTerm)) ||
                            (card.type_1 && card.type_1.toLowerCase().includes(searchTerm)) ||
                            (card.type_2 && card.type_2.toLowerCase().includes(searchTerm)) ||
                            (card.value_to_use && String(card.value_to_use).toLowerCase().includes(searchTerm)) ||
                            (card.bonus && String(card.bonus).toLowerCase().includes(searchTerm))
                        );
                displayTraining(filtered);
            }
        } catch (err) { console.error('Error searching training:', err); }
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
