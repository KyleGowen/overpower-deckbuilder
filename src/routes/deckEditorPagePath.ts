import path from 'path';

/** Static HTML for `/users/:userId/decks/:deckId` (full-page deck editor, not `index.html`). */
export const DECK_EDITOR_HTML = 'deck-editor.html';

export function pathToDeckEditorHtml(): string {
  return path.join(process.cwd(), 'public', DECK_EDITOR_HTML);
}
