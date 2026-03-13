/**
 * Shared setup and teardown for deck-import unit tests that use the real
 * public/js/components/deck-import.js and jsdom. Use with deck-import-*.test.ts
 * to avoid duplicating DOM HTML and window mocks.
 */

export const DECK_IMPORT_MINIMAL_HTML = `
  <textarea id="importJsonContent"></textarea>
  <div id="importErrorMessages" style="display: none;"></div>
  <button id="importJsonButton"></button>
  <select id="viewMode">
    <option value="card" selected>Card</option>
    <option value="list">List</option>
  </select>
`;

const MOCK_NAMES = [
  'availableCardsMap',
  'deckEditorCards',
  'addCardToEditor',
  'showNotification',
  'closeImportOverlay',
  'validateDeck',
  'loadAvailableCards',
  'renderDeckCardsCardView',
  'renderDeckCardsListView'
] as const;

/**
 * Apply standard window mocks used by deck-import tests. Call after setting
 * document.body.innerHTML and before require('deck-import.js').
 */
export function applyDeckImportMocks(win: Window & typeof globalThis): void {
  const w = win as unknown as Record<string, unknown>;
  w.availableCardsMap = new Map();
  w.deckEditorCards = [];
  w.addCardToEditor = jest.fn(async (type: string, cardId: string, cardName: string) => {
    (w.deckEditorCards as Array<{ type: string; cardId: string; cardName: string; quantity: number }>).push({
      type,
      cardId,
      cardName,
      quantity: 1
    });
  });
  w.showNotification = jest.fn();
  w.closeImportOverlay = jest.fn();
  w.validateDeck = jest.fn().mockReturnValue({ errors: [], warnings: [] });
  w.loadAvailableCards = jest.fn().mockResolvedValue(undefined);
  w.renderDeckCardsCardView = jest.fn();
  w.renderDeckCardsListView = jest.fn();
}

/**
 * Remove deck-import mocks from window. Call in afterEach.
 */
export function teardownDeckImportMocks(win: Window & typeof globalThis): void {
  const w = win as unknown as Record<string, unknown>;
  for (const key of MOCK_NAMES) {
    delete w[key];
  }
}
