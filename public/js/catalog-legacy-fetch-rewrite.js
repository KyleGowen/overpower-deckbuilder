/**
 * Rewrite removed legacy catalog list URLs to /api/v1/catalog/* before any deferred scripts run.
 * Loaded synchronously from index.html <head> (no defer) so fetch() is patched early.
 * @see API_V1.md — legacy GET /api/characters, /locations, /special-cards, /missions removed
 */
(function () {
    'use strict';

    var nativeFetch = window.fetch.bind(window);

    function rewriteLegacyCatalogListFetchInput(input) {
        if (typeof input === 'string') {
            try {
                var u = new URL(input, window.location.origin);
                if (u.pathname === '/api/characters') {
                    u.pathname = '/api/v1/catalog/characters';
                    return input.indexOf('http') === 0 ? u.href : u.pathname + u.search + u.hash;
                }
                if (u.pathname === '/api/locations') {
                    u.pathname = '/api/v1/catalog/locations';
                    return input.indexOf('http') === 0 ? u.href : u.pathname + u.search + u.hash;
                }
                if (u.pathname === '/api/special-cards') {
                    u.pathname = '/api/v1/catalog/special-cards';
                    return input.indexOf('http') === 0 ? u.href : u.pathname + u.search + u.hash;
                }
                if (u.pathname === '/api/missions') {
                    u.pathname = '/api/v1/catalog/missions';
                    return input.indexOf('http') === 0 ? u.href : u.pathname + u.search + u.hash;
                }
            } catch (_e) { /* keep original */ }
            return input;
        }
        if (input instanceof Request) {
            try {
                var ru = new URL(input.url);
                if (ru.pathname === '/api/characters') {
                    ru.pathname = '/api/v1/catalog/characters';
                    return new Request(ru.toString(), input);
                }
                if (ru.pathname === '/api/locations') {
                    ru.pathname = '/api/v1/catalog/locations';
                    return new Request(ru.toString(), input);
                }
                if (ru.pathname === '/api/special-cards') {
                    ru.pathname = '/api/v1/catalog/special-cards';
                    return new Request(ru.toString(), input);
                }
                if (ru.pathname === '/api/missions') {
                    ru.pathname = '/api/v1/catalog/missions';
                    return new Request(ru.toString(), input);
                }
            } catch (_e2) { /* keep original */ }
        }
        return input;
    }

    window.fetch = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args[0] !== undefined && args[0] !== null) {
            args[0] = rewriteLegacyCatalogListFetchInput(args[0]);
        }
        return nativeFetch.apply(window, args);
    };
})();
