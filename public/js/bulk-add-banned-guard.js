/**
 * Shared guard for deck editor bulk "Add All" flows.
 * Mirrors BannedCardsRule / client Rule 1.5: strict `banned === true` only.
 *
 * @param {string} cardId
 * @param {string} deckEditorType - e.g. mission, power, special, character, advanced-universe
 * @param {Record<string, unknown>|null|undefined} catalogRowOptional - row from API or embedded JSON when present
 * @returns {boolean}
 */
function isCatalogCardBannedForBulkAdd(cardId, deckEditorType, catalogRowOptional) {
    if (catalogRowOptional && catalogRowOptional.banned === true) {
        return true;
    }
    const normId = String(cardId ?? '').trim();
    if (!normId) {
        return false;
    }
    const map = typeof window !== 'undefined' ? window.availableCardsMap : null;
    if (!map || typeof map.get !== 'function') {
        return false;
    }

    /** @param {unknown} row */
    const rowBanned = (row) => !!(row && typeof row === 'object' && row.banned === true);

    const type = String(deckEditorType || '').trim();
    const candidates = [];
    candidates.push(normId);
    if (type) {
        candidates.push(`${type}_${normId}`);
        if (type.includes('_')) {
            candidates.push(`${type.replace(/_/g, '-')}_${normId}`);
        }
    }

    for (let i = 0; i < candidates.length; i++) {
        const row = map.get(candidates[i]);
        if (rowBanned(row)) {
            return true;
        }
    }
    return false;
}

if (typeof window !== 'undefined') {
    window.isCatalogCardBannedForBulkAdd = isCatalogCardBannedForBulkAdd;
}
