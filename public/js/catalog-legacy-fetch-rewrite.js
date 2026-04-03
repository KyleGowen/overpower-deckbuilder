/**
 * Rewrite removed legacy catalog list URLs to /api/v1/catalog/* before any deferred scripts run.
 * Loaded synchronously from index.html <head> (no defer) so fetch() is patched early.
 * @see API_V1.md — legacy GET /api/characters, /locations, /special-cards, /missions, /events, /aspects, /advanced-universe removed
 */
(function () {
    'use strict';

    var nativeFetch = window.fetch.bind(window);

    /** @type {Record<string, string>} */
    var LEGACY_TO_V1 = {
        '/api/characters': '/api/v1/catalog/characters',
        '/api/locations': '/api/v1/catalog/locations',
        '/api/special-cards': '/api/v1/catalog/special-cards',
        '/api/missions': '/api/v1/catalog/missions',
        '/api/events': '/api/v1/catalog/events',
        '/api/aspects': '/api/v1/catalog/aspects',
        '/api/advanced-universe': '/api/v1/catalog/advanced-universe'
    };

    function canonicalPathname(pathname) {
        if (!pathname || pathname === '/') {
            return pathname;
        }
        return pathname.length > 1 && pathname.slice(-1) === '/' ? pathname.slice(0, -1) : pathname;
    }

    function lookupV1CatalogPath(pathname) {
        return LEGACY_TO_V1[canonicalPathname(pathname)] || null;
    }

    function rewriteLegacyCatalogListFetchInput(input) {
        if (typeof URL !== 'undefined' && input instanceof URL) {
            try {
                var v1u = lookupV1CatalogPath(input.pathname);
                if (!v1u) {
                    return input;
                }
                var uCopy = new URL(input.href);
                uCopy.pathname = v1u;
                return uCopy;
            } catch (_e0) {
                return input;
            }
        }
        if (typeof input === 'string') {
            try {
                var u = new URL(input, window.location.origin);
                var v1 = lookupV1CatalogPath(u.pathname);
                if (!v1) {
                    return input;
                }
                u.pathname = v1;
                return input.indexOf('http') === 0 ? u.href : u.pathname + u.search + u.hash;
            } catch (_e) { /* keep original */ }
            return input;
        }
        if (input instanceof Request) {
            try {
                var ru = new URL(input.url);
                var v1r = lookupV1CatalogPath(ru.pathname);
                if (!v1r) {
                    return input;
                }
                ru.pathname = v1r;
                return new Request(ru.toString(), input);
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
