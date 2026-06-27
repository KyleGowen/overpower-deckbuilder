// Extracted from public/index.html (index-page split). Category UI must stay in sync with deck editor.

/** Escape a value for use inside single-quoted JS string literals in inline onclick handlers. */
function escapeJsSingleQuoted(value) {
    return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function setNumberSortTupleForDeckAdd(setNumRaw) {
    const s = setNumRaw != null ? String(setNumRaw).trim().toUpperCase() : '';
    if (!s) return [Number.MAX_SAFE_INTEGER, 1, ''];
    const foil = s.endsWith('F');
    const core = foil ? s.slice(0, -1) : s;
    const n = parseInt(core, 10);
    const num = Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
    return [num, foil ? 1 : 0, s];
}

/** Default printing for deck adds: non-foil, non-alternate art, lowest checklist #. */
function compareDeckAddDefaultPrinting(a, b, options = {}) {
    const aFoil = !!a.is_foil;
    const bFoil = !!b.is_foil;
    if (aFoil !== bFoil) return aFoil ? 1 : -1;

    const aImage = a.image_path || a.image || '';
    const bImage = b.image_path || b.image || '';
    const aIsAlternate = aImage.includes('/alternate/') || aImage.includes('alternate/');
    const bIsAlternate = bImage.includes('/alternate/') || bImage.includes('alternate/');
    if (aIsAlternate !== bIsAlternate) return aIsAlternate ? 1 : -1;

    const [numA, foilSuffixA, rawA] = setNumberSortTupleForDeckAdd(a.set_number);
    const [numB, foilSuffixB, rawB] = setNumberSortTupleForDeckAdd(b.set_number);
    if (numA !== numB) return numA - numB;
    if (foilSuffixA !== foilSuffixB) return foilSuffixA - foilSuffixB;
    const numCmp = rawA.localeCompare(rawB);
    if (numCmp !== 0) return numCmp;

    if (options.preferErb) {
        const aSet = (a.set || 'ERB').trim();
        const bSet = (b.set || 'ERB').trim();
        const aIsERB = aSet === 'ERB';
        const bIsERB = bSet === 'ERB';
        if (aIsERB !== bIsERB) return aIsERB ? -1 : 1;
    }

    return 0;
}

async function loadAvailableCardsData() {
    try {
        const categories = [
            { type: 'character', api: '/api/v1/catalog/characters', nameField: 'name' },
            { type: 'location', api: '/api/v1/catalog/locations', nameField: 'name' },
            { type: 'special', api: '/api/v1/catalog/special-cards', nameField: 'name' },
            { type: 'mission', api: '/api/v1/catalog/missions', nameField: 'name' },
            { type: 'event', api: '/api/v1/catalog/events', nameField: 'name' },
            { type: 'aspect', api: '/api/v1/catalog/aspects', nameField: 'card_name' },
            { type: 'advanced-universe', api: '/api/v1/catalog/advanced-universe', nameField: 'name' },
            { type: 'teamwork', api: '/api/v1/catalog/teamwork', nameField: 'card_type' },
            { type: 'ally-universe', api: '/api/v1/catalog/ally-universe', nameField: 'card_name' },
            { type: 'training', api: '/api/v1/catalog/training', nameField: 'card_name' },
            { type: 'basic-universe', api: '/api/v1/catalog/basic-universe', nameField: 'card_name' },
            { type: 'power', api: '/api/v1/catalog/power-cards', nameField: 'power_type' }
        ];
        
        // Fetch all categories in parallel (legacy + v1 catalog envelopes)
        const results = await Promise.all(
            categories.map(async cat => {
                const r = await fetch(cat.api);
                const raw = await r.json();
                const payload = catalogListPayload(r, raw);
                return { category: cat, data: { success: payload.ok, data: payload.rows } };
            })
        );
        
        for (const { category, data } of results) {
            if (data.success && data.data && data.data.length > 0) {
                data.data.forEach(card => {
                    card.cardType = category.type;
                    window.availableCardsMap.set(card.id, card);
                    window.availableCardsMap.set(`${category.type}_${card.id}`, card);
                    if (category.type === 'teamwork') {
                        const cardName = card.to_use || card.name;
                        if (cardName) window.availableCardsMap.set(cardName, card);
                    } else if (category.type === 'training' || category.type === 'ally-universe' || category.type === 'basic-universe' || category.type === 'aspect') {
                        const cardName = card.card_name || card.name;
                        if (cardName) window.availableCardsMap.set(cardName, card);
                    } else if (card.name) {
                        window.availableCardsMap.set(card.name, card);
                    }
                    if (category.type === 'character') {
                        const charMappings = { 'Zeus': 'char_42', 'Leonidas': 'char_22', 'Dr. Watson': 'char_11', 'Sherlock Holmes': 'char_8', 'Dracula': 'char_12', 'Victory Harben': 'char_15' };
                        const deckCardId = charMappings[card.name];
                        if (deckCardId) window.availableCardsMap.set(deckCardId, card);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error loading available cards data:', error);
    }
}
// removeCardFromEditor, removeOneCardFromEditor, addOneCardToEditor,
// removeAllMissionsFromDeck, removeAllCardsFromDeck, removeUnusable*,
// addAllSpecialCardsForCharacter, addAllAdvancedUniverseCardsForCharacter


// Function to update just the character limit status without affecting collapse state
// updateCharacterLimitStatus, updateLocationLimitStatus, updateMissionLimitStatus,
// getOPDKeyForDimming, updateOnePerDeckLimitStatus, shouldSpecialCardBeDisabled,
// updateCataclysmLimitStatus, updateAssistLimitStatus, updateAmbushLimitStatus

// KO Feature Functions - Now handled by SimulateKO module
// Wrapper functions for backward compatibility

// Function to update Fortification card dimming status

async function loadAvailableCards() {
    try {
        const cardCategories = document.getElementById('cardCategories');
        
        // Save current collapse state before refreshing
        const currentCollapseState = {};
        const existingHeaders = cardCategories.querySelectorAll('.card-category-header');
        existingHeaders.forEach(header => {
            const categoryName = header.textContent.split(' (')[0]; // Extract name without count
            currentCollapseState[categoryName] = header.classList.contains('collapsed');
        });
        
        cardCategories.innerHTML = '<div class="drag-instructions">Loading available cards...</div>';
        
        const categories = [
            { type: 'character', name: 'Characters', api: '/api/v1/catalog/characters', nameField: 'name' },
            { type: 'location', name: 'Locations', api: '/api/v1/catalog/locations', nameField: 'name' },
            { type: 'special', name: 'Special Cards', api: '/api/v1/catalog/special-cards', nameField: 'name' },
            { type: 'mission', name: 'Missions', api: '/api/v1/catalog/missions', nameField: 'card_name' },
            { type: 'event', name: 'Events', api: '/api/v1/catalog/events', nameField: 'name' },
            { type: 'aspect', name: 'Aspects', api: '/api/v1/catalog/aspects', nameField: 'card_name' },
            { type: 'advanced-universe', name: 'Universe: Advanced', api: '/api/v1/catalog/advanced-universe', nameField: 'name' },
            { type: 'teamwork', name: 'Universe: Teamwork', api: '/api/v1/catalog/teamwork', nameField: 'card_type' },
            { type: 'ally-universe', name: 'Universe: Ally', api: '/api/v1/catalog/ally-universe', nameField: 'card_name' },
            { type: 'training', name: 'Universe: Training', api: '/api/v1/catalog/training', nameField: 'card_name' },
            { type: 'basic-universe', name: 'Universe: Basic', api: '/api/v1/catalog/basic-universe', nameField: 'card_name' },
            { type: 'power', name: 'Power Cards', api: '/api/v1/catalog/power-cards', nameField: 'power_type' }
        ];
        
        let results;
        const mapHasData = window.availableCardsMap && window.availableCardsMap.size > 0;
        if (mapHasData) {
            results = categories.map(cat => {
                const allMatches = Array.from(window.availableCardsMap.values()).filter(c =>
                    (c.cardType || c.type) === cat.type
                );
                // Deduplicate: same card is stored under multiple keys (id, type_id, name)
                const byId = new Map();
                allMatches.forEach(c => { if (c && c.id) byId.set(c.id, c); });
                const cards = Array.from(byId.values());
                return { category: cat, data: { success: cards.length > 0, data: cards } };
            });
        } else {
            const fetched = await Promise.all(
                categories.map(async cat => {
                    const r = await fetch(cat.api);
                    const raw = await r.json();
                    const payload = catalogListPayload(r, raw);
                    return { category: cat, data: { success: payload.ok, data: payload.rows } };
                })
            );
            for (const { category, data } of fetched) {
                if (data.success && data.data && data.data.length > 0) {
                    data.data.forEach(card => {
                        card.cardType = category.type;
                        window.availableCardsMap.set(card.id, card);
                        window.availableCardsMap.set(`${category.type}_${card.id}`, card);
                        if (category.type === 'teamwork') {
                            const cardName = card.to_use || card.name;
                            if (cardName) window.availableCardsMap.set(cardName, card);
                        } else if (['training', 'ally-universe', 'basic-universe', 'aspect'].includes(category.type)) {
                            const cardName = card.card_name || card.name;
                            if (cardName) window.availableCardsMap.set(cardName, card);
                        } else if (card.name) {
                            window.availableCardsMap.set(card.name, card);
                        }
                        if (category.type === 'character') {
                            const charMappings = { 'Zeus': 'char_42', 'Leonidas': 'char_22', 'Dr. Watson': 'char_11', 'Sherlock Holmes': 'char_8', 'Dracula': 'char_12', 'Victory Harben': 'char_15' };
                            const deckCardId = charMappings[card.name];
                            if (deckCardId) window.availableCardsMap.set(deckCardId, card);
                        }
                    });
                }
            }
            results = fetched;
        }

        const getCategoryCards = (categoryType) => {
            const result = results.find(entry => entry.category.type === categoryType);
            return result && result.data && Array.isArray(result.data.data) ? result.data.data : [];
        };

        const isAlternateArtCard = (card) => {
            const image = (card.image_path || card.image || '').toLowerCase();
            return image.includes('/alternate/');
        };

        const sortPreferredOriginalArt = (cards) => cards.slice().sort((a, b) => {
            const aIsAlternate = isAlternateArtCard(a);
            const bIsAlternate = isAlternateArtCard(b);
            if (aIsAlternate !== bIsAlternate) {
                return aIsAlternate ? 1 : -1;
            }

            const aSet = (a.set || 'ERB').trim();
            const bSet = (b.set || 'ERB').trim();
            const aIsERB = aSet === 'ERB';
            const bIsERB = bSet === 'ERB';
            if (aIsERB !== bIsERB) {
                return aIsERB ? -1 : 1;
            }

            const aName = (a.name || a.card_name || '').trim();
            const bName = (b.name || b.card_name || '').trim();
            return aName.localeCompare(bName);
        });

        const dedupeByNameWithOriginalFirst = (cards) => {
            const byName = new Map();
            cards.forEach(card => {
                const name = (card.name || card.card_name || '').trim();
                if (!name) return;
                if (!byName.has(name)) {
                    byName.set(name, []);
                }
                byName.get(name).push(card);
            });

            return Array.from(byName.values())
                .map(group => sortPreferredOriginalArt(group)[0])
                .filter(Boolean)
                .sort((a, b) => {
                    const aName = (a.name || a.card_name || '').trim();
                    const bName = (b.name || b.card_name || '').trim();
                    return aName.localeCompare(bName);
                });
        };

        const specialCardMatchesCharacter = (card, characterName) => {
            const specialCharacter = card.character || card.character_name || '';

            // Character stacks intentionally exclude Any Character cards.
            if (specialCharacter === 'Any Character') {
                return false;
            }

            // Preserve Angry Mob variant behavior from existing Add All logic.
            if (specialCharacter.startsWith('Angry Mob') && characterName.startsWith('Angry Mob')) {
                if (specialCharacter === 'Angry Mob') {
                    return true;
                }

                const hasVariantQualifier = specialCharacter.includes(':') || specialCharacter.includes(' - ');
                if (hasVariantQualifier) {
                    const separator = specialCharacter.includes(':') ? ':' : ' - ';
                    const specialVariant = specialCharacter.split(separator)[1].trim();
                    const charVariantMatch = characterName.match(/\(([^)]+)\)/);
                    if (!charVariantMatch) return false;
                    const charVariant = charVariantMatch[1].trim();
                    const normalize = (value) => value.toLowerCase().replace(/\s+/g, ' ').trim().replace(/s$/, '');
                    return normalize(specialVariant) === normalize(charVariant);
                }

                return false;
            }

            return specialCharacter === characterName;
        };

        const characterCards = getCategoryCards('character').filter(card =>
            card && !card.is_foil && (card.name || '').trim() !== 'Any Character'
        );
        const specialCards = getCategoryCards('special').filter(card => card && !card.is_foil);
        const advancedUniverseCards = getCategoryCards('advanced-universe').filter(card => card && !card.is_foil);

        const characterGroups = new Map();
        characterCards.forEach(card => {
            const characterName = (card.name || '').trim();
            if (!characterName) return;
            if (!characterGroups.has(characterName)) {
                characterGroups.set(characterName, []);
            }
            characterGroups.get(characterName).push(card);
        });

        const characterStackGroups = Array.from(characterGroups.keys())
            .sort((a, b) => a.localeCompare(b))
            .map(characterName => {
                const originalCharacterCard = sortPreferredOriginalArt(characterGroups.get(characterName))[0];
                if (!originalCharacterCard) return null;

                const matchedSpecials = specialCards.filter(card => specialCardMatchesCharacter(card, characterName));
                const matchedAdvancedUniverse = advancedUniverseCards.filter(card =>
                    (card.character || '').trim() === characterName && (card.character || '').trim() !== 'Any Character'
                );

                const specialStackCards = dedupeByNameWithOriginalFirst(matchedSpecials).map(card => ({
                    cardType: 'special',
                    id: card.id,
                    name: card.name || card.card_name || 'Unknown Special',
                    imagePath: getCardImagePath(card, 'special')
                }));

                const advancedUniverseStackCards = dedupeByNameWithOriginalFirst(matchedAdvancedUniverse).map(card => ({
                    cardType: 'advanced-universe',
                    id: card.id,
                    name: card.name || card.card_name || 'Unknown Universe: Advanced Card',
                    imagePath: getCardImagePath(card, 'advanced-universe')
                }));

                return {
                    characterName,
                    cards: [
                        {
                            cardType: 'character',
                            id: originalCharacterCard.id,
                            name: originalCharacterCard.name || originalCharacterCard.card_name || characterName,
                            imagePath: getCardImagePath(originalCharacterCard, 'character')
                        },
                        ...specialStackCards,
                        ...advancedUniverseStackCards
                    ]
                };
            })
            .filter(group => group && Array.isArray(group.cards) && group.cards.length > 0);

        results = [
            {
                category: { type: 'character-stacks', name: 'Character Stacks', nameField: 'characterName' },
                data: { success: characterStackGroups.length > 0, data: characterStackGroups }
            },
            ...results
        ];
        
        let categoriesHtml = '';
        for (const { category, data } of results) {
                
                // Variables to store tile counts for header rendering
                let characterTileCount = null;
                let specialCardTileCount = null;
                let powerCardTileCount = null;
                let locationTileCount = null;
                
                if (data.success && data.data.length > 0) {
                    // Map already populated by fetch-path or reused from loadAvailableCardsData
                    let cardsHtml = '';
                    
                    if (category.type === 'character-stacks') {
                        cardsHtml = '';

                        data.data.forEach(stackGroup => {
                            const stackCards = stackGroup.cards || [];
                            if (stackCards.length === 0) return;

                            const cardItems = stackCards.map(stackCard => {
                                const cardName = escapeJsSingleQuoted(stackCard.name || '');
                                const escapedImagePath = (stackCard.imagePath || '').replace(/'/g, "\\'");
                                const escapedCardType = (stackCard.cardType || '').replace(/'/g, "\\'");
                                const escapedCardId = (stackCard.id || '').replace(/'/g, "\\'");
                                const displayName = stackCard.name || '';

                                return `
                                    <div class="card-item"
                                         draggable="true"
                                         data-type="${stackCard.cardType}"
                                         data-id="${stackCard.id}"
                                         onmouseenter="showCardHoverModal('${escapedImagePath}', '${cardName}', '${escapedCardId}', '${escapedCardType}')"
                                         onmouseleave="hideCardHoverModal()"
                                         onclick="handleCardClick(event, '${stackCard.cardType}', '${stackCard.id}', '${cardName}')"
                                         data-name="${cardName}">
                                        <div class="card-item-content">${displayName}</div>
                                        <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${stackCard.cardType}', '${stackCard.id}', '${cardName}')" title="${stackCard.cardType === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                                    </div>
                                `;
                            }).join('');

                            const escapedCharacterName = (stackGroup.characterName || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                            const htmlEscapedCharacterName = (stackGroup.characterName || '')
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&#39;');

                            cardsHtml += `
                                <div class="character-group">
                                    <div class="character-group-header" onclick="toggleCharacterGroup(this)">
                                        <span>${htmlEscapedCharacterName}</span>
                                        <div class="mission-set-controls">
                                            <button class="add-all-btn" onclick="event.stopPropagation(); addAllCharacterStack('${escapedCharacterName}')">Add All</button>
                                            <span class="collapse-icon">▶</span>
                                        </div>
                                    </div>
                                    <div class="character-group-content collapsed">
                                        ${cardItems}
                                    </div>
                                </div>
                            `;
                        });
                    } else if (category.type === 'character') {
                        // Special handling for characters with stats
                        const currentCharacterCount = window.deckEditorCards
                            .filter(card => card.type === 'character')
                            .reduce((total, card) => total + card.quantity, 0);
                        
                        const isCharacterLimitReached = currentCharacterCount >= 4;
                        
                        // Group characters by name and set (same type, name, set = same card).
                        // ERBP (ERB Promos / con exclusives) merges with ERB so alternate promo art stays in one tile.
                        const groups = new Map();
                        data.data.forEach(card => {
                            const name = (card.name || '').trim();
                            let set = (card.set || 'ERB').trim();
                            if (!set || set === '') {
                                set = 'ERB';
                            }
                            if (set === 'ERBP') {
                                set = 'ERB';
                            }
                            
                            if (!name) {
                                return;
                            }
                            
                            const key = `${name}|${set}`;
                            if (!groups.has(key)) {
                                groups.set(key, []);
                            }
                            groups.get(key).push(card);
                        });
                        
                        // Sort each group: default printing first (non-foil, non-alternate, lowest #)
                        groups.forEach((group, key) => {
                            group.sort((a, b) => compareDeckAddDefaultPrinting(a, b));
                        });
                        
                        
                        // Store the grouped tile count for use in header rendering
                        characterTileCount = groups.size;
                        
                        // Debug: Log groups with multiple cards
                        const groupsWithMultiple = Array.from(groups.entries()).filter(([key, group]) => group.length > 1);
                        
                        // Track rendered cards to prevent duplicates
                        const renderedKeys = new Set();
                        
                        cardsHtml = '';
                        groups.forEach((group, key) => {
                            if (group.length === 0) return;
                            
                            // Use first card (original art) as representative
                            const representative = group[0];
                            const name = (representative.name || '').trim();
                            const set = (representative.set || 'ERB').trim() || 'ERB';
                            const renderKey = `${name}|${set}`;
                            
                            // Skip if already rendered
                            if (renderedKeys.has(renderKey)) {
                                return;
                            }
                            
                            renderedKeys.add(renderKey);
                            
                            // Store all alternate arts
                            const allCards = group.map(card => ({
                                id: card.id,
                                imagePath: getCardImagePath(card, category.type),
                                name: card.name,
                                set: (card.set || 'ERB'),
                                set_number: card.set_number != null ? card.set_number : null,
                                rarity: card.rarity != null ? card.rarity : null,
                                is_foil: !!card.is_foil
                            }));
                            const allCardsJson = JSON.stringify(allCards).replace(/"/g, '&quot;');
                            
                            // Use original art (first card) for display
                            const displayCard = allCards[0];
                            
                            const card = representative; // Use representative for stats
                            const stats = [
                                { label: 'TL:', value: card.threat_level || 0, color: '#808080' }, // Gray - Threat Level
                                { label: 'E:', value: card.energy || 0, color: '#FFD700' },      // Yellow - Energy
                                { label: 'C:', value: card.combat || 0, color: '#FF8C00' },     // Dark Orange - Combat (redder)
                                { label: 'BF:', value: card.brute_force || 0, color: '#32CD32' }, // Green - Brute Force
                                { label: 'I:', value: card.intelligence || 0, color: '#6495ED' } // Lighter Blue - Intelligence
                            ];
                            
                            const statsHtml = stats.map(stat => 
                                `<span class="character-stat"><span class="stat-label">${stat.label}</span><span class="stat-value" style="color: ${stat.color};">${stat.value}</span></span>`
                            ).join(' ');
                            
                            // Check if ANY alternate art of this character is already in deck
                            // This includes checking all cards in the group (all alternate arts)
                            const isCharacterInDeck = window.deckEditorCards.some(deckCard => 
                                deckCard.type === 'character' && group.some(gc => gc.id === deckCard.cardId)
                            );
                            
                            // Check if this character is One Per Deck and already in deck
                            const isOnePerDeck = card.one_per_deck === true || card.is_one_per_deck === true;
                            const isOnePerDeckInDeck = isOnePerDeck && isCharacterInDeck;
                            
                            const disabledClass = (isCharacterLimitReached || isCharacterInDeck) ? 'disabled' : '';
                            let disabledTitle = '';
                            if (isCharacterLimitReached) {
                                disabledTitle = 'Character limit reached (max 4)';
                            } else if (isCharacterInDeck) {
                                disabledTitle = 'This character is already in your deck';
                            }
                            
                            cardsHtml += `
                                <div class="card-item character-card ${disabledClass}" 
                                     draggable="${!(isCharacterLimitReached || isCharacterInDeck)}" 
                                     data-type="${category.type}" 
                                     data-id="${displayCard.id}"
                                     data-all-cards="${allCardsJson}"
                                     onmouseenter="showCardHoverModal('${(displayCard.imagePath || '').replace(/'/g, "\\'")}', '${name.replace(/'/g, "\\'")}', '${(displayCard.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                     onmouseleave="hideCardHoverModal()"
                                     onclick="handleCardClick(event, '${category.type}', '${displayCard.id}', '${name.replace(/'/g, "\\'")}')"
                                     data-name="${name.replace(/'/g, "\\'")}"
                                     title="${disabledTitle}">
                                    <div class="card-item-content">
                                    <div class="character-name">${name}</div>
                                    <div class="character-stats">${statsHtml}</div>
                                    </div>
                                    <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${displayCard.id}', '${escapeJsSingleQuoted(name)}')" title="${category.type === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                                </div>
                            `;
                        });
                        
                                            } else if (category.type === 'mission') {
                    // Special handling for missions - group by mission set
                    const missionSetGroups = {};
                    
                    data.data.forEach(card => {
                        const missionSet = card.mission_set || 'Unknown Mission Set';
                        if (!missionSetGroups[missionSet]) {
                            missionSetGroups[missionSet] = [];
                        }
                        missionSetGroups[missionSet].push(card);
                    });
                    
                    const missionSetNames = Object.keys(missionSetGroups).sort();
                    cardsHtml = '';
                    
                    missionSetNames.forEach(missionSetName => {
                        const cards = missionSetGroups[missionSetName];
                        
                        // Check mission limit
                        const currentMissionCount = window.deckEditorCards
                            .filter(card => card.type === 'mission')
                            .reduce((total, card) => total + card.quantity, 0);
                        const isMissionLimitReached = currentMissionCount >= 7;
                        
                        const cardItems = cards.map(card => {
                            // Check if this mission is One Per Deck and already in deck
                            const isOnePerDeck = card.one_per_deck === true || card.is_one_per_deck === true;
                            const isOnePerDeckInDeck = isOnePerDeck && window.deckEditorCards.some(deckCard => 
                                deckCard.type === 'mission' && deckCard.cardId === card.id
                            );
                            
                            const disabledClass = (isMissionLimitReached || isOnePerDeckInDeck) ? 'disabled' : '';
                            let disabledTitle = '';
                            if (isMissionLimitReached) {
                                disabledTitle = 'Mission limit reached (max 7)';
                            } else if (isOnePerDeckInDeck) {
                                disabledTitle = 'One Per Deck - already in deck';
                            }
                            
                            return `
                                <div class="card-item ${disabledClass}" 
                                     draggable="${!(isMissionLimitReached || isOnePerDeckInDeck)}" 
                                     data-type="${category.type}" 
                                     data-id="${card.id}"
                                     onmouseenter="showCardHoverModal('${getCardImagePath(card, category.type).replace(/'/g, "\\'")}', '${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}', '${(card.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                     onmouseleave="hideCardHoverModal()"
                                     onclick="handleCardClick(event, '${category.type}', '${card.id}', '${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}')"
                                     data-name="${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}"
                                     title="${disabledTitle}">
                                    <div class="card-item-content">${card[category.nameField]}</div>
                                    <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(card[category.nameField] || card.name || '')}')" title="${category.type === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                                </div>
                            `;
                        }).join('');
                        
                        cardsHtml += `
                            <div class="mission-set-group">
                                <div class="mission-set-group-header" onclick="toggleMissionSetGroup(this)">
                                    <span>${missionSetName} (${cards.length})</span>
                                    <div class="mission-set-controls">
                                        <button class="add-all-btn" onclick="event.stopPropagation(); addAllMissionSetCards('${missionSetName}', ${JSON.stringify(cards).replace(/"/g, '&quot;')})">Add All</button>
                                        <span class="collapse-icon">▼</span>
                                    </div>
                                </div>
                                <div class="mission-set-group-content collapsed">
                                    ${cardItems}
                                </div>
                            </div>
                        `;
                    });
                                            } else if (category.type === 'event') {
                    // Special handling for events - group by mission set
                    const missionSetGroups = {};
                    
                    data.data.forEach(card => {
                        const missionSet = card.mission_set || 'Unknown Mission Set';
                        if (!missionSetGroups[missionSet]) {
                            missionSetGroups[missionSet] = [];
                        }
                        missionSetGroups[missionSet].push(card);
                    });
                    
                    const missionSetNames = Object.keys(missionSetGroups).sort();
                    cardsHtml = '';
                    
                    missionSetNames.forEach(missionSetName => {
                        const cards = missionSetGroups[missionSetName];
                        const cardItems = cards.map(card => {
                            // Check if this event is One Per Deck and already in deck
                            const isOnePerDeck = card.one_per_deck === true || card.is_one_per_deck === true;
                            const isOnePerDeckInDeck = isOnePerDeck && window.deckEditorCards.some(deckCard => 
                                deckCard.type === 'event' && deckCard.cardId === card.id
                            );
                            
                            const disabledClass = isOnePerDeckInDeck ? 'disabled' : '';
                            const disabledTitle = isOnePerDeckInDeck ? 'One Per Deck - already in deck' : '';
                            
                            return `
                                <div class="card-item ${disabledClass}" 
                                     draggable="${!isOnePerDeckInDeck}" 
                                     data-type="${category.type}" 
                                     data-id="${card.id}"
                                     onmouseenter="showCardHoverModal('${getCardImagePath(card, category.type).replace(/'/g, "\\'")}', '${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}', '${(card.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                     onmouseleave="hideCardHoverModal()"
                                     onclick="handleCardClick(event, '${category.type}', '${card.id}', '${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}')"
                                     data-name="${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}"
                                     title="${disabledTitle}">
                                    <div class="card-item-content">${card[category.nameField]}</div>
                                    <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(card[category.nameField] || card.name || '')}')" title="${category.type === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                                </div>
                            `;
                        }).join('');
                        
                        cardsHtml += `
                            <div class="mission-set-group">
                                <div class="mission-set-group-header" onclick="toggleMissionSetGroup(this)">
                                    <span>${missionSetName} (${cards.length})</span>
                                    <span class="collapse-icon">▼</span>
                                </div>
                                <div class="mission-set-group-content collapsed">
                                    ${cardItems}
                                </div>
                            </div>
                        `;
                    });
                                            } else if (category.type === 'special') {
                    // Special handling for special cards - group by character name, then by card name to consolidate alternate arts
                    
                    // First, group by character name
                    const characterGroups = {};
                    
                    data.data.forEach(card => {
                        const characterName = card.character || 'Any Character';
                        if (!characterGroups[characterName]) {
                            characterGroups[characterName] = [];
                        }
                        characterGroups[characterName].push(card);
                    });
                    
                    const characterNames = Object.keys(characterGroups).sort();
                    cardsHtml = '';
                    
                    // Track total unique special cards across all character groups
                    let totalUniqueSpecialCards = 0;
                    
                    characterNames.forEach(characterName => {
                        const cardsInCharacterGroup = characterGroups[characterName];
                        
                        // Group cards by name to consolidate alternate arts
                        const cardGroups = new Map();
                        cardsInCharacterGroup.forEach(card => {
                            const cardName = (card.name || '').trim();
                            
                            if (!cardName) {
                                console.warn('[IndexHTML] Skipping special card with empty name:', card);
                                return;
                            }
                            
                            const key = cardName;
                            if (!cardGroups.has(key)) {
                                cardGroups.set(key, []);
                            }
                            cardGroups.get(key).push(card);
                        });
                        
                        // Add to total count
                        totalUniqueSpecialCards += cardGroups.size;
                        
                        // Sort each group: default printing first (non-foil, non-alternate, lowest #)
                        cardGroups.forEach((group, key) => {
                            group.sort((a, b) => compareDeckAddDefaultPrinting(a, b));
                        });
                        
                        // Track rendered cards to prevent duplicates
                        const renderedKeys = new Set();
                        
                        const cardItems = [];
                        cardGroups.forEach((group, cardName) => {
                            if (group.length === 0) return;
                            
                            // Use first card (original art) as representative
                            const representative = group[0];
                            const name = (representative.name || '').trim();
                            
                            // Skip if already rendered
                            if (renderedKeys.has(name)) {
                                console.warn(`[IndexHTML] SKIPPING duplicate special card: "${name}"`);
                                return;
                            }
                            
                            renderedKeys.add(name);
                            
                            // Store all alternate arts
                            const allCards = group.map(card => ({
                                id: card.id,
                                imagePath: getCardImagePath(card, category.type),
                                name: card.name,
                                set: (card.set || 'ERB'),
                                set_number: card.set_number != null ? card.set_number : null,
                                rarity: card.rarity != null ? card.rarity : null,
                                is_foil: !!card.is_foil
                            }));
                            const allCardsJson = JSON.stringify(allCards).replace(/"/g, '&quot;');
                            
                            // Use original art (first card) for display
                            const displayCard = allCards[0];
                            
                            // Check if this special card is One Per Deck and already in deck
                            // Check if ANY alternate art of this card is already in deck
                            const isOnePerDeck = representative.one_per_deck === true || representative.is_one_per_deck === true;
                            const isOnePerDeckInDeck = isOnePerDeck && window.deckEditorCards.some(deckCard => 
                                deckCard.type === 'special' && group.some(gc => gc.id === deckCard.cardId)
                            );
                            
                            const disabledClass = isOnePerDeckInDeck ? 'disabled' : '';
                            const disabledTitle = isOnePerDeckInDeck ? 'One Per Deck - already in deck' : '';
                            
                            cardItems.push(`
                                <div class="card-item ${disabledClass}" 
                                     draggable="${!isOnePerDeckInDeck}" 
                                     data-type="${category.type}" 
                                     data-id="${displayCard.id}"
                                     data-all-cards="${allCardsJson}"
                                     onmouseenter="showCardHoverModal('${(displayCard.imagePath || '').replace(/'/g, "\\'")}', '${name.replace(/'/g, "\\'")}', '${(displayCard.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                     onmouseleave="hideCardHoverModal()"
                                     onclick="handleCardClick(event, '${category.type}', '${displayCard.id}', '${name.replace(/'/g, "\\'")}')"
                                     data-name="${name.replace(/'/g, "\\'")}"
                                     title="${disabledTitle}">
                                    <div class="card-item-content">${name}</div>
                                    <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${displayCard.id}', '${escapeJsSingleQuoted(name)}')" title="Add to deck (multiple copies allowed)">+</div>
                                </div>
                            `);
                        });
                        
                        // Sort card items by name
                        cardItems.sort((a, b) => {
                            const aMatch = a.match(/data-name="([^"]+)"/);
                            const bMatch = b.match(/data-name="([^"]+)"/);
                            const aName = aMatch ? aMatch[1] : '';
                            const bName = bMatch ? bMatch[1] : '';
                            return aName.localeCompare(bName);
                        });
                        
                        // Escape single quotes and HTML-encode characterName for use in onclick handler
                        const escapedCharacterName = characterName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        // Also escape for HTML display
                        const htmlEscapedCharacterName = characterName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                        
                        cardsHtml += `
                            <div class="character-group">
                                <div class="character-group-header" onclick="toggleCharacterGroup(this)">
                                    <span>${htmlEscapedCharacterName} (${cardGroups.size})</span>
                                    <button class="add-all-special-btn" onclick="event.stopPropagation(); addAllSpecialCardsForCharacter('${escapedCharacterName}')">Add All</button>
                                    <span class="collapse-icon">▶</span>
                                </div>
                                <div class="character-group-content collapsed">
                                    ${cardItems.join('')}
                                </div>
                            </div>
                        `;
                    });
                    
                    // Store the grouped tile count for use in header rendering
                    specialCardTileCount = totalUniqueSpecialCards;
                    
                } else if (category.type === 'advanced-universe') {
                    // Special handling for advanced universe cards - group by character name
                    const characterGroups = {};
                    
                    data.data.forEach(card => {
                        const characterName = card.character || 'Any Character';
                        if (!characterGroups[characterName]) {
                            characterGroups[characterName] = [];
                        }
                        characterGroups[characterName].push(card);
                    });
                    
                    const characterNames = Object.keys(characterGroups).sort();
                    cardsHtml = '';
                    
                    characterNames.forEach(characterName => {
                        const cards = characterGroups[characterName];
                        const cardItems = cards.map(card => {
                            // Check if this advanced-universe card is One Per Deck and already in deck
                            const isOnePerDeck = card.one_per_deck === true || card.is_one_per_deck === true;
                            const isOnePerDeckInDeck = isOnePerDeck && window.deckEditorCards.some(deckCard => 
                                deckCard.type === 'advanced-universe' && deckCard.cardId === card.id
                            );
                            
                            const disabledClass = isOnePerDeckInDeck ? 'disabled' : '';
                            const disabledTitle = isOnePerDeckInDeck ? 'One Per Deck - already in deck' : '';
                            
                            return `
                                <div class="card-item ${disabledClass}" 
                                     draggable="${!isOnePerDeckInDeck}" 
                                     data-type="${category.type}" 
                                     data-id="${card.id}"
                                     onmouseenter="showCardHoverModal('${getCardImagePath(card, category.type).replace(/'/g, "\\'")}', '${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}', '${(card.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                     onmouseleave="hideCardHoverModal()"
                                     onclick="handleCardClick(event, '${category.type}', '${card.id}', '${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}')"
                                     data-name="${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}"
                                     title="${disabledTitle}">
                                    <div class="card-item-content">${card[category.nameField]}</div>
                                    <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(card[category.nameField] || card.name || '')}')" title="${category.type === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                                </div>
                            `;
                        }).join('');
                        
                        cardsHtml += `
                            <div class="character-group">
                                <div class="character-group-header" onclick="toggleCharacterGroup(this)">
                                    <span>${characterName} (${cards.length})</span>
                                    <button class="add-all-special-btn" onclick="event.stopPropagation(); addAllAdvancedUniverseCardsForCharacter('${characterName}')">Add All</button>
                                    <span class="collapse-icon">▶</span>
                                </div>
                                <div class="character-group-content collapsed">
                                    ${cardItems}
                                </div>
                            </div>
                        `;
                    });
                } else if (category.type === 'teamwork') {
                    // Special handling for teamwork cards - group by "To Use" type
                    const typeGroups = {};
                    
                    data.data.forEach(card => {
                        // Extract just the type part (e.g., "6 Energy" -> "Energy", "7 Combat" -> "Combat")
                        const typeMatch = card.to_use.match(/\d+\s+(.+)/);
                        const toUseType = typeMatch ? typeMatch[1] : 'Unknown';
                        
                        if (!typeGroups[toUseType]) {
                            typeGroups[toUseType] = [];
                        }
                        typeGroups[toUseType].push(card);
                    });
                    
                    // Define the preferred order for teamwork types
                    const preferredOrder = ['Energy', 'Combat', 'Brute Force', 'Intelligence', 'Any-Power'];
                    const typeNames = Object.keys(typeGroups).sort((a, b) => {
                        const aIndex = preferredOrder.indexOf(a);
                        const bIndex = preferredOrder.indexOf(b);
                        // If both are in preferred order, sort by their position
                        if (aIndex !== -1 && bIndex !== -1) {
                            return aIndex - bIndex;
                        }
                        // If only one is in preferred order, prioritize it
                        if (aIndex !== -1) return -1;
                        if (bIndex !== -1) return 1;
                        // If neither is in preferred order, sort alphabetically
                        return a.localeCompare(b);
                    });
                    cardsHtml = '';
                    
                    typeNames.forEach(typeName => {
                        const cards = typeGroups[typeName];
                        const cardItems = cards.map(card => {
                            const summary = `${card.to_use} To Use -> ${card.followup_attack_types} (${card.first_attack_bonus}/${card.second_attack_bonus})`;
                            
                            // Check if this teamwork card is One Per Deck and already in deck
                            const isOnePerDeck = card.one_per_deck === true || card.is_one_per_deck === true;
                            const isOnePerDeckInDeck = isOnePerDeck && window.deckEditorCards.some(deckCard => 
                                deckCard.type === 'teamwork' && deckCard.cardId === card.id
                            );
                            
                            const disabledClass = isOnePerDeckInDeck ? 'disabled' : '';
                            const disabledTitle = isOnePerDeckInDeck ? 'One Per Deck - already in deck' : '';
                            
                            return `
                                <div class="card-item ${disabledClass}" 
                                     draggable="${!isOnePerDeckInDeck}" 
                                     data-type="${category.type}" 
                                     data-id="${card.id}"
                                     onmouseenter="showCardHoverModal('${getCardImagePath(card, category.type).replace(/'/g, "\\'")}', '${summary}', '${(card.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                     onmouseleave="hideCardHoverModal()"
                                     onclick="handleCardClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(summary)}')"
                                     data-name="${summary}"
                                     title="${disabledTitle}">
                                    <div class="card-item-content">${summary}</div>
                                    <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(summary)}')" title="${category.type === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                                </div>
                            `;
                        }).join('');
                        
                        cardsHtml += `
                            <div class="character-group">
                                <div class="character-group-header" onclick="toggleCharacterGroup(this)">
                                    <span>${typeName} (${cards.length})</span>
                                    <span class="collapse-icon">▶</span>
                                </div>
                                <div class="character-group-content collapsed">
                                    ${cardItems}
                                </div>
                            </div>
                        `;
                    });
                } else if (category.type === 'ally-universe') {
                    // Special handling for ally cards - show summary with stat requirements and attack info
                    cardsHtml = data.data.map(card => {
                        const summary = `${card.card_name} - ${card.stat_to_use} ${card.stat_type_to_use} → ${card.attack_value} ${card.attack_type}`;
                        
                        // Check if this ally-universe card is One Per Deck and already in deck
                        const isOnePerDeck = card.one_per_deck === true || card.is_one_per_deck === true;
                        const isOnePerDeckInDeck = isOnePerDeck && window.deckEditorCards.some(deckCard => 
                            deckCard.type === 'ally-universe' && deckCard.cardId === card.id
                        );
                        
                        const disabledClass = isOnePerDeckInDeck ? 'disabled' : '';
                        const disabledTitle = isOnePerDeckInDeck ? 'One Per Deck - already in deck' : '';
                        
                        return `
                            <div class="card-item ${disabledClass}" 
                                 draggable="${!isOnePerDeckInDeck}" 
                                 data-type="${category.type}" 
                                 data-id="${card.id}"
                                 onmouseenter="showCardHoverModal('${getCardImagePath(card, category.type).replace(/'/g, "\\'")}', '${summary}', '${(card.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                 onmouseleave="hideCardHoverModal()"
                                 onclick="handleCardClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(summary)}')"
                                 data-name="${summary}"
                                 title="${disabledTitle}">
                                <div class="card-item-content">${summary}</div>
                                <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(summary)}')" title="${category.type === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                            </div>
                        `;
                    }).join('');
                } else if (category.type === 'training') {
                    // List non-foil rows only; foil-only promos (e.g. ERBP) use foil_card_map + deck Foil toggle
                    const trainingListCards = data.data.filter(card => !card.is_foil);
                    cardsHtml = trainingListCards.map(card => {
                        const summary = `${card.card_name.replace(/^Training \(/, '').replace(/\)$/, '')} - ${card.type_1} + ${card.type_2} (${card.value_to_use} → ${card.bonus})`;
                        
                        // Check if this training card is One Per Deck and already in deck
                        const isOnePerDeck = card.one_per_deck === true || card.is_one_per_deck === true;
                        const foilId = window.foilCardMap && window.foilCardMap[card.id];
                        const isOnePerDeckInDeck = isOnePerDeck && window.deckEditorCards.some(deckCard =>
                            deckCard.type === 'training' &&
                            (deckCard.cardId === card.id || (foilId && deckCard.cardId === foilId))
                        );
                        
                        const disabledClass = isOnePerDeckInDeck ? 'disabled' : '';
                        const disabledTitle = isOnePerDeckInDeck ? 'One Per Deck - already in deck' : '';
                        
                        return `
                            <div class="card-item ${disabledClass}" 
                                 draggable="${!isOnePerDeckInDeck}" 
                                 data-type="${category.type}" 
                                 data-id="${card.id}"
                                 onmouseenter="showCardHoverModal('${getCardImagePath(card, category.type).replace(/'/g, "\\'")}', '${summary}', '${(card.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                 onmouseleave="hideCardHoverModal()"
                                 onclick="handleCardClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(summary)}')"
                                 data-name="${summary}"
                                 title="${disabledTitle}">
                                <div class="card-item-content">${summary}</div>
                                <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(summary)}')" title="${category.type === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                            </div>
                        `;
                    }).join('');
                } else if (category.type === 'basic-universe') {
                    // Special handling for basic universe cards - show summary with type, value, and bonus
                    cardsHtml = data.data.map(card => {
                        const summary = `${card.card_name} - ${card.type} (${card.value_to_use} → ${card.bonus})`;
                        const escapedSummary = escapeJsSingleQuoted(summary);
                        const escapedImagePath = getCardImagePath(card, category.type).replace(/'/g, "\\'").replace(/"/g, '\\"');
                        
                        // Check if this basic-universe card is One Per Deck and already in deck
                        const isOnePerDeck = card.one_per_deck === true || card.is_one_per_deck === true;
                        const isOnePerDeckInDeck = isOnePerDeck && window.deckEditorCards.some(deckCard => 
                            deckCard.type === 'basic-universe' && deckCard.cardId === card.id
                        );
                        
                        const disabledClass = isOnePerDeckInDeck ? 'disabled' : '';
                        const disabledTitle = isOnePerDeckInDeck ? 'One Per Deck - already in deck' : '';
                        
                        return `
                            <div class="card-item ${disabledClass}" 
                                 draggable="${!isOnePerDeckInDeck}" 
                                 data-type="${category.type}" 
                                 data-id="${card.id}"
                                 onmouseenter="showCardHoverModal('${escapedImagePath}', '${escapedSummary}', '${(card.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                 onmouseleave="hideCardHoverModal()"
                                 onclick="handleCardClick(event, '${category.type}', '${card.id}', '${escapedSummary}')"
                                 data-name="${summary}"
                                 title="${disabledTitle}">
                                <div class="card-item-content">${summary}</div>
                                <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${card.id}', '${escapedSummary}')" title="${category.type === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                            </div>
                        `;
                    }).join('');
                } else if (category.type === 'power') {
                    // Special handling for power cards - group by power type, then by value
                    // Exclude foil cards so we default to base and show all alternate arts
                    const typeGroups = {};
                    const baseCardsOnly = data.data.filter(card => !card.is_foil);
                    
                    baseCardsOnly.forEach(card => {
                        const powerType = card.power_type;
                        if (!typeGroups[powerType]) {
                            typeGroups[powerType] = [];
                        }
                        typeGroups[powerType].push(card);
                    });
                    
                    // Define the preferred order for power types (OverPower official order)
                    // Using normalized names (with hyphens) to match the normalization logic
                    const preferredOrder = ['Energy', 'Combat', 'Brute-Force', 'Intelligence', 'Multi-Power', 'Any-Power'];
                    const typeNames = Object.keys(typeGroups).sort((a, b) => {
                        // Normalize power type names for comparison
                        const normalizeType = (type) => type.replace(/\s+/g, '-');
                        const normalizedA = normalizeType(a);
                        const normalizedB = normalizeType(b);
                        
                        const aIndex = preferredOrder.indexOf(normalizedA);
                        const bIndex = preferredOrder.indexOf(normalizedB);
                        
                        // If both are in preferred order, sort by their position
                        if (aIndex !== -1 && bIndex !== -1) {
                            return aIndex - bIndex;
                        }
                        // If only one is in preferred order, prioritize it
                        if (aIndex !== -1) return -1;
                        if (bIndex !== -1) return 1;
                        // If neither is in preferred order, sort alphabetically
                        return a.localeCompare(b);
                    });
                    cardsHtml = '';
                    
                    // Track total unique power cards across all type groups
                    let totalUniquePowerCards = 0;
                    
                    typeNames.forEach(typeName => {
                        const cardsInTypeGroup = typeGroups[typeName];
                        
                        // Group cards by value only (not by set) to consolidate alternate arts across all sets
                        const cardGroups = new Map();
                        cardsInTypeGroup.forEach(card => {
                            const value = String(card.value || '').trim();
                            
                            // Group by value only, so cards from different sets are together
                            const key = value;
                            if (!cardGroups.has(key)) {
                                cardGroups.set(key, []);
                            }
                            cardGroups.get(key).push(card);
                        });
                        
                        // Add to total count
                        totalUniquePowerCards += cardGroups.size;
                        
                        // Sort each group: default printing first (non-foil, non-alternate, lowest #; ERB tiebreak)
                        cardGroups.forEach((group, key) => {
                            group.sort((a, b) => compareDeckAddDefaultPrinting(a, b, { preferErb: true }));
                        });
                        
                        // Sort groups by value (key is now just the value, not value|set)
                        const sortedCardGroups = Array.from(cardGroups.entries()).sort((a, b) => {
                            const valueA = parseInt(a[0]) || 0;
                            const valueB = parseInt(b[0]) || 0;
                            return valueA - valueB;
                        });
                        
                        // Track rendered cards to prevent duplicates
                        const renderedKeys = new Set();
                        
                        const cardItems = [];
                        sortedCardGroups.forEach(([key, group]) => {
                            if (group.length === 0) return;
                            
                            // Use first card (original art) as representative
                            const representative = group[0];
                            const value = String(representative.value || '').trim();
                            const summary = `${value} - ${typeName}`;
                            const renderKey = `${value}|${typeName}`;
                            
                            // Skip if already rendered
                            if (renderedKeys.has(renderKey)) {
                                console.warn(`[IndexHTML] SKIPPING duplicate power card: "${summary}"`);
                                return;
                            }
                            
                            renderedKeys.add(renderKey);
                            
                            // Store all alternate arts
                            const allCards = group.map(card => ({
                                id: card.id,
                                imagePath: getCardImagePath(card, category.type),
                                name: `${card.value} - ${card.power_type}`,
                                set: (card.set || 'ERB'),
                                set_number: card.set_number != null ? card.set_number : null,
                                rarity: card.rarity != null ? card.rarity : null,
                                is_foil: !!card.is_foil
                            }));
                            const allCardsJson = JSON.stringify(allCards).replace(/"/g, '&quot;');
                            
                            // Use original art (first card) for display
                            const displayCard = allCards[0];
                            
                            // Check if this power card is One Per Deck and already in deck
                            // Check if ANY alternate art of this card is already in deck
                            const isOnePerDeck = representative.one_per_deck === true || representative.is_one_per_deck === true;
                            const isOnePerDeckInDeck = isOnePerDeck && window.deckEditorCards.some(deckCard => 
                                deckCard.type === 'power' && group.some(gc => gc.id === deckCard.cardId)
                            );
                            
                            const disabledClass = isOnePerDeckInDeck ? 'disabled' : '';
                            const disabledTitle = isOnePerDeckInDeck ? 'One Per Deck - already in deck' : '';
                            
                            cardItems.push(`
                                <div class="card-item ${disabledClass}" 
                                     draggable="${!isOnePerDeckInDeck}" 
                                     data-type="${category.type}" 
                                     data-id="${displayCard.id}"
                                     data-all-cards="${allCardsJson}"
                                     onmouseenter="showCardHoverModal('${(displayCard.imagePath || '').replace(/'/g, "\\'")}', '${summary.replace(/'/g, "\\'")}', '${(displayCard.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                     onmouseleave="hideCardHoverModal()"
                                     onclick="handleCardClick(event, '${category.type}', '${displayCard.id}', '${summary.replace(/'/g, "\\'")}')"
                                     data-name="${summary.replace(/'/g, "\\'")}"
                                     title="${disabledTitle}">
                                    <div class="card-item-content">${summary}</div>
                                    <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${displayCard.id}', '${escapeJsSingleQuoted(summary)}')" title="Add to deck (multiple copies allowed)">+</div>
                                </div>
                            `);
                        });
                        
                        // Add "Add All" button - pass one base card per value (first/representative)
                        const cardsForAddAll = sortedCardGroups.map(([, group]) => group[0]);
                        const normalizedTypeName = typeName.replace(/\s+/g, '-');
                        const addAllButton = (normalizedTypeName === 'Multi-Power' || normalizedTypeName === 'Any-Power') ? 
                            `<button class="add-all-btn" onclick="event.stopPropagation(); addAllPowerCards('${typeName}', ${JSON.stringify(cardsForAddAll).replace(/"/g, '&quot;')})">Add All</button>` : '';
                        
                        cardsHtml += `
                            <div class="character-group">
                                <div class="character-group-header" onclick="toggleCharacterGroup(this)">
                                    <span>${typeName} (${cardGroups.size})</span>
                                    <div class="mission-set-controls">
                                        ${addAllButton}
                                        <span class="collapse-icon">▶</span>
                                    </div>
                                </div>
                                <div class="character-group-content collapsed">
                                    ${cardItems.join('')}
                                </div>
                            </div>
                        `;
                    });
                    
                    // Store the grouped tile count for use in header rendering
                    powerCardTileCount = totalUniquePowerCards;
                    
                } else if (category.type === 'location') {
                    // Group locations by name (same as characters) - single entry per location, art modal for alternates
                    const groups = new Map();
                    data.data.forEach(card => {
                        const name = (card.name || '').trim();
                        if (!name) return;
                        const key = name;
                        if (!groups.has(key)) {
                            groups.set(key, []);
                        }
                        groups.get(key).push(card);
                    });
                    
                    // Sort each group: default printing first (non-foil, non-alternate, lowest #)
                    groups.forEach((group) => {
                        group.sort((a, b) => compareDeckAddDefaultPrinting(a, b));
                    });
                    
                    locationTileCount = groups.size;
                    
                    const currentLocationCount = window.deckEditorCards
                        .filter(card => card.type === 'location')
                        .reduce((total, card) => total + card.quantity, 0);
                    const isLocationLimitReached = currentLocationCount >= 1;
                    
                    cardsHtml = '';
                    groups.forEach((group) => {
                        if (group.length === 0) return;
                        const representative = group[0];
                        const name = (representative.name || '').trim();
                        
                        const allCards = group.map(card => ({
                            id: card.id,
                            imagePath: getCardImagePath(card, category.type),
                            name: card.name,
                            set: (card.set || 'ERB'),
                            set_number: card.set_number != null ? card.set_number : null,
                            rarity: card.rarity != null ? card.rarity : null,
                            is_foil: !!card.is_foil
                        }));
                        const allCardsJson = JSON.stringify(allCards).replace(/"/g, '&quot;');
                        const displayCard = allCards[0];
                        
                        const stats = [
                            { label: 'TL:', value: representative.threat_level || 0, color: '#808080' }
                        ];
                        const statsHtml = stats.map(stat => 
                            `<span class="location-stat"><span class="stat-label">${stat.label}</span><span class="stat-value" style="color: ${stat.color};">${stat.value}</span></span>`
                        ).join(' ');
                        
                        // Check if ANY alternate art of this location is already in deck
                        const isLocationInDeck = window.deckEditorCards.some(deckCard => 
                            deckCard.type === 'location' && group.some(gc => gc.id === deckCard.cardId)
                        );
                        
                        const disabledClass = (isLocationLimitReached || isLocationInDeck) ? 'disabled' : '';
                        let disabledTitle = '';
                        if (isLocationLimitReached) {
                            disabledTitle = 'Location limit reached (max 1)';
                        } else if (isLocationInDeck) {
                            disabledTitle = 'One Per Deck - already in deck';
                        }
                        
                        const locationIds = group.map(gc => gc.id).join(',');
                        cardsHtml += `
                            <div class="card-item location-card ${disabledClass}" 
                                 draggable="${!(isLocationLimitReached || isLocationInDeck)}" 
                                 data-type="${category.type}" 
                                 data-id="${displayCard.id}"
                                 data-location-ids="${locationIds}"
                                 data-all-cards="${allCardsJson}"
                                 onmouseenter="showCardHoverModal('${(displayCard.imagePath || '').replace(/'/g, "\\'")}', '${name.replace(/'/g, "\\'")}', '${(displayCard.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                                 onmouseleave="hideCardHoverModal()"
                                 onclick="handleCardClick(event, '${category.type}', '${displayCard.id}', '${name.replace(/'/g, "\\'")}')"
                                 data-name="${name.replace(/'/g, "\\'")}"
                                 title="${disabledTitle}">
                                <div class="card-item-content">
                                    <div class="location-name">${name}</div>
                                    <div class="location-stats">${statsHtml}</div>
                                </div>
                                <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${displayCard.id}', '${escapeJsSingleQuoted(name)}')" title="Add to deck (max 1 location)">+</div>
                            </div>
                        `;
                    });
                } else {
                    // Regular handling for other card types
                    cardsHtml = data.data.map(card => `
                        <div class="card-item" 
                             draggable="true" 
                             data-type="${category.type}" 
                             data-id="${card.id}"
                             onmouseenter="showCardHoverModal('${getCardImagePath(card, category.type).replace(/'/g, "\\'")}', '${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}', '${(card.id || '').replace(/'/g, "\\'")}', '${(category.type || '').replace(/'/g, "\\'")}')"
                             onmouseleave="hideCardHoverModal()"
                             onclick="handleCardClick(event, '${category.type}', '${card.id}', '${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}')"
                             data-name="${(card[category.nameField] || card.name || '').replace(/'/g, "\\'")}">
                            <div class="card-item-content">${card[category.nameField]}</div>
                            <div class="card-item-plus" onclick="handlePlusButtonClick(event, '${category.type}', '${card.id}', '${escapeJsSingleQuoted(card[category.nameField] || card.name || '')}')" title="${category.type === 'character' ? 'Add to deck (max 4 characters)' : 'Add to deck (multiple copies allowed)'}">+</div>
                        </div>
                    `).join('');
                }
                    
                    // Always collapse all available card categories by default
                    const isCollapsed = true;
                    const collapsedClass = isCollapsed ? 'collapsed' : '';
                    const collapseIcon = isCollapsed ? '▶' : '▼';
                    
                    if (category.type === 'special') {
                        // Special handling for special cards header with toggle
                        // Use grouped tile count instead of raw data length
                        const displayCount = specialCardTileCount !== null ? specialCardTileCount : data.data.length;
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${displayCount})</span>
                                        <label class="filter-toggle" onclick="event.stopPropagation()">
                                            <input type="checkbox" id="specialCardsCharacterFilter" onchange="toggleSpecialCardsCharacterFilter()">
                                            <span class="toggle-label">Hide Unusables</span>
                                        </label>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'advanced-universe') {
                        // Special handling for advanced universe cards header with character filter toggle
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${data.data.length})</span>
                                        <label class="filter-toggle" onclick="event.stopPropagation()">
                                            <input type="checkbox" id="advancedUniverseCharacterFilter" checked onchange="toggleAdvancedUniverseCharacterFilter()">
                                            <span class="toggle-label">Hide Unusables</span>
                                        </label>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'power') {
                        // Special handling for power cards header with character filter toggle
                        // Use grouped tile count instead of raw data length
                        const displayCount = powerCardTileCount !== null ? powerCardTileCount : data.data.length;
                        categoriesHtml += `
                            <div class="card-category" data-type="power">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${displayCount})</span>
                                        <label class="filter-toggle" onclick="event.stopPropagation()">
                                            <input type="checkbox" id="powerCardsCharacterFilter" onchange="togglePowerCardsCharacterFilter()">
                                            <span class="toggle-label">Hide Unusables</span>
                                        </label>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'teamwork') {
                        // Teamwork category - with filter toggle
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${data.data.length})</span>
                                        <label class="filter-toggle" onclick="event.stopPropagation()">
                                            <input type="checkbox" id="teamworkCharacterFilter" onchange="toggleTeamworkCharacterFilter()">
                                            <span class="toggle-label">Hide Unusables</span>
                                        </label>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'basic-universe') {
                        // Basic universe category - with filter toggle
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${data.data.length})</span>
                                        <label class="filter-toggle" onclick="event.stopPropagation()">
                                            <input type="checkbox" id="basicUniverseCharacterFilter" onchange="toggleBasicUniverseCharacterFilter()">
                                            <span class="toggle-label">Hide Unusables</span>
                                        </label>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'training') {
                        // Training category - with filter toggle
                        const trainingSidebarCount = data.data.filter(c => !c.is_foil).length;
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${trainingSidebarCount})</span>
                                        <label class="filter-toggle" onclick="event.stopPropagation()">
                                            <input type="checkbox" id="trainingCharacterFilter" onchange="toggleTrainingCharacterFilter()">
                                            <span class="toggle-label">Hide Unusables</span>
                                        </label>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'ally-universe') {
                        // Ally universe category - with filter toggle
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${data.data.length})</span>
                                        <label class="filter-toggle" onclick="event.stopPropagation()">
                                            <input type="checkbox" id="allyUniverseCharacterFilter" onchange="toggleAllyUniverseCharacterFilter()">
                                            <span class="toggle-label">Hide Unusables</span>
                                        </label>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'character-stacks') {
                        // Character Stacks category - with name search by subdivision
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${data.data.length})</span>
                                        <input type="text" class="character-stack-name-search" placeholder="Search names..." 
                                               onkeyup="filterCharacterStacksByName(this.value)" 
                                               onclick="expandCharacterCategoryIfNeeded(this); event.stopPropagation()"
                                               onmousedown="preventCategoryCollapse(event)"
                                               onselect="preventCategoryCollapse(event)"
                                               onfocus="preventCategoryCollapse(event)"
                                               onblur="preventCategoryCollapse(event)">
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}" 
                                     ondragover="handleAvailableCardDragOver(event)" 
                                     ondragleave="handleAvailableCardDragLeave(event)"
                                     ondrop="handleAvailableCardDrop(event)">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'character') {
                        // Special handling for characters with name search
                        // Use grouped tile count instead of raw data length
                        const displayCount = characterTileCount !== null ? characterTileCount : data.data.length;
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${displayCount})</span>
                                        <input type="text" class="character-name-search" placeholder="Search names..." 
                                               onkeyup="filterCharactersByName(this.value)" 
                                               onclick="expandCharacterCategoryIfNeeded(this); event.stopPropagation()"
                                               onmousedown="preventCategoryCollapse(event)"
                                               onselect="preventCategoryCollapse(event)"
                                               onfocus="preventCategoryCollapse(event)"
                                               onblur="preventCategoryCollapse(event)">
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}" 
                                     ondragover="handleAvailableCardDragOver(event)" 
                                     ondragleave="handleAvailableCardDragLeave(event)"
                                     ondrop="handleAvailableCardDrop(event)">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'event') {
                        // Events category - with mission filter toggle
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${data.data.length})</span>
                                        <label class="filter-toggle" onclick="event.stopPropagation()">
                                            <input type="checkbox" id="eventsMissionFilter" onchange="toggleEventsMissionFilter()">
                                            <span class="toggle-label">Hide Unusables</span>
                                        </label>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}" 
                                     ondragover="handleAvailableCardDragOver(event)" 
                                     ondragleave="handleAvailableCardDragLeave(event)"
                                     ondrop="handleAvailableCardDrop(event)">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else if (category.type === 'location') {
                        // Locations - use grouped tile count (one per location name, alternates open art modal)
                        const displayCount = locationTileCount !== null ? locationTileCount : data.data.length;
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${displayCount})</span>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}" 
                                     ondragover="handleAvailableCardDragOver(event)" 
                                     ondragleave="handleAvailableCardDragLeave(event)"
                                     ondrop="handleAvailableCardDrop(event)">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    } else {
                        // Regular handling for other card types
                        categoriesHtml += `
                            <div class="card-category">
                                <div class="card-category-header ${collapsedClass}" onclick="toggleCategory(this)">
                                    <div class="category-header-content">
                                        <span>${category.name} (${data.data.length})</span>
                                    </div>
                                    <div class="category-header-controls">
                                        <span class="collapse-icon">${collapseIcon}</span>
                                    </div>
                                </div>
                                <div class="card-category-content ${collapsedClass}" 
                                     ondragover="handleAvailableCardDragOver(event)" 
                                     ondragleave="handleAvailableCardDragLeave(event)"
                                     ondrop="handleAvailableCardDrop(event)">
                                    ${cardsHtml}
                                </div>
                            </div>
                        `;
                    }
        }
        }                
        cardCategories.innerHTML = categoriesHtml;
        
        // Update power cards filter to show correct counts after categories are loaded
        updatePowerCardsFilter();
        
        // Apply advanced universe filter (checked by default)
        updateAdvancedUniverseFilter();
        
        // Update Assist and Ambush dimming status after cards are loaded
        updateAssistLimitStatus();
        updateAmbushLimitStatus();
        
        // Also update counts immediately for initial display
        setTimeout(() => {
            updatePowerCardsFilter();
            // Ensure dimming is applied after DOM is fully rendered
            updateAssistLimitStatus();
            updateAmbushLimitStatus();
        }, 100);
    } catch (error) {
        console.error('Error loading available cards:', error);
        cardCategories.innerHTML = '<div class="error">Error loading available cards</div>';
    }
}
