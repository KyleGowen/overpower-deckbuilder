// Deck tile lazy loader - defers background-image loading until elements are near viewport
// Uses Intersection Observer to set background-image from data-image-url when visible

(function initDeckTileLazyLoader() {
    let observer = null;

    function loadBackgroundImage(el) {
        const url = el.getAttribute('data-image-url');
        if (url && !el.style.backgroundImage) {
            el.style.backgroundImage = `url('${url.replace(/'/g, "\\'")}')`;
            el.removeAttribute('data-image-url');
        }
    }

    function createObserver() {
        if (observer) return observer;
        if (typeof IntersectionObserver === 'undefined') return null;
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadBackgroundImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '100px', threshold: 0.01 }
        );
        return observer;
    }

    function observeDeckTiles(container) {
        if (!container) return;
        const lazyEls = container.querySelectorAll('.deck-tile-lazy-bg[data-image-url]');
        if (typeof IntersectionObserver === 'undefined') {
            lazyEls.forEach((el) => loadBackgroundImage(el));
            return;
        }
        const obs = createObserver();
        lazyEls.forEach((el) => obs.observe(el));
    }

    window.DeckSelection = window.DeckSelection || {};
    window.DeckSelection.observeDeckTileImages = observeDeckTiles;
})();
