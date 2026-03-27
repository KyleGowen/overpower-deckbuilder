// Card Display Functions
// Extracted from index.html for better modularity

function missionUseMobileListArt() {
    if (typeof window.isLayoutMobileForCardDisplay === 'function' && window.isLayoutMobileForCardDisplay()) {
        return true;
    }
    if (typeof window.isNarrowViewportDbvBand === 'function' && window.isNarrowViewportDbvBand()) {
        return true;
    }
    return false;
}

// Display missions
function displayMissions(missions) {
    const tbody = document.getElementById('missions-tbody');

    if (missions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No missions found</td></tr>';
        return;
    }

    const useMobileListArt = missionUseMobileListArt();
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');

    // Sort missions by mission set first, then by card name alphabetically
    const sortedMissions = missions.sort((a, b) => {
        if (a.mission_set !== b.mission_set) {
            return a.mission_set.localeCompare(b.mission_set);
        }
        return a.card_name.localeCompare(b.card_name);
    });

    tbody.innerHTML = sortedMissions
        .map((mission) => {
            let imagePath;
            if (typeof window.getCardImagePath === 'function') {
                imagePath = window.getCardImagePath({ ...mission, image_path: mission.image_path || mission.image }, 'mission');
            } else {
                const cdn = (window.APP_CDN_BASE || '').replace(/\/$/, '');
                const raw = '/src/resources/cards/images/missions/' + mapImagePathToActualFile(mission.image || '');
                imagePath = cdn ? cdn + raw : raw;
            }
            const imagePathEscaped = imagePath.replace(/'/g, "\\'");
            const imagePathAttr = imagePath.replace(/"/g, '&quot;');
            const nameEsc = mission.card_name.replace(/'/g, "\\'");
            const idEsc = (mission.id || '').replace(/'/g, "\\'");

            const imgStyle = useMobileListArt
                ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
                : 'width: 120px !important; height: auto !important; max-height: 180px !important; cursor: pointer;';

            const setLine =
                typeof window.dbvSetCaptionLineFromCard === 'function'
                    ? window.dbvSetCaptionLineFromCard(mission)
                    : '';

            const captionHtml = useMobileListArt
                ? `
                <div class="characters-mobile-card-caption">
                    <div class="characters-mobile-card-caption__name">${esc(mission.card_name || '')}</div>
                    <div class="characters-mobile-card-caption__mission-set">${esc(mission.mission_set || '')}</div>
                    <div class="characters-mobile-card-caption__set-line">${esc(setLine)}</div>
                </div>`
                : '';

            const imgCellInner = useMobileListArt
                ? `
                <div class="card-image-container">
                    <img src="${imagePathAttr}"
                         alt="${mission.card_name}"
                         data-dbv-lightbox-context="mission"
                         loading="lazy"
                         decoding="async"
                         style="${imgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'mission')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                ${captionHtml}`
                : `
                <img src="${imagePathAttr}"
                     alt="${mission.card_name}"
                     loading="lazy"
                     decoding="async"
                     onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'mission')"
                     onmouseleave="hideCardHoverModal()"
                     onclick="openModal(this)"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='"
                     style="${imgStyle}">`;

            return `
        <tr>
            <td${useMobileListArt ? ' data-label="Image"' : ''}>
                ${imgCellInner}
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('mission', '${mission.id}', '${nameEsc}', this)">
                    +Deck
                </button>
                ${typeof getCurrentUser === 'function' && getCurrentUser()
                    ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${mission.id}', 'mission', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${mission.id}" data-card-type="mission" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${mission.id}', 'mission', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                `
                    : ''}
            </td>
            <td>${mission.mission_set}</td>
            <td>${mission.card_name}</td>
        </tr>
    `;
        })
        .join('');
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// Display events (desktop table + mobile card rows; single art — no nav arrows)
function displayEvents(events) {
    const tbody = document.getElementById('events-tbody');
    if (!tbody) return;

    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');

    if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No events found</td></tr>';
        return;
    }

    const sortedEvents = [...events].sort((a, b) => {
        if (a.mission_set !== b.mission_set) {
            return String(a.mission_set || '').localeCompare(String(b.mission_set || ''));
        }
        return String(a.name || '').localeCompare(String(b.name || ''));
    });

    tbody.innerHTML = '';

    const useMobileList =
        typeof window.isLayoutMobileForCardDisplay === 'function' && window.isLayoutMobileForCardDisplay();

    function eventImagePaths(ev) {
        if (typeof window.getCardImagePathForDisplay === 'function') {
            const thumb = window.getCardImagePathForDisplay(
                { ...ev, image_path: ev.image_path || ev.image },
                'event',
                { useThumbnail: true }
            );
            const full = window.getCardImagePathForDisplay({ ...ev, image_path: ev.image_path || ev.image }, 'event');
            return { thumb, full: full || thumb };
        }
        let imagePath;
        if (typeof window.getCardImagePath === 'function') {
            imagePath = window.getCardImagePath({ ...ev, image_path: ev.image_path || ev.image }, 'event');
        } else {
            const cdn = (window.APP_CDN_BASE || '').replace(/\/$/, '');
            const raw = '/src/resources/cards/images/events/' + mapImagePathToActualFile(ev.image || '');
            imagePath = cdn ? cdn + raw : raw;
        }
        return { thumb: imagePath, full: imagePath };
    }

    sortedEvents.forEach((event) => {
        const { thumb: imagePath, full: fullResPath } = eventImagePaths(event);
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        const fullResEscaped = (fullResPath || imagePath).replace(/'/g, "\\'");
        const fullResAttr = (fullResPath || imagePath).replace(/"/g, '&quot;');
        const namePlain = event.name != null ? String(event.name) : '';
        const nameEsc = esc(namePlain);
        const nameJs = namePlain.replace(/'/g, "\\'");
        const missionSetPlain = event.mission_set != null ? String(event.mission_set).trim() : '';
        const gameEffectPlain = event.game_effect != null ? String(event.game_effect) : '';
        const flavorStripped = String(event.flavor_text != null ? event.flavor_text : '').replace(/^\*|\*$/g, '');

        const eventDbvImgStyle = useMobileList
            ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
            : 'width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;';

        const capSet = `<div class="characters-mobile-card-caption__set"${missionSetPlain ? '' : ' style="display:none;"'}>${missionSetPlain ? esc(missionSetPlain) : ''}</div>`;
        const capEffect = `<div class="characters-mobile-card-caption__game-effect"${gameEffectPlain.trim() ? '' : ' style="display:none;"'}>${gameEffectPlain.trim() ? esc(gameEffectPlain) : ''}</div>`;
        const capFlavor = `<div class="characters-mobile-card-caption__flavor"${flavorStripped.trim() ? '' : ' style="display:none;"'}>${flavorStripped.trim() ? esc(flavorStripped.trim()) : ''}</div>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Image">
                <div class="card-image-container">
                    <img src="${imagePathAttr}"
                         data-full-res="${fullResAttr}"
                         alt="${nameEsc}"
                         loading="lazy"
                         decoding="async"
                         style="${eventDbvImgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${fullResEscaped}', '${nameJs}', '${String(event.id || '').replace(/'/g, "\\'")}', 'event')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                <div class="characters-mobile-card-caption">
                    <div class="characters-mobile-card-caption__name">${nameEsc}</div>
                    ${capSet}
                    ${capEffect}
                    ${capFlavor}
                </div>
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('event', '${event.id}', '${nameJs}', this)">
                    +Deck
                </button>
                ${typeof getCurrentUser === 'function' && getCurrentUser()
                    ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${event.id}', 'event', '${fullResEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${event.id}" data-card-type="event" data-image-path="${fullResAttr}" onclick="removeOneFromCollection('${event.id}', 'event', '${fullResEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                `
                    : ''}
            </td>
            <td><strong>${event.name}</strong></td>
            <td>${event.mission_set}</td>
            <td>${event.game_effect}</td>
            <td><em>${event.flavor_text.replace(/^\*|\*$/g, '')}</em></td>
        `;

        tbody.appendChild(row);

        const img = row.querySelector('img');
        if (img && typeof window.applyDbvHorizontalCardClass === 'function') {
            const syncOrientation = function () {
                window.applyDbvHorizontalCardClass(img);
            };
            if (img.complete && img.naturalWidth) {
                syncOrientation();
            } else {
                img.addEventListener('load', syncOrientation, { once: true });
            }
            if (typeof window.applyCharacterImageRowHeightLock === 'function') {
                window.applyCharacterImageRowHeightLock(row);
            }
        }

        if (typeof isGuestUser === 'function' && isGuestUser()) {
            const addToDeckBtn = row.querySelector('.add-to-deck-btn');
            if (addToDeckBtn) {
                addToDeckBtn.disabled = true;
                addToDeckBtn.style.opacity = '0.5';
                addToDeckBtn.style.cursor = 'not-allowed';
                addToDeckBtn.title = 'Log in to add to decks...';
                addToDeckBtn.setAttribute('data-guest-disabled', 'true');
            }
        }
    });
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

function aspectUseMobileListArt() {
    if (typeof window.isLayoutMobileForCardDisplay === 'function' && window.isLayoutMobileForCardDisplay()) {
        return true;
    }
    if (typeof window.isNarrowViewportDbvBand === 'function' && window.isNarrowViewportDbvBand()) {
        return true;
    }
    return false;
}

function powerUseMobileListArt() {
    return aspectUseMobileListArt();
}

function aspectMobileCaptionOptionalLine(className, text) {
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');
    const t = text != null ? String(text).trim() : '';
    return `<div class="${className}"${t ? '' : ' style="display:none;"'}>${t ? esc(t) : ''}</div>`;
}

// Display aspects
function displayAspects(aspects) {
    const tbody = document.getElementById('aspects-tbody');

    if (aspects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">No aspects found</td></tr>';
        return;
    }

    const useMobileListArt = aspectUseMobileListArt();
    const plainEffect =
        typeof window.specialCardEffectPlainForMobileCaption === 'function'
            ? window.specialCardEffectPlainForMobileCaption
            : (raw) => String(raw || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    tbody.innerHTML = aspects
        .map((aspect) => {
            let imagePath;
            if (typeof window.getCardImagePath === 'function') {
                imagePath = window.getCardImagePath({ ...aspect, image_path: aspect.image_path || aspect.image }, 'aspect');
            } else {
                const cdn = (window.APP_CDN_BASE || '').replace(/\/$/, '');
                const raw = '/src/resources/cards/images/aspects/' + mapImagePathToActualFile(aspect.image || '');
                imagePath = cdn ? cdn + raw : raw;
            }
            const imagePathEscaped = imagePath.replace(/'/g, "\\'");
            const imagePathAttr = imagePath.replace(/"/g, '&quot;');
            const nameEsc = aspect.card_name.replace(/'/g, "\\'");
            const idEsc = (aspect.id || '').replace(/'/g, "\\'");
            const effectSource = aspect.aspect_description || aspect.card_effect || '';
            const effectPlainForCaption = plainEffect(effectSource);
            const effectTdHtml = formatSpecialCardEffect(
                aspect.aspect_description || aspect.card_effect || 'No description available'
            );

            const imgStyle = useMobileListArt
                ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
                : 'width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;';

            const esc =
                typeof window.escapeHtmlText === 'function'
                    ? window.escapeHtmlText
                    : (s) =>
                          String(s)
                              .replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;');

            const captionHtml = useMobileListArt
                ? `
                <div class="characters-mobile-card-caption">
                    <div class="characters-mobile-card-caption__name">${esc(aspect.card_name || '')}</div>
                    ${aspectMobileCaptionOptionalLine('characters-mobile-card-caption__location', aspect.location || '')}
                    ${aspectMobileCaptionOptionalLine('characters-mobile-card-caption__ability', effectPlainForCaption)}
                    ${aspectMobileCaptionOptionalLine('characters-mobile-card-caption__fortification', aspect.is_fortification ? 'Fortification!' : '')}
                    ${aspectMobileCaptionOptionalLine('characters-mobile-card-caption__opd', aspect.is_one_per_deck ? 'One Per Deck' : '')}
                </div>`
                : '';

            return `
        <tr>
            <td data-label="Image">
                <div class="card-image-container">
                    <img src="${imagePathAttr}"
                         alt="${aspect.card_name}"
                         data-dbv-lightbox-context="aspect"
                         loading="lazy"
                         decoding="async"
                         style="${imgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtZWRpYW4iIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'aspect')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                ${captionHtml}
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('aspect', '${aspect.id}', '${nameEsc}', this)">
                    +Deck
                </button>
                ${typeof getCurrentUser === 'function' && getCurrentUser()
                    ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${aspect.id}', 'aspect', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${aspect.id}" data-card-type="aspect" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${aspect.id}', 'aspect', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                `
                    : ''}
            </td>
            <td data-label="Card Name"><strong>${aspect.card_name}</strong></td>
            <td data-label="Location">${aspect.location}</td>
            <td data-label="Card Effect">${effectTdHtml}</td>
            <td data-label="Icon">${renderSpecialIconBadges(aspect)}</td>
            <td data-label="Value">${aspect.value != null ? aspect.value : '-'}</td>
            <td class="fortifications-column" data-label="Fortifications">${aspect.is_fortification ? 'Yes' : 'No'}</td>
            <td class="one-per-deck-column" data-label="One Per Deck">${aspect.is_one_per_deck ? 'Yes' : 'No'}</td>
        </tr>
    `;
        })
        .join('');

    tbody.querySelectorAll('tr td:first-child img').forEach((img) => {
        if (typeof window.applyDbvHorizontalCardClass === 'function') {
            if (img.complete && img.naturalWidth) {
                window.applyDbvHorizontalCardClass(img);
            } else {
                img.addEventListener('load', () => window.applyDbvHorizontalCardClass(img), { once: true });
            }
        }
    });

    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

/**
 * Format advanced universe card effect text with proper HTML encoding and keyword highlighting
 */
function formatAdvancedUniverseCardEffect(effectText, cardData = null) {
    if (!effectText) return '';

    // Decode HTML entities in the text
    let decodedText = effectText
        .replace(/\\'93/g, "'")  // Left single quotation mark (escaped)
        .replace(/\\'94/g, "'")  // Right single quotation mark (escaped)
        .replace(/&#39;/g, "'")  // Single quotation mark
        .replace(/&apos;/g, "'") // Single quotation mark (alternative)
        .replace(/&quot;/g, '"') // Double quotes
        .replace(/&amp;/g, '&')  // Ampersands
        .replace(/&lt;/g, '<')   // Less than
        .replace(/&gt;/g, '>')   // Greater than
        .replace(/&nbsp;/g, ' '); // Non-breaking spaces

    // Define special keywords and desired display order (One Per Deck last)
    const orderedKeywords = ['**One Per Deck**'];
    const foundKeywords = [];
    
    // Find all special keywords in the text
    for (const keyword of orderedKeywords) {
        if (decodedText.includes(keyword)) {
            foundKeywords.push(keyword);
        }
    }
    
    // Check if card has one_per_deck=true and add the label if not already present
    if (cardData && cardData.is_one_per_deck === true && !foundKeywords.includes('**One Per Deck**')) {
        foundKeywords.push('**One Per Deck**');
    }
    
    if (foundKeywords.length > 0) {
        // Remove all special keywords from the main text
        let mainText = decodedText;
        for (const keyword of orderedKeywords) {
            mainText = mainText.replace(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
        }
        
        // Clean up extra spaces and trim
        mainText = mainText.replace(/\s+/g, ' ').trim();
        
        // Sort keywords in the desired order (ensures One Per Deck is last)
        const sortedKeywords = foundKeywords.sort((a, b) => orderedKeywords.indexOf(a) - orderedKeywords.indexOf(b));
        
        // Create keyword lines (convert ** to <strong> tags)
        const keywordLines = sortedKeywords.map(keyword => keyword.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));
        
        // Format: main text + keywords on separate lines
        return (mainText ? mainText + '<br><br>' : '') + keywordLines.join('<br>');
    }
    
    // If no special keywords found, return the decoded text
    return decodedText;
}

/** Same mobile list-art gate as Special Cards (layout-mobile or narrow DBV viewport). */
function advancedUniverseUseMobileListArt() {
    if (typeof window !== 'undefined' && typeof window.isLayoutMobile === 'function' && window.isLayoutMobile()) {
        return true;
    }
    try {
        return !!(window.matchMedia && window.matchMedia('(max-width: 900px)').matches);
    } catch {
        return false;
    }
}

// Display advanced universe cards
function displayAdvancedUniverse(advancedUniverse) {
    const tbody = document.getElementById('advanced-universe-tbody');
    if (!tbody) return;

    if (advancedUniverse.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No advanced universe cards found</td></tr>';
        return;
    }

    const useMobileListArt = advancedUniverseUseMobileListArt();
    const esc = typeof window.escapeHtmlText === 'function'
        ? window.escapeHtmlText
        : (s) => String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

    tbody.innerHTML = advancedUniverse.map((card) => {
        let imagePath;
        if (typeof window.getCardImagePath === 'function') {
            imagePath = window.getCardImagePath({ ...card, image_path: card.image_path || card.image }, 'advanced-universe');
        } else {
            const cdn = (window.APP_CDN_BASE || '').replace(/\/$/, '');
            const raw = (card.image || '').startsWith('advanced-universe/')
                ? '/src/resources/cards/images/' + (card.image || '')
                : '/src/resources/cards/images/advanced-universe/' + (card.image || '');
            imagePath = cdn ? cdn + raw : raw;
        }
        const imagePathEscaped = imagePath.replace(/'/g, "\\'");
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        const rawEffect = card.card_description || card.card_effect || 'No description available';
        const effectHtml = formatAdvancedUniverseCardEffect(rawEffect, card);
        const charTrim = card.character != null ? String(card.character).trim() : '';
        const charCaptionLine = charTrim
            ? `<div class="characters-mobile-card-caption__character">${esc(charTrim)}</div>`
            : '';
        const imgStyle = useMobileListArt
            ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
            : 'width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;';

        return `
        <tr>
            <td data-label="Image">
                <div class="card-image-container">
                    <img src="${imagePathAttr}"
                         alt="${card.name}"
                         data-dbv-lightbox-context="advanced-universe"
                         loading="lazy"
                         decoding="async"
                         style="${imgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onclick="openModal(this)"
                         onmouseenter="showCardHoverModal('${imagePathEscaped}', '${card.name.replace(/'/g, "\\'")}', '${(card.id || '').replace(/'/g, "\\'")}', 'advanced-universe')"
                         onmouseleave="hideCardHoverModal()">
                </div>
                <div class="characters-mobile-card-caption">
                    <div class="characters-mobile-card-caption__name">${esc(card.name)}</div>
                    ${charCaptionLine}
                    <div class="characters-mobile-card-caption__ability">${effectHtml}</div>
                </div>
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('advanced-universe', '${card.id}', '${card.name.replace(/'/g, "\\'")}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${card.id}', 'advanced-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${card.id}" data-card-type="advanced-universe" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${card.id}', 'advanced-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td data-label="Name"><strong>${card.name}</strong></td>
            <td data-label="Character">${card.character}</td>
            <td data-label="Card Effect">${effectHtml}</td>
            <td class="one-per-deck-advanced-column" data-label="One Per Deck">${card.is_one_per_deck ? 'Yes' : 'No'}</td>
        </tr>
    `;
    }).join('');

    tbody.querySelectorAll('tr').forEach((row) => {
        const img = row.querySelector('td:first-child img');
        if (!img) return;
        const syncOrientation = () => {
            if (typeof window.applyDbvHorizontalCardClass === 'function') {
                window.applyDbvHorizontalCardClass(img);
            }
        };
        if (img.complete && img.naturalWidth) {
            syncOrientation();
        } else {
            img.addEventListener('load', syncOrientation, { once: true });
        }
    });

    if (typeof isGuestUser === 'function' && isGuestUser()) {
        tbody.querySelectorAll('.add-to-deck-btn').forEach((addToDeckBtn) => {
            addToDeckBtn.disabled = true;
            addToDeckBtn.style.opacity = '0.5';
            addToDeckBtn.style.cursor = 'not-allowed';
            addToDeckBtn.title = 'Log in to add to decks...';
            addToDeckBtn.setAttribute('data-guest-disabled', 'true');
        });
    }

    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// Display teamwork cards
function displayTeamwork(teamwork) {
    const tbody = document.getElementById('teamwork-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = teamwork.map(card => `
        <tr>
            <td>${card.card_name}</td>
            <td>${card.to_use}</td>
            <td>${card.followup_attack_types}</td>
            <td>${card.first_attack_bonus}</td>
            <td>${card.second_attack_bonus}</td>
        </tr>
    `).join('');
}

// Display ally universe cards
function displayAllyUniverse(allies) {
    const tbody = document.getElementById('ally-universe-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = allies.map(card => `
        <tr>
            <td>${card.card_name}</td>
            <td>${card.stat_to_use}</td>
            <td>${card.stat_type_to_use}</td>
            <td>${card.attack_value}</td>
            <td>${card.attack_type}</td>
            <td>${card.card_text}</td>
        </tr>
    `).join('');
}

// Display training cards
function displayTraining(cards) {
    const tbody = document.getElementById('training-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = cards.map(card => `
        <tr>
            <td>${card.card_name}</td>
            <td>${card.type_1}</td>
            <td>${card.type_2}</td>
            <td>${card.value_to_use}</td>
            <td>${card.bonus}</td>
        </tr>
    `).join('');
}

// Display basic universe cards
function displayBasicUniverse(cards) {
    const tbody = document.getElementById('basic-universe-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = cards.map(card => `
        <tr>
            <td>${card.card_name}</td>
            <td>${card.type}</td>
            <td>${card.value_to_use}</td>
            <td>${card.bonus}</td>
            <td>${card.card_text}</td>
        </tr>
    `).join('');
}

// Display power cards
function displayPowerCards(cards) {
    const tbody = document.getElementById('power-cards-tbody');
    if (!tbody) {
        console.error('❌ power-cards-tbody element not found!');
        return;
    }

    tbody.innerHTML = '';

    if (!cards || cards.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No power cards found</td></tr>';
        return;
    }

    const useMobileListArt = powerUseMobileListArt();
    
    // Group power cards by power_type and value only (not set) — includes alternates across sets
    // e.g. 5 Multi Power: Tarzan (ERB) and Cthulhu (ERBP) are alternate arts of the same card
    // Exclude foil cards — they only appear on ALL tab; foil+base of same art should not show arrows
    const groups = new Map();
    
    cards.forEach(card => {
        if (card.is_foil) return; // foils only on ALL tab, not in type-tab art cycling
        // Normalize values to ensure consistent grouping
        const powerType = (card.power_type || card.type || '').trim();
        const value = String(card.value || '').trim(); // Convert to string for consistent comparison
        // Key omits set so Tarzan (ERB) and Cthulhu (ERBP) group together
        const key = `${powerType}|${value}`;
        
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        
        groups.get(key).push(card);
    });
    
    // Sort each group: original art first (image_path doesn't contain /alternate/), then alternates
    groups.forEach((group, key) => {
        group.sort((a, b) => {
            const aIsAlternate = (a.image_path || a.image || '').includes('/alternate/');
            const bIsAlternate = (b.image_path || b.image || '').includes('/alternate/');
            
            if (aIsAlternate && !bIsAlternate) return 1;  // b (original) comes first
            if (!aIsAlternate && bIsAlternate) return -1; // a (original) comes first
            return 0; // Keep original order for same type
        });
    });
    
    const groupedCards = groups;
    
    // Sort groups by power_type using OverPower order: Energy → Combat → Brute Force → Intelligence → Multi Power → Any-Power
    // Then sort by value within each type
    const preferredOrder = ['Energy', 'Combat', 'Brute Force', 'Intelligence', 'Multi Power', 'Any-Power'];
    const sortedGroups = Array.from(groupedCards.entries()).sort(([keyA, groupA], [keyB, groupB]) => {
        const repA = groupA[0];
        const repB = groupB[0];
        const aTypeIndex = preferredOrder.indexOf(repA.power_type || repA.type || '');
        const bTypeIndex = preferredOrder.indexOf(repB.power_type || repB.type || '');
        
        // If both are in preferred order, sort by their position
        if (aTypeIndex !== -1 && bTypeIndex !== -1) {
            if (aTypeIndex !== bTypeIndex) {
                return aTypeIndex - bTypeIndex;
            }
            // Same type, sort by value
            return (repA.value || 0) - (repB.value || 0);
        }
        
        // If only one is in preferred order, prioritize it
        if (aTypeIndex !== -1) return -1;
        if (bTypeIndex !== -1) return 1;
        
        // If neither is in preferred order, sort alphabetically by type, then by value
        const typeCompare = (repA.power_type || repA.type || '').localeCompare(repB.power_type || repB.type || '');
        if (typeCompare !== 0) return typeCompare;
        return (repA.value || 0) - (repB.value || 0);
    });

    if (sortedGroups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No power cards found</td></tr>';
        return;
    }

    // Process each group
    sortedGroups.forEach(([key, group]) => {
        if (group.length === 0) return;
        
        // Use the first card (original art) as the representative
        const representative = group[0];

        const esc =
            typeof window.escapeHtmlText === 'function'
                ? window.escapeHtmlText
                : (s) =>
                      String(s)
                          .replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/"/g, '&quot;');

        function powerMobileCaptionLinesForCard(card) {
            const typeIconHtmlCard = renderAllyStatTypeIcon(card.power_type || card.type || '');
            const setNameRawC = (card.set_name || 'Edgar Rice Burroughs and the World Legends').trim();
            const setNumRawC =
                card.set_number != null && String(card.set_number).trim() !== ''
                    ? String(card.set_number).trim()
                    : '';
            const setLinePlainC = setNumRawC ? `${setNameRawC} - ${setNumRawC}` : setNameRawC;
            return {
                powerMobileTypeValueHtml: `<span class="special-power-icons-cell">${typeIconHtmlCard}</span><span class="characters-mobile-card-caption__power-value-num">${esc(String(card.value ?? ''))}</span>`,
                powerMobileSetLine: setLinePlainC,
            };
        }

        // Prepare image data for navigation (include per-art caption fields for mobile)
        const imageData = group.map((card) => ({
            id: card.id,
            imagePath: getCardImagePathForDisplay(card, 'power'),
            name: card.name || `${card.value} - ${card.power_type}`,
            isFoil: !!card.is_foil,
            ...powerMobileCaptionLinesForCard(card),
        }));
        
        // Create unique identifier for this card group
        const groupId = `power-group-${representative.id}`;
        
        // Build navigation arrows HTML (only show if there are multiple images)
        const hasMultipleImages = imageData.length > 1;
        const navArrows = hasMultipleImages ? `
            <button class="card-nav-arrow card-nav-prev" onclick="navigateCardImage('${groupId}', -1)" aria-label="Previous art" type="button">‹</button>
            <button class="card-nav-arrow card-nav-next" onclick="navigateCardImage('${groupId}', 1)" aria-label="Next art" type="button">›</button>
        ` : '';
        
        // Current image (starts with original art - index 0)
        const currentImage = imageData[0];
        const currentImagePath = currentImage.imagePath;
        const currentImageName = currentImage.name;

        const imgStyle = useMobileListArt
            ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
            : 'width: 120px; height: auto; max-height: 180px; object-fit: contain; border-radius: 5px; cursor: pointer;';

        const navClass = hasMultipleImages ? ' card-image-container--with-nav' : '';

        const typeIconHtml = renderAllyStatTypeIcon(representative.power_type || representative.type || '');
        const setNameRaw = (representative.set_name || 'Edgar Rice Burroughs and the World Legends').trim();
        const setNumRaw =
            representative.set_number != null && String(representative.set_number).trim() !== ''
                ? String(representative.set_number).trim()
                : '';
        const setLinePlain = setNumRaw ? `${setNameRaw} - ${setNumRaw}` : setNameRaw;

        const captionHtml = useMobileListArt
            ? `
                <div class="characters-mobile-card-caption characters-mobile-card-caption--power">
                    <div class="characters-mobile-card-caption__power-type-value-line">
                        <span class="special-power-icons-cell">${typeIconHtml}</span>
                        <span class="characters-mobile-card-caption__power-value-num">${esc(String(representative.value ?? ''))}</span>
                    </div>
                    <div class="characters-mobile-card-caption__power-set-line">${esc(setLinePlain)}</div>
                </div>`
            : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Image">
                <div class="card-image-container${navClass}">
                    ${navArrows}
                    <img id="${groupId}-img"
                         src="${currentImagePath}" 
                         alt="${currentImageName}" 
                         style="${imgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${(currentImagePath || '').replace(/'/g, "\\'")}', '${currentImageName.replace(/'/g, "\\'")}', '${(currentImage.id || '').replace(/'/g, "\\'")}', 'power')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                ${captionHtml}
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('power', '${currentImage.id}', '${currentImageName.replace(/'/g, "\\'")}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${currentImage.id}', 'power', '${(currentImage.imagePath || currentImagePath || '').replace(/'/g, "\\'")}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${currentImage.id}" data-card-type="power" data-image-path="${(currentImage.imagePath || currentImagePath || '').replace(/"/g, '&quot;')}" onclick="removeOneFromCollection('${currentImage.id}', 'power', '${(currentImage.imagePath || currentImagePath || '').replace(/'/g, "\\'")}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td>${renderAllyStatTypeIcon(representative.power_type || representative.type || '')}</td>
            <td>${representative.value || ''}</td>
        `;
        
        // Store image data in data attribute for navigation
        row.querySelector('.card-image-container').setAttribute('data-image-data', JSON.stringify(imageData));
        row.querySelector('.card-image-container').setAttribute('data-current-index', '0');
        
        tbody.appendChild(row);
        
        // Lock row height after image loads to prevent changes when cycling images
        const img = row.querySelector('img');
        if (img) {
            const lockRowHeight = () => {
                // Mobile list layout: fixed td/row heights clip the caption under the image when
                // alternate-art nav is present (flex + max-height). Desktop DBV still locks.
                if (typeof powerUseMobileListArt === 'function' && powerUseMobileListArt()) {
                    return;
                }
                const imageCell = row.querySelector('td:nth-child(1)');
                if (imageCell && !imageCell.dataset.heightLocked) {
                    // Lock both the cell and the row height
                    // Use setProperty with important to prevent override
                    const cellHeight = imageCell.offsetHeight;
                    const rowHeight = row.offsetHeight;
                    
                    if (cellHeight > 0) {
                        const cellHeightStr = cellHeight + 'px';
                        imageCell.style.setProperty('height', cellHeightStr, 'important');
                        imageCell.style.setProperty('min-height', cellHeightStr, 'important');
                        imageCell.style.setProperty('max-height', cellHeightStr, 'important');
                        imageCell.dataset.heightLocked = 'true';
                    }
                    
                    // Also lock the row height to prevent table recalculation
                    if (rowHeight > 0) {
                        const rowHeightStr = rowHeight + 'px';
                        row.style.setProperty('height', rowHeightStr, 'important');
                        row.style.setProperty('min-height', rowHeightStr, 'important');
                        row.style.setProperty('max-height', rowHeightStr, 'important');
                        row.dataset.heightLocked = 'true';
                    }
                }
            };
            
            if (img.complete) {
                // Image already loaded
                setTimeout(lockRowHeight, 100);
            } else {
                // Wait for image to load
                img.addEventListener('load', lockRowHeight, { once: true });
                // Fallback timeout
                setTimeout(lockRowHeight, 1000);
            }
        }
        if (typeof isGuestUser === 'function' && isGuestUser()) {
            const addToDeckBtn = row.querySelector('.add-to-deck-btn');
            if (addToDeckBtn) {
                addToDeckBtn.disabled = true;
                addToDeckBtn.style.opacity = '0.5';
                addToDeckBtn.style.cursor = 'not-allowed';
                addToDeckBtn.title = 'Log in to add to decks...';
                addToDeckBtn.setAttribute('data-guest-disabled', 'true');
            }
        }
    });
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// Make functions globally available
window.displayAdvancedUniverse = displayAdvancedUniverse;
window.displayTeamwork = displayTeamwork;
window.displayAllyUniverse = displayAllyUniverse;
window.displayTraining = displayTraining;
window.displayBasicUniverse = displayBasicUniverse;
window.displayPowerCards = displayPowerCards;
window.powerUseMobileListArt = powerUseMobileListArt;
window.displayAspects = displayAspects;
window.displayMissions = displayMissions;
window.displayEvents = displayEvents;
window.displayLocations = displayLocations;
