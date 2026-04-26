/**
 * Guardrail: critical deck editor DOM ids must exist in both index.html and deck-editor.html.
 */
import fs from 'fs';
import path from 'path';

const REQUIRED_ID_SUBSTRINGS = [
  'id="deckEditorModal"',
  'id="deckCardsEditor"',
  'id="devMobileDeckSearchInput"',
  'id="deckEditorSearchInput"',
  'id="cardCategories"',
  'id="exportJsonOverlay"',
  'id="importJsonOverlay"',
  'data-excelsior-page="deck-editor"'
];

describe('Deck editor HTML parity', () => {
  const indexPath = path.join(process.cwd(), 'public/index.html');
  const editorPath = path.join(process.cwd(), 'public/deck-editor.html');

  it('serves deck-editor.html with data-excelsior-page and shared editor ids', () => {
    const editor = fs.readFileSync(editorPath, 'utf8');
    for (const s of REQUIRED_ID_SUBSTRINGS) {
      expect(editor).toContain(s);
    }
  });

  it('keeps the same critical id= markers in index.html and deck-editor.html (except deck-editor-only marker)', () => {
    const indexHtml = fs.readFileSync(indexPath, 'utf8');
    const editor = fs.readFileSync(editorPath, 'utf8');
    const shared = REQUIRED_ID_SUBSTRINGS.filter((s) => s !== 'data-excelsior-page="deck-editor"');
    for (const s of shared) {
      expect(indexHtml).toContain(s);
      expect(editor).toContain(s);
    }
  });
});
