/**
 * Locations DBV: threat min/max placeholders — short on desktop, explicit on layout-mobile.
 * Depends on layout-mode.js (window.isLayoutMobile). Listens for layout-mode-change.
 */
(function locationThreatPlaceholdersInit() {
    'use strict';

    function syncLocationThreatFilterPlaceholders() {
        var minEl = document.getElementById('location-threat-min');
        var maxEl = document.getElementById('location-threat-max');
        if (!minEl || !maxEl) {
            return;
        }
        var mobile = typeof window.isLayoutMobile === 'function' && window.isLayoutMobile();
        if (mobile) {
            minEl.placeholder = 'Min Threat Value';
            maxEl.placeholder = 'Max Threat Value';
        } else {
            minEl.placeholder = 'Min';
            maxEl.placeholder = 'Max';
        }
    }

    window.syncLocationThreatFilterPlaceholders = syncLocationThreatFilterPlaceholders;

    if (typeof document === 'undefined') {
        return;
    }
    if (document.documentElement.dataset.locationThreatPlaceholderInit === '1') {
        return;
    }
    document.documentElement.dataset.locationThreatPlaceholderInit = '1';
    window.addEventListener('layout-mode-change', syncLocationThreatFilterPlaceholders);
    syncLocationThreatFilterPlaceholders();
})();
