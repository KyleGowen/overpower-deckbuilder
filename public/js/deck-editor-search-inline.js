// deck-editor-search-inline.js - Deck editor inline search
// Extracted from public/index.html

// ===== initializeDeckEditorSearch through addCardToDeckFromSearch =====

function initializeDeckEditorSearch() {
    if (window.deckEditorSearchComponent && typeof window.deckEditorSearchComponent.unmount === 'function') {
        try {
            window.deckEditorSearchComponent.unmount();
        } catch (e) { /* ignore */ }
        window.deckEditorSearchComponent = null;
    }

    const useMobile = typeof window.isLayoutMobile === 'function' && window.isLayoutMobile();
    const searchInput = document.getElementById(useMobile ? 'devMobileDeckSearchInput' : 'deckEditorSearchInput');
    const searchResults = document.getElementById(useMobile ? 'devMobileDeckSearchResults' : 'deckEditorSearchResults');
    if (!searchInput || !searchResults) {
        return;
    }

    if (window.DeckEditorSearch && window.CardSearchService) {
        const clickRoots = useMobile
            ? ['.dev-mobile-deck-search-container', '.deck-editor-search-container']
            : ['.deck-editor-search-container'];
        window.deckEditorSearchComponent = new window.DeckEditorSearch({
            input: searchInput,
            results: searchResults,
            maxResults: 72,
            clearInputOnSelect: !useMobile,
            clickInsideRootSelectors: clickRoots,
            searchService: new window.CardSearchService({ maxResults: 72 }),
            onSelect: (payload) => {
                const t = payload && payload.type;
                if (
                    t === 'mission-set' &&
                    payload.missionBulkIds &&
                    payload.missionBulkIds.length > 0 &&
                    typeof addMissionSetToDeckFromSearch === 'function'
                ) {
                    void addMissionSetToDeckFromSearch(
                        payload.missionSetName || payload.name,
                        payload.missionBulkIds
                    );
                } else if (typeof addCardToDeckFromSearch === 'function') {
                    addCardToDeckFromSearch(payload.id, payload.type, payload.name);
                }
            }
        });
        window.deckEditorSearchComponent.mount();
        return;
    }

    // Fallback to legacy wiring if component is unavailable
    searchInput.addEventListener('input', handleDeckEditorSearch);
    searchInput.addEventListener('blur', () => { setTimeout(() => { hideDeckEditorSearchResults(); }, 200); });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.deck-editor-search-container') && !e.target.closest('.dev-mobile-deck-search-container')) {
            hideDeckEditorSearchResults();
        }
    });
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
        const fetchList =
            typeof fetchCatalogList === 'function'
                ? fetchCatalogList
                : async (url) => {
                      try {
                          const r = await fetch(url);
                          const j = await r.json();
                          const responseOk = r.ok !== false;
                          const ok =
                              responseOk &&
                              j &&
                              Array.isArray(j.data) &&
                              j.success !== false &&
                              (!j.errors || j.errors.length === 0);
                          return { ok, rows: ok ? j.data : [] };
                      } catch {
                          return { ok: false, rows: [] };
                      }
                  };
        const [characters, specials, missions, events, aspects, advanced, teamwork, ally, training, basic, power, locations] = await Promise.all([
            fetchList('/api/v1/catalog/characters'),
            fetchList('/api/v1/catalog/special-cards'),
            fetchList('/api/v1/catalog/missions'),
            fetchList('/api/v1/catalog/events'),
            fetchList('/api/v1/catalog/aspects'),
            fetchList('/api/v1/catalog/advanced-universe'),
            fetchList('/api/v1/catalog/teamwork'),
            fetchList('/api/v1/catalog/ally-universe'),
            fetchList('/api/v1/catalog/training'),
            fetchList('/api/v1/catalog/basic-universe'),
            fetchList('/api/v1/catalog/power-cards'),
            fetchList('/api/v1/catalog/locations')
        ]);
        const st = term.toLowerCase();
        const add = (card, type, name, char) => {
            if (!name) return;
            const legacy =
                type === 'location'
                    ? `/src/resources/cards/images/locations/${card.image}`
                    : `/src/resources/cards/images/${card.image}`;
            let image = legacy;
            let fullImage = legacy;
            if (typeof getCardImagePath === 'function') {
                image = getCardImagePath(card, type, { useThumbnail: true }) || legacy;
                fullImage = getCardImagePath(card, type) || legacy;
            }
            results.push({ id: card.id, name, type, image, fullImage, character: char ?? null });
        };
        if (characters.ok) characters.rows.forEach(c => c.name?.toLowerCase().includes(st) && add(c, 'character', c.name, null));
        if (specials.ok) specials.rows.forEach(c => {
            const nm = c.name?.toLowerCase();
            const linked = (c.character || c.character_name || '');
            const ch = linked.toLowerCase();
            if (nm?.includes(st) || ch.includes(st) || ch === st || st === 'special') add(c, 'special', c.name, linked || null);
        });
        if (missions.ok) missions.rows.forEach(m => { const cn = m.card_name?.toLowerCase(); const ms = m.mission_set?.toLowerCase(); if (cn?.includes(st) || ms?.includes(st) || st === 'mission' || st === 'missions') add(m, 'mission', m.card_name, m.mission_set); });
        if (events.ok) events.rows.forEach(e => { const nm = e.name?.toLowerCase(); const ms = e.mission_set?.toLowerCase(); if (nm?.includes(st) || ms?.includes(st) || st === 'event' || st === 'events') add(e, 'event', e.name, e.mission_set); });
        if (aspects.ok) aspects.rows.forEach(a => a.card_name?.toLowerCase().includes(st) && add(a, 'aspect', a.card_name, null));
        if (advanced.ok) advanced.rows.forEach(c => { const nm = c.name?.toLowerCase(); const ch = c.character?.toLowerCase(); if (nm?.includes(st) || ch?.includes(st) || ch === st || st === 'advanced') add(c, 'advanced-universe', c.name, c.character); });
        if (teamwork.ok) {
            teamwork.rows.forEach(c => {
                const matchFn = typeof window.teamworkCardMatchesSearchTerm === 'function' && window.teamworkCardMatchesSearchTerm;
                const fmt = typeof window.formatTeamworkSearchDisplayName === 'function' && window.formatTeamworkSearchDisplayName;
                const matches = matchFn ? matchFn(c, st) : (c.to_use || c.name || '').toLowerCase().includes(st) || st === 'teamwork';
                if (!matches) return;
                const label = fmt ? fmt(c) : c.to_use || c.name;
                add(c, 'teamwork', label, c.character);
            });
        }
        if (ally.ok) ally.rows.forEach(c => (c.card_name?.toLowerCase().includes(st) || st === 'ally') && add(c, 'ally-universe', c.card_name, null));
        if (training.ok) training.rows.forEach(c => !c.is_foil && (c.card_name?.toLowerCase().includes(st) || st === 'training') && add(c, 'training', c.card_name, null));
        if (basic.ok) basic.rows.forEach(c => (c.card_name?.toLowerCase().includes(st) || st === 'basic') && add(c, 'basic-universe', c.card_name, null));
        if (power.ok) {
            power.rows.forEach(c => {
                const matchFn = typeof window.powerCardMatchesSearchTerm === 'function' && window.powerCardMatchesSearchTerm;
                const fmt = typeof window.formatPowerSearchDisplayName === 'function' && window.formatPowerSearchDisplayName;
                const matches = matchFn
                    ? matchFn(c, st)
                    : (c.power_type?.toLowerCase().includes(st) || st === 'power card');
                if (!matches) return;
                add(c, 'power', fmt ? fmt(c) : c.power_type, null);
            });
        }
        if (locations.ok) locations.rows.forEach(c => (c.name?.toLowerCase().includes(st) || st === 'location') && add(c, 'location', c.name, null));
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
            const preview = (card.image || '').replace(/'/g, "\\'");
            const hoverPath = (card.fullImage || card.imagePath || card.image_path || card.image || '').replace(
                /'/g,
                "\\'"
            );
            const escapedCardId = String(card.id || '').replace(/'/g, "\\'");
            const escapedCardType = String(card.type || '').replace(/'/g, "\\'");
            const typeLine =
                card.typeCaption != null && String(card.typeCaption).trim() !== ''
                    ? String(card.typeCaption)
                    : formatCardType(card.type);
            const isMissionSetBulk = card.type === 'mission-set';
            const bulkDataAttr = isMissionSetBulk
                ? ` data-mission-set-bulk="1" data-bulk-mission-ids="${encodeURIComponent(JSON.stringify(card.missionBulkIds || []))}"`
                : '';
            const clickAttr = isMissionSetBulk
                ? ''
                : ` onclick="addCardToDeckFromSearch('${String(card.id || '').replace(/'/g, "\\'")}', '${escapedCardType}', '${card.name.replace(/'/g, "\\'")}')"`;
            return `
            <div class="deck-editor-search-result"${bulkDataAttr}${clickAttr}
                 onmouseenter="showCardHoverModal('${hoverPath}', '${card.name.replace(/'/g, "\\'")}', '${escapedCardId}', '${escapedCardType}')"
                 onmouseleave="hideCardHoverModal()">
                <div class="deck-editor-search-result-image" style="background-image: url('${preview}')"></div>
                <div class="deck-editor-search-result-info">
                    <div class="deck-editor-search-result-name">${card.name}</div>
                    <div class="deck-editor-search-result-type">${typeLine}</div>
                    ${card.character ? `<div class="deck-editor-search-result-character">${card.character}</div>` : ''}
                </div>
            </div>
        `;
        }).join('');
        
        searchResults.innerHTML = htmlContent;
        searchResults.querySelectorAll('.deck-editor-search-result[data-mission-set-bulk]').forEach((el) => {
            el.addEventListener('click', () => {
                const raw = el.getAttribute('data-bulk-mission-ids');
                let ids = [];
                try {
                    ids = raw ? JSON.parse(decodeURIComponent(raw)) : [];
                } catch {
                    ids = [];
                }
                const rowName = el.querySelector('.deck-editor-search-result-name');
                const setName = rowName ? rowName.textContent : '';
                void addMissionSetToDeckFromSearch(setName, ids);
            });
        });
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

/** Resolve mission_set for a mission already in the deck (same path as removeUnusableEvents). */
function deckEditorMissionSetForCardId(cardId) {
    const normId = String(cardId ?? '').trim();
    const m = window.availableCardsMap && window.availableCardsMap.get(normId);
    if (!m || m.mission_set == null) return null;
    const s = String(m.mission_set).trim();
    return s || null;
}

/**
 * Add all missions from a set that are not already in the deck.
 * Aborts with an error if the deck already has any mission from a different mission_set.
 */
async function addMissionSetToDeckFromSearch(missionSetName, missionBulkIds) {
    const norm = (s) => String(s || '').trim();
    const target = norm(missionSetName);
    if (!target) {
        showToast('Invalid mission set', 'error');
        return;
    }
    if (!Array.isArray(missionBulkIds) || missionBulkIds.length === 0) {
        showToast('No missions in this set', 'info');
        return;
    }

    const deck = window.deckEditorCards;
    if (!Array.isArray(deck)) {
        showToast('Deck not loaded', 'error');
        return;
    }

    const missionRows = deck.filter((c) => c.type === 'mission');
    for (let i = 0; i < missionRows.length; i++) {
        const ms = deckEditorMissionSetForCardId(missionRows[i].cardId);
        if (ms && norm(ms) !== target) {
            const msg =
                'Your deck already has missions from a different set. Remove those missions before adding this mission set.';
            if (typeof showNotification === 'function') {
                showNotification(msg, 'error');
            } else {
                showToast(msg, 'error');
            }
            return;
        }
    }

    const normId = (id) => String(id ?? '').trim();
    const existing = new Set();
    missionRows.forEach((row) => {
        const id = normId(row.cardId);
        if (id && (row.quantity ?? 1) > 0) {
            existing.add(id);
        }
    });

    const idsToAdd = missionBulkIds.map(normId).filter((id) => id && !existing.has(id));
    if (idsToAdd.length === 0) {
        showToast('Already have all missions in this set', 'info');
        return;
    }

    const dismissSearchUi = () => {
        if (window.deckEditorSearchComponent && typeof window.deckEditorSearchComponent.dismissAfterSelection === 'function') {
            window.deckEditorSearchComponent.dismissAfterSelection();
        } else {
            const searchInput = document.getElementById('deckEditorSearchInput');
            const mIn = document.getElementById('devMobileDeckSearchInput');
            if (searchInput) searchInput.value = '';
            if (mIn) mIn.value = '';
            hideDeckEditorSearchResults();
        }
    };

    if (!currentDeckId) {
        if (typeof addCardToEditor !== 'function') {
            showToast('addCardToEditor function not found', 'error');
            return;
        }
        let fail = 0;
        for (let j = 0; j < idsToAdd.length; j++) {
            const mid = idsToAdd[j];
            const cd = window.availableCardsMap && window.availableCardsMap.get(mid);
            const nm = cd ? cd.card_name || cd.name || 'Mission' : 'Mission';
            try {
                await addCardToEditor('mission', mid, nm);
            } catch (e) {
                fail++;
                console.error('addCardToEditor mission bulk:', e);
                showToast(`Failed to add mission: ${nm}`, 'error');
            }
        }
        dismissSearchUi();
        if (fail === 0) {
            showToast(`Added ${idsToAdd.length} mission(s) from set`, 'success');
        } else if (fail < idsToAdd.length) {
            showToast(`Added ${idsToAdd.length - fail} mission(s); ${fail} failed`, 'error');
        }
        return;
    }

    const isGuestDeck = typeof currentDeckId === 'string' && currentDeckId.startsWith('guest_');
    const cardsUrl = isGuestDeck
        ? `/api/guest/decks/${currentDeckId}/cards`
        : `/api/v1/decks/${currentDeckId}/cards`;

    let ok = 0;
    let bad = 0;
    for (let k = 0; k < idsToAdd.length; k++) {
        const mid = idsToAdd[k];
        try {
            const response = await fetch(cardsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ cardId: mid, cardType: 'mission', quantity: 1 })
            });
            if (response.ok) {
                ok++;
            } else {
                bad++;
                try {
                    const err = await response.json();
                    showToast(err.error || `Failed to add mission`, 'error');
                } catch {
                    showToast('Failed to add a mission from the set', 'error');
                }
            }
        } catch (e) {
            bad++;
            console.error('Mission set bulk POST:', e);
            showToast('Network error adding mission', 'error');
        }
    }

    if (ok > 0) {
        await loadDeckForEditing(currentDeckId);
        setTimeout(() => {
            if (typeof forceCharacterSingleColumnLayout === 'function') {
                forceCharacterSingleColumnLayout();
            }
        }, 100);
    }

    dismissSearchUi();

    if (ok > 0 && bad === 0) {
        showToast(`Added ${ok} mission(s) from set`, 'success');
    } else if (ok > 0 && bad > 0) {
        showToast(`Added ${ok} mission(s); ${bad} failed`, 'error');
    } else {
        showToast('Could not add missions from set', 'error');
    }
}

/**
 * Guest deck editor URLs are canonical: /users/:userId/decks/:deckId.
 * Keep global currentDeckId aligned so POST /api/guest/decks/:id/cards matches the visible deck.
 */
function syncGuestCurrentDeckIdFromUrl() {
    try {
        const m = window.location.pathname.match(/\/users\/[^/]+\/decks\/([^/?#]+)/);
        if (!m) {
            return;
        }
        const urlDeckId = decodeURIComponent(m[1]);
        if (!urlDeckId.startsWith('guest_')) {
            return;
        }
        if (typeof currentDeckId !== 'string' || currentDeckId !== urlDeckId) {
            currentDeckId = urlDeckId;
        }
    } catch (_e) {
        /* ignore */
    }
}

// Add card to deck from search
async function addCardToDeckFromSearch(cardId, cardType, cardName) {
    // Read-only mode removed - now handled by backend flag
    syncGuestCurrentDeckIdFromUrl();

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
        
        if (window.deckEditorSearchComponent && typeof window.deckEditorSearchComponent.dismissAfterSelection === 'function') {
            window.deckEditorSearchComponent.dismissAfterSelection();
        } else {
            const searchInput = document.getElementById('deckEditorSearchInput');
            const mIn = document.getElementById('devMobileDeckSearchInput');
            if (searchInput) searchInput.value = '';
            if (mIn) mIn.value = '';
            hideDeckEditorSearchResults();
        }

        // Show success message
        showToast('Card added to deck!', 'success');
        return;
    }

    const normDeckCardId = (id) => String(id ?? '').trim();
    if (cardType === 'character' && Array.isArray(window.deckEditorCards)) {
        const dup = window.deckEditorCards.some(
            c => c.type === 'character' &&
                normDeckCardId(c.cardId) === normDeckCardId(cardId) &&
                (c.quantity ?? 1) > 0
        );
        if (dup) {
            if (typeof showNotification === 'function') {
                showNotification('This character is already in your deck', 'error');
            } else {
                showToast('This character is already in your deck', 'error');
            }
            return;
        }
    }
    if (cardType === 'location' && Array.isArray(window.deckEditorCards)) {
        const hasLoc = window.deckEditorCards.some(
            c => c.type === 'location' && (c.quantity ?? 1) > 0
        );
        if (hasLoc) {
            if (typeof showNotification === 'function') {
                showNotification('Cannot add more than 1 location to a deck', 'error');
            } else {
                showToast('Cannot add more than 1 location to a deck', 'error');
            }
            return;
        }
    }

    try {
        const requestBody = {
            cardId: cardId,
            cardType: cardType,
            quantity: 1
        };

        const isGuestDeck = typeof currentDeckId === 'string' && currentDeckId.startsWith('guest_');
        const cardsUrl = isGuestDeck
            ? `/api/guest/decks/${currentDeckId}/cards`
            : `/api/v1/decks/${currentDeckId}/cards`;

        const response = await fetch(cardsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            if (window.deckEditorSearchComponent && typeof window.deckEditorSearchComponent.dismissAfterSelection === 'function') {
                window.deckEditorSearchComponent.dismissAfterSelection();
            } else {
                const searchInput = document.getElementById('deckEditorSearchInput');
                const mIn = document.getElementById('devMobileDeckSearchInput');
                if (searchInput) searchInput.value = '';
                if (mIn) mIn.value = '';
                hideDeckEditorSearchResults();
            }

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
window.addMissionSetToDeckFromSearch = addMissionSetToDeckFromSearch;
