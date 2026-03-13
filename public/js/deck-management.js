/* ========================================
 * PHASE 8: DECK MANAGEMENT FUNCTIONS
 * ========================================
 * 
 * This file contains deck creation, editing, and management functions
 * extracted from index.html during Phase 8 of the refactoring project.
 * 
 * Purpose: Deck creation, editing, and management
 * Created: Phase 8 of 12-phase refactoring project
 * Contains:
 *   - createNewDeck() - New deck creation
 *   - editDeck() - Deck editing
 *   - viewDeck() - Deck viewing
 *   - deleteDeck() - Deck deletion
 *   - showDeckSelection() - Deck selection modal
 *   - All deck management utilities
 * 
 * ======================================== */

// Global variable for user decks
let userDecks = [];

/**
 * Set user decks (used by loadDecks to avoid duplicate fetches)
 */
function setUserDecks(decks) {
    userDecks = Array.isArray(decks) ? decks : [];
}

/**
 * Check if user decks are already loaded (avoids redundant /api/decks fetch in database view)
 */
function hasUserDecksLoaded() {
    return Array.isArray(userDecks) && userDecks.length > 0;
}

/**
 * Load user decks from the API (use when loadDecks has not run, e.g. Database View Add-to-Deck)
 */
async function loadUserDecks() {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.log('No authenticated user, skipping deck load');
            return;
        }
        const isGuest = currentUser.role === 'GUEST';
        const url = isGuest ? '/api/guest/decks' : '/api/decks';
        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
            userDecks = data.data;
        } else {
            console.error('Failed to load decks:', data.error);
        }
    } catch (error) {
        console.error('Error loading user decks:', error);
    }
}

/**
 * Show deck selection menu for adding cards to decks
 */
async function showDeckSelection(cardType, cardId, cardName, buttonElement) {
    
    // Check if user is authenticated
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please log in to add cards to decks', 'error');
        return;
    }
    
    // Load user decks if not already loaded
    if (userDecks.length === 0) {
        await loadUserDecks();
    }
    
    // Check if user has any decks
    if (userDecks.length === 0) {
        showNotification('You need to create a deck first', 'error');
        return;
    }
    
    // Create and show deck selection menu
    createDeckSelectionMenu(cardType, cardId, cardName, buttonElement);
}

/**
 * Create deck selection menu
 */
function createDeckSelectionMenu(cardType, cardId, cardName, buttonElement) {
    // Remove any existing menu
    const existingMenu = document.getElementById('deck-selection-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Get button position for menu placement
    const buttonRect = buttonElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate menu position
    let top = buttonRect.bottom + 5;
    let left = buttonRect.left;
    
    // Adjust position if menu would go off screen
    if (left + 200 > viewportWidth) {
        left = viewportWidth - 200 - 10;
    }
    if (top + 300 > viewportHeight) {
        top = buttonRect.top - 300 - 5;
    }
    
    // Estimate menu height based on number of decks
    const estimatedHeight = Math.min(userDecks.length * 50 + 100, 300); // rough estimate
    
    // Create menu element
    const menu = document.createElement('div');
    menu.id = 'deck-selection-menu';
    menu.className = 'deck-selection-menu';
    menu.style.cssText = `
        position: fixed;
        top: ${top}px;
        left: ${left}px;
        width: 200px;
        max-height: ${estimatedHeight}px;
        background: #2a2a3e;
        border: 1px solid #444;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        overflow-y: auto;
        padding: 10px;
    `;
    
    // Add title
    const title = document.createElement('div');
    title.className = 'deck-selection-title';
    title.textContent = 'Add to Deck:';
    title.style.cssText = `
        color: #fff;
        font-weight: normal;
        font-size: 14px;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #444;
    `;
    menu.appendChild(title);
    
    // Add deck options
    userDecks.forEach(deck => {
        const deckOption = document.createElement('div');
        deckOption.className = 'deck-option';
        deckOption.textContent = deck.name || deck.metadata?.name || 'Unnamed Deck';
        deckOption.style.cssText = `
            color: #fff;
            font-size: 14px;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 4px;
            margin-bottom: 2px;
            transition: background-color 0.2s;
        `;
        
        // Add hover effect
        deckOption.addEventListener('mouseenter', () => {
            deckOption.style.backgroundColor = '#3a3a4e';
        });
        deckOption.addEventListener('mouseleave', () => {
            deckOption.style.backgroundColor = 'transparent';
        });
        
        // Add click handler
        deckOption.addEventListener('click', async () => {
            // Try different possible deck ID properties
            const deckId = deck.id || deck.metadata?.id || deck.deckId;
            
            if (!deckId) {
                console.error('❌ ERROR: No deck ID found in deck object:', deck);
                showNotification('Error: Could not identify deck ID', 'error');
                return;
            }
            
            await addCardToDeckFromSelection(deckId, cardType, cardId, cardName);
            menu.remove();
        });
        
        menu.appendChild(deckOption);
    });
    
    // Add menu to document
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    const closeMenuOnClickOutside = (event) => {
        if (!menu.contains(event.target) && event.target !== buttonElement) {
            menu.remove();
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    };
    
    // Use setTimeout to avoid immediate closure
    setTimeout(() => {
        document.addEventListener('click', closeMenuOnClickOutside);
    }, 100);
}

/**
 * Add card to a deck chosen from the deck-selection menu (Card Database view).
 * +Deck is disabled for GUEST; this is only used for non-guest users.
 * Named to avoid collision with deck-card-operations.js addCardToDeck(cardType, cardId) which uses currentDeckId.
 */
async function addCardToDeckFromSelection(deckId, cardType, cardId, cardName) {
    if (!deckId) {
        console.error('❌ ERROR: deckId is undefined or null');
        showNotification('Error: No deck selected', 'error');
        return;
    }
    const requestBody = { cardType, cardId, quantity: 1 };
    const isGuestDeck = typeof deckId === 'string' && deckId.startsWith('guest_');
    const url = isGuestDeck ? `/api/guest/decks/${deckId}/cards` : `/api/decks/${deckId}/cards`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });
        if (response.ok) {
            showNotification(`Added ${cardName} to deck`, 'success');
        } else {
            const errorData = await response.json();
            showNotification(`Failed to add card: ${errorData.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Error adding card to deck:', error);
        showNotification('Failed to add card to deck', 'error');
    }
}
