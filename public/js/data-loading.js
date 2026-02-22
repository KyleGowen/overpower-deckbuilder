/* ========================================
 * PHASE 6: DATA LOADING FUNCTIONS
 * ========================================
 * 
 * This file contains API data loading and management functions
 * extracted from index.html during Phase 6 of the refactoring project.
 * 
 * Purpose: API data loading and management
 * Created: Phase 6 of 12-phase refactoring project
 * Contains:
 *   - loadDatabaseViewData() - Database view initialization
 *   - loadCharacters() - Character data loading
 *   - loadSpecialCards() - Special card data loading
 *   - All other card type loading functions
 *   - Background data loading functions
 * 
 * ======================================== */

// In-memory cache for database view card data (avoids redundant API calls when switching tabs)
if (typeof window.databaseViewCardCache === 'undefined') {
    window.databaseViewCardCache = {};
}

function getCachedCardData(cacheKey) {
    return window.databaseViewCardCache[cacheKey];
}

function setCachedCardData(cacheKey, data) {
    window.databaseViewCardCache[cacheKey] = data;
}

// Load all database view data
async function loadDatabaseViewData(forceCharactersTab = false) {
    // Clear all filters globally before loading data
    clearAllFiltersGlobally();
    
    // Only force characters tab if explicitly requested
    if (forceCharactersTab) {
        // Ensure characters tab is visible before loading data
        const charactersTab = document.getElementById('characters-tab');
        charactersTab.style.display = 'block';
        
        // Set characters tab as active
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        const charactersButton = document.querySelector('[data-tab="characters"]');
        if (charactersButton) {
            charactersButton.classList.add('active');
        }
        
        // Call switchTab to set up search container and other tab-specific functionality
        if (typeof switchTab === 'function') {
            switchTab('characters');
        }
    }
    
    try {
        // Phase 4: Skip loadUserDecks if decks already loaded from deck selection
        const deckLoadPromise = (typeof hasUserDecksLoaded === 'function' && hasUserDecksLoaded())
            ? Promise.resolve()
            : (typeof loadUserDecks === 'function' ? loadUserDecks() : Promise.resolve());

        await Promise.all([
            loadCharacters(),
            loadSpecialCards(),
            loadAdvancedUniverse(),
            loadMissions(),
            loadLocations(),
            loadEvents(),
            loadAspects(),
            loadTeamwork(),
            loadAllyUniverse(),
            loadTraining(),
            loadBasicUniverse(),
            loadPowerCards(),
            deckLoadPromise
        ]);

        window.databaseViewDataLoaded = true;
        
        // Update all statistics after loading all data
        
        // Only switch to characters tab if explicitly requested
        if (forceCharactersTab) {
            switchTab('characters');
        }
        
        // Lock row heights after layout settles (requestAnimationFrame avoids long arbitrary delay)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (typeof lockAllSpecialCardRowHeights === 'function') {
                    lockAllSpecialCardRowHeights();
                }
            });
        });
        
    // Disable "Add to Deck" buttons for guest users immediately
    disableAddToDeckButtonsImmediate();
        
    } catch (error) {
        console.error('❌ Error loading database view data:', error);
    }
}

// Load and display characters (uses cache when available to avoid redundant API calls)
async function loadCharacters() {
    const cached = getCachedCardData('characters');
    if (cached) {
        displayCharacters(cached);
        return;
    }
    try {
        const response = await fetch('/api/characters');
        const data = await response.json();
        
        if (data.success) {
            setCachedCardData('characters', data.data);
            displayCharacters(data.data);
        } else {
            throw new Error('Failed to load characters');
        }
    } catch (error) {
        console.error('❌ Error loading characters:', error);
        document.getElementById('characters-tbody').innerHTML = 
            '<tr><td colspan="8" class="error">Error loading characters. Please try again.</td></tr>';
    }
}

// Load and display special cards (uses cache when available to avoid redundant API calls)
async function loadSpecialCards() {
    const cached = getCachedCardData('special-cards');
    if (cached) {
        displaySpecialCards(cached);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (typeof lockAllSpecialCardRowHeights === 'function') {
                    lockAllSpecialCardRowHeights();
                }
            });
        });
        return;
    }
    try {
        const response = await fetch('/api/special-cards');
        const data = await response.json();
        
        if (data.success) {
            setCachedCardData('special-cards', data.data);
            displaySpecialCards(data.data);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (typeof lockAllSpecialCardRowHeights === 'function') {
                        lockAllSpecialCardRowHeights();
                    }
                });
            });
        } else {
            throw new Error('Failed to load special cards');
        }
    } catch (error) {
        console.error('Error loading special cards:', error);
        document.getElementById('special-cards-tbody').innerHTML = 
            '<tr><td colspan="5" class="error">Error loading special cards. Please try again.</td></tr>';
    }
}

// Load and display locations (uses cache when available to avoid redundant API calls)
async function loadLocations() {
    const cached = getCachedCardData('locations');
    if (cached) {
        displayLocations(cached);
        return;
    }
    try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        
        if (data.success) {
            setCachedCardData('locations', data.data);
            displayLocations(data.data);
        } else {
            throw new Error('Failed to load locations');
        }
    } catch (error) {
        console.error('Error loading locations:', error);
        document.getElementById('locations-tbody').innerHTML = 
            '<tr><td colspan="4" class="error">Error loading locations. Please try again.</td></tr>';
    }
}

// Expose cache helpers for card-data-display.js and all-cards-display.js
window.getCachedCardData = getCachedCardData;
window.setCachedCardData = setCachedCardData;
