/**
 * DBV layout / viewport context (composes layout-mode.js).
 * Must load after /js/layout-mode.js and before dbv-render-shared.js + card-display.js.
 */
(function () {
    if (typeof window === 'undefined') {
        return;
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

    window.isLayoutMobileForCardDisplay = isLayoutMobileForCardDisplay;
    window.isNarrowViewportDbvBand = isNarrowViewportDbvBand;
})();
