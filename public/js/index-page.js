
// Cache busting: 2024-12-19 15:45:00 - Power card sorting fix

// LayoutManager and utility functions moved to external files

// Deck management functions moved to external file

// Deck selection and card addition functions moved to external file

// Card display functions moved to external file

// Global function to ensure no filters are applied by default
let isClearingFilters = false;

// clearAllFiltersGlobally function moved to external file

// Load database view data
// loadDatabaseViewData function moved to external file

// loadCharacters function moved to external file

// loadSpecialCards function moved to external file

// isGuestUser function moved to filter-functions.js

// Disable "Add to Deck" buttons for guest users
// disableAddToDeckButtons function moved to external file

// Disable +Deck buttons for GUEST users
function disableAddToDeckButtonsImmediate() {
    if (typeof isGuestUser !== 'function' || !isGuestUser()) return;
    const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            const buttons = node.querySelectorAll ? node.querySelectorAll('.add-to-deck-btn') : [];
                            buttons.forEach(button => {
                                button.disabled = true;
                                button.style.opacity = '0.5';
                                button.style.cursor = 'not-allowed';
                                button.title = 'Log in to add to decks...';
                                button.setAttribute('data-guest-disabled', 'true');
                            });
                            
                            // Also check if the node itself is a button
                            if (node.classList && node.classList.contains('add-to-deck-btn')) {
                                node.disabled = true;
                                node.style.opacity = '0.5';
                                node.style.cursor = 'not-allowed';
                                node.title = 'Log in to add to decks...';
                                node.setAttribute('data-guest-disabled', 'true');
                            }
                        }
                    });
                }
            });
        });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Also disable existing buttons immediately
    disableAddToDeckButtons();
}

// setupSearch function moved to external file
// Apply all active filters


// Clear all filters and reload all characters
// clearAllFilters function moved to external file

// clearFilters function moved to external file
// Modal functionality
// openModal, closeModal, and makeImagesClickable functions moved to external file

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('imageModal');
    if (modal && event.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Load and display locations
// loadLocations function moved to external file

// Location filtering functions


// clearLocationFilters function moved to filter-functions.js

// Clear filter functions moved to filter-functions.js:
// - clearSpecialCardFilters
// - clearAdvancedUniverseFilters  
// - clearAspectsFilters
// - clearMissionsFilters

// applyMissionFilters function moved to external file

// clearEventsFilters function moved to filter-functions.js


// clearTeamworkFilters function moved to filter-functions.js

// clearAllyUniverseFilters function moved to filter-functions.js

// clearTrainingFilters function moved to filter-functions.js

// Tab switching functionality
// Make switchTab globally available immediately
window.switchTab = function switchTab(tabName) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    // Removed overly aggressive tab switching protection
    
    // Add a global flag to track if we're in the middle of a filter interaction
    if (window.isFilterInteraction) {
        
        // If we're in a filter interaction and trying to switch to characters, block it
        if (tabName === 'characters') {
            return; // Block the tab switch
        }
    }
    
    // Also check if this is a call to switch to characters tab
    if (tabName === 'characters') {
        
        // Check if this is happening after a filter interaction
    }
    
    // Clear all filters when switching tabs
    clearAllFiltersGlobally();
    
    // Hide all tabs
    const allTabs = ['all-cards', 'characters', 'special-cards', 'advanced-universe', 'missions', 'locations', 'aspects', 'events', 'teamwork', 'ally-universe', 'training', 'basic-universe', 'power-cards'];
    allTabs.forEach(tab => {
        const tabElement = document.getElementById(tab + '-tab');
        if (tabElement) {
            tabElement.style.display = 'none';
        }
    });
    
    // Hide search container for all tabs
    document.getElementById('search-container').style.display = 'none';
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to the selected tab button
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.style.display = 'block';
    } else {
        console.error('Tab element not found:', tabName + '-tab');
    }
    
    // Update search placeholder for all tabs
    const searchInput = document.getElementById('search-input');
    if (tabName === 'characters') {
        searchInput.placeholder = 'Search characters by name or abilities...';
    } else if (tabName === 'special-cards') {
        searchInput.placeholder = 'Search special cards by name, character, or effect...';
    } else if (tabName === 'advanced-universe') {
        searchInput.placeholder = 'Search advanced universe by name, character, or effect...';
    } else if (tabName === 'locations') {
        searchInput.placeholder = 'Search locations by name or abilities...';
    } else if (tabName === 'aspects') {
        searchInput.placeholder = 'Search aspects by name, type, or effect...';
    } else if (tabName === 'missions') {
        searchInput.placeholder = 'Search missions by name or mission set...';
    } else if (tabName === 'events') {
        searchInput.placeholder = 'Search events by name, mission set, or effect...';
    } else if (tabName === 'teamwork') {
        searchInput.placeholder = 'Search teamwork by requirements or effects...';
    } else if (tabName === 'ally-universe') {
        searchInput.placeholder = 'Search allies by name, stat, or text...';
    } else if (tabName === 'training') {
        searchInput.placeholder = 'Search training by name or types...';
    } else if (tabName === 'basic-universe') {
        searchInput.placeholder = 'Search basic universe by name, type, or bonus...';
    } else if (tabName === 'power-cards') {
        searchInput.placeholder = 'Search power cards by type or value...';
    }
    
    
    // Update search functionality and reload data based on tab
    if (tabName === 'all-cards') {
        // Hide search container for All tab
        document.getElementById('search-container').style.display = 'none';
        // Load and display all cards
        if (typeof loadAndDisplayAllCards === 'function') {
            loadAndDisplayAllCards();
        } else {
            console.warn('loadAndDisplayAllCards function not available');
        }
    } else if (tabName === 'characters') {
        setupSearch();
        loadCharacters();
    } else if (tabName === 'special-cards') {
        setupSpecialCardSearch();
        loadSpecialCards();
    } else if (tabName === 'advanced-universe') {
        setupAdvancedUniverseSearch();
        loadAdvancedUniverse();
    } else if (tabName === 'locations') {
        setupLocationSearch();
        loadLocations();
    } else if (tabName === 'aspects') {
        setupAspectSearch();
        loadAspects();
    } else if (tabName === 'missions') {
        setupMissionSearch();
        loadMissions();
    } else if (tabName === 'events') {
        setupEventSearch();
        loadEvents();
    } else if (tabName === 'teamwork') {
        setupTeamworkSearch();
        loadTeamwork();
    } else if (tabName === 'ally-universe') {
        setupAllyUniverseSearch();
        loadAllyUniverse();
    } else if (tabName === 'training') {
        setupTrainingSearch();
        loadTraining();
    } else if (tabName === 'basic-universe') {
        setupBasicUniverseSearch();
        loadBasicUniverse();
    } else if (tabName === 'power-cards') {
        setupPowerCardsSearch();
        loadPowerCards();
    }
    
    // Disable "Add to Deck" buttons for guest users immediately
    disableAddToDeckButtonsImmediate();
}

// Location search functionality
// setupLocationSearch function moved to external file

// setupAspectSearch function moved to external file

// setupAdvancedUniverseSearch function moved to external file

// Teamwork search functionality
// setupTeamworkSearch function moved to external file

// setupSpecialCardSearch function moved to external file

// loadMissions, loadEvents, loadAspects, loadAdvancedUniverse, loadTeamwork, displayTeamwork,
// loadAllyUniverse, displayAllyUniverse, loadTraining, displayTraining, loadBasicUniverse,


// Initialize page
// Authentication functions
let currentUser = null;

// Deck editor global state (must be initialized before any line that can throw; deck-editor.html
// omits e.g. #createDeckForm so a parse-time failure would leave these in TDZ and break loadDeckForEditing)
let currentDeckId = null;
let currentDeckData = null;
if (!Array.isArray(window.deckEditorCards)) {
    window.deckEditorCards = [];
}
if (!window.availableCardsMap || typeof window.availableCardsMap.set !== 'function') {
    window.availableCardsMap = new Map();
}
let deckEditorExpansionState = {};
let characterGroupExpansionState = {};
let powerCardsSortMode = 'value';
let lastAddedCardType = null;

// Check for readOnly=true parameter - but don't apply read-only mode class yet
// Security: We need to verify deck ownership first in loadDeckForEditing()
const urlParams = new URLSearchParams(window.location.search);
const isReadOnlyFromQuery = urlParams.get('readonly') === 'true';

// Note: Read-only mode class will be applied in loadDeckForEditing() after ownership verification

// Show/hide Read-Only badge based on read-only mode
window.updateReadOnlyBadge = function() {
    const readOnlyBadge = document.getElementById('readOnlyBadge');
    if (readOnlyBadge) {
        if (document.body.classList.contains('read-only-mode')) {
            readOnlyBadge.style.display = 'inline-block';
        } else {
            readOnlyBadge.style.display = 'none';
        }
    }
}

// Update Save button state based on read-only mode and user status
window.updateSaveButtonState = function() {
    const saveButton = document.getElementById('saveDeckButton');
    if (saveButton) {
        // SECURITY: Check for read-only mode first
        if (document.body.classList.contains('read-only-mode')) {
            // Disable Save button in read-only mode
            saveButton.disabled = true;
            saveButton.style.opacity = '0.5';
            saveButton.style.cursor = 'not-allowed';
            saveButton.title = 'Save is disabled in read-only mode';
            saveButton.style.display = 'block';
        } else if (typeof isGuestUser === 'function' && isGuestUser()) {
            saveButton.disabled = true;
            saveButton.style.opacity = '0.5';
            saveButton.style.cursor = 'not-allowed';
            saveButton.title = 'Guests cannot save edits';
            saveButton.style.display = 'block';
        } else {
            // Enable Save button for regular users in edit mode
            saveButton.disabled = false;
            saveButton.style.opacity = '1';
            saveButton.style.cursor = 'pointer';
            saveButton.title = '';
            saveButton.style.display = 'block';
        }
    }
}

// Update badge and Save button state on page load
updateReadOnlyBadge();
updateSaveButtonState();

// Add global event listener to catch any clicks that might trigger tab switches
document.addEventListener('click', function(event) {
    if (window.isFilterInteraction) {
        if (event.target.onclick && event.target.onclick.toString().includes('switchTab')) {
            console.log('onclick:', event.target.onclick.toString());
        }
    }
});

// Add event listeners to catch any page navigation or refresh events
window.addEventListener('beforeunload', function(event) {
    if (window.isFilterInteraction) {
        // Page is about to unload during filter interaction
    }
});

// Add DOM observer to catch any changes to the characters tab
const charactersTab = document.getElementById('characters-tab');
if (charactersTab) {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                // characters-tab style changed
            }
        });
    });
    observer.observe(charactersTab, { 
        attributes: true, 
        attributeOldValue: true,
        attributeFilter: ['style']
    });
}

window.addEventListener('popstate', function(event) {
    if (window.isFilterInteraction) {
        // Browser back/forward button pressed during filter interaction
    }
});

// Add event listener to catch any form submissions
document.addEventListener('submit', function(event) {
    if (window.isFilterInteraction) {
        // Form submission during filter interaction
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
});

// Add event listener to catch any navigation events
window.addEventListener('beforeunload', function(event) {
    if (window.isFilterInteraction) {
        // Page navigation during filter interaction
        event.preventDefault();
        event.returnValue = '';
        return '';
    }
});

// Add event listener to catch any hash changes
window.addEventListener('hashchange', function(event) {
    if (window.isFilterInteraction) {
        // Hash change during filter interaction
        event.preventDefault();
        return false;
    }
});

// Global fetch interceptor to handle 401 responses (session expired)
// Legacy /api/* catalog list URLs are rewritten in <head> via /js/catalog-legacy-fetch-rewrite.js
const originalFetch = window.fetch;

// Toggleable client-side auth diagnostics. Enabled by default while we chase
// the "random logout" reports; set `window.__AUTH_DEBUG = false` in the console
// to silence. Helps pinpoint which request triggered a logout.
if (typeof window.__AUTH_DEBUG === 'undefined') {
    window.__AUTH_DEBUG = true;
}
function authDebugLog(message, details) {
    if (!window.__AUTH_DEBUG) return;
    if (details !== undefined) {
        console.log('[auth-debug] ' + message, details);
    } else {
        console.log('[auth-debug] ' + message);
    }
}

// Tear down the local session and surface the login modal. Only called once we
// are confident the session is actually gone (see re-verify below).
async function handleConfirmedLogout(reasonUrl) {
    authDebugLog('session confirmed invalid - logging out', { triggeredBy: reasonUrl });
    if (window.authService) {
        window.authService.currentUser = null;
        window.authService.clearStoredUser();
        await window.authService.showLoginModal();
    } else if (typeof showLoginModal === 'function') {
        await showLoginModal();
    } else if (typeof window.showLoginModal === 'function') {
        await window.showLoginModal();
    }
}

window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);

    // Check for 401 Unauthorized responses
    if (response.status === 401) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
        const isGuest = (typeof getCurrentUser === 'function' && getCurrentUser()?.role === 'GUEST') ||
            (window.authService?.getCurrentUser?.()?.role === 'GUEST');

        authDebugLog('intercepted 401 response', { url: url, isGuest: isGuest });

        // Skip for /api/auth/me when user is guest - guest sessions may 401 but user is valid
        if (url.includes('/api/auth/me') && isGuest) {
            return response;
        }
        // Guest deck/session APIs: do not nuke the session and show login — breaks deck editor
        if (isGuest && (url.includes('/api/v1/guest/') || url.includes('/api/guest/'))) {
            return response;
        }

        // `/api/auth/me` IS the authoritative session check — a 401 here means
        // the session really is gone, so act immediately without re-verifying.
        if (url.includes('/api/auth/me')) {
            await handleConfirmedLogout(url);
            return response;
        }

        // For any other endpoint, a single 401 is NOT trusted as proof the
        // session expired (it may be a transient/endpoint-specific failure that
        // previously caused "random" logouts). Re-verify once against
        // /api/auth/me using the un-intercepted fetch before tearing down.
        if (window.__authReverifyInFlight) {
            return response;
        }
        window.__authReverifyInFlight = true;
        try {
            authDebugLog('re-verifying session via /api/auth/me', { triggeredBy: url });
            const verify = await originalFetch('/api/auth/me', { credentials: 'include' });
            if (verify.status === 401) {
                await handleConfirmedLogout(url);
            } else {
                authDebugLog('session still valid - ignoring transient 401', { triggeredBy: url, verifyStatus: verify.status });
            }
        } catch (e) {
            // Network error during verification: don't log the user out on a
            // transient failure.
            authDebugLog('re-verify failed (network) - not logging out', { triggeredBy: url, error: String(e) });
        } finally {
            window.__authReverifyInFlight = false;
        }
    }

    return response;
};

// Check for stored user immediately to prevent any flash (guard: getCurrentUser may not be loaded yet with defer)
(function() {
    const storedUser = (typeof getCurrentUser === 'function' ? getCurrentUser() : null) ||
        (window.authService && typeof window.authService.getCurrentUser === 'function' ? window.authService.getCurrentUser() : null);
    if (storedUser) {
        currentUser = storedUser;
        // mainContainer starts hidden by default; show it immediately for authenticated users
        if (window.__EXCELSIOR_PAGE__ !== 'deck-editor') {
            var mc = document.getElementById('mainContainer');
            if (mc) mc.style.display = 'block';
        }
        // Hide login modal immediately if we have a stored user
        document.addEventListener('DOMContentLoaded', function() {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }
})();

// Use authentication service for authentication
// checkAuthentication function moved to external file

// showLoginModal function moved to external file

// showMainApp function moved to external file

// loadMainAppDataInBackground function moved to external file

// login function moved to external file

// logout function moved to external file

// showLoginError function moved to external file

// hideLoginError function moved to external file
// loadUserData function moved to external file
// loadGlobalNav function moved to external file

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // OAuth redirect return: finish Firebase + /api/auth/google before /api/auth/me
        // so sessionId exists when checkAuthentication runs (see login.js).
        try {
            if (typeof loadLoginTemplate === 'function') {
                await loadLoginTemplate();
            }
        } catch (e) {
            console.error('loadLoginTemplate before OAuth completion:', e);
        }
        try {
            if (typeof window.attemptGoogleRedirectCompletion === 'function') {
                await window.attemptGoogleRedirectCompletion();
            }
        } catch (e) {
            console.error('Google redirect completion:', e);
        }

        // Load global navigation first
        await loadGlobalNav();
        
        const authResult = await checkAuthentication();
        currentUser = authResult.currentUser; // Update global currentUser after checkAuthentication
        window.currentUser = currentUser; // Also set on window for modules to access

        // Initialize ViewManager
        viewManager.initialize();

        // Update user welcome message and show/hide Create User button based on role
        if (typeof updateUserWelcome === 'function') {
            updateUserWelcome();
        }

        if (authResult.isAuthenticated) {
            // Ensure Collection button visibility is updated after authentication
            if (typeof updateUserWelcome === 'function') {
                updateUserWelcome();
            }
            if (authResult.deckId) {
                // Going directly to deck editor - skip showing main app to avoid flash

                // Ensure database view is hidden to prevent flash
                const databaseView = document.getElementById('database-view');
                if (databaseView) {
                    databaseView.classList.add('view-removed');
                }
                
                // Read-only mode removed - now handled by backend flag
                
                // Add guest class if user is a guest
                if (currentUser && currentUser.role === 'GUEST') {
                    document.body.classList.add('guest-user');
                }
                
                // Standalone `/deck-editor` must still populate `window.foilCardMap` before rendering the deck editor.
                loadMainAppDataInBackground();
                
                // Check if readonly=true parameter is set - this takes precedence
                const urlParams = new URLSearchParams(window.location.search);
                const isReadOnlyFromQuery = urlParams.get('readonly') === 'true';
                
                await loadDeckForEditing(authResult.deckId, authResult.urlUserId, isReadOnlyFromQuery);
                showDeckEditor();
            } else {
                // No deck ID - show main app normally
                showMainApp(); // This will load general app data (characters, etc.)
            }
        } else {
            if (authResult.deckId) {
                // Unauthenticated user visiting a shared deck link — auto-login as guest for read-only viewing
                const guestResult = await window.authService.guestLogin();
                if (guestResult.success) {
                    currentUser = window.authService.getCurrentUser();
                    window.currentUser = currentUser;
                    if (typeof updateUserWelcome === 'function') updateUserWelcome();
                    document.body.classList.add('guest-user');
                    // Set ?readonly=true in URL so loadDeckForEditing skips the guest clone flow
                    const url = new URL(window.location.href);
                    url.searchParams.set('readonly', 'true');
                    window.history.replaceState({}, '', url.toString());
                    const databaseView = document.getElementById('database-view');
                    if (databaseView) databaseView.classList.add('view-removed');
                    loadMainAppDataInBackground();
                    await loadDeckForEditing(authResult.deckId, authResult.urlUserId, true);
                    showDeckEditor();
                } else {
                    await showLoginModal();
                }
            } else {
                await showLoginModal();
            }
        }
    } catch (error) {
        console.error('❌ Error during page initialization:', error);
        // Fallback: show login modal if initialization fails
        await showLoginModal();
    }
    
    // Login form and guest login button event listeners are now handled by login.js component
    
    // Logout button event listener
    const logoutBtnEl = document.getElementById('logoutBtn');
    if (logoutBtnEl) {
        logoutBtnEl.addEventListener('click', function(e) {
            logout(e);
        });
    }
    
    // Load data only if authenticated
    if (currentUser && window.__EXCELSIOR_PAGE__ !== 'deck-editor') {
        // Check if we're on the collection route
        const isCollectionRoute = window.location.pathname.includes('/users/') && window.location.pathname.includes('/collection');
        // Check if we're on the deck builder route
        const isDeckBuilderRoute = window.location.pathname.includes('/users/') && window.location.pathname.includes('/decks');
        
        if (isCollectionRoute && currentUser.role === 'ADMIN') {
            // Start in collection view
            const dbView = document.getElementById('database-view');
            const dbBuilder = document.getElementById('deck-builder');
            const collView = document.getElementById('collection-view');
            if (dbView) dbView.classList.add('view-removed');
            if (dbBuilder) dbBuilder.classList.add('view-removed');
            if (collView) collView.classList.remove('view-removed');
            document.getElementById('databaseViewBtn').classList.remove('active');
            document.getElementById('deckBuilderBtn').classList.remove('active');
            const collectionBtn = document.getElementById('collectionViewBtn');
            if (collectionBtn) collectionBtn.classList.add('active');
            // Initialize collection view
            if (typeof initializeCollectionView === 'function') {
                initializeCollectionView();
            }
        } else if (isDeckBuilderRoute) {
            // Start in deck builder view
            const dbView = document.getElementById('database-view');
            const dbBuilder = document.getElementById('deck-builder');
            const collView = document.getElementById('collection-view');
            if (dbView) dbView.classList.add('view-removed');
            if (dbBuilder) dbBuilder.classList.remove('view-removed');
            if (collView) collView.classList.add('view-removed');
            document.getElementById('databaseViewBtn').classList.remove('active');
            document.getElementById('deckBuilderBtn').classList.add('active');
            const collectionBtn = document.getElementById('collectionViewBtn');
            if (collectionBtn) collectionBtn.classList.remove('active');
            
        } else {
            // Start in database view
            const dbView = document.getElementById('database-view');
            const dbBuilder = document.getElementById('deck-builder');
            const collView = document.getElementById('collection-view');
            if (dbView) dbView.classList.remove('view-removed');
            if (dbBuilder) dbBuilder.classList.add('view-removed');
            if (collView) collView.classList.add('view-removed');
            document.getElementById('databaseViewBtn').classList.add('active');
            document.getElementById('deckBuilderBtn').classList.remove('active');
            const collectionBtn = document.getElementById('collectionViewBtn');
            if (collectionBtn) collectionBtn.classList.remove('active');
            
            // Load Characters tab (default) when starting in database view
            setTimeout(() => {
                if (typeof switchTab === 'function') {
                    switchTab('characters');
                }
            }, 100);
        }
        
        // Show database statistics in initial database view
        const databaseStats = document.getElementById('database-stats');
        const deckStats = document.getElementById('deck-stats');
        if (databaseStats) databaseStats.style.display = 'grid';
        if (deckStats) deckStats.style.display = 'none';
        
        // Load decks immediately for deck builder
        loadDecks();
        
        // Database view data: defer when on deck builder; load when on database/collection view
        if (!isDeckBuilderRoute) {
            requestAnimationFrame(() => {
                loadAspects();
                loadEvents();
                loadTeamwork();
                loadAllyUniverse();
                loadTraining();
                loadBasicUniverse();
                loadPowerCards();
                setupSearch();
            });
        }
    }
    
    // Add location filter event listeners (DBV only; elements absent on deck-editor shell)
    const locationThreatMin = document.getElementById('location-threat-min');
    const locationThreatMax = document.getElementById('location-threat-max');
    if (locationThreatMin && locationThreatMax) {
    locationThreatMin.addEventListener('input', (e) => {
        applyLocationFilters();
    });
    locationThreatMax.addEventListener('input', (e) => {
        applyLocationFilters();
    });
    
    // Prevent form submission and unwanted navigation
    locationThreatMin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            applyLocationFilters();
        }
    });
    
    locationThreatMax.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            applyLocationFilters();
        }
    });
    
    // Prevent click events from bubbling up and causing navigation (but allow normal input behavior)
    locationThreatMin.addEventListener('click', (e) => {
        e.stopPropagation(); // Only stop propagation, don't prevent default
    });
    
    locationThreatMax.addEventListener('click', (e) => {
        e.stopPropagation(); // Only stop propagation, don't prevent default
    });
    
    // Add event listeners for spinner arrows (mousedown/up events) - only prevent on spinner arrows
    locationThreatMin.addEventListener('mousedown', (e) => {
        // Only prevent if it's on the spinner arrows (not the input field itself)
        if (e.target !== locationThreatMin) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        } else {
            e.stopPropagation(); // Just stop propagation for the input field
        }
    });
    
    locationThreatMax.addEventListener('mousedown', (e) => {
        // Only prevent if it's on the spinner arrows (not the input field itself)
        if (e.target !== locationThreatMax) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        } else {
            e.stopPropagation(); // Just stop propagation for the input field
        }
    });
    
    // Add event listeners for mouseup events (spinner arrows) - only prevent on spinner arrows
    locationThreatMin.addEventListener('mouseup', (e) => {
        // Only prevent if it's on the spinner arrows (not the input field itself)
        if (e.target !== locationThreatMin) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        } else {
            e.stopPropagation(); // Just stop propagation for the input field
        }
    });
    
    locationThreatMax.addEventListener('mouseup', (e) => {
        // Only prevent if it's on the spinner arrows (not the input field itself)
        if (e.target !== locationThreatMax) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        } else {
            e.stopPropagation(); // Just stop propagation for the input field
        }
    });
    
    // Add event listeners for focus events
    locationThreatMin.addEventListener('focus', (e) => {
        e.stopPropagation();
    });
    
    locationThreatMax.addEventListener('focus', (e) => {
        e.stopPropagation();
    });
    
    // Prevent any form submission or navigation
    locationThreatMin.addEventListener('change', (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyLocationFilters();
    });
    
    locationThreatMax.addEventListener('change', (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyLocationFilters();
    });
    }
    
    // Make images clickable after they are loaded (main app / DBV)
    if (window.__EXCELSIOR_PAGE__ !== 'deck-editor' && typeof makeImagesClickable === 'function') {
        setTimeout(makeImagesClickable, 1000);
    }
});

// ===== DECK SELECTION / DECK TILE FUNCTIONS =====
// - /js/deck-selection/deckTileImages.js
// - /js/deck-selection/deckTileTimestamps.js
// - /js/deck-selection/deckTilesRenderer.js
// - /js/deck-selection/deckTileMenu.js
// - /js/deck-selection/index.js
//
// Keep a stable init hook for future needs.
if (window.DeckSelection && typeof window.DeckSelection.init === 'function') {
    window.DeckSelection.init();
}

// updateDeckStats function moved to filter-functions.js

// Modal functions
async function showCreateDeckModal() {
    document.getElementById('createDeckModal').style.display = 'flex';
    document.getElementById('deckName').focus();
    
    // Load characters into dropdown
    await loadCharactersForDeckCreation();
}

async function loadCharactersForDeckCreation() {
    try {
        const response = await fetch('/api/v1/catalog/characters');
        const result = await response.json();
        const payload = catalogListPayload(response, result);
        if (payload.ok && payload.rows.length > 0) {
            const characters = payload.rows;
            const characterSelect = document.getElementById('characterSelect');
            characterSelect.innerHTML = '<option value="">Select a character to add...</option>';
            
            characters.forEach(character => {
                const option = document.createElement('option');
                option.value = character.id;
                option.textContent = character.name;
                characterSelect.appendChild(option);
            });
        }
        
        // Clear selected characters
        document.getElementById('selectedCharacters').innerHTML = '';
    } catch (error) {
        console.error('Error loading characters:', error);
    }
}

// closeCreateDeckModal function moved to external file

// Character selection functionality
let selectedCharacterIds = [];

// addCharacterToDeck function moved to external file

// removeCharacterFromDeck function moved to external file

// Add event listener for character dropdown
document.addEventListener('DOMContentLoaded', function() {
    const characterSelect = document.getElementById('characterSelect');
    if (characterSelect) {
        characterSelect.addEventListener('change', addCharacterToDeck);
    }
});

// Create deck form submission (index.html / deck list only; absent on deck-editor.html)
const createDeckFormEl = document.getElementById('createDeckForm');
if (createDeckFormEl) {
    createDeckFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('deckName').value.trim();

        if (!name) return;

        try {
            const response = await fetch('/api/v1/decks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name,
                    description: '',
                    characters: selectedCharacterIds
                })
            });

            const data = await response.json();
            if (response.ok && data.data && (!data.errors || data.errors.length === 0)) {
                closeCreateDeckModal();
                loadDecks(); // Refresh the deck list
                showNotification('Deck created successfully!', 'success');
            } else {
                const errMsg =
                    (data.errors && data.errors[0] && data.errors[0].message) || data.error || 'Failed to create deck';
                showNotification('Failed to create deck: ' + errMsg, 'error');
            }
        } catch (error) {
            console.error('Error creating deck:', error);
            showNotification('Failed to create deck', 'error');
        }
    });
}

// editDeck function moved to external file

// viewDeck function moved to external file

// deleteDeck function moved to external file

// Notification system
// showNotification function moved to external file

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== NEW MODAL FUNCTIONS =====

// showViewDeckModal, closeViewDeckModal, showAddCardsModal, closeAddCardsModal functions moved to external file
// Ensure consistent two-pane layout
// ensureTwoPaneLayout function moved to filter-functions.js

// Add window resize listener for layout maintenance (throttled)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Only fix layout if it appears broken
        const layout = document.querySelector('.deck-editor-layout');
        if (layout && window.getComputedStyle(layout).flexDirection !== 'row') {
            ensureTwoPaneLayout();
        }
    }, 250);
});


// Load deck details and display cards
async function loadDeckDetails(deckId) {
    
    const layout = document.querySelector('.deck-editor-layout');
    const deckPane = document.querySelector('.deck-pane');
    const cardSelectorPane = document.querySelector('.card-selector-pane');
    
    try {
        const response = await fetch(`/api/v1/decks/${deckId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        const detailPayload =
            typeof deckDetailPayload === 'function' ? deckDetailPayload(response, data) : null;
        
        if (detailPayload && detailPayload.ok) {
            const deck = detailPayload.deck;
            
            // Update modal title and metadata
            document.getElementById('viewDeckTitle').textContent = deck.metadata.name;
            document.getElementById('viewDeckCreated').textContent = new Date(deck.metadata.created).toLocaleDateString();
            document.getElementById('viewDeckModified').textContent = new Date(deck.metadata.lastModified).toLocaleDateString();
            document.getElementById('viewDeckCardCount').textContent = calculateTotalCardCount(deck.cards || []);
            
            // Display deck cards
            displayDeckCards(deck.cards);
        } else {
            const msg =
                (data.errors && data.errors[0] && data.errors[0].message) || data.error || 'Unknown error';
            showNotification('Failed to load deck details: ' + msg, 'error');
        }
    } catch (error) {
        console.error('Error loading deck details:', error);
        showNotification('Failed to load deck details', 'error');
    }
}

async function displayDeckCards(cards) {
    const deckCardsList = document.getElementById('deckCardsList');
    
    if (cards.length === 0) {
        deckCardsList.innerHTML = `
            <div style="text-align: center; color: #bdc3c7; padding: 20px;">
                <p>No cards in this deck yet.</p>
                <p>Click "Add Cards" to get started!</p>
            </div>
        `;
        return;
    }

    // Load character data for character cards
    let characterMap = {};
    const characterCards = cards.filter(card => card.type === 'character');
    if (characterCards.length > 0) {
        try {
            const response = await fetch('/api/v1/catalog/characters');
            const result = await response.json();
            const charPayload = catalogListPayload(response, result);
            if (charPayload.ok) {
                characterMap = charPayload.rows.reduce((map, char) => {
                    map[char.id] = char;
                    return map;
                }, {});
            }
        } catch (error) {
            console.error('Error loading character data:', error);
        }
    }

    deckCardsList.innerHTML = cards.map(card => {
        let cardImage = '';
        let cardName = getCardName(card);
        
        if (card.type === 'character') {
            // Direct lookup using UUID
            const character = window.availableCardsMap.get(card.cardId);
            if (character && character.image) {
                const imagePath = getCardImagePath(character, 'character');
                cardImage = `<div class="deck-card-image" style="background-image: url('${imagePath}')" title="${character.name}"></div>`;
                cardName = character.name;
            }
        }
        
        return `
            <div class="deck-card-item">
                ${cardImage}
                <div class="deck-card-info">
                    <div class="deck-card-name">${cardName}</div>
                    <div class="deck-card-type">${formatCardType(card.type)}</div>
                </div>
                <div class="deck-card-quantity">×${card.quantity}</div>
                <div class="deck-card-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="changeCardQuantity('${card.id}', -1)">-</button>
                        <span>${card.quantity}</span>
                        <button class="quantity-btn" onclick="changeCardQuantity('${card.id}', 1)">+</button>
                    </div>
                    <button class="quantity-btn danger" onclick="removeCardFromDeck('${card.id}')">Remove</button>
                </div>
            </div>
        `;
    }).join('');
}

// getCardName, formatCardType functions moved to external file

async function removeCardFromDeck(cardId) {
    
    const layout = document.querySelector('.deck-editor-layout');
    const deckPane = document.querySelector('.deck-pane');
    const cardSelectorPane = document.querySelector('.card-selector-pane');
    
    if (!currentDeckId) return;
    
    if (confirm('Are you sure you want to remove this card from the deck?')) {
        try {
            const response = await fetch(`/api/v1/decks/${currentDeckId}/cards`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    cardType: 'character', // TODO: Get actual card type
                    cardId: cardId,
                    quantity: 1
                })
            });

            const data = await response.json();
            const ok = response.ok && data && (!data.errors || data.errors.length === 0);
            if (ok) {
                // Reload deck details
                loadDeckDetails(currentDeckId);
                // Refresh deck list
                loadDecks();
                showNotification('Card removed from deck', 'success');
                
                // Check layout after removal
                setTimeout(() => {
                    // Only ensure layout if we detect it's broken
                    const currentLayout = document.querySelector('.deck-editor-layout');
                    if (currentLayout && window.getComputedStyle(currentLayout).flexDirection !== 'row') {
                        ensureTwoPaneLayout();
                    }
                }, 100);
            } else {
                const msg = (data.errors && data.errors[0] && data.errors[0].message) || data.error || 'Request failed';
                showNotification('Failed to remove card: ' + msg, 'error');
            }
        } catch (error) {
            console.error('Error removing card:', error);
            showNotification('Failed to remove card', 'error');
        }
    }
}
window.removeCardFromDeck = removeCardFromDeck;

// Card search functionality
async function searchCards() {
    const cardType = document.getElementById('cardTypeFilter').value;
    const searchTerm = document.getElementById('cardSearchInput').value.toLowerCase();
    
    try {
        let cards = [];
        
        // Search based on card type
        if (cardType === 'character' || cardType === '') {
            const response = await fetch('/api/v1/catalog/characters');
            const data = await response.json();
            const charPayload = catalogListPayload(response, data);
            if (charPayload.ok) {
                cards.push(...charPayload.rows.map(card => ({
                    ...card,
                    type: 'character',
                    displayName: card.name
                })));
            }
        }
        
        if (cardType === 'location' || cardType === '') {
            const response = await fetch('/api/v1/catalog/locations');
            const data = await response.json();
            const locPayload = catalogListPayload(response, data);
            if (locPayload.ok) {
                cards.push(...locPayload.rows.map(card => ({
                    ...card,
                    type: 'location',
                    displayName: card.name
                })));
            }
        }
        
        if (cardType === 'special' || cardType === '') {
            const response = await fetch('/api/v1/catalog/special-cards');
            const data = await response.json();
            const specPayload = catalogListPayload(response, data);
            if (specPayload.ok) {
                cards.push(...specPayload.rows.map(card => ({
                    ...card,
                    type: 'special',
                    displayName: card.name
                })));
            }
        }
        
        // Filter by search term if provided
        if (searchTerm) {
            cards = cards.filter(card => 
                card.displayName.toLowerCase().includes(searchTerm)
            );
        }
        
        // Limit results to first 50 for performance
        cards = cards.slice(0, 50);
        
        displayCardSearchResults(cards);
    } catch (error) {
        console.error('Error searching cards:', error);
        document.getElementById('cardResults').innerHTML = '<div class="error">Error searching cards</div>';
    }
}

// displayCardSearchResults function moved to external file
// (deck global state: currentDeckId, currentDeckData, deckEditorCards, availableCardsMap, etc. — initialized near top of file)



// View toggle functionality - now supports three-way cycling (Card → List → Tile → Card)
// toggleListView, renderDeckCardsListView, toggleCardViewCategory, renderDeckCardsCardView


// Function to enforce horizontal layout in list view

// Draw Hand functionality has been moved to public/js/components/draw-hand.js module

// validateDeck function moved to external file

// calculateTotalCardCount function moved to external file

// calculateTotalThreat function moved to external file

// Function to calculate total icon counts across all cards in the deck
// Uses the same logic as list view to determine icons for each card type
// Only counts icons from: Special Cards, Aspect Cards, Ally Cards, Teamwork Cards, and Power Cards


// Function to update deck title validation badge
// updateDeckTitleValidation, toggleLimitedState functions moved to external file

// Add event listeners for card search (defer until DOMContentLoaded so debounce from utilities.js is available)
document.addEventListener('DOMContentLoaded', function() {
    const cardTypeFilter = document.getElementById('cardTypeFilter');
    const cardSearchInput = document.getElementById('cardSearchInput');
    if (cardTypeFilter) cardTypeFilter.addEventListener('change', searchCards);
    if (cardSearchInput) {
        const searchFn = (typeof debounce === 'function' ? debounce(searchCards, 300) : searchCards);
        cardSearchInput.addEventListener('input', searchFn);
    }
});

// Toggle category collapse/expand
// toggleCategory, togglePowerCardsSort, loadPowerCardsSortMode, toggleCharacterGroup,


// Update deck editor card count display

// updateSpecialCardsFilter, toggleAdvancedUniverseCharacterFilter, updateAdvancedUniverseFilter,
// togglePowerCardsCharacterFilter, updatePowerCardsFilter, toggleBasicUniverseCharacterFilter,
// updateBasicUniverseFilter, toggleTeamworkCharacterFilter, updateTeamworkFilter,
// toggleTrainingCharacterFilter, updateTrainingFilter, toggleAllyUniverseCharacterFilter,


// ===== UI PREFERENCES MANAGEMENT =====

// Load UI preferences from database


// ===== DECK EDITOR FUNCTIONS =====

// Deck Editor Search Functionality
let deckEditorSearchTimeout;
let allCardsCache = null;

// Initialize deck editor search

// Inline editing functions for deck title
// startEditingTitle function moved to external file

// saveTitleEdit function moved to external file

// cancelTitleEdit function moved to external file

// showDeckEditor function moved to external file

// closeDeckEditor function moved to external file
// Resizable divider functionality

function initializeBlankDeck() {
    console.log('initializeBlankDeck called');
    
    // Set up blank deck data
    currentDeckData = {
        metadata: {
            id: null,
            name: 'New Deck',
            description: '',
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            cardCount: 0,
            userId: getCurrentUser() ? (getCurrentUser().userId || getCurrentUser().id) : 'guest'
        },
        cards: []
    };
    
    window.deckEditorCards = [];
    currentDeckId = null;
    
    // Update modal title and description
    const titleElement = document.getElementById('deckEditorTitle');
    const descriptionElement = document.getElementById('deckEditorDescription');
    
    if (titleElement) {
        titleElement.textContent = 'New Deck';
    }
    
    if (descriptionElement) {
        descriptionElement.textContent = 'Click to add description';
        descriptionElement.style.display = 'block';
        descriptionElement.classList.add('placeholder');
    }
    
    // Clear any existing cards
    const deckCardsContainer = document.getElementById('deckCardsContainer');
    if (deckCardsContainer) {
        deckCardsContainer.innerHTML = '<div class="no-cards-message">No cards in this deck yet. Drag cards from the right panel to add them!</div>';
    }
    
    // Load available cards
    if (typeof loadAvailableCards === 'function') {
        loadAvailableCards();
    }
    
    // Update card count
    updateDeckCardCount();
    
    // Update deck title validation
    updateDeckTitleValidation(currentDeckData.cards || []);
            
            // Update power cards filter to show correct counts
            updatePowerCardsFilter();
}

// loadDeckForEditing function moved to external file

// applyCharacterBackgroundsToEditor, applyDeckEditorExpansionState, toggleDeckTypeSection,
// toggleDeckListSection, ensureScrollContainerCanShowAllContent, ensureCollapsedHeaderIsVisible


// Save deck expansion state to localStorage

// Helper function to map database IDs to deck card IDs (reverse mapping)
// Note: After UUID migration, this function is no longer needed as we'll use
// a different approach to map between deck card IDs and database UUIDs


// Expand character category if it's collapsed when search input is clicked
function expandCharacterCategoryIfNeeded(searchInput) {
    const category = searchInput.closest('.card-category');
    const header = category.querySelector('.card-category-header');
    
    if (header.classList.contains('collapsed')) {
        toggleCategory(header);
    }
}

// Prevent search input from collapsing the category when text is selected
function preventCategoryCollapse(event) {
    event.stopPropagation();
}

// Filter characters by name in the Available Cards section
function filterCharactersByName(searchTerm) {
    // Find the character category by its dedicated search input.
    const characterSearchInput = document.querySelector('.character-name-search');
    if (!characterSearchInput) return;
    const characterCategory = characterSearchInput.closest('.card-category');
    if (!characterCategory) return;
    
    const characterCards = characterCategory.querySelectorAll('.character-card');
    const searchLower = searchTerm.toLowerCase();
    
    characterCards.forEach(card => {
        const characterName = card.querySelector('.character-name');
        if (characterName) {
            const name = characterName.textContent.toLowerCase();
            if (searchLower === '' || name.includes(searchLower)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Filter Character Stacks subdivisions by character name in Available Cards
function filterCharacterStacksByName(searchTerm) {
    const characterStacksSearchInput = document.querySelector('.character-stack-name-search');
    if (!characterStacksSearchInput) return;

    const characterStacksCategory = characterStacksSearchInput.closest('.card-category');
    if (!characterStacksCategory) return;

    const characterGroups = characterStacksCategory.querySelectorAll('.character-group');
    const searchLower = (searchTerm || '').toLowerCase().trim();

    characterGroups.forEach(group => {
        const groupHeader = group.querySelector('.character-group-header span');
        if (!groupHeader) return;

        const groupName = groupHeader.textContent.toLowerCase().trim();
        group.style.display = searchLower === '' || groupName.includes(searchLower) ? 'block' : 'none';
    });
}
// setupDragAndDrop function moved to external file

// handlePlusButtonClick, handleCardClick functions moved to external file

// Enhanced drag and drop functionality for deck cards - variables moved to external file

// handleDeckCardDragStart function moved to external file

// handleDeckCardDragEnd, handleDeckCardDragOver, handleDeckCardDrop, handleAvailableCardDragOver, handleAvailableCardDragLeave, handleAvailableCardDrop, updateDragLayout, reorderDeckCards functions moved to external file


/**
 * Show alternate art selection modal
 * Make it globally accessible
 */


// Reserve Character Functions — shared UUID normalization for reserve vs deck row identities
function extractReserveUuid(id) {
    if (!id) return null;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(id)) return id;
    const prefixedMatch = id.match(/^[a-z]+_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
    if (prefixedMatch && prefixedMatch[1]) return prefixedMatch[1];
    const parts = id.split('_');
    for (let i = 1; i < parts.length; i++) {
        const candidate = parts.slice(i).join('_');
        if (uuidPattern.test(candidate)) return candidate;
    }
    return id;
}

/**
 * Whether deck metadata reserve_character refers to this deck row index (base id + alternate art ids).
 * Used by desktop reserve button and mobile ⋯ reserve row (tap-to-switch).
 */
function computeReserveCharacterRowState(cardId, index) {
    const deckData = window.currentDeckData || currentDeckData;
    const reserveCharacterId = deckData && deckData.metadata && deckData.metadata.reserve_character;
    const hasReserveCharacter = !!reserveCharacterId;
    const isReadOnlyUI = !!(document.body && document.body.classList && document.body.classList.contains('read-only-mode'));

    let isReserveCharacter = false;
    if (reserveCharacterId && window.deckEditorCards && window.deckEditorCards[index]) {
        const card = window.deckEditorCards[index];

        const normalizedReserveId = extractReserveUuid(reserveCharacterId);
        const normalizedCardId = extractReserveUuid(card.cardId);

        if (normalizedReserveId === normalizedCardId) {
            isReserveCharacter = true;
        } else if (card.selectedAlternateCardId) {
            const normalizedAlternateId = extractReserveUuid(card.selectedAlternateCardId);
            if (normalizedReserveId === normalizedAlternateId) {
                isReserveCharacter = true;
            }
        } else if (card.selectedAlternateCardIds && Array.isArray(card.selectedAlternateCardIds)) {
            for (const altId of card.selectedAlternateCardIds) {
                const normalizedAltId = extractReserveUuid(altId);
                if (normalizedReserveId === normalizedAltId) {
                    isReserveCharacter = true;
                    break;
                }
            }
        }
    } else if (reserveCharacterId) {
        isReserveCharacter = reserveCharacterId === cardId;
    }

    let reserveMatchesAnyCard = false;
    if (hasReserveCharacter && window.deckEditorCards) {
        const normalizedReserveId = extractReserveUuid(reserveCharacterId);
        for (const card of window.deckEditorCards) {
            if (card.type !== 'character') continue;
            const normalizedCid = extractReserveUuid(card.cardId);
            if (normalizedReserveId === normalizedCid) {
                reserveMatchesAnyCard = true;
                break;
            }
            if (card.selectedAlternateCardId) {
                const normalizedAltId = extractReserveUuid(card.selectedAlternateCardId);
                if (normalizedReserveId === normalizedAltId) {
                    reserveMatchesAnyCard = true;
                    break;
                }
            }
            if (card.selectedAlternateCardIds && Array.isArray(card.selectedAlternateCardIds)) {
                for (const altId of card.selectedAlternateCardIds) {
                    const normalizedAltId = extractReserveUuid(altId);
                    if (normalizedReserveId === normalizedAltId) {
                        reserveMatchesAnyCard = true;
                        break;
                    }
                }
                if (reserveMatchesAnyCard) break;
            }
        }
    }

    return {
        hasReserveCharacter,
        reserveCharacterId,
        isReadOnlyUI,
        isReserveCharacter,
        reserveMatchesAnyCard,
    };
}

function getReserveCharacterButton(cardId, index) {
    const {
        hasReserveCharacter,
        isReadOnlyUI,
        isReserveCharacter,
        reserveMatchesAnyCard,
    } = computeReserveCharacterRowState(cardId, index);

    // Read-only mode behavior:
    // - If a reserve character is set, show ONLY the selected reserve state (disabled)
    // - If no reserve character is set, hide all reserve buttons
    if (isReadOnlyUI) {
        if (hasReserveCharacter && isReserveCharacter) {
            return `<button class="reserve-btn active" disabled title="Reserve character">Reserve</button>`;
        }
        return '';
    }

    if (isReserveCharacter) {
        const buttonText = 'Reserve';
        const buttonClass = 'reserve-btn active';
        const onclickFunction = `deselectReserveCharacter(${index})`;
        return `<button class="${buttonClass}" onclick="${onclickFunction}">${buttonText}</button>`;
    }

    if (hasReserveCharacter && !reserveMatchesAnyCard) {
        const buttonText = 'Reserve';
        const buttonClass = 'reserve-btn';
        const onclickFunction = `selectReserveCharacter('${cardId}', ${index})`;
        return `<button class="${buttonClass}" onclick="${onclickFunction}">${buttonText}</button>`;
    }
    if (hasReserveCharacter && reserveMatchesAnyCard) {
        return '';
    }
    const buttonText = 'Reserve';
    const buttonClass = 'reserve-btn';
    const onclickFunction = `selectReserveCharacter('${cardId}', ${index})`;
    return `<button class="${buttonClass}" onclick="${onclickFunction}">${buttonText}</button>`;
}

function updateReserveButtons() {
    
    // Find all character cards in the deck editor (both Tile View and Card View)
    const characterCards = document.querySelectorAll('.deck-card-editor-item, .deck-card-card-view-item');
    
    characterCards.forEach((cardElement, index) => {
        // Check if this is a character card
        const cardInfo = cardElement.querySelector('.deck-card-editor-name');
        let matchingCard = null;
        
        if (cardInfo) {
            // Tile View: Find by card name
            const cardName = cardInfo.textContent.trim();
            matchingCard = window.deckEditorCards.find(card => {
                if (card.type !== 'character') return false;
                const character = window.availableCardsMap.get(card.cardId);
                return character && character.name === cardName;
            });
        } else if (cardElement.hasAttribute('data-index')) {
            // Card View: Find by data-index attribute
            const cardIndex = parseInt(cardElement.getAttribute('data-index'));
            if (cardIndex >= 0 && cardIndex < window.deckEditorCards.length) {
                const card = window.deckEditorCards[cardIndex];
                if (card && card.type === 'character') {
                    matchingCard = card;
                }
            }
        }
        
        if (!matchingCard) return;
        
        if (matchingCard) {
            const cardId = matchingCard.cardId;
            const cardIndex = window.deckEditorCards.indexOf(matchingCard);
            
            // Handle both Tile View and Card View
            let reserveContainer = cardElement.querySelector('.deck-card-editor-reserve');
            if (!reserveContainer) {
                // Card View: look for reserve button in card-view-actions
                reserveContainer = cardElement.querySelector('.card-view-actions');
            }
            
            if (reserveContainer) {
                // Get the new button HTML
                const newButtonHTML = getReserveCharacterButton(cardId, cardIndex);
                
                // For Card View, we need to preserve other buttons and only update the reserve button
                if (cardElement.classList.contains('deck-card-card-view-item')) {
                    // Card View: find and update only the reserve button
                    const existingReserveBtn = reserveContainer.querySelector('.reserve-btn');
                    if (existingReserveBtn) {
                        existingReserveBtn.outerHTML = newButtonHTML;
                    } else if (newButtonHTML) {
                        // Add reserve button if it doesn't exist
                        reserveContainer.innerHTML += newButtonHTML;
                    }
                } else {
                    // Tile View: replace entire container content
                    if (reserveContainer.innerHTML !== newButtonHTML) {
                        reserveContainer.innerHTML = newButtonHTML;
                    }
                }
            }
        }
    });

    // Also update reserve buttons in list view - only in Characters section
    const charactersListItems = document.querySelectorAll('#deck-list-items-character .deck-list-item');
    charactersListItems.forEach((listItem, index) => {
        // Find the card name from the list item
        const cardNameElement = listItem.querySelector('.deck-list-item-name');
        if (!cardNameElement) return;
        
        const cardName = cardNameElement.textContent.trim();
        
        // Find the corresponding character card in window.deckEditorCards by name
        const matchingCard = window.deckEditorCards.find(card => {
            if (card.type !== 'character') return false;
            const character = window.availableCardsMap.get(card.cardId);
            return character && character.name === cardName;
        });
        
        if (matchingCard) {
            const cardId = matchingCard.cardId;
            const originalIndex = window.deckEditorCards.indexOf(matchingCard);
            const actionsContainer = listItem.querySelector('.deck-list-item-actions');
            
            if (actionsContainer) {
                // Find existing reserve button and remove it
                const existingReserveBtn = actionsContainer.querySelector('.reserve-btn');
                if (existingReserveBtn) {
                    existingReserveBtn.remove();
                }
                
                // Get the new button HTML
                const newButtonHTML = getReserveCharacterButton(cardId, originalIndex);
                
                // Insert the new button before the remove button
                const removeBtn = actionsContainer.querySelector('.deck-list-item-remove');
                if (removeBtn && newButtonHTML) {
                    removeBtn.insertAdjacentHTML('beforebegin', newButtonHTML);
                }
            }
        }
    });
}


async function selectReserveCharacter(cardId, index) {
    
    if (!currentDeckId && currentDeckId !== null) {
        showNotification('No deck selected', 'error');
        return;
    }

    if (!currentDeckData) {
        showNotification('No deck data available', 'error');
        return;
    }

    // Read-only mode removed - now handled by backend flag


    // Update local deck data only - changes will be persisted when user clicks Save
    if (!currentDeckData.metadata) {
        currentDeckData.metadata = {};
    }
    
    currentDeckData.metadata.reserve_character = cardId;
    
    showNotification('Reserve character selected! (Click Save to persist changes)', 'success');
    
    // Update reserve buttons without re-rendering the entire deck to preserve layout
    updateReserveButtons();

    if (
        typeof isLayoutMobile === 'function' &&
        isLayoutMobile() &&
        typeof closeDevMobileDeckActionsSheet === 'function' &&
        typeof renderDeckEditorMobileView === 'function'
    ) {
        closeDevMobileDeckActionsSheet();
        renderDeckEditorMobileView();
    }
    
    // Update deck summary to reflect new threat calculation
    // Use window.deckEditorCards which is the working copy of deck cards
    await updateDeckSummary(window.deckEditorCards);
    
}

async function deselectReserveCharacter(index) {
    
    if (!currentDeckId && currentDeckId !== null) {
        showNotification('No deck selected', 'error');
        return;
    }

    if (!currentDeckData) {
        showNotification('No deck data available', 'error');
        return;
    }

    // Read-only mode removed - now handled by backend flag


    // Update local deck data only - changes will be persisted when user clicks Save
    if (!currentDeckData.metadata) {
        currentDeckData.metadata = {};
    }
    
    currentDeckData.metadata.reserve_character = null;
    
    showNotification('Reserve character deselected! (Click Save to persist changes)', 'success');
    
    // Update reserve buttons without re-rendering the entire deck to preserve layout
    updateReserveButtons();

    if (
        typeof isLayoutMobile === 'function' &&
        isLayoutMobile() &&
        typeof closeDevMobileDeckActionsSheet === 'function' &&
        typeof renderDeckEditorMobileView === 'function'
    ) {
        closeDevMobileDeckActionsSheet();
        renderDeckEditorMobileView();
    }
    
    // Update deck summary to reflect new threat calculation
    // Use window.deckEditorCards which is the working copy of deck cards
    await updateDeckSummary(window.deckEditorCards);
    
}

// Mission Display Tile Selection Functions
function getDisplayMissionButton(cardId, index) {
    // Hide in read-only mode
    if (document.body.classList.contains('read-only-mode')) {
        return '';
    }

    // Only applies to mission cards
    if (!window.deckEditorCards || !window.deckEditorCards[index] || window.deckEditorCards[index].type !== 'mission') {
        return '';
    }

    const deckData = window.currentDeckData || currentDeckData;
    const selectedMissionId = deckData?.metadata?.display_mission_card_id || null;
    const hasSelection = !!selectedMissionId;

    // Check if selection matches any mission card in deck
    let selectionMatchesAnyMission = false;
    if (hasSelection && window.deckEditorCards) {
        selectionMatchesAnyMission = window.deckEditorCards.some(c => c?.type === 'mission' && c.cardId === selectedMissionId);
    }

    const isSelected = hasSelection && selectedMissionId === cardId;

    // If selected and this is the selected mission -> show active Display button
    if (isSelected) {
        return `<button class="reserve-btn display-mission-btn active" onclick="deselectDisplayMission(${index})">Display</button>`;
    }

    // If there is a valid selection on another mission -> hide button here
    if (hasSelection && selectionMatchesAnyMission) {
        return '';
    }

    // No selection (or stale selection) -> show Display button on all missions
    return `<button class="reserve-btn display-mission-btn" onclick="selectDisplayMission('${cardId}', ${index})">Display</button>`;
}

function updateDisplayMissionButtons() {
    // Update buttons in Tile View (deck-card-editor-item) and Card View (deck-card-card-view-item)
    const allCards = document.querySelectorAll('.deck-card-editor-item, .deck-card-card-view-item');
    allCards.forEach((cardElement) => {
        const cardIndexAttr = cardElement.getAttribute('data-index');
        if (cardIndexAttr === null || cardIndexAttr === undefined) return;
        const cardIndex = parseInt(cardIndexAttr);
        if (Number.isNaN(cardIndex)) return;

        const card = window.deckEditorCards && window.deckEditorCards[cardIndex];
        if (!card || card.type !== 'mission') return;

        let actionsContainer = cardElement.querySelector('.deck-card-editor-actions');
        if (!actionsContainer) {
            // Card View: actions container uses card-view-actions
            actionsContainer = cardElement.querySelector('.card-view-actions');
        }
        if (!actionsContainer) return;

        // Remove any existing Display buttons (identified by text and reserve-btn class)
        actionsContainer.querySelectorAll('button.reserve-btn').forEach(btn => {
            if ((btn.textContent || '').trim() === 'Display') {
                btn.remove();
            }
        });

        const newButtonHTML = getDisplayMissionButton(card.cardId, cardIndex);
        if (!newButtonHTML) return;

        // Insert near the other small action buttons
        actionsContainer.insertAdjacentHTML('beforeend', newButtonHTML);
    });

    // Update buttons in list view - Missions section only
    const missionsListItems = document.querySelectorAll('#deck-list-items-mission .deck-list-item');
    missionsListItems.forEach((listItem) => {
        const nameEl = listItem.querySelector('.deck-list-item-name');
        if (!nameEl) return;
        const cardName = nameEl.textContent.trim();

        const matchingCard = window.deckEditorCards?.find(c => {
            if (c.type !== 'mission') return false;
            const mission = window.availableCardsMap?.get(c.cardId);
            const missionName = mission?.name || mission?.card_name || '';
            return missionName === cardName;
        });
        if (!matchingCard) return;

        const originalIndex = window.deckEditorCards.indexOf(matchingCard);
        const actionsContainer = listItem.querySelector('.deck-list-item-actions');
        if (!actionsContainer) return;

        // Remove existing Display button
        actionsContainer.querySelectorAll('button.reserve-btn').forEach(btn => {
            if ((btn.textContent || '').trim() === 'Display') {
                btn.remove();
            }
        });

        const newButtonHTML = getDisplayMissionButton(matchingCard.cardId, originalIndex);
        if (!newButtonHTML) return;

        const removeBtn = actionsContainer.querySelector('.deck-list-item-remove');
        if (removeBtn) {
            removeBtn.insertAdjacentHTML('beforebegin', newButtonHTML);
        } else {
            actionsContainer.insertAdjacentHTML('beforeend', newButtonHTML);
        }
    });
}

async function selectDisplayMission(cardId, index) {
    if (!currentDeckData) {
        showNotification('No deck data available', 'error');
        return;
    }
    if (!currentDeckData.metadata) {
        currentDeckData.metadata = {};
    }

    // Only allow selecting mission cards
    const card = window.deckEditorCards && window.deckEditorCards[index];
    if (!card || card.type !== 'mission') {
        return;
    }

    currentDeckData.metadata.display_mission_card_id = cardId;
    showNotification('Mission selected for deck tile! (Click Save to persist changes)', 'success');
    updateDisplayMissionButtons();
}

async function deselectDisplayMission(index) {
    if (!currentDeckData) {
        showNotification('No deck data available', 'error');
        return;
    }
    if (!currentDeckData.metadata) {
        currentDeckData.metadata = {};
    }

    currentDeckData.metadata.display_mission_card_id = null;
    showNotification('Mission display selection cleared! (Click Save to persist changes)', 'success');
    updateDisplayMissionButtons();
}

// saveDeckChanges function moved to external file

// Global alias for updateDeckEditorCardCount
window.updateDeckCardCount = function() {
    updateDeckEditorCardCount();
    // Also update deck summary to ensure button states are correct
    if (typeof updateDeckSummary === 'function') {
        updateDeckSummary(window.deckEditorCards);
    } else {
    }
};

