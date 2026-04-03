/**
 * Normalize v1 GET responses: DBV catalog and deck list.
 * - Catalog: legacy `{ success, data }` or v1 `{ data, meta, errors }` via `catalogListPayload` / `fetchCatalogList`.
 * - Deck list: v1 `{ data, meta, errors }` via `deckListPayload` / `fetchDeckList` (`GET /api/v1/decks`).
 * Load before scripts that call migrated `/api/v1/catalog/*` or `/api/v1/decks`.
 */
(function () {
    'use strict';

    /**
     * @param {Response} response
     * @param {any} json
     * @returns {{ ok: boolean, rows: any[] }}
     */
    function catalogListPayload(response, json) {
        if (!response || !response.ok || !json) {
            return { ok: false, rows: [] };
        }
        if (json.success === false) {
            return { ok: false, rows: [] };
        }
        if (json.errors && json.errors.length > 0) {
            return { ok: false, rows: [] };
        }
        if (!Array.isArray(json.data)) {
            return { ok: false, rows: [] };
        }
        return { ok: true, rows: json.data };
    }

    /**
     * @param {string} url
     * @returns {Promise<{ ok: boolean, rows: any[] }>}
     */
    async function fetchCatalogList(url) {
        try {
            const response = await fetch(url);
            const json = await response.json();
            return catalogListPayload(response, json);
        } catch {
            return { ok: false, rows: [] };
        }
    }

    /**
     * @param {Response} response
     * @param {any} json
     * @returns {{ ok: boolean, decks: any[] }}
     */
    function deckListPayload(response, json) {
        if (!response || !response.ok || !json) {
            return { ok: false, decks: [] };
        }
        if (json.errors && json.errors.length > 0) {
            return { ok: false, decks: [] };
        }
        if (!Array.isArray(json.data)) {
            return { ok: false, decks: [] };
        }
        return { ok: true, decks: json.data };
    }

    /**
     * @param {string} url
     * @param {RequestInit} [init]
     * @returns {Promise<{ ok: boolean, decks: any[] }>}
     */
    async function fetchDeckList(url, init) {
        try {
            const response = await fetch(url, init);
            const json = await response.json();
            return deckListPayload(response, json);
        } catch {
            return { ok: false, decks: [] };
        }
    }

    window.catalogListPayload = catalogListPayload;
    window.fetchCatalogList = fetchCatalogList;
    window.deckListPayload = deckListPayload;
    window.fetchDeckList = fetchDeckList;
})();
