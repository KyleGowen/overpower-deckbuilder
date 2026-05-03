/**
 * Shared orchestration after POST /api/v1/(guest/)decks/:id/cards succeeds:
 * apply v1 deck payload from JSON or fall back to loadDeckForEditing.
 * Uses globalThis so the same file runs in browser (with globals from other scripts) and in Jest.
 */
(function deckEditorPostCardsSyncIife() {
    'use strict';

    /**
     * @param {Response} response
     * @returns {Promise<{ ok: boolean, message?: string }>}
     */
    async function syncDeckEditorAfterSuccessfulCardsPostResponse(response) {
        let json = {};
        try {
            json = await response.json();
        } catch (_e) {
            json = {};
        }
        const v1Ok =
            typeof globalThis.v1ResponseOk === 'function' ? globalThis.v1ResponseOk : null;
        const apply =
            typeof globalThis.applyDeckSnapshotToEditor === 'function'
                ? globalThis.applyDeckSnapshotToEditor
                : null;
        const reload =
            typeof globalThis.loadDeckForEditing === 'function'
                ? globalThis.loadDeckForEditing
                : null;

        if (v1Ok && v1Ok(response, json) && json.data && json.data.metadata && apply) {
            const applied = await apply(json.data);
            if (applied) {
                return { ok: true };
            }
        }
        if (reload) {
            const deckId =
                typeof globalThis.currentDeckId !== 'undefined' ? globalThis.currentDeckId : '';
            const re = await reload(deckId);
            if (re && re.ok) {
                return { ok: true };
            }
            return { ok: false, message: (re && re.message) || 'Failed to reload deck' };
        }
        return { ok: false, message: 'Failed to reload deck' };
    }

    /**
     * @param {{ metadata: Record<string, unknown>, cards?: unknown[] } | null | undefined} deckData
     * @returns {Promise<{ ok: boolean, message?: string }>}
     */
    async function syncDeckEditorFromV1DeckDataOrReload(deckData) {
        const apply =
            typeof globalThis.applyDeckSnapshotToEditor === 'function'
                ? globalThis.applyDeckSnapshotToEditor
                : null;
        const reload =
            typeof globalThis.loadDeckForEditing === 'function'
                ? globalThis.loadDeckForEditing
                : null;

        if (deckData && deckData.metadata && apply) {
            const applied = await apply(deckData);
            if (applied) {
                return { ok: true };
            }
        }
        if (reload) {
            const deckId =
                typeof globalThis.currentDeckId !== 'undefined' ? globalThis.currentDeckId : '';
            const re = await reload(deckId);
            if (re && re.ok) {
                return { ok: true };
            }
            return { ok: false, message: (re && re.message) || 'Failed to reload deck' };
        }
        return { ok: false, message: 'Failed to reload deck' };
    }

    globalThis.syncDeckEditorAfterSuccessfulCardsPostResponse =
        syncDeckEditorAfterSuccessfulCardsPostResponse;
    globalThis.syncDeckEditorFromV1DeckDataOrReload = syncDeckEditorFromV1DeckDataOrReload;
})();
