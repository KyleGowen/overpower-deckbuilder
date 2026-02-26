// App Initialization Functions
// Extracted from index.html for better modularity

// Load and initialize global navigation component
async function loadGlobalNav() {
    try {
        const response = await fetch('/components/globalNav.html');
        const html = await response.text();
        document.getElementById('globalNav').innerHTML = html;
        
        // Initialize the global navigation
        initializeGlobalNav();
    } catch (error) {
        console.error('Failed to load global navigation:', error);
    }
}

// Show main application interface
function showMainApp() {
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) mainContainer.style.display = 'block';
    document.getElementById('loginModal').style.display = 'none';
    // Display "Guest" with capital G for guest users, otherwise use the username/name
    const displayName = (currentUser.role === 'GUEST') 
        ? 'Guest' 
        : (currentUser.username || currentUser.name || 'User');
    document.getElementById('currentUsername').textContent = displayName;
    
    // Update Collection button visibility after login
    if (typeof updateUserWelcome === 'function') {
        updateUserWelcome();
    }
    
    // Hide database view by default to avoid flash and switch directly to deck builder
    const databaseView = document.getElementById('database-view');
    if (databaseView) databaseView.classList.add('view-removed');

    // Load core data in background to keep transition smooth
    loadMainAppDataInBackground();

    // Show deck builder smoothly
    if (typeof switchToDeckBuilder === 'function') {
        switchToDeckBuilder();
    } else {
        const deckBuilder = document.getElementById('deck-builder');
        if (deckBuilder) deckBuilder.classList.remove('view-removed');
    }

    // Disable "Add to Deck" buttons for guest users immediately
    disableAddToDeckButtonsImmediate();
}

// Load main app data in background without showing the UI
// loadDecks (called by switchToDeckBuilder) fetches decks and populates userDecks via setUserDecks
// loadDatabaseViewData() deferred - called by switchToDatabaseView() on first tab switch
function loadMainAppDataInBackground() {
    // No loadUserDecks - loadDecks handles decks and populates userDecks
}

// Load user-specific data
async function loadUserData() {
    // Load user-specific data
    loadCharacters();
    loadSpecialCards();
    loadAdvancedUniverse();
    loadMissions();
    loadLocations();
    loadEvents();
    loadAspects();
    loadTeamwork();
    loadAllyUniverse();
    loadTraining();
    loadBasicUniverse();
    loadPowerCards();
    loadDecks();
}
