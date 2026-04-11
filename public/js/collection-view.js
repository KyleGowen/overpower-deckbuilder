/* Collection View JavaScript */

// Collection view state
let collectionCards = [];
let collectionSearchTimeout = null;
let mergedCollectionData = [];
let showUnownedCards = true;

/** Mirrors desktop table sort (column headers on desktop only). */
let collectionSortField = 'set_number';
let collectionSortDir = 'asc';

/** @type {HTMLElement | null} */
let collectionMobileDetailTriggerEl = null;

/** @type {boolean} */
let collectionMobileDetailOpen = false;

let collectionLayoutModeListenerBound = false;

/** Mobile list always uses this sort (no column headers on MV). */
const COLLECTION_MOBILE_LIST_SORT_FIELD = 'set_number';
const COLLECTION_MOBILE_LIST_SORT_DIR = 'asc';

function collectionIsLayoutMobile() {
    return typeof window !== 'undefined' && typeof window.isLayoutMobile === 'function' && window.isLayoutMobile();
}

// GUEST sandbox localStorage key
const GUEST_COLLECTION_KEY = 'guestCollection';

/** Authenticated collection card CRUD (v1 envelope). */
const COLLECTION_V1_CARDS_BASE = '/api/v1/collections/me/cards';

function collectionV1IsSuccess(body) {
    return body && Array.isArray(body.errors) && body.errors.length === 0;
}

function collectionApiErrorMessage(errorData) {
    if (!errorData) return 'Unknown error';
    if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return errorData.errors.map(function (e) { return e.message; }).join('; ');
    }
    if (typeof errorData.error === 'string') return errorData.error;
    return 'Unknown error';
}

/** Uppercase set code → display name; seeded for offline / before GET /api/v1/dbv/sets */
const DEFAULT_COLLECTION_SET_NAMES = new Map([
    ['ERB', 'Edgar Rice Burroughs and the World Legends'],
    ['ERBP', 'Edgar Rice Burroughs and the World Legends - Promos'],
    ['SKY', 'Skybound'],
    ['SKYP', 'Skybound - Promos'],
    ['TFCP', 'The Few and the Cursed - Promos'],
]);
let collectionSetNamesByCode = new Map(DEFAULT_COLLECTION_SET_NAMES);
let collectionSetNamesFetched = false;

// Database view: map of "cardId|cardType|imagePath" -> quantity for -Collection button state
let databaseViewCollectionMap = null;

function getCollectionMapKey(cardId, cardType, imagePath) {
    return `${cardId}|${cardType}|${(imagePath != null && imagePath !== undefined) ? String(imagePath) : ''}`;
}

/**
 * Card Database UI uses hyphenated universe types; collection API and DB use underscores.
 */
function normalizeCollectionCardTypeForApi(cardType) {
    if (!cardType || typeof cardType !== 'string') return cardType;
    const map = {
        'basic-universe': 'basic_universe',
        'advanced-universe': 'advanced_universe',
        'ally-universe': 'ally_universe',
    };
    return map[cardType] || cardType;
}

/**
 * Fetch collection and build map for database view -Collection buttons.
 * GUEST: build from localStorage; USER/ADMIN: fetch GET /api/v1/collections/me/cards.
 */
async function fetchDatabaseViewCollection() {
    if (isGuestUser()) {
        const guestCards = loadGuestCollectionFromStorage();
        databaseViewCollectionMap = new Map();
        guestCards.forEach(c => {
            const key = getCollectionMapKey(c.card_id, c.card_type, c.image_path);
            databaseViewCollectionMap.set(key, c.quantity || 1);
        });
        return;
    }
    try {
        const response = await fetch(COLLECTION_V1_CARDS_BASE, { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        if (!collectionV1IsSuccess(data) || !Array.isArray(data.data)) return;
        databaseViewCollectionMap = new Map();
        data.data.forEach(c => {
            const key = getCollectionMapKey(c.card_id, c.card_type, c.image_path);
            databaseViewCollectionMap.set(key, c.quantity || 0);
        });
    } catch (e) {
        console.error('Failed to fetch collection for database view:', e);
    }
}

/**
 * Get quantity for a card variant from the database view collection map.
 * Returns 0 if map not built or variant not in collection.
 */
function getDatabaseViewCollectionQuantity(cardId, cardType, imagePath) {
    if (!databaseViewCollectionMap) return 0;
    const normalized = normalizeCollectionCardTypeForApi(cardType);
    let key = getCollectionMapKey(cardId, normalized, imagePath);
    let qty = databaseViewCollectionMap.get(key);
    if (qty != null) return qty;
    // Legacy guest localStorage may still use hyphenated universe types
    if (normalized !== cardType) {
        key = getCollectionMapKey(cardId, cardType, imagePath);
        return databaseViewCollectionMap.get(key) || 0;
    }
    return 0;
}

/**
 * Refresh -Collection button state across the database view (disabled when quantity < 1).
 * Fetches and builds the collection map if not yet built. Call after add/remove one or when tables render.
 */
async function refreshDatabaseViewCollectionButtons() {
    if (!databaseViewCollectionMap) {
        await fetchDatabaseViewCollection();
    }
    const buttons = document.querySelectorAll('.remove-from-collection-btn');
    buttons.forEach(btn => {
        const cardId = btn.getAttribute('data-card-id');
        const cardType = btn.getAttribute('data-card-type');
        const imagePath = btn.getAttribute('data-image-path') || '';
        if (!cardId || !cardType) return;
        const qty = getDatabaseViewCollectionQuantity(cardId, cardType, imagePath);
        btn.disabled = qty < 1;
        btn.title = qty < 1 ? 'Card not in collection' : 'Remove one copy from collection';
    });
}

/**
 * Check if the current user is a GUEST
 */
function isGuestUser() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    return currentUser && currentUser.role === 'GUEST';
}

/**
 * Load GUEST collection from localStorage
 */
function loadGuestCollectionFromStorage() {
    try {
        const stored = localStorage.getItem(GUEST_COLLECTION_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Save GUEST collection to localStorage
 */
function saveGuestCollectionToStorage(cards) {
    try {
        localStorage.setItem(GUEST_COLLECTION_KEY, JSON.stringify(cards));
    } catch (e) {
        console.error('Failed to save guest collection:', e);
    }
}

/**
 * GUEST sandbox banner: desktop = always-open single block; mobile = compact one-line summary, expand for full text + signup.
 */
function syncGuestSandboxBannerOpenState() {
    const el = document.getElementById('guestSandboxBanner');
    if (!el || el.tagName !== 'DETAILS') return;
    if (collectionIsLayoutMobile()) {
        el.removeAttribute('open');
    } else {
        el.setAttribute('open', '');
    }
}

/**
 * Show sandbox banner for GUEST users
 */
function showGuestSandboxBanner() {
    const container = document.getElementById('collectionCardsList');
    if (!container || !container.parentNode) return;
    
    const existingBanner = document.getElementById('guestSandboxBanner');
    if (existingBanner) return;
    
    const banner = document.createElement('details');
    banner.id = 'guestSandboxBanner';
    banner.className = 'guest-sandbox-banner';
    banner.setAttribute('open', '');
    banner.innerHTML = `
        <summary class="guest-sandbox-summary">
            <span class="sandbox-icon guest-sandbox-warning-icon" aria-hidden="true">
                <svg class="guest-sandbox-warning-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" aria-hidden="true" focusable="false">
                    <path fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round" d="M12 5.2L19.8 19H4.2L12 5.2z"/>
                    <path stroke="currentColor" stroke-width="1.35" stroke-linecap="round" d="M12 10v4"/>
                    <circle cx="12" cy="17.25" r="1" fill="currentColor"/>
                </svg>
            </span>
            <span class="guest-sandbox-mobile-one-line">Sandbox · Saved only on this device — tap for details</span>
        </summary>
        <div class="guest-sandbox-expanded">
            <span class="sandbox-text">Sandbox Mode: Your collection is stored locally in this browser and will not be saved to your account.
            <a href="#" class="guest-signup-link">Create an account</a> to save your collection permanently.</span>
        </div>
    `;

    const summary = banner.querySelector('.guest-sandbox-summary');
    if (summary) {
        summary.addEventListener('click', (e) => {
            if (!collectionIsLayoutMobile()) {
                e.preventDefault();
            }
        });
    }
    
    // Attach click handler to open login modal (where user can sign up)
    const signupLink = banner.querySelector('.guest-signup-link');
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof showLoginModal === 'function') {
                showLoginModal();
            } else if (typeof window.showLoginModal === 'function') {
                window.showLoginModal();
            }
        });
    }
    
    container.parentNode.insertBefore(banner, container);
    syncGuestSandboxBannerOpenState();
}

/**
 * Merge owned collection cards with all cards from the game database.
 * Returns a unified array where each entry has inCollection: true/false.
 * Owned entries preserve the full collection record; unowned entries are
 * synthesised from allCardsData so they can be rendered in the same table.
 */
function mergeCollectionWithAllCards(owned, allCards) {
    // Build a lookup of owned cards: "card_id|card_type" -> collection record
    // Normalize card_type (underscore -> hyphen) so API ally_universe matches allCards ally-universe
    const ownedLookup = new Map();
    owned.forEach(c => {
        const key = `${c.card_id}|${(c.card_type || '').replace(/_/g, '-')}`;
        ownedLookup.set(key, c);
    });

    const merged = [];

    allCards.forEach(card => {
        const key = `${card.id}|${card.cardType}`;
        if (ownedLookup.has(key)) {
            // Already in collection — use the collection record, mark it owned
            // Include card_data from allCardsData for display name and other info
            // Carry is_foil from allCardsData so foil UI can be applied
            merged.push(Object.assign(
                {}, 
                ownedLookup.get(key), 
                { 
                    inCollection: true, 
                    is_foil: !!(card.is_foil),
                    card_data: card,
                    set: card.set || card.universe || null
                }
            ));
            ownedLookup.delete(key); // Remove so we don't double-add
        } else {
            // Not in collection — synthesise an entry from allCardsData
            merged.push({
                inCollection: false,
                card_id: card.id,
                card_type: card.cardType,
                image_path: card.image_path || card.image || null,
                quantity: null,
                set: card.set || card.universe || null,
                is_foil: !!(card.is_foil),
                card_data: card
            });
        }
    });

    // Any remaining owned cards not found in allCardsData (edge case)
    ownedLookup.forEach(c => {
        merged.push(Object.assign({}, c, { inCollection: true }));
    });

    return merged;
}

/**
 * Load set code → display name from GET /api/v1/dbv/sets (uses `sets.name` in DB). Safe to call multiple times.
 */
async function ensureCollectionSetNamesLoaded() {
    if (collectionSetNamesFetched) {
        return;
    }
    collectionSetNamesFetched = true;
    try {
        const res = await fetch('/api/v1/dbv/sets', { credentials: 'include' });
        if (!res.ok) {
            return;
        }
        const data = await res.json();
        const payload =
            typeof catalogListPayload === 'function'
                ? catalogListPayload(res, data)
                : {
                    ok:
                        res.ok !== false &&
                        data &&
                        !data.errors?.length &&
                        Array.isArray(data.data),
                    rows: Array.isArray(data.data) ? data.data : []
                };
        if (payload.ok && payload.rows.length > 0) {
            const map = new Map();
            for (const row of payload.rows) {
                if (row.code) {
                    map.set(String(row.code).trim().toUpperCase(), row.name);
                }
            }
            collectionSetNamesByCode = map;
        }
    } catch (e) {
        console.error('Failed to load /api/v1/dbv/sets:', e);
    }
}

/**
 * Display name for a set: looks up `sets.name` by code, or passes through values already resolved by the API.
 */
function translateSet(setCode) {
    const erbDefault = collectionSetNamesByCode.get('ERB')
        || DEFAULT_COLLECTION_SET_NAMES.get('ERB')
        || 'Edgar Rice Burroughs and the World Legends';
    if (setCode == null || setCode === '') {
        return erbDefault;
    }
    const s = String(setCode).trim();
    const upper = s.toUpperCase();
    const byCode = collectionSetNamesByCode.get(upper);
    if (byCode) {
        return byCode;
    }
    return s;
}

/**
 * Main ERB line only (set code ERB or unset). Promo/expansion codes (ERBP, TFCP, SKY, …)
 * get no "(Alternate Art)" suffix — the Set column already distinguishes them.
 */
function isMainErbSetCode(setCode) {
    if (setCode == null || String(setCode).trim() === '') {
        return true;
    }
    return String(setCode).trim().toUpperCase() === 'ERB';
}

/** Stable product line for table sort (do not use translated set display names — they can split ERB rows). */
function collectionSortSetCodeForCard(card) {
    const raw = (card?.set ?? card?.card_data?.set ?? '').toString().trim();
    if (!raw) return 'ERB';
    return raw.toUpperCase();
}

/** Numeric tier for # sort: 538F → 538; invalid → 999999 (foil tie-break uses data-is-foil). */
function collectionSetNumberSortNumeric(card) {
    const raw = card?.card_data?.set_number;
    const s = raw != null ? String(raw).trim() : '';
    if (!s) return 999999;
    const core = s.replace(/f$/i, '');
    const n = parseInt(core, 10);
    return Number.isFinite(n) ? n : 999999;
}

/**
 * Format card type for display
 */
function formatCardType(cardType) {
    const typeMap = {
        'character': 'Character',
        'special': 'Special',
        'power': 'Power',
        'location': 'Location',
        'mission': 'Mission',
        'event': 'Event',
        'aspect': 'Aspect',
        'advanced_universe': 'Universe: Advanced',
        'teamwork': 'Universe: Teamwork',
        'ally_universe': 'Universe: Ally',
        'training': 'Universe: Training',
        'basic_universe': 'Universe: Basic'
    };
    return typeMap[cardType] || cardType;
}

/**
 * Map database image paths to actual file paths
 */
function mapImagePathToActualFile(imagePath) {
    if (!imagePath) return imagePath;
    
    // For all card types, the database now contains the full directory structure
    // like "characters/angry_mob_industrial_age.webp", "missions/the-warlord-of-mars/a_fighting_man_of_mars.webp", etc.
    // So we need to return the path after the first directory to preserve the directory structure
    
    // Check for common card type prefixes
    const prefixes = ['characters/', 'missions/', 'specials/', 'locations/', 'events/', 'aspects/', 'power-cards/', 'teamwork-universe/', 'ally-universe/', 'training-universe/', 'basic-universe/', 'advanced-universe/'];
    
    for (const prefix of prefixes) {
        if (imagePath.startsWith(prefix)) {
            return imagePath.substring(prefix.length);
        }
    }
    
    // Fallback: if no prefix matches, return the filename part (after the last slash)
    const filename = imagePath.split('/').pop();
    return filename;
}

var COLLECTION_IMAGE_ASSET_PREFIX = '/src/resources/cards/images/';

/**
 * Collection add flow may persist absolute CDN URLs as image_path; getCardImagePath expects a
 * site path starting with /src/resources/cards/images/. Strip origin / CDN base when present.
 */
function normalizeCollectionImagePathForResolve(raw) {
    if (raw == null || typeof raw !== 'string') {
        return raw;
    }
    var s = raw.trim();
    if (s === '') {
        return s;
    }
    var prefix = COLLECTION_IMAGE_ASSET_PREFIX;
    if (s.startsWith(prefix)) {
        return s;
    }
    var cdnBase = (typeof window !== 'undefined' && window.APP_CDN_BASE || '').replace(/\/$/, '');
    if (cdnBase && s.startsWith(cdnBase + prefix)) {
        return s.slice(cdnBase.length);
    }
    if (/^https?:\/\//i.test(s)) {
        try {
            var u = new URL(s);
            var pathPart = u.pathname + (u.search || '') + (u.hash || '');
            if (pathPart.startsWith(prefix)) {
                return pathPart;
            }
        } catch (e) {
            // ignore invalid URL
        }
    }
    return s;
}

/**
 * Get card image path - uses image_path from collection card, constructing full path if needed
 * options: { useThumbnail: boolean } - when true, return thumbnail path for character images
 */
function getCardImagePath(cardData, cardType, options) {
    const useThumbnail = options && options.useThumbnail === true;
    const toThumb = typeof window.toThumbnailPath === 'function' ? window.toThumbnailPath : function(p) { return p; };
    function maybeThumbnail(path) {
        if (useThumbnail && cardType === 'character' && path && path.startsWith('/src/resources/cards/images/characters/') && !path.includes('/thumb/')) {
            return toThumb(path);
        }
        return path;
    }
    const cdnBase = (typeof window !== 'undefined' && window.APP_CDN_BASE || '').replace(/\/$/, '');

    if (!cardData || !cardData.image_path) {
        return cdnBase + '/src/resources/cards/images/placeholder.webp';
    }

    const imagePath = normalizeCollectionImagePathForResolve(cardData.image_path.trim());
    if (!imagePath) {
        return cdnBase + '/src/resources/cards/images/placeholder.webp';
    }

    // If it's already a full path, use it directly (fix location alternate paths missing locations/)
    if (imagePath.startsWith('/src/resources/cards/images/')) {
        let path = imagePath;
        if (cardType === 'location' && path.includes('/alternate/') && !path.includes('/locations/alternate/')) {
            path = path.replace('/images/alternate/', '/images/locations/alternate/');
        }
        return cdnBase + maybeThumbnail(path);
    }

    // If it's just a filename (like "placeholder_aspect.webp" or "angry_mob__industrial_age_.webp")
    // construct the full path based on card type
    if (!imagePath.includes('/')) {
        // It's just a filename - construct path based on card type
        let constructedPath;
        switch (cardType) {
            case 'character':
                constructedPath = maybeThumbnail(`/src/resources/cards/images/characters/${imagePath}`);
                break;
            case 'special':
                constructedPath = `/src/resources/cards/images/specials/${imagePath}`;
                break;
            case 'power':
                constructedPath = `/src/resources/cards/images/power-cards/${imagePath}`;
                break;
            case 'location':
                constructedPath = `/src/resources/cards/images/locations/${imagePath}`;
                break;
            case 'mission':
                constructedPath = `/src/resources/cards/images/missions/${imagePath}`;
                break;
            case 'event':
                constructedPath = `/src/resources/cards/images/events/${imagePath}`;
                break;
            case 'aspect':
                constructedPath = `/src/resources/cards/images/aspects/${imagePath}`;
                break;
            case 'advanced_universe':
                constructedPath = `/src/resources/cards/images/advanced-universe/${imagePath}`;
                break;
            case 'teamwork':
                constructedPath = `/src/resources/cards/images/teamwork-universe/${imagePath}`;
                break;
            case 'ally_universe':
                constructedPath = `/src/resources/cards/images/ally-universe/${imagePath}`;
                break;
            case 'training':
                constructedPath = `/src/resources/cards/images/training-universe/${imagePath}`;
                break;
            case 'basic_universe':
                constructedPath = `/src/resources/cards/images/basic-universe/${imagePath}`;
                break;
            default:
                constructedPath = '/src/resources/cards/images/placeholder.webp';
        }
        return cdnBase + constructedPath;
    }

    // If it has a partial path (like "characters/alternate/zorro.png" or "alternate/draculas_armory.png"), construct full path
    if (imagePath.includes('/') && !imagePath.startsWith('/')) {
        let fullPath = imagePath;
        // Location alternates: alternate/xxx must become locations/alternate/xxx
        if (cardType === 'location' && imagePath.startsWith('alternate/') && !imagePath.startsWith('locations/')) {
            fullPath = 'locations/' + imagePath;
        }
        return cdnBase + maybeThumbnail(`/src/resources/cards/images/${fullPath}`);
    }

    // Fallback: ensure it starts with / to make it absolute
    if (imagePath && !imagePath.startsWith('/')) {
        return cdnBase + '/src/resources/cards/images/placeholder.webp';
    }

    return cdnBase + (maybeThumbnail(imagePath) || '/src/resources/cards/images/placeholder.webp');
}

/**
 * Get card display name
 */
function getCardDisplayName(cardData, cardType) {
    if (!cardData || !cardData.card_data) {
        return 'Unknown Card';
    }

    cardType = (cardType || '').replace(/-/g, '_');
    const card = cardData.card_data;

    switch (cardType) {
        case 'power':
            return `${card.value} - ${card.power_type}`;
        case 'teamwork':
            return card.to_use || card.card_type || card.name || 'Teamwork';
        case 'advanced_universe':
            return card.card_name || card.name || 'Advanced Universe';
        case 'ally_universe':
            return card.card_name || card.name || 'Ally';
        case 'training':
            return card.card_name || card.name || 'Training';
        case 'basic_universe':
            return card.card_name || card.name || 'Basic Universe';
        case 'aspect':
            return card.card_name || card.name || 'Aspect';
        case 'mission':
            return card.card_name || card.name || 'Mission';
        case 'event':
            return card.name || 'Event';
        case 'location':
            return card.name || 'Location';
        case 'special':
            return card.name || 'Special';
        case 'character':
            return card.name || 'Character';
        default:
            return cardData.card_name || 'Unknown';
    }
}

/**
 * Load collection cards from API (or localStorage for GUEST), merge with full card database, and display.
 */
async function loadCollection() {
    try {
        await ensureCollectionSetNamesLoaded();

        // For GUEST users, load from localStorage instead of API
        if (isGuestUser()) {
            collectionCards = loadGuestCollectionFromStorage();
            
            // Load allCardsData for merging
            let allCards = (window.allCardsData && window.allCardsData.length > 0)
                ? window.allCardsData
                : null;

            if (!allCards && typeof loadAllCards === 'function') {
                allCards = await loadAllCards();
            }

            if (allCards && allCards.length > 0) {
                mergedCollectionData = mergeCollectionWithAllCards(collectionCards, allCards);
            } else {
                mergedCollectionData = collectionCards.map(c => Object.assign({}, c, { inCollection: true }));
            }

            // Show sandbox banner for GUEST users
            showGuestSandboxBanner();
            displayCollectionCards(mergedCollectionData);
            return;
        }

        // For authenticated users (USER/ADMIN), use API
        // Remove any GUEST sandbox banner if present (e.g., from a previous session)
        const existingBanner = document.getElementById('guestSandboxBanner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const response = await fetch(COLLECTION_V1_CARDS_BASE, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to load collection: ${response.status}`);
        }

        const data = await response.json();
        if (collectionV1IsSuccess(data)) {
            collectionCards = data.data;

            // Reuse already-loaded allCardsData if available; otherwise load on-demand
            let allCards = (window.allCardsData && window.allCardsData.length > 0)
                ? window.allCardsData
                : null;

            if (!allCards && typeof loadAllCards === 'function') {
                allCards = await loadAllCards();
            }

            if (allCards && allCards.length > 0) {
                mergedCollectionData = mergeCollectionWithAllCards(collectionCards, allCards);
            } else {
                // Fallback: no allCardsData available — show only owned cards
                mergedCollectionData = collectionCards.map(c => Object.assign({}, c, { inCollection: true }));
            }

            displayCollectionCards(mergedCollectionData);
        } else {
            console.error('Failed to load collection:', collectionApiErrorMessage(data));
        }
    } catch (error) {
        console.error('Error loading collection:', error);
        const listContainer = document.getElementById('collectionCardsList');
        if (listContainer) {
            listContainer.innerHTML = '<div class="collection-loading">Error loading collection. Please try again.</div>';
        }
    }
}

/**
 * Sort merged collection records (same semantics as sortCollectionTable on DOM rows).
 * @param {Array<Record<string, unknown>>} cards
 * @param {string} sortField
 * @param {string} direction 'asc' | 'desc'
 */
function sortMergedCollectionCards(cards, sortField, direction) {
    const out = cards.slice();
    out.sort((a, b) => {
        if (sortField === 'set_number') {
            const aCode = collectionSortSetCodeForCard(a).toUpperCase();
            const bCode = collectionSortSetCodeForCard(b).toUpperCase();
            if (aCode !== bCode) {
                const c = aCode < bCode ? -1 : aCode > bCode ? 1 : 0;
                return direction === 'asc' ? c : -c;
            }
            const aFoil = !!a.is_foil;
            const bFoil = !!b.is_foil;
            if (aFoil !== bFoil) return aFoil ? 1 : -1;
            const av = collectionSetNumberSortNumeric(a);
            const bv = collectionSetNumberSortNumeric(b);
            const n = av - bv;
            return direction === 'asc' ? n : -n;
        }
        if (sortField === 'quantity') {
            const av = a.inCollection === false ? -1 : (parseInt(String(a.quantity || 0), 10) || 0);
            const bv = b.inCollection === false ? -1 : (parseInt(String(b.quantity || 0), 10) || 0);
            const n = av - bv;
            return direction === 'asc' ? n : -n;
        }
        let av = '';
        let bv = '';
        if (sortField === 'name') {
            av = (getCardDisplayName(a, a.card_type) || '').toLowerCase();
            bv = (getCardDisplayName(b, b.card_type) || '').toLowerCase();
        } else if (sortField === 'type') {
            av = (formatCardType(a.card_type) || '').toLowerCase();
            bv = (formatCardType(b.card_type) || '').toLowerCase();
        } else if (sortField === 'set') {
            av = collectionSortSetCodeForCard(a).toLowerCase();
            bv = collectionSortSetCodeForCard(b).toLowerCase();
        } else {
            return 0;
        }
        let c = 0;
        if (av < bv) c = -1;
        else if (av > bv) c = 1;
        return direction === 'asc' ? c : -c;
    });
    return out;
}

function onCollectionLayoutModeChange() {
    closeCollectionMobileDetail();
    syncGuestSandboxBannerOpenState();
    const cv = document.getElementById('collection-view');
    if (!cv || cv.classList.contains('view-removed')) return;
    displayCollectionCards(mergedCollectionData);
}

function onCollectionMobileDetailKeydown(e) {
    if (e.key === 'Escape') {
        e.preventDefault();
        closeCollectionMobileDetail();
    }
}

function ensureCollectionMobileDetailPanel() {
    let root = document.getElementById('collectionMobileDetail');
    if (root) return root;
    const host = document.getElementById('collection-view');
    if (!host) return null;
    root = document.createElement('div');
    root.id = 'collectionMobileDetail';
    root.className = 'collection-mobile-detail';
    root.innerHTML = `
        <div class="collection-mobile-detail-scrim" aria-hidden="true"></div>
        <div id="collectionMobileDetailPanel" class="collection-mobile-detail-panel" role="dialog" aria-modal="true" aria-labelledby="collectionMobileDetailTitle">
            <div class="collection-mobile-detail-header">
                <button type="button" class="collection-mobile-detail-back">Back</button>
            </div>
            <div class="collection-mobile-detail-body">
                <img class="collection-mobile-detail-image" src="" alt="" />
                <h2 id="collectionMobileDetailTitle" class="collection-mobile-detail-heading"></h2>
                <div class="collection-mobile-detail-lines" aria-live="polite"></div>
                <div class="collection-mobile-detail-actions"></div>
            </div>
        </div>
    `;
    host.appendChild(root);
    const panelEl = root.querySelector('#collectionMobileDetailPanel');
    if (panelEl) panelEl.setAttribute('aria-hidden', 'true');
    const scrim = root.querySelector('.collection-mobile-detail-scrim');
    const back = root.querySelector('.collection-mobile-detail-back');
    if (scrim) scrim.addEventListener('click', closeCollectionMobileDetail);
    if (back) back.addEventListener('click', closeCollectionMobileDetail);
    return root;
}

function closeCollectionMobileDetail() {
    const root = document.getElementById('collectionMobileDetail');
    const panel = document.getElementById('collectionMobileDetailPanel');
    if (!root || !panel) {
        collectionMobileDetailOpen = false;
        return;
    }
    root.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onCollectionMobileDetailKeydown, true);
    collectionMobileDetailOpen = false;
    if (collectionMobileDetailTriggerEl && typeof collectionMobileDetailTriggerEl.focus === 'function') {
        collectionMobileDetailTriggerEl.focus();
    }
    collectionMobileDetailTriggerEl = null;
}

/**
 * @param {HTMLElement} rowEl - li.collection-mobile-row
 */
function openCollectionMobileDetail(rowEl) {
    if (!collectionIsLayoutMobile()) return;
    ensureCollectionMobileDetailPanel();
    const root = document.getElementById('collectionMobileDetail');
    const panel = document.getElementById('collectionMobileDetailPanel');
    if (!root || !panel) return;

    collectionMobileDetailTriggerEl = rowEl;
    const cardId = rowEl.getAttribute('data-card-id') || '';
    const cardType = rowEl.getAttribute('data-card-type') || '';
    const imagePath = rowEl.getAttribute('data-image-path') || '';
    const titlePlain = rowEl.getAttribute('data-card-title-plain') || rowEl.getAttribute('data-card-name') || '';
    const qtyStr = rowEl.getAttribute('data-quantity') || '0';
    const qty = parseInt(qtyStr, 10);
    const owned = rowEl.getAttribute('data-in-collection') !== 'false';
    const setNumber = rowEl.getAttribute('data-set-number-display') || '';
    const cardSet = rowEl.getAttribute('data-card-set') || '';
    const typeLabel = rowEl.getAttribute('data-card-type-label') || formatCardType(cardType);

    panel.dataset.cardId = cardId;
    panel.dataset.cardType = cardType;
    panel.dataset.imagePath = imagePath;
    panel.dataset.inCollection =
        owned && !Number.isNaN(qty) && qty >= 0 ? 'true' : 'false';

    const img = panel.querySelector('.collection-mobile-detail-image');
    const h2 = panel.querySelector('#collectionMobileDetailTitle');
    const lines = panel.querySelector('.collection-mobile-detail-lines');
    const actions = panel.querySelector('.collection-mobile-detail-actions');

    if (img) {
        img.src = imagePath || '';
        img.alt = titlePlain || 'Card';
    }
    if (h2) h2.textContent = titlePlain;
    if (lines) {
        lines.innerHTML = `
            <p class="collection-mobile-detail-line"><span class="collection-mobile-detail-k">Type</span> ${escapeHtmlCollection(typeLabel)}</p>
            <p class="collection-mobile-detail-line"><span class="collection-mobile-detail-k">Set #</span> ${escapeHtmlCollection(setNumber || '—')}</p>
            <p class="collection-mobile-detail-line"><span class="collection-mobile-detail-k">Set</span> ${escapeHtmlCollection(cardSet)}</p>
        `;
    }

    const escapedId = cardId.replace(/'/g, "\\'");
    const escapedType = cardType.replace(/'/g, "\\'");
    const escapedImg = imagePath.replace(/'/g, "\\'");

    if (actions) {
        if (!owned || Number.isNaN(qty) || qty < 0) {
            actions.innerHTML = `
                <div class="collection-quantity-control collection-mobile-detail-stepper">
                    <button type="button" class="collection-quantity-btn" disabled aria-disabled="true">-</button>
                    <button type="button" class="collection-quantity-btn collection-add-btn"
                        onclick="event.stopPropagation(); addCardToCollection('${escapedId}', '${escapedType}', '${escapedImg}')">+</button>
                    ${collectionQuantitySetClusterHtml('', { stopPropagation: true, detailPanel: true })}
                </div>
            `;
        } else {
            actions.innerHTML = `
                <div class="collection-quantity-control collection-mobile-detail-stepper">
                    <button type="button" class="collection-quantity-btn"
                        onclick="event.stopPropagation(); handleCollectionMobileDetailQuantityClick(${qty - 1})"
                        ${qty <= 0 ? 'disabled' : ''}>-</button>
                    <span class="collection-mobile-detail-qty-num">${qty}</span>
                    <button type="button" class="collection-quantity-btn"
                        onclick="event.stopPropagation(); handleCollectionMobileDetailQuantityClick(${qty + 1})">+</button>
                    ${collectionQuantitySetClusterHtml(qty, { stopPropagation: true, detailPanel: true })}
                </div>
            `;
        }
    }

    root.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    collectionMobileDetailOpen = true;
    document.addEventListener('keydown', onCollectionMobileDetailKeydown, true);
    const backBtn = panel.querySelector('.collection-mobile-detail-back');
    if (backBtn && typeof backBtn.focus === 'function') {
        backBtn.focus();
    }
}

function escapeHtmlCollection(s) {
    if (s == null || s === '') return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Escape for double-quoted HTML attributes (e.g. input value="…"). */
function escapeHtmlAttrDouble(val) {
    if (val == null || val === '') return '';
    return String(val).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Markup for numeric field + Set button in collection quantity controls.
 * @param {number|string} qtyValue - initial value; use '' for blank (unowned).
 * @param {{ stopPropagation?: boolean, detailPanel?: boolean }} [options]
 */
function collectionQuantitySetClusterHtml(qtyValue, options) {
    const opts = options || {};
    const stopPropagation = !!opts.stopPropagation;
    const detailPanel = !!opts.detailPanel;
    const prefix = stopPropagation ? 'event.stopPropagation(); ' : '';
    const setCall = detailPanel ? 'handleCollectionMobileDetailQuantitySetClick()' : 'handleCollectionQuantitySetClick(this)';
    const val =
        qtyValue === '' || qtyValue === null || qtyValue === undefined ? '' : String(qtyValue);
    const valAttr = escapeHtmlAttrDouble(val);
    const inputClick = stopPropagation ? ' onclick="event.stopPropagation();"' : '';
    return (
        '<span class="collection-qty-set-group">' +
        '<input type="number" min="0" step="1" inputmode="numeric" class="collection-qty-set-input" value="' +
        valAttr +
        '" aria-label="Set quantity"' +
        inputClick +
        ' />' +
        '<button type="button" class="collection-qty-set-btn" onclick="' +
        prefix +
        setCall +
        '">Set</button>' +
        '</span>'
    );
}

/**
 * Parse quantity from Set input; non-negative integer or null if invalid.
 * @param {string} raw
 * @returns {number|null}
 */
function parseCollectionSetQuantityInput(raw) {
    const s = String(raw == null ? '' : raw).trim();
    if (s === '') return null;
    const n = Math.floor(Number(s));
    if (!Number.isFinite(n) || Number.isNaN(n)) return null;
    return Math.max(0, n);
}

function handleCollectionQuantitySetClick(buttonElement) {
    if (!buttonElement) return;
    const control = buttonElement.closest('.collection-quantity-control');
    const row = buttonElement.closest('.collection-card-item');
    const input = control && control.querySelector('.collection-qty-set-input');
    const n = parseCollectionSetQuantityInput(input && input.value);
    if (n === null) {
        if (typeof showNotification === 'function') {
            showNotification('Enter a valid quantity', 'error');
        }
        return;
    }
    if (!row) return;
    const owned = row.getAttribute('data-in-collection') !== 'false';
    const cardId = row.getAttribute('data-card-id');
    const cardType = row.getAttribute('data-card-type');
    const imagePath = row.getAttribute('data-image-path');
    if (!imagePath) {
        console.error('Missing image_path attribute on collection card row');
        return;
    }
    if (owned) {
        updateCollectionQuantity(cardId, cardType, n, imagePath);
        return;
    }
    if (n === 0) {
        if (typeof showNotification === 'function') {
            showNotification('Enter a quantity greater than 0 to add this card', 'info');
        }
        return;
    }
    if (isGuestUser()) {
        updateCollectionQuantity(cardId, cardType, n, imagePath);
        return;
    }
    addCardToCollection(cardId, cardType, imagePath, n);
}

function handleCollectionMobileDetailQuantitySetClick() {
    const panel = document.getElementById('collectionMobileDetailPanel');
    if (!panel) return;
    const input = panel.querySelector('.collection-qty-set-input');
    const n = parseCollectionSetQuantityInput(input && input.value);
    if (n === null) {
        if (typeof showNotification === 'function') {
            showNotification('Enter a valid quantity', 'error');
        }
        return;
    }
    const owned = panel.dataset.inCollection === 'true';
    const cardId = panel.dataset.cardId;
    const cardType = panel.dataset.cardType;
    const imagePath = panel.dataset.imagePath;
    if (!imagePath) {
        console.error('Missing image_path on collection mobile detail panel');
        return;
    }
    if (owned) {
        updateCollectionQuantity(cardId, cardType, n, imagePath);
        return;
    }
    if (n === 0) {
        if (typeof showNotification === 'function') {
            showNotification('Enter a quantity greater than 0 to add this card', 'info');
        }
        return;
    }
    if (isGuestUser()) {
        updateCollectionQuantity(cardId, cardType, n, imagePath);
        return;
    }
    addCardToCollection(cardId, cardType, imagePath, n);
}

function handleCollectionMobileDetailQuantityClick(newQuantity) {
    const panel = document.getElementById('collectionMobileDetailPanel');
    if (!panel) return;
    const cardId = panel.dataset.cardId;
    const cardType = panel.dataset.cardType;
    const imagePath = panel.dataset.imagePath;
    if (!cardId || !cardType || !imagePath) return;
    updateCollectionQuantity(cardId, cardType, newQuantity, imagePath);
}

function onCollectionViewMobileActivate(e) {
    if (!collectionIsLayoutMobile()) return;
    const row = e.target.closest('.collection-mobile-row.collection-card-item');
    if (!row || !document.getElementById('collection-view')?.contains(row)) return;
    if (e.target.closest('.collection-quantity-control')) return;
    if (e.target.closest('button')) return;
    openCollectionMobileDetail(row);
}

/**
 * Display collection cards in a single table.
 * Accepts merged array (from mergeCollectionWithAllCards) or plain collection array.
 */
function displayCollectionCards(cards) {
    mergedCollectionData = cards;
    const listContainer = document.getElementById('collectionCardsList');
    if (!listContainer) return;

    if (collectionIsLayoutMobile()) {
        closeCollectionMobileDetail();
    }

    // Apply unowned filter
    const visibleCards = showUnownedCards
        ? cards
        : cards.filter(c => c.inCollection !== false);

    const ownedCount = cards.filter(c => c.inCollection !== false).length;

    if (ownedCount === 0 && !showUnownedCards) {
        listContainer.innerHTML = `
            <div class="collection-empty">
                <div class="collection-empty-message">Your collection is empty</div>
                <div class="collection-empty-hint">Use the search bar above to add cards to your collection</div>
            </div>
        `;
        return;
    }

    if (visibleCards.length === 0) {
        listContainer.innerHTML = `
            <div class="collection-empty">
                <div class="collection-empty-message">No cards to display</div>
            </div>
        `;
        return;
    }

    if (collectionIsLayoutMobile()) {
        const sorted = sortMergedCollectionCards(
            visibleCards,
            COLLECTION_MOBILE_LIST_SORT_FIELD,
            COLLECTION_MOBILE_LIST_SORT_DIR
        );
        let listHtml = `<ul id="collection-mobile-list" class="collection-mobile-list" role="list">`;

        sorted.forEach(card => {
            const cardType = card.card_type;
            const cardName = getCardDisplayName(card, cardType);
            const cardImageFull = getCardImagePath(card, cardType);
            const cardImageThumb = getCardImagePath(card, cardType, { useThumbnail: true });
            const escapedImagePath = cardImageFull.replace(/'/g, "\\'");
            const cardSet = translateSet(card.set);
            const sortSetCode = collectionSortSetCodeForCard(card);
            const setNumber = card.card_data?.set_number != null ? String(card.card_data.set_number).trim() : '';
            const setNumberValue = collectionSetNumberSortNumeric(card);
            const isAlternateArt = card.image_path && card.image_path.includes('/alternate/');
            const showAlternateArtLabel = isAlternateArt && isMainErbSetCode(card.set);
            const isFoil = !!(card.is_foil);
            let displayName = showAlternateArtLabel ? `${cardName} (Alternate Art)` : cardName;
            if (isFoil) {
                displayName = `${cardName} <span class="collection-foil-badge">✦ FOIL</span>`;
            }
            const titlePlain = isFoil ? `${cardName} ✦ FOIL` : (showAlternateArtLabel ? `${cardName} (Alternate Art)` : cardName);
            const escapedImagePathAttr = cardImageFull.replace(/"/g, '&quot;');
            const escapedImageForAdd = cardImageFull.replace(/'/g, "\\'");
            const thumbAttr = cardImageThumb.replace(/"/g, '&quot;');
            const escapedCardIdHover = String(card.card_id || '').replace(/'/g, "\\'");
            const escapedCardTypeHover = String(cardType || '').replace(/'/g, "\\'");
            const escapedDisplayNameSingle = (isFoil ? `${cardName} ✦ FOIL` : cardName).replace(/'/g, "\\'");
            const foilRowClass = isFoil ? ' collection-card-foil' : '';
            const typeLabel = formatCardType(cardType);
            const subtitleText = `${typeLabel} · #${setNumber || '—'} · ${cardSet}`;
            const titlePlainAttr = titlePlain.replace(/"/g, '&quot;');
            const subtitleAttr = subtitleText.replace(/"/g, '&quot;');
            const typeLabelAttr = typeLabel.replace(/"/g, '&quot;');
            const cardSetAttr = cardSet.replace(/"/g, '&quot;');

            if (card.inCollection === false) {
                const escapedCardId = String(card.card_id).replace(/"/g, '&quot;');
                const escapedCardType = String(card.card_type).replace(/"/g, '&quot;');
                listHtml += `
                    <li class="collection-card-item collection-card-unowned collection-mobile-row${foilRowClass}" tabindex="0"
                        data-card-id="${escapedCardId}"
                        data-card-type="${escapedCardType}"
                        data-image-path="${escapedImagePathAttr}"
                        data-quantity="-1"
                        data-set-number="${setNumberValue}"
                        data-set-number-display="${setNumber.replace(/"/g, '&quot;')}"
                        data-card-set-code="${sortSetCode.replace(/"/g, '&quot;')}"
                        data-is-foil="${isFoil}"
                        data-card-name="${titlePlainAttr}"
                        data-card-title-plain="${titlePlainAttr}"
                        data-card-type-label="${typeLabelAttr}"
                        data-card-set="${cardSetAttr}"
                        data-in-collection="false"
                        onmouseenter="showCardHoverModal('${escapedImagePath}', '${escapedDisplayNameSingle}', '${escapedCardIdHover}', '${escapedCardTypeHover}', ${isFoil})"
                        onmouseleave="hideCardHoverModal()">
                        <img class="collection-mobile-row-thumb" src="${thumbAttr}" alt="" width="56" height="56" loading="lazy" />
                        <div class="collection-mobile-row-main">
                            <div class="collection-mobile-row-title">${displayName}</div>
                            <div class="collection-mobile-row-subtitle">${escapeHtmlCollection(subtitleText)}</div>
                        </div>
                        <div class="collection-mobile-row-actions">
                            <div class="collection-quantity-control">
                                <button type="button" class="collection-quantity-btn" disabled aria-disabled="true">-</button>
                                <button type="button" class="collection-quantity-btn collection-add-btn"
                                    onclick="event.stopPropagation(); addCardToCollection('${String(card.card_id).replace(/'/g, "\\'")}', '${String(card.card_type).replace(/'/g, "\\'")}', '${escapedImageForAdd}')">+</button>
                                ${collectionQuantitySetClusterHtml('', { stopPropagation: true })}
                            </div>
                        </div>
                    </li>
                `;
            } else {
                const q = card.quantity;
                listHtml += `
                    <li class="collection-card-item collection-mobile-row${foilRowClass}" tabindex="0"
                        data-card-id="${card.card_id}"
                        data-card-type="${card.card_type}"
                        data-image-path="${escapedImagePathAttr}"
                        data-quantity="${q}"
                        data-set-number="${setNumberValue}"
                        data-set-number-display="${setNumber.replace(/"/g, '&quot;')}"
                        data-card-set-code="${sortSetCode.replace(/"/g, '&quot;')}"
                        data-is-foil="${isFoil}"
                        data-card-name="${titlePlainAttr}"
                        data-card-title-plain="${titlePlainAttr}"
                        data-card-type-label="${typeLabelAttr}"
                        data-card-set="${cardSetAttr}"
                        data-in-collection="true"
                        onmouseenter="showCardHoverModal('${escapedImagePath}', '${escapedDisplayNameSingle}', '${escapedCardIdHover}', '${escapedCardTypeHover}', ${isFoil})"
                        onmouseleave="hideCardHoverModal()">
                        <img class="collection-mobile-row-thumb" src="${thumbAttr}" alt="" width="56" height="56" loading="lazy" />
                        <div class="collection-mobile-row-main">
                            <div class="collection-mobile-row-title">${displayName}</div>
                            <div class="collection-mobile-row-subtitle">${escapeHtmlCollection(subtitleText)}</div>
                        </div>
                        <div class="collection-mobile-row-actions">
                            <div class="collection-quantity-control">
                                <button type="button" class="collection-quantity-btn"
                                    onclick="event.stopPropagation(); handleCollectionQuantityClick(this, ${q - 1})"
                                    ${q <= 0 ? 'disabled' : ''}>-</button>
                                <span class="collection-mobile-row-qty" aria-label="Quantity">${q}</span>
                                <button type="button" class="collection-quantity-btn"
                                    onclick="event.stopPropagation(); handleCollectionQuantityClick(this, ${q + 1})">+</button>
                                ${collectionQuantitySetClusterHtml(q, { stopPropagation: true })}
                            </div>
                        </div>
                    </li>
                `;
            }
        });

        listHtml += '</ul>';
        listContainer.innerHTML = listHtml;
        return;
    }

    let html = `
        <table class="collection-category-table" id="collection-table" data-sort="set_number" data-sort-dir="asc">
            <thead>
                <tr>
                    <th class="collection-col-quantity sortable resizable" data-sort="quantity">
                        <div class="th-content">Qty <span class="sort-indicator"></span></div>
                        <div class="resize-handle"></div>
                    </th>
                    <th class="collection-col-set-number sortable resizable" data-sort="set_number">
                        <div class="th-content"># <span class="sort-indicator"> ▲</span></div>
                        <div class="resize-handle"></div>
                    </th>
                    <th class="collection-col-name sortable resizable" data-sort="name">
                        <div class="th-content">Name <span class="sort-indicator"></span></div>
                        <div class="resize-handle"></div>
                    </th>
                    <th class="collection-col-type sortable resizable" data-sort="type">
                        <div class="th-content">Type <span class="sort-indicator"></span></div>
                        <div class="resize-handle"></div>
                    </th>
                    <th class="collection-col-set sortable resizable" data-sort="set">
                        <div class="th-content">Set <span class="sort-indicator"></span></div>
                        <div class="resize-handle"></div>
                    </th>
                    <th class="collection-col-actions resizable">
                        <div class="th-content">Actions</div>
                        <div class="resize-handle"></div>
                    </th>
                </tr>
            </thead>
            <tbody class="collection-category-tbody">
    `;

    visibleCards.forEach(card => {
        const cardType = card.card_type;
        const cardName = getCardDisplayName(card, cardType);
        const cardImage = getCardImagePath(card, cardType);
        const cardSet = translateSet(card.set);
        const sortSetCode = collectionSortSetCodeForCard(card);

        // Get set_number from card_data
        const setNumber = card.card_data?.set_number != null ? String(card.card_data.set_number).trim() : '';
        const setNumberValue = collectionSetNumberSortNumeric(card);

        // Alternate art label only for main ERB rows; promos/expansions use Set column instead
        const isAlternateArt = card.image_path && card.image_path.includes('/alternate/');
        const showAlternateArtLabel = isAlternateArt && isMainErbSetCode(card.set);
        const isFoil = !!(card.is_foil);
        let displayName = showAlternateArtLabel ? `${cardName} (Alternate Art)` : cardName;
        if (isFoil) {
            displayName = `${cardName} <span class="collection-foil-badge">✦ FOIL</span>`;
        }

        const escapedImagePath = cardImage.replace(/'/g, "\\'");
        const escapedImagePathAttr = cardImage.replace(/"/g, '&quot;');
        const escapedDisplayName = (isFoil ? `${cardName} ✦ FOIL` : displayName).replace(/"/g, '&quot;');
        const escapedDisplayNameSingle = (isFoil ? `${cardName} ✦ FOIL` : cardName).replace(/'/g, "\\'");
        const escapedCardIdHover = String(card.card_id || '').replace(/'/g, "\\'");
        const escapedCardTypeHover = String(cardType || '').replace(/'/g, "\\'");
        const foilRowClass = isFoil ? ' collection-card-foil' : '';

        if (card.inCollection === false) {
            // Unowned card: dimmed row, blank Qty, single + button
            const escapedCardId = String(card.card_id).replace(/"/g, '&quot;');
            const escapedCardType = String(card.card_type).replace(/"/g, '&quot;');
            const escapedImageForAdd = cardImage.replace(/'/g, "\\'");

            html += `
                <tr class="collection-card-item collection-card-unowned${foilRowClass}"
                    data-card-id="${escapedCardId}"
                    data-card-type="${escapedCardType}"
                    data-image-path="${escapedImagePathAttr}"
                    data-quantity="-1"
                    data-set-number="${setNumberValue}"
                    data-card-set-code="${sortSetCode.replace(/"/g, '&quot;')}"
                    data-is-foil="${isFoil}"
                    data-card-name="${escapedDisplayName}"
                    data-card-set="${cardSet.replace(/"/g, '&quot;')}"
                    data-in-collection="false"
                    onmouseenter="showCardHoverModal('${escapedImagePath}', '${escapedDisplayNameSingle}', '${escapedCardIdHover}', '${escapedCardTypeHover}', ${isFoil})"
                    onmouseleave="hideCardHoverModal()">
                    <td class="collection-card-quantity"></td>
                    <td class="collection-card-set-number">${setNumber || ''}</td>
                    <td class="collection-card-name">${displayName}</td>
                    <td class="collection-card-type">${formatCardType(cardType)}</td>
                    <td class="collection-card-set">${cardSet}</td>
                    <td class="collection-card-actions">
                        <div class="collection-quantity-control">
                            <button type="button" class="collection-quantity-btn" disabled aria-disabled="true">-</button>
                            <button class="collection-quantity-btn collection-add-btn"
                                onclick="addCardToCollection('${escapedCardId}', '${escapedCardType}', '${escapedImageForAdd}')">+</button>
                            ${collectionQuantitySetClusterHtml('')}
                        </div>
                    </td>
                </tr>
            `;
        } else {
            // Owned card: full row with - and + quantity controls
            html += `
                <tr class="collection-card-item${foilRowClass}"
                    data-card-id="${card.card_id}"
                    data-card-type="${card.card_type}"
                    data-image-path="${escapedImagePathAttr}"
                    data-quantity="${card.quantity}"
                    data-set-number="${setNumberValue}"
                    data-card-set-code="${sortSetCode.replace(/"/g, '&quot;')}"
                    data-is-foil="${isFoil}"
                    data-card-name="${escapedDisplayName}"
                    data-card-set="${cardSet.replace(/"/g, '&quot;')}"
                    data-in-collection="true"
                    onmouseenter="showCardHoverModal('${escapedImagePath}', '${escapedDisplayNameSingle}', '${escapedCardIdHover}', '${escapedCardTypeHover}', ${isFoil})"
                    onmouseleave="hideCardHoverModal()">
                    <td class="collection-card-quantity">${card.quantity}</td>
                    <td class="collection-card-set-number">${setNumber || ''}</td>
                    <td class="collection-card-name">${displayName}</td>
                    <td class="collection-card-type">${formatCardType(cardType)}</td>
                    <td class="collection-card-set">${cardSet}</td>
                    <td class="collection-card-actions">
                        <div class="collection-quantity-control">
                            <button type="button" class="collection-quantity-btn"
                                onclick="handleCollectionQuantityClick(this, ${card.quantity - 1})"
                                    ${card.quantity <= 0 ? 'disabled' : ''}>-</button>
                            <button class="collection-quantity-btn"
                                onclick="handleCollectionQuantityClick(this, ${card.quantity + 1})">+</button>
                            ${collectionQuantitySetClusterHtml(card.quantity)}
                        </div>
                    </td>
                </tr>
            `;
        }
    });

    html += `
            </tbody>
        </table>
    `;

    listContainer.innerHTML = html;

    // Load saved column widths
    const table = listContainer.querySelector('#collection-table');
    if (table) {
        loadColumnWidths(table);
    }

    // Add event listeners for sortable column headers
    initializeCollectionSorting();

    // Apply default sort by set_number ascending
    if (table) {
        const setNumberHeader = table.querySelector('[data-sort="set_number"]');
        if (setNumberHeader) {
            const indicator = setNumberHeader.querySelector('.sort-indicator');
            if (indicator) {
                indicator.textContent = ' ▲';
            }
        }
        sortCollectionTable(table, 'set_number', 'asc');
    }

    // Add event listeners for resizable columns
    initializeCollectionResizing();
}

/**
 * Initialize collection search
 */
function initializeCollectionSearch() {
    const searchInput = document.getElementById('collectionSearchInput');
    const searchResults = document.getElementById('collectionSearchResults');

    if (!searchInput || !searchResults) {
        console.error('Collection search elements not found');
        return;
    }

    // Use DeckEditorSearch component if available
    if (window.DeckEditorSearch && window.CardSearchService) {
        window.collectionSearchComponent = new window.DeckEditorSearch({
            input: searchInput,
            results: searchResults,
            searchService: new window.CardSearchService({ maxResults: 72 }),
            clickInsideRootSelectors: ['.collection-search-container'],
            onSelect: ({ id, type, imagePath }) => {
                addCardToCollection(id, type, imagePath || null);
            }
        });
        window.collectionSearchComponent.mount();
        return;
    }

    // Fallback to manual implementation
    searchInput.addEventListener('input', handleCollectionSearch);
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) {
            searchResults.style.display = 'block';
        }
    });
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchResults.style.display = 'none';
        }, 200);
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.collection-search-container')) {
            searchResults.style.display = 'none';
        }
    });
}

/**
 * Handle collection search input
 */
async function handleCollectionSearch(e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    const searchResults = document.getElementById('collectionSearchResults');

    if (searchTerm.length < 2) {
        searchResults.style.display = 'none';
        return;
    }

    // Clear previous timeout
    if (collectionSearchTimeout) {
        clearTimeout(collectionSearchTimeout);
    }

    // Debounce search
    collectionSearchTimeout = setTimeout(async () => {
        try {
            let results = [];
            if (window.CardSearchService) {
                const searchService = new window.CardSearchService({ maxResults: 20 });
                results = await searchService.search(searchTerm);
            } else {
                // Fallback to searchAllCards if available
                if (typeof searchAllCards === 'function') {
                    results = await searchAllCards(searchTerm);
                }
            }
            displayCollectionSearchResults(results);
        } catch (error) {
            console.error('Collection search error:', error);
            searchResults.style.display = 'none';
        }
    }, 300);
}

/**
 * Display collection search results
 */
function displayCollectionSearchResults(results) {
    const searchResults = document.getElementById('collectionSearchResults');
    if (!searchResults) return;

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="collection-search-result-item">No cards found</div>';
        searchResults.style.display = 'block';
        return;
    }

    const html = results.map(card => {
        // Escape single quotes in image path and card name for use in HTML attributes
        const escapedImagePath = (card.image || '').replace(/'/g, "\\'");
        const escapedCardName = (card.name || '').replace(/'/g, "\\'");
        const escapedCardIdHover = String(card.id || '').replace(/'/g, "\\'");
        const escapedCardTypeHover = String(card.type || '').replace(/'/g, "\\'");
        // After migration, alternate cards are separate cards, so we use the card's image directly
        const imagePath = card.image || card.image_path || '';
        const imagePathAttr = imagePath ? imagePath.replace(/"/g, '&quot;') : '';
        // Use data attributes instead of inline onclick to avoid escaping issues
        return `
        <div class="collection-search-result-item"
             data-card-id="${card.id}"
             data-card-type="${card.type}"
             data-image-path="${imagePathAttr}"
             onclick="handleCollectionSearchResultClick(this)"
             onmouseenter="showCardHoverModal('${escapedImagePath}', '${escapedCardName}', '${escapedCardIdHover}', '${escapedCardTypeHover}')"
             onmouseleave="hideCardHoverModal()">
            <div class="collection-search-result-name">${card.name}</div>
            <div class="collection-search-result-type">${formatCardType(card.type)}</div>
        </div>
        `;
    }).join('');

    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
}

/**
 * Handle click on collection search result
 */
function handleCollectionSearchResultClick(element) {
    const cardId = element.getAttribute('data-card-id');
    const cardType = element.getAttribute('data-card-type');
    const imagePath = element.getAttribute('data-image-path') || null;
    addCardToCollection(cardId, cardType, imagePath);
}

/**
 * Add card to collection from database view
 * @param {string} cardId - Card UUID
 * @param {string} cardType - Card type (character, special, advanced_universe, etc.)
 * @param {string|null} [imagePath] - Optional image path (helps server avoid lookup)
 */
async function addCardToCollectionFromDatabase(cardId, cardType, imagePath = null) {
    await addCardToCollection(cardId, cardType, imagePath);
}

/**
 * Add card to collection
 * @param {string|null} [imagePath]
 * @param {number} [explicitQuantity] - If set, used as POST quantity (auth) or initial quantity (guest new row). Omit for +1 stepper behavior.
 */
async function addCardToCollection(cardId, cardType, imagePath = null, explicitQuantity = undefined) {
    try {
        const resolvedType = normalizeCollectionCardTypeForApi(cardType);
        // For GUEST users, store in localStorage (key by card_id, card_type, image_path for foil/alt art)
        if (isGuestUser()) {
            const guestCards = loadGuestCollectionFromStorage();
            const existingIndex = guestCards.findIndex(c =>
                c.card_id === cardId &&
                c.card_type === resolvedType &&
                (c.image_path || '') === (imagePath || '')
            );

            if (existingIndex >= 0) {
                if (explicitQuantity !== undefined) {
                    const pq = Math.max(0, Math.floor(Number(explicitQuantity)));
                    if (pq < 1) return;
                    guestCards[existingIndex].quantity = pq;
                } else {
                    guestCards[existingIndex].quantity = (guestCards[existingIndex].quantity || 1) + 1;
                }
            } else {
                const qNew =
                    explicitQuantity !== undefined
                        ? Math.max(0, Math.floor(Number(explicitQuantity)))
                        : 1;
                if (qNew < 1) return;
                guestCards.push({
                    card_id: cardId,
                    card_type: resolvedType,
                    image_path: imagePath || null,
                    quantity: qNew
                });
            }
            
saveGuestCollectionToStorage(guestCards);

            // Clear search
            const searchInput = document.getElementById('collectionSearchInput');
            if (searchInput) searchInput.value = '';
            const searchResults = document.getElementById('collectionSearchResults');
            if (searchResults) searchResults.style.display = 'none';

            await loadCollection();
            databaseViewCollectionMap = null;
            if (typeof refreshDatabaseViewCollectionButtons === 'function') {
                refreshDatabaseViewCollectionButtons();
            }

            if (typeof showNotification === 'function') {
                showNotification('Card added to collection', 'success');
            }
            return;
        }

        // For authenticated users (USER/ADMIN), use API
        const postQty =
            explicitQuantity !== undefined
                ? Math.max(0, Math.floor(Number(explicitQuantity)))
                : 1;
        if (postQty < 1) {
            return;
        }
        const requestBody = {
            cardId: cardId,
            cardType: resolvedType,
            quantity: postQty
        };
        
        // Include imagePath if provided (required for collection cards)
        if (imagePath && imagePath.trim() !== '') {
            requestBody.imagePath = imagePath;
        }
        
        const url = COLLECTION_V1_CARDS_BASE;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
            }
            console.error('Failed to add card to collection:', {
                status: response.status,
                errorData
            });
            if (typeof showNotification === 'function') {
                showNotification(`Failed to add card: ${collectionApiErrorMessage(errorData)}`, 'error');
            } else {
                alert(`Failed to add card: ${collectionApiErrorMessage(errorData)}`);
            }
            return;
        }

        const data = await response.json();
        if (collectionV1IsSuccess(data)) {
            // Clear search
            const searchInput = document.getElementById('collectionSearchInput');
            if (searchInput) {
                searchInput.value = '';
            }
            const searchResults = document.getElementById('collectionSearchResults');
            if (searchResults) {
                searchResults.style.display = 'none';
            }

            // Reload collection and refresh database view -Collection buttons
            await loadCollection();
            databaseViewCollectionMap = null;
            if (typeof refreshDatabaseViewCollectionButtons === 'function') {
                refreshDatabaseViewCollectionButtons();
            }

            if (typeof showNotification === 'function') {
                showNotification('Card added to collection', 'success');
            }
        }
    } catch (error) {
        console.error('Error adding card to collection:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to add card to collection', 'error');
        } else {
            alert('Failed to add card to collection');
        }
    }
}

/**
 * Update card quantity in collection
 */
async function updateCollectionQuantity(cardId, cardType, newQuantity, imagePath) {
    if (newQuantity < 0) {
        console.warn('🟦 [Collection] updateCollectionQuantity called with negative quantity:', newQuantity);
        return;
    }

    if (!imagePath) {
        console.error('🟦 [Collection] updateCollectionQuantity called without imagePath');
        return;
    }

    const resolvedType = normalizeCollectionCardTypeForApi(cardType);

    // For GUEST users, update localStorage (key by card_id, card_type, image_path)
    if (isGuestUser()) {
        const guestCards = loadGuestCollectionFromStorage();
        let existingIndex = guestCards.findIndex(c =>
            c.card_id === cardId &&
            c.card_type === resolvedType &&
            (c.image_path || '') === (imagePath || '')
        );
        if (existingIndex < 0 && resolvedType !== cardType) {
            existingIndex = guestCards.findIndex(c =>
                c.card_id === cardId &&
                c.card_type === cardType &&
                (c.image_path || '') === (imagePath || '')
            );
        }

        if (newQuantity === 0) {
            if (existingIndex >= 0) {
                guestCards.splice(existingIndex, 1);
            }
        } else if (existingIndex >= 0) {
            guestCards[existingIndex].quantity = newQuantity;
            if (guestCards[existingIndex].card_type !== resolvedType) {
                guestCards[existingIndex].card_type = resolvedType;
            }
        } else {
            guestCards.push({
                card_id: cardId,
                card_type: resolvedType,
                image_path: imagePath,
                quantity: newQuantity
            });
        }
        
        saveGuestCollectionToStorage(guestCards);
        await loadCollection();
        return;
    }

    // For authenticated users (USER/ADMIN), use API
    const url = `${COLLECTION_V1_CARDS_BASE}/${encodeURIComponent(cardId)}`;
    const requestBody = {
        quantity: newQuantity,
        cardType: resolvedType,
        imagePath: imagePath
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
            }
            console.error('Failed to update quantity:', {
                status: response.status,
                statusText: response.statusText,
                errorData,
                requestBody
            });
            if (typeof showNotification === 'function') {
                showNotification(`Failed to update quantity: ${collectionApiErrorMessage(errorData)}`, 'error');
            }
            return;
        }

        const data = await response.json();
        if (collectionV1IsSuccess(data)) {
            // Reload collection
            await loadCollection();
        }
    } catch (error) {
        console.error('Error updating collection quantity:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to update quantity', 'error');
        }
    }
}

/**
 * Handle quantity button click (uses DOM context for alternate image)
 */
function handleCollectionQuantityClick(buttonElement, newQuantity) {
    if (!buttonElement) return;
    const row = buttonElement.closest('.collection-card-item');
    if (!row) return;

    const cardId = row.getAttribute('data-card-id');
    const cardType = row.getAttribute('data-card-type');
    const imagePath = row.getAttribute('data-image-path');

    if (!imagePath) {
        console.error('Missing image_path attribute on collection card row');
        return;
    }

    updateCollectionQuantity(cardId, cardType, newQuantity, imagePath);
}

/**
 * Remove one copy of a card variant from collection (database view -Collection button).
 * Respects foil/alternate art via imagePath. No confirmation.
 */
async function removeOneFromCollection(cardId, cardType, imagePath) {
    if (!cardId || !cardType) return;
    const resolvedType = normalizeCollectionCardTypeForApi(cardType);
    const path = (imagePath != null && imagePath !== '') ? String(imagePath).trim() : '';

    // For GUEST users, remove one from localStorage (key by card_id, card_type, image_path)
    if (isGuestUser()) {
        const guestCards = loadGuestCollectionFromStorage();
        let existingIndex = guestCards.findIndex(c =>
            c.card_id === cardId &&
            c.card_type === resolvedType &&
            (c.image_path || '') === path
        );
        if (existingIndex < 0 && resolvedType !== cardType) {
            existingIndex = guestCards.findIndex(c =>
                c.card_id === cardId &&
                c.card_type === cardType &&
                (c.image_path || '') === path
            );
        }

        if (existingIndex >= 0) {
            const entry = guestCards[existingIndex];
            const qty = (entry.quantity || 1) - 1;
            if (qty < 1) {
                guestCards.splice(existingIndex, 1);
            } else {
                entry.quantity = qty;
            }
            saveGuestCollectionToStorage(guestCards);
        }

        databaseViewCollectionMap = null;
        if (typeof refreshDatabaseViewCollectionButtons === 'function') {
            refreshDatabaseViewCollectionButtons();
        }
        if (typeof showNotification === 'function') {
            showNotification('One copy removed from collection', 'success');
        }
        return;
    }

    // For USER/ADMIN, call remove-one API
    try {
        const response = await fetch(`${COLLECTION_V1_CARDS_BASE}/remove-one`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ cardId, cardType: resolvedType, imagePath: path || imagePath })
        });

        const data = await response.json();
        if (!response.ok) {
            if (typeof showNotification === 'function') {
                showNotification(collectionApiErrorMessage(data) || 'Failed to remove one from collection', 'error');
            } else {
                alert(collectionApiErrorMessage(data) || 'Failed to remove one from collection');
            }
            return;
        }

        if (collectionV1IsSuccess(data)) {
            databaseViewCollectionMap = null;
            if (typeof refreshDatabaseViewCollectionButtons === 'function') {
                refreshDatabaseViewCollectionButtons();
            }
        }
        if (typeof showNotification === 'function') {
            showNotification('One copy removed from collection', 'success');
        }
    } catch (error) {
        console.error('Error removing one from collection:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to remove one from collection', 'error');
        } else {
            alert('Failed to remove one from collection');
        }
    }
}

/**
 * Remove card from collection (all copies for this card+type; used from collection view)
 */
async function removeCardFromCollection(cardId, cardType) {
    if (!confirm('Are you sure you want to remove this card from your collection?')) {
        return;
    }

    const resolvedType = normalizeCollectionCardTypeForApi(cardType);

    // For GUEST users, remove from localStorage (all entries for this card+type)
    if (isGuestUser()) {
        const guestCards = loadGuestCollectionFromStorage();
        const filtered = guestCards.filter(c =>
            !(c.card_id === cardId && (c.card_type === resolvedType || c.card_type === cardType))
        );
        saveGuestCollectionToStorage(filtered);

        await loadCollection();

        if (typeof showNotification === 'function') {
            showNotification('Card removed from collection', 'success');
        }
        return;
    }

    // For authenticated users (USER/ADMIN), use API
    try {
        const response = await fetch(`${COLLECTION_V1_CARDS_BASE}/${encodeURIComponent(cardId)}?cardType=${encodeURIComponent(resolvedType)}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (typeof showNotification === 'function') {
                showNotification(`Failed to remove card: ${collectionApiErrorMessage(errorData)}`, 'error');
            } else {
                alert(`Failed to remove card: ${collectionApiErrorMessage(errorData)}`);
            }
            return;
        }

        const data = await response.json();
        if (collectionV1IsSuccess(data)) {
            // Reload collection
            await loadCollection();

            if (typeof showNotification === 'function') {
                showNotification('Card removed from collection', 'success');
            }
        }
    } catch (error) {
        console.error('Error removing card from collection:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to remove card from collection', 'error');
        } else {
            alert('Failed to remove card from collection');
        }
    }
}

/**
 * Initialize sorting for collection table
 */
function initializeCollectionSorting() {
    const sortableHeaders = document.querySelectorAll('.collection-category-table .sortable');
    
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            const table = this.closest('.collection-category-table');
            
            if (!table) return;
            
            // Toggle sort direction
            const currentSort = table.getAttribute('data-sort');
            const currentDir = table.getAttribute('data-sort-dir') || 'asc';
            let newDir = 'asc';
            
            if (currentSort === sortField && currentDir === 'asc') {
                newDir = 'desc';
            }
            
            // Update table attributes
            table.setAttribute('data-sort', sortField);
            table.setAttribute('data-sort-dir', newDir);
            collectionSortField = sortField;
            collectionSortDir = newDir;

            // Update sort indicators
            table.querySelectorAll('.sort-indicator').forEach(indicator => {
                indicator.textContent = '';
            });
            
            const indicator = this.querySelector('.sort-indicator');
            if (indicator) {
                indicator.textContent = newDir === 'asc' ? ' ▲' : ' ▼';
            }
            
            // Sort the table rows
            sortCollectionTable(table, sortField, newDir);
        });
        
        // Add hover effect
        header.style.cursor = 'pointer';
    });
}

/**
 * Sort collection table rows.
 * The set_number column uses a compound sort: set name first (ERB < SKY alphabetically),
 * then set_number numerically within each set.
 */
function sortCollectionTable(table, sortField, direction) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr.collection-card-item'));
    
    rows.sort((a, b) => {
        switch (sortField) {
            case 'quantity': {
                const av = parseInt(a.getAttribute('data-quantity') || '0');
                const bv = parseInt(b.getAttribute('data-quantity') || '0');
                return direction === 'asc' ? av - bv : bv - av;
            }
            case 'set_number': {
                // Primary: set code (ERB, ERBP, SKY, …) — not translated display name (avoids splitting same-line cards)
                const aCode = (a.getAttribute('data-card-set-code') || 'ERB').toUpperCase();
                const bCode = (b.getAttribute('data-card-set-code') || 'ERB').toUpperCase();
                if (aCode !== bCode) {
                    return direction === 'asc'
                        ? aCode < bCode ? -1 : aCode > bCode ? 1 : 0
                        : aCode < bCode ? 1 : aCode > bCode ? -1 : 0;
                }
                // Secondary: foil cards always sort after non-foil (regardless of sort direction)
                const aFoil = a.getAttribute('data-is-foil') === 'true';
                const bFoil = b.getAttribute('data-is-foil') === 'true';
                if (aFoil !== bFoil) return aFoil ? 1 : -1;
                // Tertiary: set_number numerically (data-set-number is pre-normalized; NaN-safe)
                const av = parseInt(a.getAttribute('data-set-number') || '999999', 10);
                const bv = parseInt(b.getAttribute('data-set-number') || '999999', 10);
                const aNum = Number.isFinite(av) ? av : 999999;
                const bNum = Number.isFinite(bv) ? bv : 999999;
                return direction === 'asc' ? aNum - bNum : bNum - aNum;
            }
            case 'name': {
                const av = (a.getAttribute('data-card-name') || '').toLowerCase();
                const bv = (b.getAttribute('data-card-name') || '').toLowerCase();
                if (av < bv) return direction === 'asc' ? -1 : 1;
                if (av > bv) return direction === 'asc' ? 1 : -1;
                return 0;
            }
            case 'set': {
                const av = (a.getAttribute('data-card-set-code') || 'ERB').toLowerCase();
                const bv = (b.getAttribute('data-card-set-code') || 'ERB').toLowerCase();
                if (av < bv) return direction === 'asc' ? -1 : 1;
                if (av > bv) return direction === 'asc' ? 1 : -1;
                return 0;
            }
            case 'type': {
                const av = (a.querySelector('.collection-card-type')?.textContent || '').toLowerCase();
                const bv = (b.querySelector('.collection-card-type')?.textContent || '').toLowerCase();
                if (av < bv) return direction === 'asc' ? -1 : 1;
                if (av > bv) return direction === 'asc' ? 1 : -1;
                return 0;
            }
            default:
                return 0;
        }
    });
    
    // Clear tbody and re-append sorted rows
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

/**
 * Initialize column resizing for collection tables
 */
function initializeCollectionResizing() {
    const tables = document.querySelectorAll('.collection-category-table');
    
    tables.forEach(table => {
        const resizeHandles = table.querySelectorAll('.resize-handle');
        
        resizeHandles.forEach((handle) => {
            let isResizing = false;
            let startX = 0;
            let startWidth = 0;
            let th = handle.parentElement;
            
            handle.addEventListener('mousedown', function(e) {
                isResizing = true;
                startX = e.pageX;
                startWidth = th.offsetWidth;
                
                th.classList.add('resizing');
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                
                e.preventDefault();
                e.stopPropagation();
            });
            
            function handleMouseMove(e) {
                if (!isResizing) return;
                
                const diff = e.pageX - startX;
                let newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
                
                // Get all column headers to calculate total width
                const allHeaders = Array.from(th.parentElement.children);
                const columnIndex = allHeaders.indexOf(th);
                
                // Apply max-width constraint if it exists on the column
                const maxWidth = window.getComputedStyle(th).maxWidth;
                if (maxWidth && maxWidth !== 'none') {
                    const maxWidthPx = parseFloat(maxWidth);
                    if (!isNaN(maxWidthPx)) {
                        newWidth = Math.min(newWidth, maxWidthPx);
                    }
                }
                
                // Calculate current total width of all columns
                let totalWidth = 0;
                allHeaders.forEach((header, idx) => {
                    if (idx === columnIndex) {
                        totalWidth += newWidth;
                    } else {
                        // Get the actual width, preferring style.width over offsetWidth
                        const styleWidth = header.style.width;
                        if (styleWidth) {
                            totalWidth += parseFloat(styleWidth);
                        } else {
                            totalWidth += header.offsetWidth;
                        }
                    }
                });
                
                // Get table's available width
                const tableWidth = table.offsetWidth;
                
                // If total width exceeds table width, constrain the new width
                if (totalWidth > tableWidth) {
                    // Calculate how much we need to reduce
                    const excess = totalWidth - tableWidth;
                    newWidth = Math.max(50, newWidth - excess);
                    
                    // Re-apply max-width after constraint
                    if (maxWidth && maxWidth !== 'none') {
                        const maxWidthPx = parseFloat(maxWidth);
                        if (!isNaN(maxWidthPx)) {
                            newWidth = Math.min(newWidth, maxWidthPx);
                        }
                    }
                }
                
                th.style.width = newWidth + 'px';
                th.style.minWidth = newWidth + 'px';
                th.style.maxWidth = newWidth + 'px'; // Prevent expansion beyond calculated width
                
                // Update all cells in this column
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const cell = row.children[columnIndex];
                    if (cell) {
                        cell.style.width = newWidth + 'px';
                        cell.style.minWidth = newWidth + 'px';
                        cell.style.maxWidth = newWidth + 'px';
                    }
                });
            }
            
            function handleMouseUp() {
                if (!isResizing) return;
                
                isResizing = false;
                th.classList.remove('resizing');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                
                // Save column widths to localStorage
                saveColumnWidths(table);
            }
        });
    });
}

/**
 * Save column widths to localStorage
 */
function saveColumnWidths(table) {
    const headers = table.querySelectorAll('thead th');
    const widths = {};
    
    headers.forEach((th) => {
        const className = th.className.match(/collection-col-\w+/)?.[0];
        if (className) {
            widths[className] = th.offsetWidth;
        }
    });
    
    localStorage.setItem('collection-column-widths', JSON.stringify(widths));
}

/**
 * Load column widths from localStorage
 */
function loadColumnWidths(table) {
    const savedWidths = localStorage.getItem('collection-column-widths');
    
    if (!savedWidths) return;
    
    try {
        const widths = JSON.parse(savedWidths);
        const headers = table.querySelectorAll('thead th');
        
        headers.forEach((th) => {
            const className = th.className.match(/collection-col-\w+/)?.[0];
            if (className && widths[className]) {
                const width = widths[className];
                th.style.width = width + 'px';
                th.style.minWidth = width + 'px';
                
                // Update all cells in this column
                const columnIndex = Array.from(th.parentElement.children).indexOf(th);
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const cell = row.children[columnIndex];
                    if (cell) {
                        cell.style.width = width + 'px';
                        cell.style.minWidth = width + 'px';
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error loading column widths:', error);
    }
}

/**
 * Toggle visibility of unowned (not-in-collection) cards.
 * Re-renders from the cached merged data so no API call is needed.
 */
function toggleUnownedCards() {
    const checkbox = document.getElementById('showUnownedToggle');
    showUnownedCards = checkbox ? checkbox.checked : !showUnownedCards;
    displayCollectionCards(mergedCollectionData);
}

/**
 * Initialize collection view
 */
function initializeCollectionView() {
    initializeCollectionSearch();
    const cv = document.getElementById('collection-view');
    if (cv && !cv.dataset.collectionMobileDelegateBound) {
        cv.dataset.collectionMobileDelegateBound = '1';
        cv.addEventListener('click', onCollectionViewMobileActivate);
    }
    if (!collectionLayoutModeListenerBound) {
        collectionLayoutModeListenerBound = true;
        window.addEventListener('layout-mode-change', onCollectionLayoutModeChange);
    }
    ensureCollectionMobileDetailPanel();
    loadCollection();
}

// Expose functions globally for inline HTML usage
window.translateSet = translateSet;
window.translateUniverse = translateSet; // Backward compatibility alias
window.ensureCollectionSetNamesLoaded = ensureCollectionSetNamesLoaded;
window.formatCardType = formatCardType;
window.loadCollection = loadCollection;
window.displayCollectionCards = displayCollectionCards;
window.initializeCollectionSearch = initializeCollectionSearch;
window.addCardToCollection = addCardToCollection;
window.updateCollectionQuantity = updateCollectionQuantity;
window.handleCollectionQuantityClick = handleCollectionQuantityClick;
window.removeCardFromCollection = removeCardFromCollection;
window.removeOneFromCollection = removeOneFromCollection;
window.getDatabaseViewCollectionQuantity = getDatabaseViewCollectionQuantity;
window.refreshDatabaseViewCollectionButtons = refreshDatabaseViewCollectionButtons;
window.initializeCollectionView = initializeCollectionView;
window.addCardToCollectionFromDatabase = addCardToCollectionFromDatabase;
window.handleCollectionSearchResultClick = handleCollectionSearchResultClick;
window.toggleUnownedCards = toggleUnownedCards;
window.handleCollectionMobileDetailQuantityClick = handleCollectionMobileDetailQuantityClick;
window.handleCollectionQuantitySetClick = handleCollectionQuantitySetClick;
window.handleCollectionMobileDetailQuantitySetClick = handleCollectionMobileDetailQuantitySetClick;
window.sortMergedCollectionCards = sortMergedCollectionCards;
window.closeCollectionMobileDetail = closeCollectionMobileDetail;
window.openCollectionMobileDetail = openCollectionMobileDetail;

