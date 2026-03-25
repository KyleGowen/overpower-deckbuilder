// card-data-display.js - Card-type data loading and display functions
// Extracted from public/index.html

function getCardImageUrlForDisplay(card, cardType) {
    if (typeof window.getCardImagePath === 'function') {
        return window.getCardImagePath(
            { ...card, image_path: card.image_path || card.image },
            cardType
        );
    }
    const cdn = (window.APP_CDN_BASE || '').replace(/\/$/, '');
    const folder = { teamwork: 'teamwork-universe', 'ally-universe': 'ally-universe', training: 'training-universe', 'basic-universe': 'basic-universe' }[cardType] || cardType;
    const raw = '/src/resources/cards/images/' + folder + '/' + mapImagePathToActualFile(card.image || card.image_path || '');
    return cdn ? cdn + raw : raw;
}

async function loadMissions() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('missions');
    if (cached) {
        window.missionsData = cached;
        if (typeof populateMissionsMissionSetSelect === 'function') populateMissionsMissionSetSelect();
        if (typeof applyMissionFilters === 'function') applyMissionFilters();
        else displayMissions(cached);
        return;
    }
    try {
        const response = await fetch('/api/missions');
        const data = await response.json();

        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('missions', data.data);
            window.missionsData = data.data;
            if (typeof populateMissionsMissionSetSelect === 'function') populateMissionsMissionSetSelect();
            if (typeof applyMissionFilters === 'function') applyMissionFilters();
            else displayMissions(data.data);
        }
    } catch (error) {
        console.error('Error loading missions:', error);
    }
}

// displayMissions function moved to external file

// setupMissionSearch function moved to external file

// Event functions
async function loadEvents() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('events');
    if (cached) {
        window.eventsData = cached;
        if (typeof populateEventsMissionSetSelect === 'function') populateEventsMissionSetSelect();
        if (typeof applyEventsFilters === 'function') applyEventsFilters();
        else displayEvents(cached);
        return;
    }
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('events', data.data);
            window.eventsData = data.data;
            if (typeof populateEventsMissionSetSelect === 'function') populateEventsMissionSetSelect();
            if (typeof applyEventsFilters === 'function') applyEventsFilters();
            else displayEvents(data.data);
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// displayEvents function moved to external file

// setupEventSearch function moved to external file

// Aspect functions
async function loadAspects() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('aspects');
    if (cached) {
        displayAspects(cached);
        return;
    }
    try {
        const response = await fetch('/api/aspects');
        const data = await response.json();
        
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('aspects', data.data);
            displayAspects(data.data);
        }
    } catch (error) {
        console.error('Error loading aspects:', error);
    }
}
// displayAspects function moved to external file

// toggleFortificationsColumn function moved to filter-functions.js

// toggleOnePerDeckColumn function moved to external file

// Advanced Universe functions
async function loadAdvancedUniverse() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('advanced-universe');
    if (cached) {
        displayAdvancedUniverse(cached);
        return;
    }
    try {
        const response = await fetch('/api/advanced-universe');
        const data = await response.json();
        
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('advanced-universe', data.data);
            displayAdvancedUniverse(data.data);
        }
    } catch (error) {
        console.error('Error loading advanced universe:', error);
    }
}

// displayAdvancedUniverse function moved to external file
// displayAdvancedUniverse_OLD function removed (unused)
// toggleOnePerDeckAdvancedColumn function moved to external file

// Teamwork functions
async function loadTeamwork() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('teamwork');
    if (cached) {
        displayTeamwork(cached);
        return;
    }
    try {
        const response = await fetch('/api/teamwork');
        const data = await response.json();
        
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('teamwork', data.data);
            displayTeamwork(data.data);
        }
    } catch (error) {
        console.error('Error loading teamwork:', error);
    }
}

function displayTeamwork(teamwork) {
    const tbody = document.getElementById('teamwork-tbody');
    
    if (teamwork.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No teamwork cards found</td></tr>';
        return;
    }
    
    // Sort teamwork cards by OverPower type order: Energy, Combat, Brute Force, Intelligence, Any-Power
    const preferredOrder = ['Energy', 'Combat', 'Brute Force', 'Intelligence', 'Any-Power'];
    const sortedTeamwork = teamwork.sort((a, b) => {
        const aType = a.to_use || '';
        const bType = b.to_use || '';
        
        // Extract the power type from "X Energy", "X Combat", etc.
        const aPowerType = aType.replace(/^\d+\s+/, '');
        const bPowerType = bType.replace(/^\d+\s+/, '');
        
        const aIndex = preferredOrder.indexOf(aPowerType);
        const bIndex = preferredOrder.indexOf(bPowerType);
        
        // If both are in preferred order, sort by their position
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        
        // If only one is in preferred order, prioritize it
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // If neither is in preferred order, sort alphabetically
        return aPowerType.localeCompare(bPowerType);
    });
    
    tbody.innerHTML = sortedTeamwork.map(card => {
        const imagePath = getCardImageUrlForDisplay(card, 'teamwork');
        const imagePathEscaped = imagePath.replace(/'/g, "\\'");
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        return `
        <tr>
            <td>
                <img src="${imagePath.replace(/"/g, '&quot;')}" 
                     alt="${card.card_type || ''}" 
                     loading="lazy"
                     decoding="async"
                     style="width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiZmZmYiIHRleHQtYW5jaG9yPSJtZWRpYW4iIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                     onmouseenter="showCardHoverModal('${imagePathEscaped}', '${(card.card_type || '').replace(/'/g, "\\'")}')"
                     onmouseleave="hideCardHoverModal()"
                     onclick="openModal(this)">
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('teamwork', '${card.id}', '${(card.card_type || '').replace(/'/g, "\\'")}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${card.id}', 'teamwork', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${card.id}" data-card-type="teamwork" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${card.id}', 'teamwork', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td>${renderTeamworkValueCell(card.to_use, (card.to_use || '').trim().replace(/^\d+\s+/, ''))}</td>
            <td>${renderTeamworkValueCell(card.acts_as, (card.to_use || '').trim().replace(/^\d+\s+/, ''))}</td>
            <td>${renderFollowupAttackTypes(card.followup_attack_types)}</td>
            <td>${card.first_attack_bonus}</td>
            <td>${card.second_attack_bonus}</td>
        </tr>
    `;
    }).join('');
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// Ally Universe
async function loadAllyUniverse() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('ally-universe');
    if (cached) {
        displayAllyUniverse(cached);
        return;
    }
    try {
        const response = await fetch('/api/ally-universe');
        const data = await response.json();
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('ally-universe', data.data);
            displayAllyUniverse(data.data);
        }
    } catch (error) {
        console.error('Error loading ally universe:', error);
    }
}

function displayAllyUniverse(allies) {
    const tbody = document.getElementById('ally-universe-tbody');
    if (!allies || allies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No allies found</td></tr>';
        return;
    }
    
    // Sort ally cards by OverPower type order: Energy, Combat, Brute Force, Intelligence, Any-Power
    const preferredOrder = ['Energy', 'Combat', 'Brute Force', 'Intelligence', 'Any-Power'];
    const sortedAllies = allies.sort((a, b) => {
        const aType = a.stat_type_to_use || '';
        const bType = b.stat_type_to_use || '';
        
        const aIndex = preferredOrder.indexOf(aType);
        const bIndex = preferredOrder.indexOf(bType);
        
        // If both are in preferred order, sort by their position
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        
        // If only one is in preferred order, prioritize it
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // If neither is in preferred order, sort alphabetically
        return aType.localeCompare(bType);
    });
    
    tbody.innerHTML = sortedAllies.map(card => {
        const imagePath = getCardImageUrlForDisplay(card, 'ally-universe');
        const imagePathEscaped = imagePath.replace(/'/g, "\\'");
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        return `
        <tr>
            <td>
                <img src="${imagePathAttr}" 
                     alt="${card.card_name}" 
                     loading="lazy"
                     decoding="async"
                     style="width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiZmZmYiIHRleHQtYW5jaG9yPSJtZWRpYW4iIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                     onmouseenter="showCardHoverModal('${imagePathEscaped}', '${(card.card_name || '').replace(/'/g, "\\'")}')"
                     onmouseleave="hideCardHoverModal()"
                     onclick="openModal(this)">
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('ally-universe', '${card.id}', '${(card.card_name || '').replace(/'/g, "\\'")}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${card.id}', 'ally-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${card.id}" data-card-type="ally-universe" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${card.id}', 'ally-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td><strong>${card.card_name}</strong></td>
            <td>${card.stat_to_use}</td>
            <td>${renderAllyStatTypeIcon(card.stat_type_to_use)}</td>
            <td>${renderTeamworkValueCell(String(card.attack_value), card.attack_type)}</td>
            <td>${card.card_text}</td>
        </tr>
    `;
    }).join('');
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// setupAllyUniverseSearch function moved to external file

// Training functions
async function loadTraining() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('training');
    if (cached) {
        displayTraining(cached);
        return;
    }
    try {
        const response = await fetch('/api/training');
        const data = await response.json();
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('training', data.data);
            displayTraining(data.data);
        }
    } catch (e) { console.error('Error loading training:', e); }
}

function displayTraining(cards) {
    const tbody = document.getElementById('training-tbody');
    if (!cards || cards.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No training found</td></tr>';
        return;
    }
    tbody.innerHTML = cards.map(card => {
        const imagePath = getCardImageUrlForDisplay(card, 'training');
        const imagePathEscaped = imagePath.replace(/'/g, "\\'");
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        return `
        <tr>
            <td>
                <img src="${imagePathAttr}" 
                     alt="${card.card_name}" 
                     style="width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiZmZmYiIHRleHQtYW5jaG9yPSJtZWRpYW4iIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                     onmouseenter="showCardHoverModal('${imagePathEscaped}', '${(card.card_name || '').replace(/'/g, "\\'")}')"
                     onmouseleave="hideCardHoverModal()"
                     onclick="openModal(this)">
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('training', '${card.id}', '${(card.card_name || '').replace(/'/g, "\\'")}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${card.id}', 'training', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${card.id}" data-card-type="training" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${card.id}', 'training', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td><strong>${card.card_name.replace(/^Training \(/, '').replace(/\)$/, '')}</strong></td>
            <td>${renderAllyStatTypeIcon(card.type_1)}</td>
            <td>${renderAllyStatTypeIcon(card.type_2)}</td>
            <td>${card.value_to_use}</td>
            <td>${card.bonus}</td>
        </tr>
    `;
    }).join('');
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// setupTrainingSearch function moved to external file

// Basic Universe functions
async function loadBasicUniverse() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('basic-universe');
    if (cached) {
        displayBasicUniverse(cached);
        return;
    }
    try {
        const resp = await fetch('/api/basic-universe');
        const data = await resp.json();
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('basic-universe', data.data);
            displayBasicUniverse(data.data);
        }
    } catch (e) { console.error('Error loading basic universe:', e); }
}

function setupBasicUniverseSearch() {
    // Wire type filter toggle buttons
    const typeToggles = document.querySelectorAll('#basic-universe-tab .power-type-filter-toggle');
    typeToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('is-active');
            btn.setAttribute('aria-pressed', String(btn.classList.contains('is-active')));
            applyBasicUniverseFilters();
        });
    });

    // Add event listeners for other filter inputs
    const valueEquals = document.querySelector('#basic-universe-tab input[data-column="value"].equals');
    const valueMin = document.getElementById('basic-value-min');
    const valueMax = document.getElementById('basic-value-max');
    const bonusEquals = document.querySelector('#basic-universe-tab input[data-column="bonus"].equals');
    const bonusMin = document.getElementById('basic-bonus-min');
    const bonusMax = document.getElementById('basic-bonus-max');

    if (valueEquals) valueEquals.addEventListener('input', applyBasicUniverseFilters);
    if (valueMin) valueMin.addEventListener('input', applyBasicUniverseFilters);
    if (valueMax) valueMax.addEventListener('input', applyBasicUniverseFilters);
    if (bonusEquals) bonusEquals.addEventListener('input', applyBasicUniverseFilters);
    if (bonusMin) bonusMin.addEventListener('input', applyBasicUniverseFilters);
    if (bonusMax) bonusMax.addEventListener('input', applyBasicUniverseFilters);

    // Setup search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm.length === 0) { 
                await applyBasicUniverseFilters(); 
                return; 
            }
            try {
                const resp = await fetch('/api/basic-universe');
                const data = await resp.json();
                if (data.success) {
                    const filtered = data.data.filter(card =>
                        card.card_name.toLowerCase().includes(searchTerm) ||
                        card.type.toLowerCase().includes(searchTerm) ||
                        card.value_to_use.toLowerCase().includes(searchTerm) ||
                        card.bonus.toLowerCase().includes(searchTerm)
                    );
                    displayBasicUniverse(filtered);
                }
            } catch (err) { 
                console.error('Error searching basic universe:', err); 
            }
        });
    }
}

function displayBasicUniverse(cards) {
    const tbody = document.getElementById('basic-universe-tbody');
    if (!cards || cards.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No basic universe cards found</td></tr>';
        return;
    }
    
    // Sort basic universe cards by type, then value_to_use, then bonus
    const preferredOrder = ['Energy', 'Combat', 'Brute Force', 'Intelligence', 'Any-Power'];
    const sortedCards = cards.sort((a, b) => {
        // First sort by type using OverPower order
        const aTypeIndex = preferredOrder.indexOf(a.type);
        const bTypeIndex = preferredOrder.indexOf(b.type);
        
        if (aTypeIndex !== bTypeIndex) {
            if (aTypeIndex === -1) return 1;  // Put unknown types at end
            if (bTypeIndex === -1) return -1;
            return aTypeIndex - bTypeIndex;
        }
        
        // Then sort by value_to_use (extract numeric value)
        const aValue = parseInt(a.value_to_use) || 0;
        const bValue = parseInt(b.value_to_use) || 0;
        if (aValue !== bValue) {
            return aValue - bValue;
        }
        
        // Finally sort by bonus (extract numeric value)
        const aBonus = parseInt(a.bonus.replace('+', '')) || 0;
        const bBonus = parseInt(b.bonus.replace('+', '')) || 0;
        return aBonus - bBonus;
    });
    
    tbody.innerHTML = sortedCards.map(card => {
        const imagePath = getCardImageUrlForDisplay(card, 'basic-universe');
        const imagePathEscaped = imagePath.replace(/'/g, "\\'");
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        return `
        <tr>
            <td>
                <img src="${imagePathAttr}" 
                     alt="${card.card_name}" 
                     style="width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                     onmouseenter="showCardHoverModal('${imagePathEscaped}', '${(card.card_name || '').replace(/'/g, "\\'")}')"
                     onmouseleave="hideCardHoverModal()"
                     onclick="openModal(this)">
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('basic-universe', '${card.id}', '${(card.card_name || '').replace(/'/g, "\\'")}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${card.id}', 'basic-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${card.id}" data-card-type="basic-universe" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${card.id}', 'basic-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td><strong>${card.card_name}</strong></td>
            <td>${renderAllyStatTypeIcon(card.type)}</td>
            <td>${card.value_to_use}</td>
            <td>${card.bonus}</td>
        </tr>
    `;
    }).join('');
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// setupBasicUniverseSearch function moved to external file

// clearBasicUniverseFilters function moved to filter-functions.js

// applyBasicUniverseFilters moved to card-filter-toggles.js


// Power Cards functions
async function loadPowerCards() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('power-cards');
    if (cached) {
        displayPowerCards(cached);
        return;
    }
    try {
        const resp = await fetch('/api/power-cards');
        const data = await resp.json();
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('power-cards', data.data);
            displayPowerCards(data.data);
        }
    } catch (e) { console.error('Error loading power cards:', e); }
}

// Export all functions to window for backward compatibility
window.loadMissions = loadMissions;
window.loadEvents = loadEvents;
window.loadAspects = loadAspects;
window.loadAdvancedUniverse = loadAdvancedUniverse;
window.loadTeamwork = loadTeamwork;
window.displayTeamwork = displayTeamwork;
window.loadAllyUniverse = loadAllyUniverse;
window.displayAllyUniverse = displayAllyUniverse;
window.loadTraining = loadTraining;
window.displayTraining = displayTraining;
window.loadBasicUniverse = loadBasicUniverse;
window.setupBasicUniverseSearch = setupBasicUniverseSearch;
window.displayBasicUniverse = displayBasicUniverse;
window.loadPowerCards = loadPowerCards;
