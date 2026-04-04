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

    /**
     * Single deck GET/PUT v1 payload (`data` = `{ metadata, cards }`).
     * @param {Response} response
     * @param {any} json
     * @returns {{ ok: boolean, deck: any | null }}
     */
    function deckDetailPayload(response, json) {
        if (!response || !response.ok || !json) {
            return { ok: false, deck: null };
        }
        if (json.success === false) {
            return { ok: false, deck: null };
        }
        if (json.errors && json.errors.length > 0) {
            return { ok: false, deck: null };
        }
        var d = json.data;
        if (!d || typeof d !== 'object' || !d.metadata) {
            return { ok: false, deck: null };
        }
        return { ok: true, deck: d };
    }

    /**
     * True when v1 envelope has no errors (and optional legacy success).
     * @param {Response} response
     * @param {any} json
     */
    function v1ResponseOk(response, json) {
        if (!response || !response.ok || !json) {
            return false;
        }
        if (json.success === false) {
            return false;
        }
        if (json.errors && json.errors.length > 0) {
            return false;
        }
        return true;
    }

    window.catalogListPayload = catalogListPayload;
    window.fetchCatalogList = fetchCatalogList;
    window.deckListPayload = deckListPayload;
    window.fetchDeckList = fetchDeckList;
    window.deckDetailPayload = deckDetailPayload;
    window.v1ResponseOk = v1ResponseOk;
})();
