/**
 * Tests for public/js/deck-editor-post-cards-sync.js (deck refresh after POST .../cards).
 */
import path from 'path';

describe('deck-editor-post-cards-sync', () => {
  function loadSyncScript(): void {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(path.join(__dirname, '../../public/js/deck-editor-post-cards-sync.js'));
  }

  beforeEach(() => {
    delete (globalThis as any).v1ResponseOk;
    delete (globalThis as any).applyDeckSnapshotToEditor;
    delete (globalThis as any).loadDeckForEditing;
    delete (globalThis as any).currentDeckId;
    delete (globalThis as any).syncDeckEditorAfterSuccessfulCardsPostResponse;
    delete (globalThis as any).syncDeckEditorFromV1DeckDataOrReload;
  });

  describe('syncDeckEditorAfterSuccessfulCardsPostResponse', () => {
    it('returns ok when v1 envelope passes and apply succeeds without reload', async () => {
      (globalThis as any).currentDeckId = 'deck-a';
      (globalThis as any).v1ResponseOk = jest.fn(() => true);
      (globalThis as any).applyDeckSnapshotToEditor = jest.fn(async () => true);
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: false }));
      loadSyncScript();

      const jsonBody = {
        data: { metadata: { id: 'deck-a', name: 'T' }, cards: [{ type: 'character', cardId: 'c1', quantity: 1 }] },
        success: true,
        errors: []
      };
      const response = {
        ok: true,
        json: async () => jsonBody
      };

      const result = await (globalThis as any).syncDeckEditorAfterSuccessfulCardsPostResponse(response);
      expect(result).toEqual({ ok: true });
      expect((globalThis as any).applyDeckSnapshotToEditor).toHaveBeenCalledWith(jsonBody.data);
      expect((globalThis as any).loadDeckForEditing).not.toHaveBeenCalled();
    });

    it('falls back to loadDeckForEditing when apply returns false', async () => {
      (globalThis as any).currentDeckId = 'deck-b';
      (globalThis as any).v1ResponseOk = jest.fn(() => true);
      (globalThis as any).applyDeckSnapshotToEditor = jest.fn(async () => false);
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: true }));
      loadSyncScript();

      const response = {
        ok: true,
        json: async () => ({
          data: { metadata: { id: 'deck-b' }, cards: [] },
          success: true,
          errors: []
        })
      };

      const result = await (globalThis as any).syncDeckEditorAfterSuccessfulCardsPostResponse(response);
      expect(result).toEqual({ ok: true });
      expect((globalThis as any).loadDeckForEditing).toHaveBeenCalledWith('deck-b');
    });

    it('returns ok false when envelope invalid and reload fails', async () => {
      (globalThis as any).currentDeckId = 'deck-c';
      (globalThis as any).v1ResponseOk = jest.fn(() => false);
      (globalThis as any).applyDeckSnapshotToEditor = jest.fn(async () => true);
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({
        ok: false,
        message: 'gone'
      }));
      loadSyncScript();

      const response = {
        ok: true,
        json: async () => ({ data: null })
      };

      const result = await (globalThis as any).syncDeckEditorAfterSuccessfulCardsPostResponse(response);
      expect(result.ok).toBe(false);
      expect(result.message).toBe('gone');
    });

    it('falls back to reload when response JSON parse fails', async () => {
      (globalThis as any).currentDeckId = 'deck-d';
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: true }));
      loadSyncScript();

      const response = {
        ok: true,
        json: async () => {
          throw new Error('bad json');
        }
      };

      const result = await (globalThis as any).syncDeckEditorAfterSuccessfulCardsPostResponse(response);
      expect(result).toEqual({ ok: true });
      expect((globalThis as any).loadDeckForEditing).toHaveBeenCalledWith('deck-d');
    });

    it('returns failed reload default message when reload yields ok false without message', async () => {
      (globalThis as any).currentDeckId = 'deck-h';
      (globalThis as any).v1ResponseOk = jest.fn(() => false);
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: false }));
      loadSyncScript();

      const response = {
        ok: true,
        json: async () => ({ data: { metadata: { id: 'x' } }, errors: [] })
      };

      const result = await (globalThis as any).syncDeckEditorAfterSuccessfulCardsPostResponse(response);
      expect(result).toEqual({ ok: false, message: 'Failed to reload deck' });
    });

    it('returns Failed to reload deck when apply path fails and loadDeckForEditing is absent', async () => {
      (globalThis as any).currentDeckId = 'deck-i';
      (globalThis as any).v1ResponseOk = jest.fn(() => false);
      loadSyncScript();

      const response = {
        ok: true,
        json: async () => ({ data: { metadata: { id: 'deck-i' } }, cards: [] })
      };

      const result = await (globalThis as any).syncDeckEditorAfterSuccessfulCardsPostResponse(response);
      expect(result).toEqual({ ok: false, message: 'Failed to reload deck' });
    });

    it('calls reload with empty string when currentDeckId is undefined', async () => {
      (globalThis as any).v1ResponseOk = jest.fn(() => false);
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: true }));
      loadSyncScript();

      const response = {
        ok: true,
        json: async () => ({ data: null })
      };

      const result = await (globalThis as any).syncDeckEditorAfterSuccessfulCardsPostResponse(response);
      expect(result).toEqual({ ok: true });
      expect((globalThis as any).loadDeckForEditing).toHaveBeenCalledWith('');
    });
  });

  describe('syncDeckEditorFromV1DeckDataOrReload', () => {
    it('returns ok when apply succeeds', async () => {
      (globalThis as any).currentDeckId = 'deck-e';
      (globalThis as any).applyDeckSnapshotToEditor = jest.fn(async () => true);
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: false }));
      loadSyncScript();

      const deckData = { metadata: { id: 'deck-e' }, cards: [] };
      const result = await (globalThis as any).syncDeckEditorFromV1DeckDataOrReload(deckData);
      expect(result).toEqual({ ok: true });
      expect((globalThis as any).loadDeckForEditing).not.toHaveBeenCalled();
    });

    it('reloads when deckData is null', async () => {
      (globalThis as any).currentDeckId = 'deck-f';
      (globalThis as any).applyDeckSnapshotToEditor = jest.fn(async () => true);
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: true }));
      loadSyncScript();

      const result = await (globalThis as any).syncDeckEditorFromV1DeckDataOrReload(null);
      expect(result).toEqual({ ok: true });
      expect((globalThis as any).loadDeckForEditing).toHaveBeenCalledWith('deck-f');
    });

    it('reloads after apply returns false', async () => {
      (globalThis as any).currentDeckId = 'deck-g';
      (globalThis as any).applyDeckSnapshotToEditor = jest.fn(async () => false);
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: true }));
      loadSyncScript();

      const result = await (globalThis as any).syncDeckEditorFromV1DeckDataOrReload({
        metadata: { id: 'deck-g' },
        cards: []
      });
      expect(result).toEqual({ ok: true });
      expect((globalThis as any).loadDeckForEditing).toHaveBeenCalledWith('deck-g');
    });

    it('returns reload error message when reload fails after null deckData', async () => {
      (globalThis as any).currentDeckId = 'deck-j';
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({
        ok: false,
        message: 'network'
      }));
      loadSyncScript();

      const result = await (globalThis as any).syncDeckEditorFromV1DeckDataOrReload(null);
      expect(result).toEqual({ ok: false, message: 'network' });
    });

    it('returns default message when reload fails without message', async () => {
      (globalThis as any).currentDeckId = 'deck-k';
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: false }));
      loadSyncScript();

      const result = await (globalThis as any).syncDeckEditorFromV1DeckDataOrReload(null);
      expect(result).toEqual({ ok: false, message: 'Failed to reload deck' });
    });

    it('returns Failed to reload deck when apply cannot run and loadDeckForEditing is absent', async () => {
      (globalThis as any).currentDeckId = 'deck-l';
      loadSyncScript();

      const result = await (globalThis as any).syncDeckEditorFromV1DeckDataOrReload(null);
      expect(result).toEqual({ ok: false, message: 'Failed to reload deck' });
    });

    it('calls reload with empty string when currentDeckId is undefined', async () => {
      (globalThis as any).loadDeckForEditing = jest.fn(async () => ({ ok: true }));
      loadSyncScript();

      const result = await (globalThis as any).syncDeckEditorFromV1DeckDataOrReload(null);
      expect(result).toEqual({ ok: true });
      expect((globalThis as any).loadDeckForEditing).toHaveBeenCalledWith('');
    });
  });
});
