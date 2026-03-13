// Deck selection module entrypoint
// Provides a stable `window.DeckSelection` API and preserves existing globals.

(function initDeckSelectionIndex() {
    window.DeckSelection = window.DeckSelection || {};

    const SKELETON_DEFAULT_COUNT = 3;
    const SKELETON_MIN_COUNT = 1;

    function getSkeletonCount() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (user && user.id) {
                const stored = parseInt(localStorage.getItem('deck_count_' + user.id) || '0', 10);
                if (stored > 0) return stored;
            }
        } catch (_) { /* ignore parse errors */ }
        return SKELETON_DEFAULT_COUNT;
    }

    function saveSkeletonCount(decks) {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (user && user.id && Array.isArray(decks)) {
                localStorage.setItem('deck_count_' + user.id, String(Math.max(decks.length, SKELETON_MIN_COUNT)));
            }
        } catch (_) { /* ignore storage errors */ }
    }

    function showSkeletonTiles(count) {
        const deckList = document.getElementById('deck-list');
        if (!deckList) return;
        const safeCount = Math.max(count, SKELETON_MIN_COUNT);
        deckList.innerHTML = Array.from({ length: safeCount }, () =>
            '<div class="deck-card deck-tile deck-tile--compact deck-tile--skeleton" aria-hidden="true">' +
                '<div class="deck-tile-skeleton-main">' +
                    '<div class="deck-tile-skeleton-title"></div>' +
                    '<div class="deck-tile-skeleton-chars"></div>' +
                    '<div class="deck-tile-skeleton-meta"></div>' +
                '</div>' +
                '<div class="deck-tile-skeleton-side"></div>' +
            '</div>'
        ).join('');
    }

    window.DeckSelection.loadDecks = async function loadDecks() {
        try {
            if (typeof loadAvailableCardsData === 'function') {
                loadAvailableCardsData().catch(() => {});
            }

            showSkeletonTiles(getSkeletonCount());

            const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            const isGuest = currentUser && currentUser.role === 'GUEST';
            const url = isGuest ? '/api/guest/decks' : '/api/decks';
            const response = await fetch(url, { credentials: 'include' });
            const data = await response.json();
            if (data.success) {
                saveSkeletonCount(data.data);
                if (typeof setUserDecks === 'function') {
                    setUserDecks(data.data);
                }
                await window.DeckSelection.displayDecks(data.data);
                updateDeckStats();
            }
        } catch (error) {
            console.error('Error loading decks:', error);
            document.getElementById('deck-list').innerHTML = '<div class="error">Failed to load decks</div>';
        }
    };

    window.DeckSelection.init = function init() {
        // Reserved for future deck-selection init hooks.
        // (Menu listeners are installed by deckTileMenu.js at script load.)
    };

    // Preserve existing globals used by other scripts and inline handlers
    window.loadDecks = window.DeckSelection.loadDecks;
    window.displayDecks = window.DeckSelection.displayDecks;
    window.toggleDeckTileMenu = window.DeckSelection.toggleDeckTileMenu;
    window.closeAllDeckTileMenus = window.DeckSelection.closeAllDeckTileMenus;
})();

