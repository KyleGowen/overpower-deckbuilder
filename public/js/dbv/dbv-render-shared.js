/**
 * DBV shared rendering helpers: grouping, captions, image paths, desktop row height locks.
 * Depends: alphabetization.js (optional), /js/dbv/dbv-layout-context.js, app-config / getCardImagePath at runtime.
 * mapImagePathToActualFile: global from card-image-utils.js when fallback paths run.
 */
function dbvIsMobileForCardDisplay() {
    return (
        typeof window.isLayoutMobileForCardDisplay === 'function' && window.isLayoutMobileForCardDisplay()
    );
}

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
 * Mobile DBV caption under location art: name, special ability, set line (same DOM order as characters).
 */
function locationMobileCaptionLines(loc) {
    const line1 = String(loc && loc.name != null ? loc.name : '').trim();
    const codeRaw = loc && loc.set != null ? loc.set : 'ERB';
    const code = String(codeRaw != null ? codeRaw : 'ERB').trim() || 'ERB';
    const setLabel = (typeof window !== 'undefined' && typeof window.translateSet === 'function')
        ? window.translateSet(code)
        : code;
    const snRaw = loc && loc.set_number != null ? String(loc.set_number).trim() : '';
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
    const rawAbility = loc && loc.special_ability != null ? String(loc.special_ability) : '';
    const line3 = rawAbility.replace(/\s+/g, ' ').trim();
    return { line1, line2: line2.trim(), line3 };
}

function locationThreatCssClass(threatLevel) {
    const t = Number(threatLevel);
    if (t >= 3) return 'threat-high';
    if (t >= 1) return 'threat-medium';
    return 'threat-low';
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
    const base = setLine.trim();
    const foil =
        card && (card.is_foil === true || card.is_foil === 'true' || card.is_foil === 1)
            ? ' · Foil'
            : '';
    return (base + foil).trim();
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
function dbvIsMobileForCardDisplay() {
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
    if (dbvIsMobileForCardDisplay()) {
        return;
    }
    const imageCell = row.querySelector('td:nth-child(1)');
    const img = row.querySelector('td:nth-child(1) img');
    if (!imageCell || !img || imageCell.dataset.heightLocked) {
        return;
    }
    const lockRowHeight = () => {
        if (dbvIsMobileForCardDisplay() || imageCell.dataset.heightLocked) {
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
    if (dbvIsMobileForCardDisplay()) {
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

/** Clear desktop height locks on location rows (e.g. layout switch to mobile). */
function clearLocationRowHeightLocks() {
    const tbody = document.getElementById('locations-tbody');
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

function refreshLocationTableHeightLocks() {
    if (dbvIsMobileForCardDisplay()) {
        return;
    }
    clearLocationRowHeightLocks();
    const tbody = document.getElementById('locations-tbody');
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
        if (dbvIsMobileForCardDisplay()) {
            clearCharacterRowHeightLocks();
            clearLocationRowHeightLocks();
        } else {
            refreshCharacterTableHeightLocks();
            refreshLocationTableHeightLocks();
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
    if (dbvIsMobileForCardDisplay()) {
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
            if (dbvIsMobileForCardDisplay() || imageCell.dataset.heightLocked) {
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
        if (dbvIsMobileForCardDisplay()) {
            clearSpecialRowHeightLocks();
        } else {
            refreshSpecialTableHeightLocks();
        }
    });
}

// Globals consumed across DBV + deck tooling (and jsdom tests that eval scripts separately)
window.escapeHtmlText = escapeHtmlText;
window.applyDbvHorizontalCardClass = applyDbvHorizontalCardClass;
window.groupCardsByVariant = groupCardsByVariant;
window.getCardImagePathForDisplay = getCardImagePathForDisplay;
window.specialCardEffectPlainForMobileCaption = specialCardEffectPlainForMobileCaption;
window.dbvSetCaptionLineFromCard = dbvSetCaptionLineFromCard;
window.characterMobileCaptionLines = characterMobileCaptionLines;
window.locationMobileCaptionLines = locationMobileCaptionLines;
window.locationThreatCssClass = locationThreatCssClass;
window.specialMobileCaption = specialMobileCaption;
window.buildSpecialMobileCaptionHtml = buildSpecialMobileCaptionHtml;
window.preloadAlternateImages = preloadAlternateImages;
window.applyCharacterImageRowHeightLock = applyCharacterImageRowHeightLock;
window.clearCharacterRowHeightLocks = clearCharacterRowHeightLocks;
window.refreshCharacterTableHeightLocks = refreshCharacterTableHeightLocks;
