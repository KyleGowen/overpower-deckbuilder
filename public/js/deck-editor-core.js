// Deck Editor Core Functions
// Extracted from index.html for better modularity

function deckEditorControlsMenuUsesFixedPanelPlacement() {
    return (
        (typeof window.isLayoutMobile === 'function' && window.isLayoutMobile()) ||
        (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 480px)').matches)
    );
}

function positionDeckEditorControlsMenuPanel() {
    const toggle = document.getElementById('deckEditorControlsMenuToggle');
    const panel = document.getElementById('deckEditorControlsMenuPanel');
    if (!toggle || !panel) return;
    const useFixedPlacement = deckEditorControlsMenuUsesFixedPanelPlacement();
    if (!useFixedPlacement) {
        panel.style.removeProperty('top');
        panel.style.removeProperty('left');
        panel.style.removeProperty('visibility');
        return;
    }
    requestAnimationFrame(() => {
        const r = toggle.getBoundingClientRect();
        const pw = panel.offsetWidth;
        const ph = panel.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const gap = 8;
        const margin = 12;
        let left = r.right - pw;
        if (left < margin) {
            left = margin;
        }
        if (left + pw > vw - margin) {
            left = Math.max(margin, vw - pw - margin);
        }
        panel.style.left = `${Math.round(left)}px`;
        let top = r.bottom + gap;
        if (top + ph > vh - margin) {
            top = r.top - gap - ph;
        }
        if (top < margin) {
            top = margin;
        }
        if (top + ph > vh - margin) {
            top = Math.max(margin, vh - ph - margin);
        }
        panel.style.top = `${Math.round(top)}px`;
        panel.style.removeProperty('visibility');
    });
}

function setDeckEditorControlsMenuOpen(open) {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return;
    const root = document.querySelector('[data-deck-editor-controls-menu]');
    if (!root) return;
    const toggle = document.getElementById('deckEditorControlsMenuToggle');
    const panel = document.getElementById('deckEditorControlsMenuPanel');
    const backdrop = root.querySelector('.deck-editor-menu-backdrop');
    root.classList.toggle('deck-editor-controls-menu-open', !!open);
    if (toggle) {
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close deck editor menu' : 'Open deck editor menu');
    }
    if (panel) {
        if (open) {
            if (deckEditorControlsMenuUsesFixedPanelPlacement()) {
                panel.style.visibility = 'hidden';
            }
            panel.removeAttribute('hidden');
            positionDeckEditorControlsMenuPanel();
        } else {
            panel.style.removeProperty('top');
            panel.style.removeProperty('left');
            panel.style.removeProperty('visibility');
            panel.setAttribute('hidden', '');
        }
    }
    if (backdrop) {
        if (open) {
            backdrop.removeAttribute('hidden');
        } else {
            backdrop.setAttribute('hidden', '');
        }
    }
}

function closeDeckEditorControlsMenu() {
    setDeckEditorControlsMenuOpen(false);
}
window.closeDeckEditorControlsMenu = closeDeckEditorControlsMenu;

function initDeckEditorControlsMenu() {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return;
    const root = document.querySelector('[data-deck-editor-controls-menu]');
    if (!root || root.dataset.deckEditorMenuInit === '1') return;
    root.dataset.deckEditorMenuInit = '1';
    const toggle = document.getElementById('deckEditorControlsMenuToggle');
    const panel = document.getElementById('deckEditorControlsMenuPanel');
    const backdrop = root.querySelector('.deck-editor-menu-backdrop');
    if (!toggle || !panel || !backdrop) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = panel.hasAttribute('hidden');
        setDeckEditorControlsMenuOpen(willOpen);
    });

    backdrop.addEventListener('click', () => {
        setDeckEditorControlsMenuOpen(false);
    });

    panel.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-click-handler]');
        if (btn) {
            requestAnimationFrame(() => setDeckEditorControlsMenuOpen(false));
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (panel.hasAttribute('hidden')) return;
        setDeckEditorControlsMenuOpen(false);
    });

    document.addEventListener('mousedown', (e) => {
        if (panel.hasAttribute('hidden')) return;
        if (root.contains(e.target)) return;
        setDeckEditorControlsMenuOpen(false);
    });
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDeckEditorControlsMenu);
    } else {
        initDeckEditorControlsMenu();
    }
}

function revealDeckEditorExportImportButtons() {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    if (exportBtn) exportBtn.hidden = false;
    if (importBtn) importBtn.hidden = false;
}

function hideDeckEditorExportImportButtons() {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    if (exportBtn) exportBtn.hidden = true;
    if (importBtn) importBtn.hidden = true;
}

// Show deck editor modal
function showDeckEditor() {
    const mc = document.getElementById('mainContainer');
    if (mc) mc.style.display = 'block';
    try {
        const modal = document.getElementById('deckEditorModal');
        if (!modal) {
            console.error('deckEditorModal not found');
            return;
        }
        closeDeckEditorControlsMenu();
        modal.style.display = 'flex';
        modal.classList.add('modal-opening');
        requestAnimationFrame(() => {
            modal.classList.remove('modal-opening');
            modal.classList.add('modal-visible');
        });
        
        // Add body class for deck editor specific styling
        document.body.classList.add('deck-editor-active');
        
        // Show Export and Import buttons for all users (GUEST, USER, ADMIN)
        revealDeckEditorExportImportButtons();
        
        // Apply layout after paint (requestAnimationFrame avoids fixed delays)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const layout = document.querySelector('.deck-editor-layout');
                const deckPane = document.querySelector('.deck-pane');
                if (layout && deckPane) {
                    const layoutWidth = layout.offsetWidth;
                    const deckWidth = deckPane.offsetWidth;
                    const deckPercentage = (deckWidth / layoutWidth) * 100;
                    const onMobile =
                        typeof window.isLayoutMobile === 'function' && window.isLayoutMobile();
                    if (!onMobile && deckPercentage >= 33) {
                        const deckCardsEditor = document.querySelector('.deck-cards-editor');
                        if (deckCardsEditor && !manageDeckLayout('hasClass', { className: 'list-view' })) {
                            manageDeckLayout('addClass', { className: 'two-column' });
                            createTwoColumnLayout();
                        }
                    }
                }
            });
        });
        
        // Ensure the deck editor starts scrolled to the top
        requestAnimationFrame(() => {
            const deckCardsEditor = document.querySelector('.deck-cards-editor');
            if (deckCardsEditor) deckCardsEditor.scrollTop = 0;
        });
        
        // Set initial divider position immediately to prevent 50% flash
        const uiPrefs = currentDeckData
            ? (currentDeckData.ui_preferences || (currentDeckData.metadata && currentDeckData.metadata.ui_preferences))
            : null;
        
        // Default to 71% for deck pane (29% for available cards) for new decks
        const defaultPercentage = 71;
        const percentage = uiPrefs && uiPrefs.dividerPosition ? uiPrefs.dividerPosition : defaultPercentage;
        
        // Defer to after paint so layout is measurable (skip on MV — flex-basis px shrinks the pane)
        requestAnimationFrame(() => {
            if (typeof window.isLayoutMobile === 'function' && window.isLayoutMobile()) {
                return;
            }
            const layout = document.querySelector('.deck-editor-layout');
            const deckPane = document.querySelector('.deck-pane');
            if (layout && deckPane) {
                const newWidth = (percentage / 100) * layout.offsetWidth;
                deckPane.style.flex = `0 0 ${newWidth}px`;
            }
        });
        
        // Read-only mode removed - now handled by backend flag
        
        // Title is already set to the deck name, no need to override it
        
        // Hide/show Save button based on guest status and read-only mode
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
            } else if (isGuestUser()) {
                // Enable Save for guest users (saves to session-scoped guest decks only)
                saveButton.disabled = false;
                saveButton.style.opacity = '1';
                saveButton.style.cursor = 'pointer';
                saveButton.title = 'Save to session (not persisted after logout)';
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
        
        // Don't set up drag and drop immediately - wait for API response to determine read-only mode
        // setupDragAndDrop() will be called after loadDeckForEditing() completes
        
        // Initialize deck editor search
        initializeDeckEditorSearch();

        // MV: replace any desktop empty markup (e.g. from globalNav new-deck) with mobile empty state
        if (
            typeof window.isLayoutMobile === 'function' &&
            window.isLayoutMobile() &&
            typeof window.renderDeckEditorMobileView === 'function' &&
            (!window.deckEditorCards || window.deckEditorCards.length === 0)
        ) {
            window.renderDeckEditorMobileView();
        }
        
        // Initialize the resizable divider after modal paint
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                initializeResizableDivider();
                requestAnimationFrame(() => {
                    restoreSliderPosition();
                    const layout = document.querySelector('.deck-editor-layout');
                    const deckPane = document.querySelector('.deck-pane');
                    if (layout && deckPane) {
                        updateDeckLayout(deckPane.offsetWidth, layout.offsetWidth);
                    }
                    if (layout && window.getComputedStyle(layout).flexDirection !== 'row') {
                        ensureTwoPaneLayout();
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error in showDeckEditor:', error);
    }
}

// Load deck for editing
async function loadDeckForEditing(deckId, urlUserId = null, isReadOnly = false) {
    // Note: Read-only mode is now determined by API response and ownership checks below
    
    // Handle new deck creation
    if (deckId === 'new') {
        currentDeckId = null; // No ID until saved
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
        // Read-only mode removed - now handled by backend flag
        
        // Show the deck editor modal (use same fade-in as showDeckEditor)
        const newDeckModal = document.getElementById('deckEditorModal');
        closeDeckEditorControlsMenu();
        newDeckModal.style.display = 'flex';
        newDeckModal.classList.add('modal-opening');
        requestAnimationFrame(() => {
            newDeckModal.classList.remove('modal-opening');
            newDeckModal.classList.add('modal-visible');
        });
        revealDeckEditorExportImportButtons();
            
            // Ensure search component is initialized for new deck flow as well
            if (typeof initializeDeckEditorSearch === 'function') {
                try {
                    initializeDeckEditorSearch();
                } catch (err) {
                    console.error('Failed to initialize deck editor search for new deck:', err);
                }
            }
        
        // Load available cards in background - show editor immediately, panel populates when ready
        if (typeof loadAvailableCards === 'function') {
            loadAvailableCards().catch(error => {
                console.error('[DeckEditor] Error calling loadAvailableCards:', error);
            });
        } else {
            console.error('[DeckEditor] ❌ loadAvailableCards function not found!');
            console.error('[DeckEditor] Available functions:', Object.keys(window).filter(k => k.includes('load') || k.includes('card')));
        }
        
        // Update card count
        if (typeof updateDeckCardCount === 'function') {
            updateDeckCardCount();
        }
        
        // Update deck summary to set proper button states
        if (typeof updateDeckSummary === 'function') {
            updateDeckSummary(window.deckEditorCards);
        }
        
        // Set initial view based on user role for new decks
        await viewManager.applyInitialView();
        
        // Initialize background manager for new decks (all users)
        requestAnimationFrame(() => {
            requestAnimationFrame(async () => {
                if (window.deckBackgroundManager) {
                    try {
                        const currentUser = getCurrentUser();
                        if (currentUser) {
                            await window.deckBackgroundManager.loadBackgrounds();
                            window.deckBackgroundManager.createBackgroundButton();
                        }
                    } catch (error) {
                        console.error('Error initializing background manager for new deck:', error);
                    }
                }
            });
        });
        
        return;
    }

    // GUEST opening a database deck: clone to a session deck so edits never persist to DB
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const isGuest = currentUser && currentUser.role === 'GUEST';
    const isDbDeck = typeof deckId === 'string' && deckId.length > 0 && !deckId.startsWith('guest_');
    const isReadOnlyQuery = new URLSearchParams(window.location.search).get('readonly') === 'true';
    if (isGuest && isDbDeck && !isReadOnlyQuery) {
        try {
            const res = await fetch(`/api/v1/decks/${deckId}`, { credentials: 'include' });
            const json = await res.json();
            const guestClonePayload =
                typeof deckDetailPayload === 'function' ? deckDetailPayload(res, json) : null;
            if (!guestClonePayload || !guestClonePayload.ok || !guestClonePayload.deck) {
                const msg =
                    (json.errors && json.errors[0] && json.errors[0].message) ||
                    json.error ||
                    'Unknown error';
                showNotification('Could not load deck: ' + msg, 'error');
                return;
            }
            const deck = guestClonePayload.deck;
            const createRes = await fetch('/api/guest/decks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: deck.metadata?.name || deck.name || 'Copy of deck',
                    description: deck.metadata?.description || deck.description || ''
                })
            });
            const createData = await createRes.json();
            if (!createRes.ok || !createData.success || !createData.data || !createData.data.id) {
                showNotification('Could not create session copy: ' + (createData.error || 'Unknown error'), 'error');
                return;
            }
            const guestDeckId = createData.data.id;
            const cards = (deck.cards || []).map(function (c, i) {
                return {
                    cardType: c.type,
                    cardId: c.cardId,
                    quantity: c.quantity ?? 1,
                    exclude_from_draw: c.exclude_from_draw
                };
            });
            if (cards.length > 0) {
                const putRes = await fetch(`/api/guest/decks/${guestDeckId}/cards`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ cards: cards })
                });
                if (!putRes.ok) {
                    const errData = await putRes.json();
                    showNotification('Could not copy deck cards: ' + (errData.error || 'Unknown error'), 'error');
                    return;
                }
            }
            const userId = currentUser.userId || currentUser.id || 'guest';
            window.location.replace(`/users/${userId}/decks/${guestDeckId}`);
            return;
        } catch (err) {
            console.error('Error cloning deck to session for guest:', err);
            showNotification('Failed to open deck for editing', 'error');
            return;
        }
    }

    currentDeckId = deckId;
    const isGuestDeck = typeof deckId === 'string' && deckId.startsWith('guest_');
    const deckUrl = isGuestDeck ? `/api/guest/decks/${deckId}` : `/api/v1/decks/${deckId}`;
    try {
        const response = await fetch(deckUrl, {
            credentials: 'include'
        });
        const data = await response.json();
        let loadedDeck = null;
        if (isGuestDeck) {
            if (data.success && data.data) {
                loadedDeck = data.data;
            }
        } else if (typeof deckDetailPayload === 'function') {
            const detail = deckDetailPayload(response, data);
            if (detail.ok) {
                loadedDeck = detail.deck;
            }
        }

        if (loadedDeck) {
            currentDeckData = loadedDeck;
            window.currentDeckData = loadedDeck; // Also set on window for global access
            window.deckEditorCards = [...(loadedDeck.cards || [])]; // Create working copy
            
            // Load background immediately from deck data (before other initialization)
            if (window.deckBackgroundManager && currentDeckData.metadata) {
                window.deckBackgroundManager.setBackgroundFromDeckData(currentDeckData.metadata);
            }
            
            // Convert database type format to frontend format
            // Also detect if cardId is an alternate art and set selectedAlternateCardId accordingly
            window.deckEditorCards = window.deckEditorCards.map(card => {
                let convertedType = card.type;
                if (card.type === 'ally_universe') {
                    convertedType = 'ally-universe';
                } else if (card.type === 'basic_universe') {
                    convertedType = 'basic-universe';
                } else if (card.type === 'advanced_universe') {
                    convertedType = 'advanced-universe';
                }
                
                const convertedCard = { ...card, type: convertedType };
                if (
                    (convertedType === 'character' || convertedType === 'location') &&
                    (convertedCard.quantity ?? 1) > 1
                ) {
                    convertedCard.quantity = 1;
                }

                // Note: We'll process alternate art detection after availableCardsMap is loaded
                // This will be done in a separate step after loadAvailableCards completes

                return convertedCard;
            });
            
            // Determine read-only mode based on URL parameter and ownership
            const urlParams = new URLSearchParams(window.location.search);
            const isReadOnlyFromQuery = urlParams.get('readonly') === 'true';
            const isDeckOwner = loadedDeck.metadata && loadedDeck.metadata.isOwner === true;
            const isForcedReadOnlyMode = isReadOnlyFromQuery || !isDeckOwner;

            // Track forced read-only separately from user-triggered Preview mode
            window.isForcedReadOnlyMode = isForcedReadOnlyMode;
            window.isPreviewReadOnlyMode = false;
            
            if (isReadOnlyFromQuery) {
                // If readonly=true is in URL, always use read-only mode (regardless of ownership)
                isReadOnlyMode = true;
            } else if (loadedDeck.metadata && loadedDeck.metadata.isOwner !== undefined) {
                // Use API response for ownership-based read-only mode
                // Non-owners should always be in read-only mode
                isReadOnlyMode = !loadedDeck.metadata.isOwner;
            } else {
                // Fallback: if no ownership info, assume read-only for safety
                isReadOnlyMode = true;
            }
            
            // Update the body class to reflect the correct read-only mode
            if (isReadOnlyMode) {
                document.body.classList.add('read-only-mode');
            } else {
                document.body.classList.remove('read-only-mode');
            }

            // Keep layout stable in Preview mode; only collapse panes for forced read-only
            document.body.classList.toggle('forced-read-only-mode', !!window.isForcedReadOnlyMode);
            document.body.classList.remove('preview-read-only-mode');
            
            // Update Read-Only badge visibility
            updateReadOnlyBadge();
            
            // Update Save button state based on read-only mode
            updateSaveButtonState();

            // Update Preview button state (hide when forced read-only)
            if (typeof window.updatePreviewButtonState === 'function') {
                window.updatePreviewButtonState();
            }

            // Update Background button state if present (disable in read-only)
            if (typeof window.updateBackgroundButtonState === 'function') {
                window.updateBackgroundButtonState();
            }
            
            // Now set up drag and drop based on the correct read-only mode
            setupDragAndDrop();
            
            // Validate and fix location count (max 1 location allowed)
            const locationCards = window.deckEditorCards.filter(card => card.type === 'location');
            if (locationCards.length > 1) {
                // Keep only the first location card
                const firstLocationIndex = window.deckEditorCards.findIndex(card => card.type === 'location');
                window.deckEditorCards = window.deckEditorCards.filter((card, index) => 
                    card.type !== 'location' || index === firstLocationIndex
                );
                showNotification(`Removed ${locationCards.length - 1} extra location card(s) - only 1 location allowed per deck`, 'warning');
            }
            
            // Set limited state from loaded deck
            isDeckLimited = currentDeckData.metadata.is_limited || false;
            
            // Update modal title
            document.getElementById('deckEditorTitle').textContent = currentDeckData.metadata.name;
            
            // Update deck title validation
            updateDeckTitleValidation(currentDeckData.cards || []);
            
            // Load available cards first, then display deck cards
            if (typeof loadAvailableCards === 'function') {
                try {
                    await loadAvailableCards();
                } catch (error) {
                    console.error('[DeckEditor] Error calling loadAvailableCards:', error);
                    console.error('[DeckEditor] Error stack:', error.stack);
                }
            } else {
                console.error('[DeckEditor] ❌ loadAvailableCards function not found!');
            }
            
            // After available cards are loaded, process deck cards to detect alternate art selections
            // If a cardId is an alternate art card, find the base card and set selectedAlternateCardId
            if (window.availableCardsMap && window.deckEditorCards) {
                window.deckEditorCards = window.deckEditorCards.map(card => {
                    // Check if this cardId corresponds to an alternate art card
                    const cardData = window.availableCardsMap.get(card.cardId);
                    if (!cardData) {
                        console.warn('[DeckEditor] Card not found in availableCardsMap:', card.cardId);
                        return card;
                    }
                    
                    // Check if this is an alternate art by checking image path
                    const imagePath = cardData.image_path || cardData.image || '';
                    const isAlternateArt = imagePath && imagePath.includes('/alternate/');
                    
                    if (isAlternateArt) {
                        // This cardId is an alternate art, find the base card
                        let baseCardId = null;
                        let baseCard = null;
                        
                        // Find base card by searching for cards with same name/universe but non-alternate image
                        if (card.type === 'character') {
                            const name = (cardData.name || '').trim();
                            const set = (cardData.set || 'ERB').trim() || 'ERB';
                            
                            window.availableCardsMap.forEach((candidateCard, candidateId) => {
                                const candidateType = candidateCard.cardType || candidateCard.type || '';
                                if ((candidateType === 'character' || candidateId.startsWith('char_')) &&
                                    (candidateCard.name || '').trim() === name &&
                                    (candidateCard.set || 'ERB').trim() === set) {
                                    const candidateImagePath = candidateCard.image_path || candidateCard.image || '';
                                    if (!candidateImagePath.includes('/alternate/')) {
                                        baseCardId = candidateId;
                                        baseCard = candidateCard;
                                    }
                                }
                            });
                        } else if (card.type === 'special') {
                            const name = (cardData.name || '').trim();
                            const characterName = (cardData.character_name || '').trim();
                            const universe = (cardData.universe || 'ERB').trim() || 'ERB';
                            
                            window.availableCardsMap.forEach((candidateCard, candidateId) => {
                                const candidateType = candidateCard.cardType || candidateCard.type || '';
                                if ((candidateType === 'special' || candidateId.startsWith('special_')) &&
                                    (candidateCard.name || '').trim() === name &&
                                    (candidateCard.character_name || '').trim() === characterName &&
                                    (candidateCard.universe || 'ERB').trim() === universe) {
                                    const candidateImagePath = candidateCard.image_path || candidateCard.image || '';
                                    if (!candidateImagePath.includes('/alternate/')) {
                                        baseCardId = candidateId;
                                        baseCard = candidateCard;
                                    }
                                }
                            });
                        } else if (card.type === 'power') {
                            const value = String(cardData.value || '').trim();
                            const powerType = (cardData.power_type || '').trim();
                            
                            window.availableCardsMap.forEach((candidateCard, candidateId) => {
                                const candidateType = candidateCard.cardType || candidateCard.type || '';
                                if ((candidateType === 'power' || candidateId.startsWith('power_')) &&
                                    String(candidateCard.value || '').trim() === value &&
                                    (candidateCard.power_type || '').trim() === powerType) {
                                    const candidateImagePath = candidateCard.image_path || candidateCard.image || '';
                                    if (!candidateImagePath.includes('/alternate/')) {
                                        baseCardId = candidateId;
                                        baseCard = candidateCard;
                                    }
                                }
                            });
                        }
                        
                        if (baseCardId && baseCard) {
                            // Found base card, set selectedAlternateCardId to the alternate card ID
                            return {
                                ...card,
                                cardId: baseCardId, // Use base card ID for grouping
                                selectedAlternateCardId: card.cardId, // Store alternate card ID as selected
                                // For quantity > 1, initialize selectedAlternateCardIds array
                                selectedAlternateCardIds: card.quantity > 1 ? Array(card.quantity).fill(card.cardId) : undefined
                            };
                        } else {
                            // Could not find base card - this might mean the cardId IS the base card
                            // or it's an alternate art but we can't find the base
                            // In this case, keep the cardId as-is but still set selectedAlternateCardId
                            // This handles edge cases where alternate arts might not have a clear base
                            // Still set selectedAlternateCardId to indicate this is the selected art
                            // The cardId might already be correct (alternate art card ID)
                            return {
                                ...card,
                                selectedAlternateCardId: card.cardId, // Mark as selected
                                selectedAlternateCardIds: card.quantity > 1 ? Array(card.quantity).fill(card.cardId) : undefined
                            };
                        }
                    }
                    
                    return card;
                });
                
                // Consolidate multiple entries for the same base card with different alternate arts
                // Only consolidate if there are actually multiple entries for the same base card
                // Group by base cardId (after alternate art detection) and type
                const cardGroups = new Map();
                
                window.deckEditorCards.forEach(card => {
                    const key = `${card.type}_${card.cardId}`;
                    if (!cardGroups.has(key)) {
                        cardGroups.set(key, []);
                    }
                    cardGroups.get(key).push(card);
                });
                
                // Only consolidate if there are multiple entries for the same base card
                const needsConsolidation = Array.from(cardGroups.values()).some(group => group.length > 1);
                
                if (needsConsolidation) {
                    const consolidatedCards = new Map();
                    
                    cardGroups.forEach((group, key) => {
                        if (group.length === 1) {
                            // Single entry, no consolidation needed - just ensure selectedAlternateCardIds is set if needed
                            const card = group[0];
                            const alternateId = card.selectedAlternateCardId || card.cardId;
                            
                            if (card.quantity > 1 && !card.selectedAlternateCardIds) {
                                // Initialize array if quantity > 1
                                card.selectedAlternateCardIds = Array(card.quantity).fill(alternateId);
                                card.selectedAlternateCardId = undefined; // Clear single ID when using array
                            } else if (card.quantity === 1 && !card.selectedAlternateCardId && alternateId !== card.cardId) {
                                // Set selectedAlternateCardId if we have an alternate
                                card.selectedAlternateCardId = alternateId;
                            }
                            
                            consolidatedCards.set(key, card);
                        } else {
                            // Multiple entries - consolidate them
                            const firstCard = group[0];
                            const consolidated = {
                                ...firstCard,
                                quantity: 0,
                                selectedAlternateCardIds: []
                            };
                            
                            group.forEach(entry => {
                                consolidated.quantity += entry.quantity;
                                const alternateId = entry.selectedAlternateCardId || entry.cardId;
                                
                                // Add alternate ID for each instance
                                for (let i = 0; i < entry.quantity; i++) {
                                    consolidated.selectedAlternateCardIds.push(alternateId);
                                }
                            });
                            
                            // Set selectedAlternateCardId only if quantity is 1
                            if (consolidated.quantity === 1 && consolidated.selectedAlternateCardIds.length > 0) {
                                consolidated.selectedAlternateCardId = consolidated.selectedAlternateCardIds[0];
                            } else {
                                consolidated.selectedAlternateCardId = undefined;
                            }
                            
                            consolidatedCards.set(key, consolidated);
                        }
                    });
                    
                    window.deckEditorCards = Array.from(consolidatedCards.values());
                } else {
                    // No consolidation needed, but ensure selectedAlternateCardId is set correctly
                    window.deckEditorCards = window.deckEditorCards.map(card => {
                        if (card.selectedAlternateCardId) {
                            // Already set, ensure selectedAlternateCardIds is initialized if quantity > 1
                            if (card.quantity > 1 && !card.selectedAlternateCardIds) {
                                card.selectedAlternateCardIds = Array(card.quantity).fill(card.selectedAlternateCardId);
                                card.selectedAlternateCardId = undefined;
                            }
                        }
                        return card;
                    });
                }
            }
            
            // Display deck cards after available cards are loaded
            // Apply the initial view based on user role (set during ViewManager.initialize())
            await viewManager.applyInitialView();
            
            // Ensure scroll container can show all content after deck is displayed
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ensureScrollContainerCanShowAllContent();
                    const collapsedHeaders = document.querySelectorAll('.deck-type-header.collapsed');
                    collapsedHeaders.forEach(header => {
                        ensureCollapsedHeaderIsVisible(header);
                    });
                });
            });
            
            // Use UI preferences from deck metadata when present (avoids redundant fetch)
            const existingPrefs = currentDeckData?.metadata?.uiPreferences;
            const uiPreferences = existingPrefs !== undefined ? (existingPrefs ?? {}) : await loadUIPreferences(deckId);
            applyUIPreferences(uiPreferences ?? {});
            
            // Force character cards to single column layout after paint
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    forceCharacterSingleColumnLayout();
                });
            });
            
            // Also run it immediately as a backup
            forceCharacterSingleColumnLayout();
            
            // Set up layout observer if in list view
            const deckCardsEditor = document.getElementById('deckCardsEditor');
            if (deckCardsEditor && deckCardsEditor.classList.contains('list-view')) {
                setupLayoutObserver();
            }
            
            // Initialize background manager without delay to avoid header control flicker
            if (window.deckBackgroundManager && currentDeckId) {
                try {
                    // Pass metadata to skip redundant deck fetch (already loaded above)
                    await window.deckBackgroundManager.initialize(currentDeckId, isReadOnlyMode, currentDeckData?.metadata);
                } catch (error) {
                    console.error('Error initializing background manager:', error);
                }
            }
            
            // Update card count
            updateDeckEditorCardCount();
            revealDeckEditorExportImportButtons();
            
            // Auto-activate special cards character filter if deck has characters
            const hasCharacters = window.deckEditorCards.some(card => card.type === 'character');
            if (hasCharacters) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(async () => {
                        const filterCheckbox = document.getElementById('specialCardsCharacterFilter');
                        if (filterCheckbox && !filterCheckbox.checked) {
                            filterCheckbox.checked = true;
                            await toggleSpecialCardsCharacterFilter();
                        }
                    });
                });
            }
            
            // Re-apply advanced universe filter now that deck characters are loaded
            requestAnimationFrame(() => {
                requestAnimationFrame(async () => {
                    const advFilterCheckbox = document.getElementById('advancedUniverseCharacterFilter');
                    if (advFilterCheckbox && advFilterCheckbox.checked) {
                        await toggleAdvancedUniverseCharacterFilter();
                    }
                });
            });
        } else {
            const errMsg =
                (data.errors && data.errors[0] && data.errors[0].message) || data.error || 'Unknown error';
            console.error('Failed to load deck for editing:', errMsg);
            showNotification('Deck not found or access denied: ' + errMsg, 'error');
            
            // Redirect to user's deck list if deck doesn't exist or access denied
            const currentUser = getCurrentUser();
            if (currentUser) {
                setTimeout(() => {
                    window.location.href = `/users/${currentUser.userId || currentUser.id}/decks`;
                }, 2000);
            } else {
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
            return;
        }
    } catch (error) {
        console.error('❌ Error loading deck for editing:', error);
        showNotification('Failed to load deck for editing', 'error');
        
        // Redirect to user's deck list on network errors too
        const currentUser = getCurrentUser();
        if (currentUser) {
            setTimeout(() => {
                window.location.href = `/users/${currentUser.userId || currentUser.id}/decks`;
            }, 2000);
        } else {
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
        return;
    }
}

/**
 * Serialize window.deckEditorCards to the API shape used by PUT .../cards (same as save).
 */
function buildDeckCardsDataForApi() {
    const cardsData = [];
    if (!window.deckEditorCards || !Array.isArray(window.deckEditorCards)) {
        return cardsData;
    }
    const extractUUID = (cardId) => {
        if (!cardId) return null;
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(cardId)) return cardId;
        const prefixedMatch = cardId.match(/^[a-z]+_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
        if (prefixedMatch && prefixedMatch[1]) return prefixedMatch[1];
        const parts = cardId.split('_');
        for (let i = 1; i < parts.length; i++) {
            const candidate = parts.slice(i).join('_');
            if (uuidPattern.test(candidate)) return candidate;
        }
        return cardId;
    };
    window.deckEditorCards.forEach(card => {
        const hasPerInstanceSelections = card.selectedAlternateCardIds && Array.isArray(card.selectedAlternateCardIds) && card.selectedAlternateCardIds.length > 0 && card.selectedAlternateCardIds.some(id => id !== undefined && id !== null);
        if (hasPerInstanceSelections && card.quantity > 1) {
            for (let i = 0; i < card.quantity; i++) {
                const rawCardIdForInstance = (card.selectedAlternateCardIds[i] !== undefined && card.selectedAlternateCardIds[i] !== null) ? card.selectedAlternateCardIds[i] : (card.selectedAlternateCardId || card.cardId);
                const instanceData = { cardType: card.type, cardId: extractUUID(rawCardIdForInstance), quantity: 1 };
                if (card.exclude_from_draw !== undefined) instanceData.exclude_from_draw = card.exclude_from_draw;
                cardsData.push(instanceData);
            }
        } else {
            const rawCardIdToSave = card.selectedAlternateCardId || card.cardId;
            const cardData = { cardType: card.type, cardId: extractUUID(rawCardIdToSave), quantity: card.quantity };
            if (card.exclude_from_draw !== undefined) cardData.exclude_from_draw = card.exclude_from_draw;
            cardsData.push(cardData);
        }
    });
    return cardsData;
}

/**
 * Push current editor cards to the server so single-card POST (e.g. search add) matches the UI.
 * Used after remove/remove-one on persisted DB or guest session decks.
 */
async function syncPersistedDeckCardsFromEditor() {
    if (!currentDeckId || document.body.classList.contains('read-only-mode')) {
        return true;
    }
    const deckId = currentDeckId;
    const cards = buildDeckCardsDataForApi();
    const isGuest = typeof isGuestUser === 'function' && isGuestUser() && String(deckId).startsWith('guest_');
    const url = isGuest ? `/api/guest/decks/${deckId}/cards` : `/api/v1/decks/${deckId}/cards`;
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ cards })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showNotification(err.error || 'Failed to sync deck to server', 'error');
            return false;
        }
        return true;
    } catch (e) {
        console.error('syncPersistedDeckCardsFromEditor', e);
        showNotification('Failed to sync deck to server', 'error');
        return false;
    }
}

window.buildDeckCardsDataForApi = buildDeckCardsDataForApi;
window.syncPersistedDeckCardsFromEditor = syncPersistedDeckCardsFromEditor;

// Save deck changes
async function saveDeckChanges() {
    if (!currentDeckData) {
        console.error('❌ Cannot save - no deck data loaded');
        return;
    }
    
    // SECURITY: Check if deck exists before attempting to save
    if (currentDeckId && !currentDeckData.metadata?.id) {
        console.error('🔒 SECURITY: Cannot save - deck does not exist or is invalid');
        showNotification('Cannot save: Deck not found or invalid', 'error');
        
        // Redirect to user's deck list
        const currentUser = getCurrentUser();
        if (currentUser) {
            setTimeout(() => {
                window.location.href = `/users/${currentUser.userId || currentUser.id}/decks`;
            }, 2000);
        }
        return;
    }
    
    // SECURITY: Check for read-only mode first
    if (document.body.classList.contains('read-only-mode')) {
        alert('Cannot save changes in read-only mode.');
        return;
    }

    const isGuest = typeof isGuestUser === 'function' && isGuestUser();

    const cardsData = buildDeckCardsDataForApi();

    const parseApiErrorResponse = async (response) => {
        const fallbackMessage = `Failed to save deck cards: ${response.status} ${response.statusText}`;
        const raw = await response.text();
        if (!raw) {
            return fallbackMessage;
        }
        try {
            const responseBody = JSON.parse(raw);
            const v1Msg = responseBody?.errors?.[0]?.message;
            if (v1Msg) {
                return v1Msg;
            }
            const specificMessage = responseBody?.error || responseBody?.details;
            if (specificMessage) {
                return specificMessage;
            }
        } catch (parseError) {
            console.warn('[saveDeckChanges] Failed to parse error response as JSON:', parseError);
        }
        return raw.length > 200 ? `${raw.slice(0, 200)}...` : raw;
    };

    try {
        let deckId = currentDeckId;

        if (isGuest) {
            if (!deckId) {
                const createResponse = await fetch('/api/guest/decks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: currentDeckData.metadata.name,
                        description: currentDeckData.metadata.description || ''
                    })
                });
                const createData = await createResponse.json();
                if (!createResponse.ok || !createData.success) {
                    throw new Error(createData.error || 'Failed to create guest deck');
                }
                deckId = createData.data.id;
                currentDeckId = deckId;
                currentDeckData.metadata.id = deckId;
                currentDeckData.metadata.created = createData.data.created_at;
                currentDeckData.metadata.lastModified = createData.data.updated_at;
                const userId = getCurrentUser() ? (getCurrentUser().userId || getCurrentUser().id) : 'guest';
                window.history.pushState({ deckId, userId }, '', `/users/${userId}/decks/${deckId}`);
            }
            const cardsEndpoint = `/api/guest/decks/${deckId}/cards`;
            const replaceResponse = await fetch(cardsEndpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ cards: cardsData })
            });
            if (!replaceResponse.ok) {
                const errData = await replaceResponse.json();
                throw new Error(errData.error || 'Failed to save guest deck cards');
            }
            if (typeof saveDeckExpansionState === 'function') saveDeckExpansionState();
            if (typeof showNotification === 'function') showNotification('Guest deck saved (session only)', 'success');
            return;
        }

        // Non-guest: use main deck API
        if (!deckId) {
            const createResponse = await fetch('/api/v1/decks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: currentDeckData.metadata.name,
                    description: currentDeckData.metadata.description || '',
                    ui_preferences: currentDeckData.ui_preferences
                })
            });
            
            const createPayload = await createResponse.json();
            if (!createResponse.ok || (createPayload.errors && createPayload.errors.length)) {
                const msg =
                    (createPayload.errors && createPayload.errors[0] && createPayload.errors[0].message) ||
                    createPayload.error ||
                    'Failed to create deck';
                throw new Error(msg);
            }
            
            // Update the deck ID and data with the response (v1 envelope: data = created deck)
            const created = createPayload.data;
            deckId = created.id;
            currentDeckId = deckId;
            currentDeckData.metadata.id = deckId;
            currentDeckData.metadata.created = created.created_at;
            currentDeckData.metadata.lastModified = created.updated_at;
            
            // Update URL to include the new deck ID for sharing
            const currentUser = getCurrentUser();
            const userId = currentUser ? (currentUser.userId || currentUser.id || 'guest') : 'guest';
            const newUrl = `/users/${userId}/decks/${currentDeckId}`;
            window.history.pushState({ deckId: currentDeckId, userId }, '', newUrl);
            
        }

        console.log('💾 [saveDeckChanges] Prepared cards data:', {
            totalCards: cardsData.length,
            cards: cardsData.map(c => ({ type: c.cardType, id: c.cardId, qty: c.quantity }))
        });
        
        // Bulk replace all cards in one atomic operation
        const cardsEndpoint = `/api/v1/decks/${deckId}/cards`;
        console.log('💾 [saveDeckChanges] Saving cards to endpoint:', cardsEndpoint);
        console.log('💾 [saveDeckChanges] deckId:', deckId, 'currentDeckId:', currentDeckId);
        
        const replaceResponse = await fetch(cardsEndpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ cards: cardsData })
        });
        
        if (!replaceResponse.ok) {
            const saveErrorMessage = await parseApiErrorResponse(replaceResponse);
            console.error('💾 [saveDeckChanges] Failed to save deck cards:', {
                status: replaceResponse.status,
                statusText: replaceResponse.statusText,
                error: saveErrorMessage,
                endpoint: cardsEndpoint
            });
            throw new Error(saveErrorMessage);
        }
        
        // Check validation status before saving
        const validation = validateDeck(window.deckEditorCards);
        const isDeckValid = validation.errors.length === 0;
        
        // Update reserve_character to use alternate card ID if the reserved character has alternate art selected
        let reserveCharacterToSave = currentDeckData.metadata.reserve_character;
        if (reserveCharacterToSave) {
            // Helper function to extract UUID from cardId (removes prefixes like "character_")
            const extractUUID = (cardId) => {
                if (!cardId) return null;
                
                // First check if it's already a pure UUID (matches UUID pattern exactly)
                const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidPattern.test(cardId)) {
                    return cardId;
                }
                
                // If it has a prefix like "character_", extract the UUID part
                // Pattern: "character_" followed by UUID
                const prefixedMatch = cardId.match(/^[a-z]+_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
                if (prefixedMatch && prefixedMatch[1]) {
                    return prefixedMatch[1];
                }
                
                // Try splitting by underscore and checking if any part is a UUID
                const parts = cardId.split('_');
                for (let i = 1; i < parts.length; i++) {
                    const candidate = parts.slice(i).join('_');
                    if (uuidPattern.test(candidate)) {
                        return candidate;
                    }
                }
                
                // If no UUID pattern found, return as-is (might be a legacy ID)
                return cardId;
            };
            
            // Normalize the reserve_character ID (remove prefix if present)
            reserveCharacterToSave = extractUUID(reserveCharacterToSave);
            
            // Find the character card that matches the reserve_character ID (compare normalized)
            const reservedCharacterCard = window.deckEditorCards.find(card => {
                if (card.type !== 'character') return false;
                const normalizedCardId = extractUUID(card.cardId);
                return normalizedCardId === reserveCharacterToSave || card.cardId === reserveCharacterToSave;
            });
            
            if (reservedCharacterCard) {
                // If this character has alternate art selected, use the alternate card ID
                const alternateCardId = reservedCharacterCard.selectedAlternateCardId || 
                                      (reservedCharacterCard.selectedAlternateCardIds && reservedCharacterCard.selectedAlternateCardIds[0]) ||
                                      null;
                
                if (alternateCardId) {
                    // Normalize alternate card ID as well
                    const normalizedAlternateId = extractUUID(alternateCardId);
                    if (normalizedAlternateId && normalizedAlternateId !== reserveCharacterToSave) {
                        console.log('💾 [saveDeckChanges] Updating reserve_character to use alternate art:', {
                            baseCardId: reserveCharacterToSave,
                            alternateCardId: normalizedAlternateId
                        });
                        reserveCharacterToSave = normalizedAlternateId;
                    }
                }
            } else {
                // Reserve character not found in deck - might have been removed
                // Check if it matches any alternate card IDs (normalized)
                for (const card of window.deckEditorCards) {
                    if (card.type === 'character') {
                        const normalizedCardId = extractUUID(card.cardId);
                        const normalizedAlternateId = card.selectedAlternateCardId ? extractUUID(card.selectedAlternateCardId) : null;
                        
                        if (normalizedAlternateId === reserveCharacterToSave || normalizedCardId === reserveCharacterToSave ||
                            (card.selectedAlternateCardIds && card.selectedAlternateCardIds.some(id => extractUUID(id) === reserveCharacterToSave))) {
                            // Reserve character matches an alternate card ID, keep it as-is
                            console.log('💾 [saveDeckChanges] Reserve character matches alternate card ID, keeping:', reserveCharacterToSave);
                            break;
                        }
                    }
                }
            }
        }
        
        // Save deck metadata (name, is_limited, is_valid, reserve_character, display_mission_card_id, and background_image_path)
        const backgroundPath = window.deckBackgroundManager ? window.deckBackgroundManager.getSelectedBackground() : null;
        console.log('Saving deck with background_image_path:', backgroundPath);
        console.log('deckBackgroundManager exists:', !!window.deckBackgroundManager);
        console.log('currentDeckId:', currentDeckId);
        console.log('💾 [saveDeckChanges] Saving reserve_character:', reserveCharacterToSave);
        
        const updateResponse = await fetch(`/api/v1/decks/${currentDeckId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                name: currentDeckData.metadata.name,
                description: '',
                is_limited: isDeckLimited,
                is_valid: isDeckValid,
                reserve_character: reserveCharacterToSave,
                display_mission_card_id: currentDeckData.metadata.display_mission_card_id || null,
                background_image_path: backgroundPath
            })
        });
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Failed to update deck metadata:', errorText);
            throw new Error('Failed to update deck metadata');
        }
        
        const updateResult = await updateResponse.json();
        console.log('Deck update response:', updateResult);
        
        // Update background manager after save (v1 envelope)
        const updateDetail =
            typeof deckDetailPayload === 'function'
                ? deckDetailPayload(updateResponse, updateResult)
                : null;
        if (updateDetail && updateDetail.ok && window.deckBackgroundManager) {
            const savedBackground = updateDetail.deck.metadata?.background_image_path;
            if (savedBackground !== undefined) {
                window.deckBackgroundManager.updateSelectedBackground(savedBackground);
            }
        }
        
        // Save expansion state
        saveDeckExpansionState();
        
        // Save UI preferences to database
        const preferences = getCurrentUIPreferences();
        await saveUIPreferences(currentDeckId, preferences);
        
        // Show appropriate notification based on validation status
        if (isDeckValid) {
            showNotification('Deck changes saved successfully!', 'success');
        } else {
            showNotification('Deck saved with validation errors - not legal for tournament play', 'warning');
        }
        
        // Don't close the editor - just refresh the deck list
        loadDecks();
        
    } catch (error) {
        console.error('Error saving deck changes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save deck changes';
        showNotification(errorMessage, 'error');
    }
}

// Export deck as JSON (Available to all users)
// Function moved to deck-export.js component module
// Access via window.exportDeckAsJson() or import from deck-export.js

// Import deck from JSON (Available to all users)
// Function moved to deck-export.js component module
// Access via window.importDeckFromJson() or import from deck-export.js








// Close deck editor modal
async function closeDeckEditor() {
    closeDeckEditorControlsMenu();
    hideDeckEditorExportImportButtons();
    if (typeof closeDevMobileDeckActionsSheet === 'function') {
        closeDevMobileDeckActionsSheet();
    }
    // Close draw hand pane first to clear any drawn cards
    closeDrawHand();
    
    // Save UI preferences before closing
    if (currentDeckId) {
        const preferences = getCurrentUIPreferences();
        await saveUIPreferences(currentDeckId, preferences);
    }
    
    const modal = document.getElementById('deckEditorModal');
    const deckBuilderBtn = document.getElementById('deckBuilderBtn');
    const isAlreadyInDeckBuilder = deckBuilderBtn && deckBuilderBtn.classList.contains('active');
    
    // Fade out, then hide
    modal.classList.remove('modal-visible');
    modal.addEventListener('transitionend', function onTransitionEnd() {
        modal.removeEventListener('transitionend', onTransitionEnd);
        modal.style.display = 'none';
    }, { once: true });
    
    // Remove body class for deck editor specific styling
    document.body.classList.remove('deck-editor-active');
    
    currentDeckId = null;
    currentDeckData = null;
    window.deckEditorCards = [];
    
    // Always reset URL to remove the deck ID — prevents stale deck URLs on hard refresh
    const closingUser = getCurrentUser();
    const closingUserId = closingUser ? (closingUser.userId || closingUser.id) : 'guest';
    history.replaceState({view: 'deckbuilder'}, '', `/users/${closingUserId}/decks`);

    // Only do DOM work if not already in deck builder (avoids redundant DOM updates and flash)
    if (!isAlreadyInDeckBuilder && typeof switchToDeckBuilder === 'function') {
        switchToDeckBuilder();
    }
}

// Export Overlay Functions
// Functions moved to deck-export.js component module
// Access via window.showExportOverlay(), window.closeExportOverlay(), window.copyJsonToClipboard()
// or import from deck-export.js


// Export Overlay Functions
// Functions moved to deck-export.js component module
// Access via window.showExportOverlay(), window.closeExportOverlay(), window.copyJsonToClipboard()
// or import from deck-export.js

// ========================================
// Deck Editor Preview Mode (in-place)
// ========================================

function updatePreviewButtonState() {
    const previewBtn = document.getElementById('previewBtn');
    if (!previewBtn) return;
    
    const forced = !!window.isForcedReadOnlyMode;
    const preview = !!window.isPreviewReadOnlyMode;
    
    // If the deck is truly read-only (non-owner or readonly=true), hide the Preview toggle.
    if (forced) {
        previewBtn.style.display = 'none';
        return;
    }
    
    previewBtn.style.display = 'flex';
    const previewLabel = previewBtn.querySelector('.deck-editor-menu-item-label');
    if (previewLabel) {
        previewLabel.textContent = preview ? 'Edit' : 'Preview';
    } else {
        previewBtn.textContent = preview ? 'Edit' : 'Preview';
    }
    previewBtn.title = preview ? 'Exit preview (edit mode)' : 'Preview deck (read-only)';
    previewBtn.classList.toggle('preview-active', preview);
}

function updateBackgroundButtonState() {
    const backgroundBtn = document.getElementById('backgroundBtn');
    if (!backgroundBtn) return;
    
    // Disable only when deck is forced read-only (non-owner or readonly URL).
    // Preserve availability gating from deck-background.js (loading/unavailable states).
    const isForcedReadOnly = !!window.isForcedReadOnlyMode;
    const hasBackgroundsFlag = backgroundBtn.dataset
        ? backgroundBtn.dataset.hasBackgrounds
        : (typeof backgroundBtn.getAttribute === 'function'
            ? backgroundBtn.getAttribute('data-has-backgrounds')
            : backgroundBtn._hasBackgrounds);
    const hasBackgrounds = hasBackgroundsFlag !== 'false';
    const shouldDisable = isForcedReadOnly || !hasBackgrounds;
    backgroundBtn.disabled = shouldDisable;
    
    if (isForcedReadOnly) {
        backgroundBtn.style.opacity = '0.5';
        backgroundBtn.style.cursor = 'not-allowed';
        backgroundBtn.title = 'Background is disabled in read-only mode';
    } else if (!hasBackgrounds) {
        backgroundBtn.style.opacity = '0.5';
        backgroundBtn.style.cursor = 'not-allowed';
        if (!backgroundBtn.title) {
            backgroundBtn.title = 'Backgrounds unavailable';
        }
    } else {
        backgroundBtn.style.opacity = '1';
        backgroundBtn.style.cursor = 'pointer';
        backgroundBtn.title = '';
    }
}

async function togglePreviewMode() {
    // Never allow toggling out of forced read-only mode.
    if (window.isForcedReadOnlyMode) {
        updatePreviewButtonState();
        return;
    }
    
    // Toggle preview flag
    window.isPreviewReadOnlyMode = !window.isPreviewReadOnlyMode;
    
    // Reuse existing read-only mode plumbing
    isReadOnlyMode = window.isPreviewReadOnlyMode;
    document.body.classList.toggle('read-only-mode', isReadOnlyMode);
    // Preview mode should hide Available Cards pane but keep padding/layout stable
    document.body.classList.remove('forced-read-only-mode');
    document.body.classList.toggle('preview-read-only-mode', !!window.isPreviewReadOnlyMode);
    
    if (typeof updateReadOnlyBadge === 'function') updateReadOnlyBadge();
    if (typeof updateSaveButtonState === 'function') updateSaveButtonState();
    updatePreviewButtonState();
    updateBackgroundButtonState();
    
    // Re-render current view so UI updates (buttons, drag attrs, etc.)
    const deckCardsEditor = document.getElementById('deckCardsEditor');
    if (!deckCardsEditor) return;
    
    try {
        if (typeof window.isLayoutMobile === 'function' && window.isLayoutMobile() && typeof window.renderDeckEditorMobileView === 'function') {
            window.renderDeckEditorMobileView();
        } else if (deckCardsEditor.classList.contains('card-view')) {
            if (typeof renderDeckCardsCardView === 'function') {
                renderDeckCardsCardView();
            }
        } else if (deckCardsEditor.classList.contains('list-view')) {
            if (typeof renderDeckCardsListView === 'function') {
                renderDeckCardsListView();
            }
        } else {
            if (typeof displayDeckCardsForEditing === 'function') {
                await displayDeckCardsForEditing();
            }
        }
    } catch (e) {
        console.error('[DeckEditor] Error re-rendering after preview toggle:', e);
    }
}

// Expose for data-click-handler binder
window.togglePreviewMode = togglePreviewMode;
window.updatePreviewButtonState = updatePreviewButtonState;
window.updateBackgroundButtonState = updateBackgroundButtonState;

/**
 * toggleFoilForCard
 *
 * Toggles the foil state of a specific card instance in the deck editor.
 * Uses window.foilCardMap for O(1) bidirectional lookup — the same map key
 * works regardless of whether the current instance is foil or non-foil:
 *
 *   window.foilCardMap[foilCardId]  → baseCardId  (deselect foil)
 *   window.foilCardMap[baseCardId]  → foilCardId  (select foil)
 *
 * Foil state is persisted by storing the foil/base card UUID in
 * selectedAlternateCardIds[instanceIndex], identical to how alternate art
 * is saved. Deck persistence requires no schema changes.
 *
 * @param {string} cardId - The original (base) card ID for this deck slot
 * @param {number} index - Index of the card in window.deckEditorCards
 * @param {number} instanceIndex - Which instance to toggle (0-based, default 0)
 */
window.toggleFoilForCard = function toggleFoilForCard(cardId, index, instanceIndex = 0) {
    if (!window.deckEditorCards || !window.deckEditorCards[index]) {
        console.error('[toggleFoilForCard] Invalid card index:', index);
        return;
    }
    if (!window.foilCardMap) {
        console.warn('[toggleFoilForCard] foilCardMap not loaded yet');
        return;
    }

    const deckCard = window.deckEditorCards[index];

    // Resolve current instance card ID
    let currentInstanceId;
    if (deckCard.selectedAlternateCardIds && deckCard.selectedAlternateCardIds[instanceIndex]) {
        currentInstanceId = deckCard.selectedAlternateCardIds[instanceIndex];
    } else if (deckCard.selectedAlternateCardId) {
        currentInstanceId = deckCard.selectedAlternateCardId;
    } else {
        currentInstanceId = deckCard.cardId;
    }

    // O(1) lookup for the counterpart ID (works in both directions)
    const counterpartId = window.foilCardMap[currentInstanceId];
    if (!counterpartId) {
        console.warn('[toggleFoilForCard] No foil counterpart found for:', currentInstanceId);
        return;
    }

    // Apply the swap using the same selectedAlternateCardIds mechanism as alternate art
    if (!deckCard.selectedAlternateCardIds) {
        deckCard.selectedAlternateCardIds = Array(deckCard.quantity || 1).fill(deckCard.cardId);
    }
    deckCard.selectedAlternateCardIds[instanceIndex] = counterpartId;

    // Keep backward-compat single field in sync for quantity === 1
    if (deckCard.quantity === 1) {
        deckCard.selectedAlternateCardId = counterpartId;
    }

    // Re-render the current view
    const deckCardsEditor = document.getElementById('deckCardsEditor');
    if (!deckCardsEditor) return;

    if (typeof window.isLayoutMobile === 'function' && window.isLayoutMobile() && typeof window.renderDeckEditorMobileView === 'function') {
        window.renderDeckEditorMobileView();
    } else if (deckCardsEditor.classList.contains('card-view') && typeof renderDeckCardsCardView === 'function') {
        renderDeckCardsCardView();
    } else if (deckCardsEditor.classList.contains('list-view') && typeof renderDeckCardsListView === 'function') {
        renderDeckCardsListView();
    } else if (typeof displayDeckCardsForEditing === 'function') {
        displayDeckCardsForEditing();
    }
};
