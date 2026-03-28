// deck-editor-search-inline.js - Deck editor inline search
// Extracted from public/index.html

// ===== initializeDeckEditorSearch through addCardToDeckFromSearch =====

function initializeDeckEditorSearch() {
    const searchInput = document.getElementById('deckEditorSearchInput');
    const searchResults = document.getElementById('deckEditorSearchResults');
    if (!searchInput || !searchResults) { console.error('🔍 Deck editor search elements not found!'); return; }

    if (window.DeckEditorSearch && window.CardSearchService) {
        // Prefer refactored component
        window.deckEditorSearchComponent = new window.DeckEditorSearch({
            input: searchInput,
            results: searchResults,
            onSelect: ({ id, type, name }) => {
                if (typeof addCardToDeckFromSearch === 'function') {
                    addCardToDeckFromSearch(id, type, name);
                }
            }
        });
        window.deckEditorSearchComponent.mount();
        return;
    }

    // Fallback to legacy wiring if component is unavailable
    searchInput.addEventListener('input', handleDeckEditorSearch);
    searchInput.addEventListener('focus', showDeckEditorSearchResults);
    searchInput.addEventListener('blur', () => { setTimeout(() => { hideDeckEditorSearchResults(); }, 200); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.deck-editor-search-container')) { hideDeckEditorSearchResults(); } });
}
// Handle search input
async function handleDeckEditorSearch(e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    const searchResults = document.getElementById('deckEditorSearchResults');
    
    if (searchTerm.length < 2) {
        hideDeckEditorSearchResults();
        return;
    }

    // Clear previous timeout
    if (deckEditorSearchTimeout) {
        clearTimeout(deckEditorSearchTimeout);
    }

    // Debounce search
    deckEditorSearchTimeout = setTimeout(async () => {
        try {
            const results = await searchAllCards(searchTerm);
            displayDeckEditorSearchResults(results);
        } catch (error) {
            console.error('🔍 Search error:', error);
            hideDeckEditorSearchResults();
        }
    }, 300);
}

// Search all card types - uses availableCardsMap when populated (via CardSearchService), otherwise fetches
async function searchAllCards(searchTerm) {
    const term = (searchTerm || '').trim();
    if (term.length < 2) return [];

    if (window.CardSearchService) {
        const svc = new window.CardSearchService({ maxResults: 20 });
        return svc.search(term);
    }

    // Legacy fallback when CardSearchService not loaded
    const results = [];
    try {
        const [characters, specials, missions, events, aspects, advanced, teamwork, ally, training, basic, power, locations] = await Promise.all([
            fetch('/api/characters').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/special-cards').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/missions').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/events').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/aspects').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/advanced-universe').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/teamwork').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/ally-universe').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/training').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/basic-universe').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/power-cards').then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/locations').then(r => r.json()).catch(() => ({ success: false, data: [] }))
        ]);
        const st = term.toLowerCase();
        const add = (card, type, name, char) => {
            if (!name) return;
            const img = type === 'location' ? `/src/resources/cards/images/locations/${card.image}` : `/src/resources/cards/images/${card.image}`;
            results.push({ id: card.id, name, type, image: img, character: char ?? null });
        };
        if (characters.success) characters.data.forEach(c => c.name?.toLowerCase().includes(st) && add(c, 'character', c.name, null));
        if (specials.success) specials.data.forEach(c => {
            const nm = c.name?.toLowerCase();
            const linked = (c.character || c.character_name || '');
            const ch = linked.toLowerCase();
            if (nm?.includes(st) || ch.includes(st) || ch === st || st === 'special') add(c, 'special', c.name, linked || null);
        });
        if (missions.success) missions.data.forEach(m => { const cn = m.card_name?.toLowerCase(); const ms = m.mission_set?.toLowerCase(); if (cn?.includes(st) || ms?.includes(st) || st === 'mission' || st === 'missions') add(m, 'mission', m.card_name, m.mission_set); });
        if (events.success) events.data.forEach(e => { const nm = e.name?.toLowerCase(); const ms = e.mission_set?.toLowerCase(); if (nm?.includes(st) || ms?.includes(st) || st === 'event' || st === 'events') add(e, 'event', e.name, e.mission_set); });
        if (aspects.success) aspects.data.forEach(a => a.card_name?.toLowerCase().includes(st) && add(a, 'aspect', a.card_name, null));
        if (advanced.success) advanced.data.forEach(c => { const nm = c.name?.toLowerCase(); const ch = c.character?.toLowerCase(); if (nm?.includes(st) || ch?.includes(st) || ch === st || st === 'advanced') add(c, 'advanced-universe', c.name, c.character); });
        if (teamwork.success) teamwork.data.forEach(c => { const n = (c.to_use || c.name)?.toLowerCase(); const ch = c.character?.toLowerCase(); if (n?.includes(st) || ch?.includes(st) || ch === st || st === 'teamwork') add(c, 'teamwork', c.to_use || c.name, c.character); });
        if (ally.success) ally.data.forEach(c => (c.card_name?.toLowerCase().includes(st) || st === 'ally') && add(c, 'ally-universe', c.card_name, null));
        if (training.success) training.data.forEach(c => !c.is_foil && (c.card_name?.toLowerCase().includes(st) || st === 'training') && add(c, 'training', c.card_name, null));
        if (basic.success) basic.data.forEach(c => (c.card_name?.toLowerCase().includes(st) || st === 'basic') && add(c, 'basic-universe', c.card_name, null));
        if (power.success) power.data.forEach(c => ((c.power_type?.toLowerCase().includes(st)) || st === 'power card') && add(c, 'power', c.power_type, null));
        if (locations.success) locations.data.forEach(c => (c.name?.toLowerCase().includes(st) || st === 'location') && add(c, 'location', c.name, null));
    } catch (err) {
        console.error('Error searching cards:', err);
    }
    const filteredResults = results
        .filter(result => result.name && result.name.trim()) // Filter out results with empty names
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 20);
        
    return filteredResults;
}

// Display search results
function displayDeckEditorSearchResults(results) {
    const searchResults = document.getElementById('deckEditorSearchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="deck-editor-search-result">No cards found</div>';
    } else {
        const htmlContent = results.map(card => {
            const escapedImage = (card.image || '').replace(/'/g, "\\'");
            const escapedCardId = String(card.id || '').replace(/'/g, "\\'");
            const escapedCardType = String(card.type || '').replace(/'/g, "\\'");
            return `
            <div class="deck-editor-search-result" 
                 onclick="addCardToDeckFromSearch('${card.id}', '${card.type}', '${card.name.replace(/'/g, "\\'")}')"
                 onmouseenter="showCardHoverModal('${escapedImage}', '${card.name.replace(/'/g, "\\'")}', '${escapedCardId}', '${escapedCardType}')"
                 onmouseleave="hideCardHoverModal()">
                <div class="deck-editor-search-result-image" style="background-image: url('${card.image}')"></div>
                <div class="deck-editor-search-result-info">
                    <div class="deck-editor-search-result-name">${card.name}</div>
                    <div class="deck-editor-search-result-type">${formatCardType(card.type)}</div>
                    ${card.character ? `<div class="deck-editor-search-result-character">${card.character}</div>` : ''}
                </div>
            </div>
        `;
        }).join('');
        
        searchResults.innerHTML = htmlContent;
    }
    
    showDeckEditorSearchResults();
}

// Show search results
function showDeckEditorSearchResults() {
    const searchResults = document.getElementById('deckEditorSearchResults');
    if (searchResults) {
        searchResults.style.display = 'block';
    } else {
        console.error('🔍 Search results element not found!');
    }
}

// Hide search results
function hideDeckEditorSearchResults() {
    const searchResults = document.getElementById('deckEditorSearchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Toast notification function
// showToast function moved to external file

// Add card to deck from search
async function addCardToDeckFromSearch(cardId, cardType, cardName) {
    // Read-only mode removed - now handled by backend flag
    
    // Check if we're creating a new deck (no currentDeckId)
    if (!currentDeckId) {
        // For new decks, use addCardToEditor to add to local window.deckEditorCards array
        // Adding card to new deck via addCardToEditor
        
        // Use the card name passed as parameter, or fallback to availableCardsMap
        let finalCardName = cardName;
        if (!finalCardName && availableCardsMap) {
            const cardData = window.availableCardsMap.get(cardId);
            finalCardName = cardData ? cardData.name : 'Unknown Card';
        }
        if (!finalCardName) {
            finalCardName = 'Unknown Card';
        }
        
        // Check if addCardToEditor function exists
        if (typeof addCardToEditor === 'function') {
            try {
                await addCardToEditor(cardType, cardId, finalCardName);
            } catch (error) {
                console.error('addCardToEditor failed:', error);
                showToast('Failed to add card to deck: ' + error.message, 'error');
                return;
            }
        } else {
            console.error('addCardToEditor function does not exist!');
            showToast('addCardToEditor function not found', 'error');
            return;
        }
        
        // Clear search and hide results
        const searchInput = document.getElementById('deckEditorSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        hideDeckEditorSearchResults();
        
        // Show success message
        showToast('Card added to deck!', 'success');
        return;
    }

    try {
        const requestBody = {
            cardId: cardId,
            cardType: cardType
        };
        
        // Add the card to the deck
        const response = await fetch(`/api/decks/${currentDeckId}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            // Clear search and hide results
            const searchInput = document.getElementById('deckEditorSearchInput');
            if (searchInput) {
                searchInput.value = '';
            }
            hideDeckEditorSearchResults();
            
            // Reload deck cards
            await loadDeckForEditing(currentDeckId);
            
            // Force character single column layout after reload
            setTimeout(() => {
                forceCharacterSingleColumnLayout();
            }, 100);
            
            // Show success message
            showToast('Card added to deck!', 'success');
        } else {
            console.error('🔍 API Error Response:', response.status, response.statusText);
            const error = await response.json();
            console.error('🔍 API Error Details:', error);
            showToast(error.error || 'Failed to add card to deck', 'error');
        }
    } catch (error) {
        console.error('Error adding card to deck:', error);
        showToast('Failed to add card to deck', 'error');
    }
}


// Export all functions to window for backward compatibility
window.initializeDeckEditorSearch = initializeDeckEditorSearch;
window.handleDeckEditorSearch = handleDeckEditorSearch;
window.searchAllCards = searchAllCards;
window.displayDeckEditorSearchResults = displayDeckEditorSearchResults;
window.showDeckEditorSearchResults = showDeckEditorSearchResults;
window.hideDeckEditorSearchResults = hideDeckEditorSearchResults;
window.addCardToDeckFromSearch = addCardToDeckFromSearch;
