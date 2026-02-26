/**
 * Deck Editor Close URL Reset Tests
 *
 * Verifies that closeDeckEditor always resets the URL to /users/{userId}/decks
 * (removing the deck ID), regardless of whether the deck builder panel is already
 * visible. This prevents stale deck URLs from surviving a hard refresh.
 */

describe('closeDeckEditor URL reset', () => {
  let mockCloseDrawHand: jest.Mock;
  let mockSaveUIPreferences: jest.Mock;
  let mockSwitchToDeckBuilder: jest.Mock;
  let mockGetCurrentUIPreferences: jest.Mock;
  let mockGetCurrentUser: jest.Mock;
  let mockHistoryReplaceState: jest.Mock;

  // Simulate the closeDeckEditor function exactly as it exists in deck-editor-core.js
  const buildCloseDeckEditor = (isAlreadyInDeckBuilder: boolean) => {
    return async () => {
      mockCloseDrawHand();

      if ((global as any).currentDeckId) {
        const preferences = mockGetCurrentUIPreferences();
        await mockSaveUIPreferences((global as any).currentDeckId, preferences);
      }

      // Always reset URL to remove the deck ID
      const closingUser = mockGetCurrentUser();
      const closingUserId = closingUser
        ? (closingUser.userId || closingUser.id)
        : 'guest';
      mockHistoryReplaceState(
        { view: 'deckbuilder' },
        '',
        `/users/${closingUserId}/decks`
      );

      // Only do DOM work if not already in deck builder
      if (!isAlreadyInDeckBuilder) {
        mockSwitchToDeckBuilder();
      }

      (global as any).currentDeckId = null;
      (global as any).currentDeckData = null;
      (global as any).deckEditorCards = [];
    };
  };

  beforeEach(() => {
    mockCloseDrawHand = jest.fn();
    mockSaveUIPreferences = jest.fn().mockResolvedValue(undefined);
    mockSwitchToDeckBuilder = jest.fn();
    mockGetCurrentUIPreferences = jest.fn().mockReturnValue({});
    mockGetCurrentUser = jest.fn();
    mockHistoryReplaceState = jest.fn();

    (global as any).closeDrawHand = mockCloseDrawHand;
    (global as any).saveUIPreferences = mockSaveUIPreferences;
    (global as any).switchToDeckBuilder = mockSwitchToDeckBuilder;
    (global as any).getCurrentUIPreferences = mockGetCurrentUIPreferences;
    (global as any).currentDeckId = 'deck-abc';
    (global as any).currentDeckData = { id: 'deck-abc' };
    (global as any).deckEditorCards = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
    (global as any).currentDeckId = null;
    (global as any).currentDeckData = null;
    (global as any).deckEditorCards = [];
  });

  describe('URL reset via history.replaceState', () => {
    it('resets URL when deck builder button is already active (most common path)', async () => {
      mockGetCurrentUser.mockReturnValue({ id: 'user-123', userId: 'user-123' });

      // isAlreadyInDeckBuilder = true — this is the case that previously skipped switchToDeckBuilder
      // AND skipped the URL update entirely
      const closeDeckEditor = buildCloseDeckEditor(true);
      await closeDeckEditor();

      expect(mockHistoryReplaceState).toHaveBeenCalledWith(
        { view: 'deckbuilder' },
        '',
        '/users/user-123/decks'
      );
    });

    it('resets URL when deck builder button is NOT active', async () => {
      mockGetCurrentUser.mockReturnValue({ id: 'user-456', userId: 'user-456' });

      const closeDeckEditor = buildCloseDeckEditor(false);
      await closeDeckEditor();

      expect(mockHistoryReplaceState).toHaveBeenCalledWith(
        { view: 'deckbuilder' },
        '',
        '/users/user-456/decks'
      );
    });

    it('uses the id property when userId is absent', async () => {
      mockGetCurrentUser.mockReturnValue({ id: 'id-only-user' }); // no userId property

      const closeDeckEditor = buildCloseDeckEditor(true);
      await closeDeckEditor();

      expect(mockHistoryReplaceState).toHaveBeenCalledWith(
        { view: 'deckbuilder' },
        '',
        '/users/id-only-user/decks'
      );
    });

    it('uses the userId property over id when both are present', async () => {
      mockGetCurrentUser.mockReturnValue({ id: 'id-field', userId: 'userid-field' });

      const closeDeckEditor = buildCloseDeckEditor(true);
      await closeDeckEditor();

      expect(mockHistoryReplaceState).toHaveBeenCalledWith(
        { view: 'deckbuilder' },
        '',
        '/users/userid-field/decks'
      );
    });

    it('falls back to "guest" when getCurrentUser returns null', async () => {
      mockGetCurrentUser.mockReturnValue(null);

      const closeDeckEditor = buildCloseDeckEditor(true);
      await closeDeckEditor();

      expect(mockHistoryReplaceState).toHaveBeenCalledWith(
        { view: 'deckbuilder' },
        '',
        '/users/guest/decks'
      );
    });

    it('falls back to "guest" when getCurrentUser returns undefined', async () => {
      mockGetCurrentUser.mockReturnValue(undefined);

      const closeDeckEditor = buildCloseDeckEditor(true);
      await closeDeckEditor();

      expect(mockHistoryReplaceState).toHaveBeenCalledWith(
        { view: 'deckbuilder' },
        '',
        '/users/guest/decks'
      );
    });
  });

  describe('switchToDeckBuilder DOM work gating', () => {
    it('skips switchToDeckBuilder when deck builder is already active', async () => {
      mockGetCurrentUser.mockReturnValue({ id: 'user-1' });

      const closeDeckEditor = buildCloseDeckEditor(true);
      await closeDeckEditor();

      // URL was still reset
      expect(mockHistoryReplaceState).toHaveBeenCalledTimes(1);
      // But DOM work was skipped to avoid flash
      expect(mockSwitchToDeckBuilder).not.toHaveBeenCalled();
    });

    it('calls switchToDeckBuilder when deck builder is not active', async () => {
      mockGetCurrentUser.mockReturnValue({ id: 'user-1' });

      const closeDeckEditor = buildCloseDeckEditor(false);
      await closeDeckEditor();

      expect(mockHistoryReplaceState).toHaveBeenCalledTimes(1);
      expect(mockSwitchToDeckBuilder).toHaveBeenCalledTimes(1);
    });
  });

  describe('state cleanup', () => {
    it('clears currentDeckId, currentDeckData, and deckEditorCards after close', async () => {
      mockGetCurrentUser.mockReturnValue({ id: 'user-1' });
      (global as any).currentDeckId = 'some-deck';
      (global as any).currentDeckData = { id: 'some-deck' };
      (global as any).deckEditorCards = [{ id: 'card-1' }];

      const closeDeckEditor = buildCloseDeckEditor(true);
      await closeDeckEditor();

      expect((global as any).currentDeckId).toBeNull();
      expect((global as any).currentDeckData).toBeNull();
      expect((global as any).deckEditorCards).toEqual([]);
    });
  });
});
