/* ========================================
 * PHASE 3: CARD DISPLAY FUNCTIONS
 * ========================================
 * 
 * This file contains all card rendering and display functions extracted from
 * index.html during Phase 3 of the refactoring project.
 * 
 * Purpose: All card rendering and display functions
 * Created: Phase 3 of 12-phase refactoring project
 * Contains:
 *   - displayCharacters() - Character card rendering
 *   - displaySpecialCards() - Special card rendering
 *   - displayLocations() - Location card rendering
 *   - formatSpecialCardEffect() - Card effect formatting
 *   - All other card type display functions
 * 
 * ======================================== */

/**
 * Group cards by name, universe, and card type
 * Returns a map where key is "name|universe|type" and value is array of cards
 * Original art (non-alternate) is placed first in each group
 *
 * @param options.mergeAcrossSets When true (locations list), key is "name|type" so ERB base + ERBP
 *   alternate art for the same location name share one row and art navigation (set no longer splits rows).
 */
function groupCardsByVariant(cards, nameField = 'name', universeField = 'universe', options = {}) {
    const mergeAcrossSets = options && options.mergeAcrossSets === true;
    const groups = new Map();
    
    cards.forEach(card => {
        if (card.is_foil) return; // foils only appear on the ALL tab, not in art cycling
        const name = card[nameField] || card.name || '';
        const set = card[universeField] || card.set || 'ERB';
        const cardType = card.card_type || 'character';
        const key = mergeAcrossSets
            ? `${name}|${cardType}`
            : `${name}|${set}|${cardType}`;
        
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        
        groups.get(key).push(card);
    });
    
    // Sort each group: original art first, then alternates
    groups.forEach((group, _key) => {
        group.sort((a, b) => {
            const aIsAlternate = (a.image_path || a.image || '').includes('alternate/');
            const bIsAlternate = (b.image_path || b.image || '').includes('alternate/');

            if (aIsAlternate && !bIsAlternate) return 1;  // b (original) comes first
            if (!aIsAlternate && bIsAlternate) return -1; // a (original) comes first
            return 0; // Keep original order for same type
        });
    });

    // Ensure stable, user-friendly ordering for display:
    // sort groups alphabetically by card name using the global Alphabetization scheme when available.
    const compareText =
        (typeof window !== 'undefined' &&
            window.Alphabetization &&
            typeof window.Alphabetization.compare === 'function')
            ? window.Alphabetization.compare
            : (a, b) => String(a ?? '').localeCompare(String(b ?? ''));

    const sortedEntries = Array.from(groups.entries()).sort(([_keyA, groupA], [_keyB, groupB]) => {
        const repA = groupA?.[0] || {};
        const repB = groupB?.[0] || {};

        const nameA = repA[nameField] || repA.name || '';
        const nameB = repB[nameField] || repB.name || '';
        const nameCmp = compareText(nameA, nameB);
        if (nameCmp !== 0) return nameCmp;

        const setA = repA[universeField] || repA.set || 'ERB';
        const setB = repB[universeField] || repB.set || 'ERB';
        const setCmp = compareText(setA, setB);
        if (setCmp !== 0) return setCmp;

        const typeA = repA.card_type || '';
        const typeB = repB.card_type || '';
        return compareText(typeA, typeB);
    });

    return new Map(sortedEntries);
}

function escapeHtmlText(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Up to three lines under character art on mobile DBV: name, inherent ability, "set - number".
 * Line 1: full DB `name` (parentheses are part of the card identity, not the product set).
 * Line 2: `special_abilities` when non-empty (plain text; same field as Inherent Abilities column).
 * Line 3: `translateSet(set|universe)` plus padded `set_number` (no checklist total suffix).
 */
function characterMobileCaptionLines(card) {
    const line1 = String(card && card.name != null ? card.name : '').trim();
    const codeRaw = card && card.set != null ? card.set : card && card.universe != null ? card.universe : 'ERB';
    const code = String(codeRaw != null ? codeRaw : 'ERB').trim() || 'ERB';
    const setLabel = (typeof window !== 'undefined' && typeof window.translateSet === 'function')
        ? window.translateSet(code)
        : code;
    const snRaw = card && card.set_number != null ? String(card.set_number).trim() : '';
    let line2 = '';
    if (snRaw) {
        if (snRaw.includes('/')) {
            line2 = `${setLabel} - ${snRaw}`;
        } else {
            const foil = /F$/i.test(snRaw);
            const core = foil ? snRaw.slice(0, -1) : snRaw;
            const n = parseInt(core, 10);
            const padded = Number.isFinite(n) ? String(n).padStart(3, '0') : snRaw;
            const suffix = foil ? 'F' : '';
            const numPart = `${padded}${suffix}`;
            line2 = `${setLabel} - ${numPart}`;
        }
    } else {
        line2 = setLabel;
    }
    const rawAbility = card && card.special_abilities != null ? String(card.special_abilities) : '';
    const line3 = rawAbility.replace(/\s+/g, ' ').trim();
    return { line1, line2: line2.trim(), line3 };
}

/**
 * Strip HTML tags / collapse whitespace for mobile caption text (DB `card_effect` may contain markup).
 */
function specialCardEffectPlainText(htmlOrText) {
    if (htmlOrText == null) return '';
    const s = String(htmlOrText).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return s;
}

/** Same token list as `formatSpecialCardEffect` — strip from mobile effect line (flags shown separately). */
const SPECIAL_MOBILE_CAPTION_KEYWORD_TOKENS = [
    '**Fortifications!**',
    '**Cataclysm!**',
    '**Assist!**',
    '**Ambush!**',
    '**One Per Deck**',
];

/**
 * Plain card_effect for Special mobile caption: decode common entities, strip HTML, remove keyword lines.
 */
function specialCardEffectPlainForMobileCaption(htmlOrText) {
    if (htmlOrText == null) return '';
    let decoded = String(htmlOrText)
        .replace(/\\'93/g, "'")
        .replace(/\\'94/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ');
    let plain = specialCardEffectPlainText(decoded);
    for (const kw of SPECIAL_MOBILE_CAPTION_KEYWORD_TOKENS) {
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        plain = plain.replace(re, '');
    }
    plain = plain.replace(/\s+/g, ' ').trim();
    if (plain.length > 220) {
        plain = plain.slice(0, 217) + '…';
    }
    return plain;
}

function dbvSetCaptionLineFromCard(card) {
    const codeRaw = card && card.set != null ? card.set : card && card.universe != null ? card.universe : 'ERB';
    const code = String(codeRaw != null ? codeRaw : 'ERB').trim() || 'ERB';
    const setLabel = (typeof window !== 'undefined' && typeof window.translateSet === 'function')
        ? window.translateSet(code)
        : code;
    const snRaw = card && card.set_number != null ? String(card.set_number).trim() : '';
    let setLine = '';
    if (snRaw) {
        if (snRaw.includes('/')) {
            setLine = `${setLabel} - ${snRaw}`;
        } else {
            const foil = /F$/i.test(snRaw);
            const core = foil ? snRaw.slice(0, -1) : snRaw;
            const n = parseInt(core, 10);
            const padded = Number.isFinite(n) ? String(n).padStart(3, '0') : snRaw;
            const suffix = foil ? 'F' : '';
            const numPart = `${padded}${suffix}`;
            setLine = `${setLabel} - ${numPart}`;
        }
    } else {
        setLine = setLabel;
    }
    return setLine.trim();
}

/**
 * Mobile DBV caption under Special card art: name, character, effect, optional flag lines, set + number.
 */
function specialMobileCaption(card) {
    const name = String(card && card.name != null ? card.name : '').trim();
    const character = String(card && (card.character || card.character_name) != null ? (card.character || card.character_name) : '').trim();
    const effect = specialCardEffectPlainForMobileCaption(card && card.card_effect != null ? card.card_effect : '');
    const onePerDeck = card && (card.one_per_deck === true || card.is_one_per_deck === true) ? 'One per deck' : '';
    const cataclysm = card && (card.is_cataclysm === true || card.cataclysm === true) ? 'Cataclysm' : '';
    const assist = card && (card.is_assist === true || card.assist === true) ? 'Assist' : '';
    const ambush = card && (card.is_ambush === true || card.ambush === true) ? 'Ambush' : '';
    const set = dbvSetCaptionLineFromCard(card);
    return { name, character, effect, onePerDeck, cataclysm, assist, ambush, set };
}

function specialMobileCaptionOptionalLine(className, text) {
    const t = text != null ? String(text).trim() : '';
    return `<div class="${className}"${t ? '' : ' style="display:none;"'}">${t ? escapeHtmlText(t) : ''}</div>`;
}

function buildSpecialMobileCaptionHtml(cap) {
    return `
                    <div class="characters-mobile-card-caption__name">${escapeHtmlText(cap.name)}</div>
                    ${specialMobileCaptionOptionalLine('characters-mobile-card-caption__character', cap.character)}
                    ${specialMobileCaptionOptionalLine('characters-mobile-card-caption__ability', cap.effect)}
                    ${specialMobileCaptionOptionalLine('characters-mobile-card-caption__opd', cap.onePerDeck)}
                    ${specialMobileCaptionOptionalLine('characters-mobile-card-caption__cataclysm', cap.cataclysm)}
                    ${specialMobileCaptionOptionalLine('characters-mobile-card-caption__assist', cap.assist)}
                    ${specialMobileCaptionOptionalLine('characters-mobile-card-caption__ambush', cap.ambush)}
                    ${specialMobileCaptionOptionalLine('characters-mobile-card-caption__set', cap.set)}
    `.trim();
}

/**
 * Get the image path for a card, handling both image_path and image fields
 * options: { useThumbnail: boolean } - when true, return thumbnail for character images
 */
function getCardImagePathForDisplay(card, cardType = 'character', options) {
    const useThumbnail = options && options.useThumbnail === true;
    const toThumb = typeof window.toThumbnailPath === 'function' ? window.toThumbnailPath : function(p) { return p; };
    function maybeThumb(path) {
        if (useThumbnail && cardType === 'character' && path && path.startsWith('/src/resources/cards/images/characters/') && !path.includes('/thumb/')) {
            return toThumb(path);
        }
        return path;
    }
    const imagePath = card.image_path || card.image || '';
    if (!imagePath) return '/src/resources/cards/images/placeholder.webp';

    // Use global getCardImagePath when available (handles all cases including thumbnail)
    if (typeof window.getCardImagePath === 'function') {
        return window.getCardImagePath({ ...card, image_path: card.image_path || card.image }, cardType, options);
    }

    // If it's already a full path, return it
    if (imagePath.startsWith('/src/resources/cards/images/')) {
        return maybeThumb(imagePath);
    }

    // Construct full path based on card type
    const basePath = '/src/resources/cards/images/';
    switch (cardType) {
        case 'character':
            return maybeThumb(`${basePath}characters/${mapImagePathToActualFile(imagePath)}`);
        case 'special':
            return `${basePath}specials/${mapImagePathToActualFile(imagePath)}`;
        case 'power':
            return `${basePath}power-cards/${mapImagePathToActualFile(imagePath)}`;
        case 'location':
            return `${basePath}locations/${mapImagePathToActualFile(imagePath)}`;
        case 'mission':
            return `${basePath}missions/${mapImagePathToActualFile(imagePath)}`;
        case 'event':
            return `${basePath}events/${mapImagePathToActualFile(imagePath)}`;
        case 'aspect':
            return `${basePath}aspects/${mapImagePathToActualFile(imagePath)}`;
        case 'advanced-universe':
        case 'advanced_universe':
            return `${basePath}advanced-universe/${mapImagePathToActualFile(imagePath)}`;
        case 'teamwork':
            return `${basePath}teamwork-universe/${mapImagePathToActualFile(imagePath)}`;
        case 'ally-universe':
        case 'ally_universe':
            return `${basePath}ally-universe/${mapImagePathToActualFile(imagePath)}`;
        case 'training':
            return `${basePath}training-universe/${mapImagePathToActualFile(imagePath)}`;
        case 'basic-universe':
        case 'basic_universe':
            return `${basePath}basic-universe/${mapImagePathToActualFile(imagePath)}`;
        default:
            return `${basePath}${mapImagePathToActualFile(imagePath)}`;
    }
}

/**
 * Preloads alternate art images (index 1+) from imageData into the browser cache so that
 * the first arrow-click is instant rather than triggering a visible network fetch.
 */
function preloadAlternateImages(imageData) {
    if (!imageData || imageData.length <= 1) return;
    imageData.slice(1).forEach(function(item) {
        if (item.imagePath) {
            var img = new Image();
            img.src = item.imagePath;
        }
    });
}

/** True when root layout mode is mobile; skip table row height locks (M2c card rows). */
function isLayoutMobileForCardDisplay() {
    return typeof window.isLayoutMobile === 'function' && window.isLayoutMobile();
}

/** Matches layout-mode.js / mobile-layout.css DBV band; used for Special tab row art when layout-desktop + narrow. */
function isNarrowViewportDbvBand() {
    try {
        return !!(window.matchMedia && window.matchMedia('(max-width: 900px)').matches);
    } catch {
        return false;
    }
}

/**
 * Match All-tab DBV tile behavior (all-cards-display): landscape art uses .horizontal-card
 * (mobile-layout.css mirrors .all-cards-cell img.horizontal-card).
 * @param {HTMLImageElement} img
 */
function applyDbvHorizontalCardClass(img) {
    if (!img || !img.naturalWidth || !img.naturalHeight) {
        return;
    }
    if (img.naturalWidth > img.naturalHeight) {
        img.classList.add('horizontal-card');
    } else {
        img.classList.remove('horizontal-card');
    }
}

/**
 * Lock character image cell + row height so alternate-art navigation does not reflow (desktop only).
 * @param {HTMLTableRowElement} row
 */
function applyCharacterImageRowHeightLock(row) {
    if (isLayoutMobileForCardDisplay()) {
        return;
    }
    const imageCell = row.querySelector('td:nth-child(1)');
    const img = row.querySelector('td:nth-child(1) img');
    if (!imageCell || !img || imageCell.dataset.heightLocked) {
        return;
    }
    const lockRowHeight = () => {
        if (isLayoutMobileForCardDisplay() || imageCell.dataset.heightLocked) {
            return;
        }
        const cellHeight = imageCell.offsetHeight;
        const rowHeight = row.offsetHeight;
        if (cellHeight > 0) {
            imageCell.style.height = cellHeight + 'px';
            imageCell.style.minHeight = cellHeight + 'px';
            imageCell.style.maxHeight = cellHeight + 'px';
            imageCell.dataset.heightLocked = 'true';
        }
        if (rowHeight > 0) {
            row.style.height = rowHeight + 'px';
            row.style.minHeight = rowHeight + 'px';
            row.style.maxHeight = rowHeight + 'px';
            row.dataset.heightLocked = 'true';
        }
    };
    if (img.complete) {
        setTimeout(lockRowHeight, 100);
    } else {
        img.addEventListener('load', lockRowHeight, { once: true });
        setTimeout(lockRowHeight, 1000);
    }
}

/** Clear desktop height locks on character rows (e.g. layout switch to mobile). */
function clearCharacterRowHeightLocks() {
    const tbody = document.getElementById('characters-tbody');
    if (!tbody) {
        return;
    }
    tbody.querySelectorAll('tr').forEach((r) => {
        r.style.removeProperty('height');
        r.style.removeProperty('min-height');
        r.style.removeProperty('max-height');
        delete r.dataset.heightLocked;
        const ic = r.querySelector('td:nth-child(1)');
        if (ic) {
            ic.style.removeProperty('height');
            ic.style.removeProperty('min-height');
            ic.style.removeProperty('max-height');
            delete ic.dataset.heightLocked;
        }
        const imgEl = r.querySelector('img');
        if (imgEl) {
            imgEl.style.removeProperty('max-height');
            imgEl.style.removeProperty('object-fit');
        }
    });
}

/** Re-apply height locks after switching to desktop layout. */
function refreshCharacterTableHeightLocks() {
    if (isLayoutMobileForCardDisplay()) {
        return;
    }
    clearCharacterRowHeightLocks();
    const tbody = document.getElementById('characters-tbody');
    if (!tbody) {
        return;
    }
    tbody.querySelectorAll('tr').forEach((row) => {
        if (!row.querySelector('td:nth-child(1) img')) {
            return;
        }
        applyCharacterImageRowHeightLock(row);
    });
}

if (typeof window !== 'undefined') {
    window.addEventListener('layout-mode-change', function onCharacterDbvLayoutModeChange() {
        if (isLayoutMobileForCardDisplay()) {
            clearCharacterRowHeightLocks();
        } else {
            refreshCharacterTableHeightLocks();
        }
    });
}

/** Clear desktop height locks on special card rows (e.g. layout switch to mobile). */
function clearSpecialRowHeightLocks() {
    const tbody = document.getElementById('special-cards-tbody');
    if (!tbody) {
        return;
    }
    tbody.querySelectorAll('tr').forEach((r) => {
        r.style.removeProperty('height');
        r.style.removeProperty('min-height');
        r.style.removeProperty('max-height');
        delete r.dataset.heightLocked;
        const ic = r.querySelector('td:nth-child(1)');
        if (ic) {
            ic.style.removeProperty('height');
            ic.style.removeProperty('min-height');
            ic.style.removeProperty('max-height');
            delete ic.dataset.heightLocked;
        }
        const imgEl = r.querySelector('img');
        if (imgEl) {
            imgEl.style.removeProperty('max-height');
            imgEl.style.removeProperty('object-fit');
        }
    });
}

/** Re-apply special row height locks after switching to desktop layout. */
function refreshSpecialTableHeightLocks() {
    if (isLayoutMobileForCardDisplay()) {
        return;
    }
    clearSpecialRowHeightLocks();
    const tbody = document.getElementById('special-cards-tbody');
    if (!tbody) {
        return;
    }
    tbody.querySelectorAll('tr').forEach((row) => {
        if (!row.querySelector('td:nth-child(1) img')) {
            return;
        }
        const imageCell = row.querySelector('td:nth-child(1)');
        const img = row.querySelector('td:nth-child(1) img');
        if (!imageCell || !img || imageCell.dataset.heightLocked) {
            return;
        }
        const lockRowHeight = () => {
            if (isLayoutMobileForCardDisplay() || imageCell.dataset.heightLocked) {
                return;
            }
            const cellHeight = imageCell.offsetHeight;
            const rowHeight = row.offsetHeight;
            if (cellHeight > 0) {
                const cellHeightStr = cellHeight + 'px';
                imageCell.style.setProperty('height', cellHeightStr, 'important');
                imageCell.style.setProperty('min-height', cellHeightStr, 'important');
                imageCell.style.setProperty('max-height', cellHeightStr, 'important');
                imageCell.dataset.heightLocked = 'true';
            }
            if (rowHeight > 0) {
                const rowHeightStr = rowHeight + 'px';
                row.style.setProperty('height', rowHeightStr, 'important');
                row.style.setProperty('min-height', rowHeightStr, 'important');
                row.style.setProperty('max-height', rowHeightStr, 'important');
                row.dataset.heightLocked = 'true';
            }
        };
        if (img.complete) {
            setTimeout(lockRowHeight, 100);
        } else {
            img.addEventListener('load', lockRowHeight, { once: true });
            setTimeout(lockRowHeight, 1000);
        }
    });
}

if (typeof window !== 'undefined') {
    window.addEventListener('layout-mode-change', function onSpecialDbvLayoutModeChange() {
        if (isLayoutMobileForCardDisplay()) {
            clearSpecialRowHeightLocks();
        } else {
            refreshSpecialTableHeightLocks();
        }
    });
}

/**
 * Display character cards in the characters table
 * Groups cards by name and universe, showing a single row with navigation arrows for alternate arts
 */
function displayCharacters(characters) {
    const tbody = document.getElementById('characters-tbody');
    if (!tbody) {
        console.error('❌ characters-tbody element not found!');
        return;
    }
    
    // Ensure the characters tab is visible before populating
    const charactersTab = document.getElementById('characters-tab');
    if (charactersTab && charactersTab.style.display === 'none') {
        charactersTab.style.display = 'block';
    }
    
    tbody.innerHTML = '';
    
    // Group characters by name and universe
    const groupedCharacters = groupCardsByVariant(characters, 'name', 'universe');
    
    // Process each group
    groupedCharacters.forEach((group, key) => {
        if (group.length === 0) return;
        
        // Use the first card (original art) as the representative for stats
        const representative = group[0];
        
        // Determine threat level class
        let threatClass = 'threat-low';
        if (representative.threat_level >= 20) threatClass = 'threat-high';
        else if (representative.threat_level >= 18) threatClass = 'threat-medium';
        
        // Prepare image data for navigation (thumbnail for display, fullRes for modal)
        const imageData = group.map(card => {
            const cap = characterMobileCaptionLines(card);
            return {
                id: card.id,
                imagePath: getCardImagePathForDisplay(card, 'character', { useThumbnail: true }),
                fullResPath: getCardImagePathForDisplay(card, 'character'),
                name: card.name,
                isFoil: !!(card.is_foil),
                mobileCaptionLine1: cap.line1,
                mobileCaptionLine2: cap.line2,
                mobileCaptionLine3: cap.line3
            };
        });
        
        // Create unique identifier for this card group
        const groupId = `char-group-${representative.id}`;
        
        // Build navigation arrows HTML (only show if there are multiple images)
        const hasMultipleImages = imageData.length > 1;
        const navArrows = hasMultipleImages ? `
            <button class="card-nav-arrow card-nav-prev" onclick="navigateCardImage('${groupId}', -1)" aria-label="Previous art" type="button">‹</button>
            <button class="card-nav-arrow card-nav-next" onclick="navigateCardImage('${groupId}', 1)" aria-label="Next art" type="button">›</button>
        ` : '';
        
        // Current image (starts with original art - index 0)
        const currentImage = imageData[0];
        const currentImagePath = currentImage.imagePath;
        const currentFullResPath = currentImage.fullResPath || currentImagePath;
        const currentImageName = currentImage.name;
        const capLines = characterMobileCaptionLines(representative);
        const capSetHtml = `<div class="characters-mobile-card-caption__set"${capLines.line2 ? '' : ' style="display:none;"'}">${capLines.line2 ? escapeHtmlText(capLines.line2) : ''}</div>`;
        const capAbilityHtml = `<div class="characters-mobile-card-caption__ability"${capLines.line3 ? '' : ' style="display:none;"'}">${capLines.line3 ? escapeHtmlText(capLines.line3) : ''}</div>`;
        const characterDbvImgStyle = isLayoutMobileForCardDisplay()
            ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
            : 'width: auto; max-width: 316px; height: auto; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Image">
                <div class="card-image-container${hasMultipleImages ? ' card-image-container--with-nav' : ''}">
                    ${navArrows}
                    <span id="${groupId}-foil-badge" class="foil-card-badge" style="display:none;">✦ FOIL</span>
                    <img id="${groupId}-img"
                         src="${currentImagePath}"
                         data-src="${currentImagePath}"
                         data-full-res="${currentFullResPath}"
                         alt="${currentImageName}"
                         loading="lazy"
                         decoding="async"
                         style="${characterDbvImgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgODAgMTIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjQwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${currentFullResPath.replace(/'/g, "\\'")}', '${currentImageName.replace(/'/g, "\\'")}', '${(currentImage.id || '').replace(/'/g, "\\'")}', 'character')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                <div class="characters-mobile-card-caption">
                    <div class="characters-mobile-card-caption__name">${escapeHtmlText(capLines.line1)}</div>
                    ${capAbilityHtml}
                    ${capSetHtml}
                </div>
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('character', '${currentImage.id}', '${currentImageName.replace(/'/g, "\\'")}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${currentImage.id}', 'character', '${currentFullResPath.replace(/'/g, "\\'")}')">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${currentImage.id}" data-card-type="character" data-image-path="${currentFullResPath.replace(/"/g, '&quot;')}" onclick="removeOneFromCollection('${currentImage.id}', 'character', '${currentFullResPath.replace(/'/g, "\\'")}')" disabled title="Card not in collection">
                    -Collection
                </button>
                ` : ''}
            </td>
            <td data-label="Name"><strong>${representative.name}</strong></td>
            <td data-label="Energy">${representative.energy}</td>
            <td data-label="Combat">${representative.combat}</td>
            <td data-label="Brute Force">${representative.brute_force}</td>
            <td data-label="Intelligence">${representative.intelligence}</td>
            <td data-label="Threat Level" class="${threatClass}">${representative.threat_level}</td>
            <td data-label="Inherent Abilities">${representative.special_abilities || ''}</td>
        `;
        
        // Store image data in data attribute for navigation
        row.querySelector('.card-image-container').setAttribute('data-image-data', JSON.stringify(imageData));
        row.querySelector('.card-image-container').setAttribute('data-current-index', '0');
        preloadAlternateImages(imageData);
        
        tbody.appendChild(row);
        
        const img = row.querySelector('img');
        if (img) {
            const syncOrientation = function () {
                applyDbvHorizontalCardClass(img);
            };
            if (img.complete && img.naturalWidth) {
                syncOrientation();
            } else {
                img.addEventListener('load', syncOrientation, { once: true });
            }
            applyCharacterImageRowHeightLock(row);
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
    if (typeof refreshDatabaseViewCollectionButtons === 'function') {
        refreshDatabaseViewCollectionButtons();
    }
}

function setDbvCaptionLineEl(row, selector, text) {
    if (!row) return;
    const el = row.querySelector(selector);
    if (!el) return;
    const t = text != null ? String(text).trim() : '';
    if (t) {
        el.textContent = t;
        el.style.removeProperty('display');
    } else {
        el.textContent = '';
        el.style.display = 'none';
    }
}

function applySpecialMobileCaptionFromNav(row, cap) {
    if (!row || !cap) return;
    setDbvCaptionLineEl(row, '.characters-mobile-card-caption__name', cap.name);
    setDbvCaptionLineEl(row, '.characters-mobile-card-caption__character', cap.character);
    setDbvCaptionLineEl(row, '.characters-mobile-card-caption__ability', cap.effect);
    setDbvCaptionLineEl(row, '.characters-mobile-card-caption__opd', cap.onePerDeck);
    setDbvCaptionLineEl(row, '.characters-mobile-card-caption__cataclysm', cap.cataclysm);
    setDbvCaptionLineEl(row, '.characters-mobile-card-caption__assist', cap.assist);
    setDbvCaptionLineEl(row, '.characters-mobile-card-caption__ambush', cap.ambush);
    setDbvCaptionLineEl(row, '.characters-mobile-card-caption__set', cap.set);
}

/**
 * Navigate through alternate card images
 * @param {string} groupId - The unique identifier for the card group
 * @param {number} direction - -1 for previous, 1 for next
 */
function navigateCardImage(groupId, direction) {
    const container = document.querySelector(`#${groupId}-img`).closest('.card-image-container');
    if (!container) {
        console.error('Container not found for:', groupId);
        return;
    }
    
    const imageData = JSON.parse(container.getAttribute('data-image-data') || '[]');
    if (imageData.length <= 1) {
        return; // No navigation needed for single image
    }
    
    // Get the row and preserve locked height before changing image (desktop table layout only)
    const row = container.closest('tr');
    const imageCell = row ? row.querySelector('td:nth-child(1)') : null;
    let lockedCellHeight = null;
    let lockedRowHeight = null;
    const useHeightLocks = !isLayoutMobileForCardDisplay();

    if (useHeightLocks && imageCell) {
        if (imageCell.dataset.heightLocked) {
            lockedCellHeight = imageCell.style.height || imageCell.style.minHeight || imageCell.offsetHeight + 'px';
        } else {
            const cellHeight = imageCell.offsetHeight;
            if (cellHeight > 0) {
                lockedCellHeight = cellHeight + 'px';
                imageCell.style.setProperty('height', lockedCellHeight, 'important');
                imageCell.style.setProperty('min-height', lockedCellHeight, 'important');
                imageCell.style.setProperty('max-height', lockedCellHeight, 'important');
                imageCell.dataset.heightLocked = 'true';
            }
        }
    }

    if (useHeightLocks && row) {
        if (row.dataset.heightLocked) {
            lockedRowHeight = row.style.height || row.style.minHeight || row.offsetHeight + 'px';
        } else {
            const rowHeight = row.offsetHeight;
            if (rowHeight > 0) {
                lockedRowHeight = rowHeight + 'px';
                row.style.setProperty('height', lockedRowHeight, 'important');
                row.style.setProperty('min-height', lockedRowHeight, 'important');
                row.style.setProperty('max-height', lockedRowHeight, 'important');
                row.dataset.heightLocked = 'true';
            }
        }
    }
    
    let currentIndex = parseInt(container.getAttribute('data-current-index') || '0', 10);
    currentIndex += direction;
    
    // Wrap around
    if (currentIndex < 0) {
        currentIndex = imageData.length - 1;
    } else if (currentIndex >= imageData.length) {
        currentIndex = 0;
    }
    
    // Update image
    const newImage = imageData[currentIndex];
    const img = document.getElementById(`${groupId}-img`);
    const newImagePath = newImage.imagePath;
    
    if (useHeightLocks && lockedCellHeight && imageCell) {
        imageCell.style.setProperty('height', lockedCellHeight, 'important');
        imageCell.style.setProperty('min-height', lockedCellHeight, 'important');
        imageCell.style.setProperty('max-height', lockedCellHeight, 'important');
    }

    if (useHeightLocks && lockedRowHeight && row) {
        row.style.setProperty('height', lockedRowHeight, 'important');
        row.style.setProperty('min-height', lockedRowHeight, 'important');
        row.style.setProperty('max-height', lockedRowHeight, 'important');
    }

    if (useHeightLocks && lockedCellHeight && imageCell) {
        const cellHeightValue = parseFloat(lockedCellHeight);
        if (!isNaN(cellHeightValue)) {
            img.style.setProperty('max-height', (cellHeightValue - 20) + 'px', 'important');
            img.style.setProperty('object-fit', 'contain', 'important');
        }
    }
    
    img.classList.remove('horizontal-card');
    img.src = newImagePath;
    img.alt = newImage.name;
    const fullResPath = newImage.fullResPath || newImagePath;
    img.setAttribute('data-full-res', fullResPath);

    const syncDbvImgOrientation = () => {
        applyDbvHorizontalCardClass(img);
    };
    img.addEventListener('load', syncDbvImgOrientation, { once: true });

    if (row && newImage.mobileCaption && row.querySelector('.characters-mobile-card-caption__character')) {
        applySpecialMobileCaptionFromNav(row, newImage.mobileCaption);
    } else {
        const capNameEl = row ? row.querySelector('.characters-mobile-card-caption__name') : null;
        const capSetEl = row ? row.querySelector('.characters-mobile-card-caption__set') : null;
        const capAbilityEl = row ? row.querySelector('.characters-mobile-card-caption__ability') : null;
        if (capNameEl) {
            capNameEl.textContent = newImage.mobileCaptionLine1 != null && String(newImage.mobileCaptionLine1).trim() !== ''
                ? newImage.mobileCaptionLine1
                : (newImage.name != null ? String(newImage.name) : '');
        }
        if (capSetEl) {
            const t = newImage.mobileCaptionLine2 != null ? String(newImage.mobileCaptionLine2).trim() : '';
            if (t) {
                capSetEl.textContent = t;
                capSetEl.style.removeProperty('display');
            } else {
                capSetEl.textContent = '';
                capSetEl.style.display = 'none';
            }
        }
        if (capAbilityEl) {
            const ab = newImage.mobileCaptionLine3 != null ? String(newImage.mobileCaptionLine3).trim() : '';
            if (ab) {
                capAbilityEl.textContent = ab;
                capAbilityEl.style.removeProperty('display');
            } else {
                capAbilityEl.textContent = '';
                capAbilityEl.style.display = 'none';
            }
        }
    }

    // Apply or remove foil shimmer effect on the container
    if (newImage.isFoil) {
        container.classList.add('foil-shimmer');
    } else {
        container.classList.remove('foil-shimmer');
    }

    // Show or hide foil badge (badge has id `${groupId}-foil-badge`)
    const foilBadge = document.getElementById(`${groupId}-foil-badge`);
    if (foilBadge) {
        foilBadge.style.display = newImage.isFoil ? 'block' : 'none';
    }

    // Determine card type from groupId for hover modal progressive load
    let navCardType = 'character';
    if (groupId.startsWith('special-')) {
        navCardType = 'special';
    } else if (groupId.startsWith('power-')) {
        navCardType = 'power';
    } else if (groupId.startsWith('location-') || groupId.startsWith('loc-group-')) {
        navCardType = 'location';
    } else if (groupId.startsWith('mission-')) {
        navCardType = 'mission';
    } else if (groupId.startsWith('event-')) {
        navCardType = 'event';
    } else if (groupId.startsWith('aspect-')) {
        navCardType = 'aspect';
    }
    const escapedNavCardId = String(newImage.id || '').replace(/'/g, "\\'");
    const escapedNavCardType = String(navCardType || '').replace(/'/g, "\\'");
    // Update hover modal (pass full-res, cardId, cardType for progressive load; foil state for shimmer)
    img.setAttribute('onmouseenter', `showCardHoverModal('${fullResPath.replace(/'/g, "\\'")}', '${newImage.name.replace(/'/g, "\\'")}', '${escapedNavCardId}', '${escapedNavCardType}', ${!!newImage.isFoil})`);
    
    // Update current index
    container.setAttribute('data-current-index', currentIndex.toString());
    
    // Update Add to Deck and Add to Collection buttons to use current card ID
    if (row) {
        // Determine card type from groupId prefix
        let cardType = 'character';
        if (groupId.startsWith('special-')) {
            cardType = 'special';
        } else if (groupId.startsWith('power-')) {
            cardType = 'power';
        } else if (groupId.startsWith('location-') || groupId.startsWith('loc-group-')) {
            cardType = 'location';
        } else if (groupId.startsWith('mission-')) {
            cardType = 'mission';
        } else if (groupId.startsWith('event-')) {
            cardType = 'event';
        } else if (groupId.startsWith('aspect-')) {
            cardType = 'aspect';
        }
        
        const addToDeckBtn = row.querySelector('.add-to-deck-btn');
        if (addToDeckBtn) {
            addToDeckBtn.setAttribute('onclick', `showDeckSelection('${cardType}', '${newImage.id}', '${newImage.name.replace(/'/g, "\\'")}', this)`);
        }
        
        const addToCollectionBtn = row.querySelector('.add-to-collection-btn');
        if (addToCollectionBtn) {
            const newImagePath = (newImage.fullResPath || newImage.imagePath || '').replace(/'/g, "\\'");
            addToCollectionBtn.setAttribute('onclick', `addCardToCollectionFromDatabase('${newImage.id}', '${cardType}', '${newImagePath}')`);
        }
        const removeFromCollectionBtn = row.querySelector('.remove-from-collection-btn');
        if (removeFromCollectionBtn) {
            const newImagePath = (newImage.fullResPath || newImage.imagePath || '').replace(/'/g, "\\'");
            const newImagePathAttr = (newImage.fullResPath || newImage.imagePath || '').replace(/"/g, '&quot;');
            removeFromCollectionBtn.setAttribute('data-card-id', newImage.id);
            removeFromCollectionBtn.setAttribute('data-card-type', cardType);
            removeFromCollectionBtn.setAttribute('data-image-path', newImagePathAttr);
            removeFromCollectionBtn.setAttribute('onclick', `removeOneFromCollection('${newImage.id}', '${cardType}', '${newImagePath}')`);
            if (typeof getDatabaseViewCollectionQuantity === 'function') {
                const qty = getDatabaseViewCollectionQuantity(newImage.id, cardType, newImage.fullResPath || newImage.imagePath || '');
                removeFromCollectionBtn.disabled = qty < 1;
            }
        }
    }
    
    // Re-apply locked heights after image loads to ensure they're maintained (desktop only)
    if (useHeightLocks && (lockedCellHeight || lockedRowHeight) && img) {
        const reapplyHeights = () => {
            if (lockedCellHeight && imageCell && imageCell.dataset.heightLocked) {
                imageCell.style.setProperty('height', lockedCellHeight, 'important');
                imageCell.style.setProperty('min-height', lockedCellHeight, 'important');
                imageCell.style.setProperty('max-height', lockedCellHeight, 'important');
            }
            if (lockedRowHeight && row && row.dataset.heightLocked) {
                row.style.setProperty('height', lockedRowHeight, 'important');
                row.style.setProperty('min-height', lockedRowHeight, 'important');
                row.style.setProperty('max-height', lockedRowHeight, 'important');
            }
        };
        
        // Reapply immediately
        reapplyHeights();
        
        // Reapply after image loads
        if (img.complete) {
            setTimeout(() => reapplyHeights(), 10);
            setTimeout(() => reapplyHeights(), 50);
            setTimeout(() => reapplyHeights(), 100);
        } else {
            img.addEventListener('load', () => {
                reapplyHeights();
                setTimeout(() => reapplyHeights(), 10);
                setTimeout(() => reapplyHeights(), 50);
                setTimeout(() => reapplyHeights(), 100);
            }, { once: true });
            // Also reapply after short delays to catch any layout recalculation
            setTimeout(() => reapplyHeights(), 50);
            setTimeout(() => reapplyHeights(), 100);
            setTimeout(() => reapplyHeights(), 200);
        }
    }
}

/**
 * Format special card effect text with proper HTML encoding and keyword highlighting
 */
function formatSpecialCardEffect(effectText, cardData = null) {
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
    const orderedKeywords = ['**Fortifications!**', '**Cataclysm!**', '**Assist!**', '**Ambush!**', '**One Per Deck**'];
    const foundKeywords = [];
    
    // Find all special keywords in the text
    for (const keyword of orderedKeywords) {
        if (decodedText.includes(keyword)) {
            foundKeywords.push(keyword);
        }
    }
    
    // Check if card has one_per_deck=true and add the label if not already present
    if (cardData && cardData.one_per_deck === true && !foundKeywords.includes('**One Per Deck**')) {
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

const SPECIAL_FUNCTION_ICON_CONFIGS = [
    { field: 'icon_offensive_swords', filename: 'offensive_action.png', label: 'Offensive Action' },
    { field: 'icon_defensive_shield', filename: 'defensive_action.png', label: 'Defensive Action' },
    { field: 'icon_remainder_of_battle', filename: 'reminder_of_battle.png', label: 'Remainder of Battle' },
    { field: 'icon_remainder_of_game', filename: 'reminder_of_game.png', label: 'Remainder of Game' },
    { field: 'icon_attached_paperclip', filename: 'attach_to_a_character.png', label: 'Attach to a Character' },
    { field: 'icon_astral_plane', filename: 'astral_plane.png', label: 'Astral Plane' },
    { field: 'icon_first_action_only', filename: 'first_icon.png', label: 'First Action Only' }
];

function getSpecialFunctionIcons(cardData) {
    if (!cardData) return [];

    return SPECIAL_FUNCTION_ICON_CONFIGS
        .filter(iconConfig => Boolean(cardData[iconConfig.field]))
        .map(iconConfig => ({
            ...iconConfig,
            path: `/src/resources/images/icons/function/${iconConfig.filename}`
        }));
}

const POWER_TYPE_ICON_MAP = {
    'Energy':      { path: '/src/resources/images/icons/energy.png',       label: 'Energy' },
    'Combat':      { path: '/src/resources/images/icons/combat.png',        label: 'Combat' },
    'Brute Force': { path: '/src/resources/images/icons/brute_force.png',   label: 'Brute Force' },
    'Intelligence':{ path: '/src/resources/images/icons/intelligence.png',  label: 'Intelligence' },
    'Any-Power':   { path: '/src/resources/images/icons/any-power.png',     label: 'Any-Power' },
};

function renderSpecialIconBadges(cardData) {
    const icons = cardData && Array.isArray(cardData.icons) ? cardData.icons : [];
    if (icons.length === 0) {
        return '<span class="special-function-icons-empty" aria-hidden="true">-</span>';
    }
    const iconImgs = icons.map(icon => {
        const cfg = POWER_TYPE_ICON_MAP[icon];
        if (cfg) {
            return `<img class="special-power-type-icon" src="${cfg.path}" alt="${cfg.label}" title="${cfg.label}" loading="lazy" decoding="async">`;
        }
        return `<span class="special-icon-text-fallback" title="${icon}">${icon}</span>`;
    }).join('');
    return `<div class="special-power-icons-cell">${iconImgs}</div>`;
}

const MULTI_POWER_TYPES = ['Energy', 'Combat', 'Brute Force', 'Intelligence'];

function renderAllyStatTypeIcon(statType) {
    if (!statType) return '<span>-</span>';
    if (statType === 'Multi Power' || statType === 'Multi-Power') {
        const icons = MULTI_POWER_TYPES.map(t => {
            const cfg = POWER_TYPE_ICON_MAP[t];
            return `<img class="special-power-type-icon" src="${cfg.path}" alt="${cfg.label}" title="${cfg.label}" loading="lazy" decoding="async">`;
        }).join('');
        return `<div class="special-power-icons-cell">${icons}</div>`;
    }
    const cfg = POWER_TYPE_ICON_MAP[statType];
    if (cfg) {
        return `<img class="special-power-type-icon" src="${cfg.path}" alt="${cfg.label}" title="${cfg.label}" loading="lazy" decoding="async">`;
    }
    return `<span class="special-icon-text-fallback" title="${statType}">${statType}</span>`;
}

function renderTeamworkValueCell(value, powerType) {
    if (!value) return '<span>-</span>';
    const num = value.trim().split(/\s+/)[0];
    return `<span class="teamwork-value-icon-cell">${num} ${renderAllyStatTypeIcon(powerType)}</span>`;
}

function renderFollowupAttackTypes(value) {
    if (!value) return '<span>-</span>';
    const separator = value.includes(' + ') ? ' + ' : ' / ';
    const parts = value.split(separator).map(p => p.trim());
    const unique = parts[0] === parts[1] ? [parts[0]] : parts;
    const icons = unique.map(part => renderAllyStatTypeIcon(part)).join('');
    return `<span class="followup-icons-cell">${icons}</span>`;
}

function renderSpecialFunctionIcons(cardData) {
    const icons = getSpecialFunctionIcons(cardData);
    if (icons.length === 0) {
        return '<span class="special-function-icons-empty" aria-hidden="true">-</span>';
    }

    return `
        <div class="special-function-icons-cell">
            ${icons.map(icon => `
                <img
                    class="special-function-icon"
                    src="${icon.path}"
                    alt="${icon.label}"
                    title="${icon.label}"
                    loading="lazy"
                    decoding="async"
                >
            `).join('')}
        </div>
    `;
}

/**
 * Display special cards in the special cards table
 * Groups cards by name, universe, and card_type, showing a single row with navigation arrows for alternate arts
 */
function displaySpecialCards(specialCards) {
    const tbody = document.getElementById('special-cards-tbody');
    
    if (!tbody) {
        console.error('❌ special-cards-tbody element not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    // Check tab visibility after clearing
    const specialCardsTab = document.getElementById('special-cards-tab');
    const charactersTab = document.getElementById('characters-tab');

    // Group special cards by name, universe, and card_type (keeps alternate-art navigation)
    const groupedCards = groupCardsByVariant(specialCards, 'name', 'universe');

    // Re-sort groups for the Special Cards tab: by character name (A→Z, ignores leading "The"),
    // then by card name, with "Any Character" always last for character-sorts.
    const compareText =
        (typeof window !== 'undefined' &&
            window.Alphabetization &&
            typeof window.Alphabetization.compare === 'function')
            ? window.Alphabetization.compare
            : (a, b) => String(a ?? '').localeCompare(String(b ?? ''));

    function isAnyCharacterName(value) {
        return String(value ?? '').trim().toLowerCase() === 'any character';
    }

    function compareCharacterNames(a, b) {
        const aIsAny = isAnyCharacterName(a);
        const bIsAny = isAnyCharacterName(b);
        if (aIsAny !== bIsAny) return aIsAny ? 1 : -1;
        return compareText(a, b);
    }

    const sortedGroups = Array.from(groupedCards.entries()).sort(([_keyA, groupA], [_keyB, groupB]) => {
        const repA = groupA?.[0] || {};
        const repB = groupB?.[0] || {};

        const charA = String(repA.character || repA.character_name || '').trim();
        const charB = String(repB.character || repB.character_name || '').trim();
        const charCmp = compareCharacterNames(charA, charB);
        if (charCmp !== 0) return charCmp;

        const nameA = String(repA.name || '').trim();
        const nameB = String(repB.name || '').trim();
        const nameCmp = compareText(nameA, nameB);
        if (nameCmp !== 0) return nameCmp;

        const setA = String(repA.universe || repA.set || 'ERB').trim();
        const setB = String(repB.universe || repB.set || 'ERB').trim();
        const setCmp = compareText(setA, setB);
        if (setCmp !== 0) return setCmp;

        const typeA = String(repA.card_type || '').trim();
        const typeB = String(repB.card_type || '').trim();
        return compareText(typeA, typeB);
    });

    // Process each group in our preferred order
    sortedGroups.forEach(([key, group]) => {
        if (group.length === 0) return;
        
        // Use the first card (original art) as the representative
        const representative = group[0];
        
        // Prepare image data for navigation (specials don't have thumbnails - imagePath is full res)
        const imageData = group.map(card => {
            const cap = specialMobileCaption(card);
            return {
                id: card.id,
                imagePath: getCardImagePathForDisplay(card, 'special'),
                fullResPath: getCardImagePathForDisplay(card, 'special'),
                name: card.name,
                isFoil: !!(card.is_foil),
                mobileCaption: cap
            };
        });

        // Create unique identifier for this card group
        const groupId = `special-group-${representative.id}`;

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
        const capLines = specialMobileCaption(representative);
        const specialCaptionHtml = buildSpecialMobileCaptionHtml(capLines);
        const specialUseMobileListArt =
            isLayoutMobileForCardDisplay() || isNarrowViewportDbvBand();
        const specialDbvImgStyle = specialUseMobileListArt
            ? 'border-radius: 5px; cursor: pointer;'
            : 'width: 120px; height: auto; max-height: 180px; object-fit: contain; border-radius: 5px; cursor: pointer;';
        const foilBadgeDisplay = currentImage.isFoil ? 'block' : 'none';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Image">
                <div class="card-image-container${hasMultipleImages ? ' card-image-container--with-nav' : ''}">
                    ${navArrows}
                    <span id="${groupId}-foil-badge" class="foil-card-badge" style="display:${foilBadgeDisplay};">✦ FOIL</span>
                    <img id="${groupId}-img"
                         src="${currentImagePath}"
                         data-src="${currentImagePath}"
                         data-full-res="${currentImagePath}"
                         data-dbv-lightbox-context="special"
                         alt="${currentImageName}"
                         loading="lazy"
                         decoding="async"
                         style="${specialDbvImgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${(currentImagePath || '').replace(/'/g, "\\'")}', '${currentImageName.replace(/'/g, "\\'")}', '${(currentImage.id || '').replace(/'/g, "\\'")}', 'special')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                <div class="characters-mobile-card-caption">
                    ${specialCaptionHtml}
                </div>
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('special', '${currentImage.id}', '${currentImageName.replace(/'/g, "\\'")}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${currentImage.id}', 'special', '${(currentImagePath || '').replace(/'/g, "\\'")}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${currentImage.id}" data-card-type="special" data-image-path="${(currentImagePath || '').replace(/"/g, '&quot;')}" onclick="removeOneFromCollection('${currentImage.id}', 'special', '${(currentImagePath || '').replace(/'/g, "\\'")}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">
                    -Collection
                </button>
                ` : ''}
            </td>
            <td data-label="Name"><strong>${representative.name}</strong></td>
            <td data-label="Character">${representative.character || ''}</td>
            <td data-label="Card Effect">${formatSpecialCardEffect(representative.card_effect, representative)}</td>
            <td data-label="Icon">${renderSpecialIconBadges(representative)}</td>
            <td data-label="Value">${representative.value == null ? '' : representative.value}</td>
            <td data-label="Function">${renderSpecialFunctionIcons(representative)}</td>
        `;

        // Store image data in data attribute for navigation
        row.querySelector('.card-image-container').setAttribute('data-image-data', JSON.stringify(imageData));
        row.querySelector('.card-image-container').setAttribute('data-current-index', '0');
        preloadAlternateImages(imageData);

        tbody.appendChild(row);

        const img = row.querySelector('img');
        if (img) {
            const syncOrientation = function () {
                applyDbvHorizontalCardClass(img);
            };
            if (img.complete && img.naturalWidth) {
                syncOrientation();
            } else {
                img.addEventListener('load', syncOrientation, { once: true });
            }
            if (!specialUseMobileListArt) {
                const lockRowHeight = () => {
                    const imageCell = row.querySelector('td:nth-child(1)');
                    if (imageCell && !imageCell.dataset.heightLocked) {
                        const cellHeight = imageCell.offsetHeight;
                        const rowHeight = row.offsetHeight;

                        if (cellHeight > 0) {
                            const cellHeightStr = cellHeight + 'px';
                            imageCell.style.setProperty('height', cellHeightStr, 'important');
                            imageCell.style.setProperty('min-height', cellHeightStr, 'important');
                            imageCell.style.setProperty('max-height', cellHeightStr, 'important');
                            imageCell.dataset.heightLocked = 'true';
                        }

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
                    setTimeout(lockRowHeight, 100);
                } else {
                    img.addEventListener('load', () => {
                        lockRowHeight();
                    }, { once: true });
                    setTimeout(() => {
                        lockRowHeight();
                    }, 1000);
                }
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
    if (typeof refreshDatabaseViewCollectionButtons === 'function') {
        refreshDatabaseViewCollectionButtons();
    }
}

/**
 * Display location cards in the locations table
 * Groups locations by name (across sets), showing a single row with navigation arrows for alternate arts
 * (ERB base + ERBP promo alternate are one row — same physical location)
 */
function displayLocations(locations) {
    const tbody = document.getElementById('locations-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const groupedLocations = groupCardsByVariant(locations, 'name', 'set', { mergeAcrossSets: true });

    groupedLocations.forEach((group) => {
        if (group.length === 0) return;

        // Use the first location (original art) as the representative for stats
        const representative = group[0];

        // Determine threat level class
        let threatClass = 'threat-low';
        if (representative.threat_level >= 3) threatClass = 'threat-high';
        else if (representative.threat_level >= 1) threatClass = 'threat-medium';

        // Prepare image data for navigation (thumbnail for list display, full-res for modal/hover)
        const imageData = group.map(loc => ({
            id: loc.id,
            imagePath: getCardImagePathForDisplay(loc, 'location', { useThumbnail: true }),
            fullResPath: getCardImagePathForDisplay(loc, 'location'),
            name: loc.name
        }));

        const groupId = `loc-group-${representative.id}`;
        const hasMultipleImages = imageData.length > 1;
        const navArrows = hasMultipleImages ? `
            <button class="card-nav-arrow card-nav-prev" onclick="navigateCardImage('${groupId}', -1)" aria-label="Previous art" type="button">‹</button>
            <button class="card-nav-arrow card-nav-next" onclick="navigateCardImage('${groupId}', 1)" aria-label="Next art" type="button">›</button>
        ` : '';

        const currentImage = imageData[0];
        const currentImagePath = currentImage.imagePath;
        const currentFullResPath = currentImage.fullResPath || currentImagePath;
        const currentImageName = currentImage.name;

        const row = document.createElement('tr');
        row.dataset.id = representative.id;
        row.innerHTML = `
            <td>
                <div class="card-image-container">
                    ${navArrows}
                    <img id="${groupId}-img"
                         src="${currentImagePath}"
                         data-src="${currentImagePath}"
                         data-full-res="${currentFullResPath}"
                         alt="${currentImageName}"
                         loading="lazy"
                         decoding="async"
                         style="width: 80px; height: auto; max-height: 120px; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjQwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0iblkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3R0eHQ+Cjwvc3ZnPg=='; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${currentFullResPath.replace(/'/g, "\\'")}', '${currentImageName.replace(/'/g, "\\'")}', '${(currentImage.id || '').replace(/'/g, "\\'")}', 'location')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('location', '${currentImage.id}', '${currentImageName.replace(/'/g, "\\'")}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${currentImage.id}', 'location', '${currentFullResPath.replace(/'/g, "\\'")}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${currentImage.id}" data-card-type="location" data-image-path="${currentFullResPath.replace(/"/g, '&quot;')}" onclick="removeOneFromCollection('${currentImage.id}', 'location', '${currentFullResPath.replace(/'/g, "\\'")}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">
                    -Collection
                </button>
                ` : ''}
            </td>
            <td><strong>${representative.name}</strong></td>
            <td class="${threatClass}">${representative.threat_level}</td>
            <td>${representative.special_ability || ''}</td>
        `;

        row.querySelector('.card-image-container').setAttribute('data-image-data', JSON.stringify(imageData));
        row.querySelector('.card-image-container').setAttribute('data-current-index', '0');
        preloadAlternateImages(imageData);

        tbody.appendChild(row);

        const img = row.querySelector('img');
        if (img) {
            const lockRowHeight = () => {
                const imageCell = row.querySelector('td:nth-child(1)');
                if (imageCell && !imageCell.dataset.heightLocked) {
                    const cellHeight = imageCell.offsetHeight;
                    const rowHeight = row.offsetHeight;
                    if (cellHeight > 0) {
                        const cellHeightStr = cellHeight + 'px';
                        imageCell.style.setProperty('height', cellHeightStr, 'important');
                        imageCell.style.setProperty('min-height', cellHeightStr, 'important');
                        imageCell.style.setProperty('max-height', cellHeightStr, 'important');
                        imageCell.dataset.heightLocked = 'true';
                    }
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
                setTimeout(lockRowHeight, 100);
            } else {
                img.addEventListener('load', lockRowHeight, { once: true });
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
    if (typeof refreshDatabaseViewCollectionButtons === 'function') {
        refreshDatabaseViewCollectionButtons();
    }
}

/**
 * Lock all special card row heights after page load
 * This ensures rows maintain consistent height when cycling images
 * Matches the approach used for character rows
 */
function lockAllSpecialCardRowHeights() {
    if (isLayoutMobileForCardDisplay()) {
        return;
    }
    const table = document.getElementById('special-cards-table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const imageCell = row.querySelector('td:nth-child(1)');
        if (imageCell && !imageCell.dataset.heightLocked) {
            const img = imageCell.querySelector('img');
            if (img) {
                const lockRowHeight = () => {
                    // Lock both the cell and the row height, just like characters
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
                };
                
                if (img.complete) {
                    setTimeout(lockRowHeight, 100);
                } else {
                    img.addEventListener('load', lockRowHeight, { once: true });
                    setTimeout(lockRowHeight, 1000);
                }
            }
        }
    });
}

// Make functions globally available
window.escapeHtmlText = escapeHtmlText;
window.applyDbvHorizontalCardClass = applyDbvHorizontalCardClass;
window.displayCharacters = displayCharacters;
window.displaySpecialCards = displaySpecialCards;
window.lockAllSpecialCardRowHeights = lockAllSpecialCardRowHeights;
window.displayLocations = displayLocations;
window.formatSpecialCardEffect = formatSpecialCardEffect;
window.navigateCardImage = navigateCardImage;
window.groupCardsByVariant = groupCardsByVariant;
window.getCardImagePathForDisplay = getCardImagePathForDisplay;
window.getSpecialFunctionIcons = getSpecialFunctionIcons;
window.renderSpecialFunctionIcons = renderSpecialFunctionIcons;

