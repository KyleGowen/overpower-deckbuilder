// Deck tile click entry point: keeps a single `onclick="handleDeckTileClick(...)"` on tiles
// so mobile and desktop stay aligned. Both open the deck editor (same as DTV).

(function initDeckTileMobileInteraction() {
    window.handleDeckTileClick = function handleDeckTileClick(_event, deckId) {
        editDeck(deckId);
    };
})();
