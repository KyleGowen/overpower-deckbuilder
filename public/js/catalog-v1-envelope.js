/**
 * Normalize DBV catalog GET responses: legacy `{ success, data }` or v1 `{ data, meta, errors }`.
 * Load before scripts that call migrated `/api/v1/catalog/*` routes.
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

    window.catalogListPayload = catalogListPayload;
    window.fetchCatalogList = fetchCatalogList;
})();
