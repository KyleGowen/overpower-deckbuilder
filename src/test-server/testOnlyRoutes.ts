/**
 * Test-only routes: GET /deck-editor/:deckId and lenient page routes for integration tests.
 * When registered before registerRoutes, lenient /users/:userId/decks take precedence (no auth, serve HTML).
 */
import express, { Request } from 'express';
import path from 'path';
import { pathToDeckEditorHtml } from '../routes/deckEditorPagePath';

export interface TestOnlyRoutesDeps {
  deckRepository: { getDeckById: (id: string) => Promise<unknown> };
  authenticateUser: express.RequestHandler;
}

export function registerTestOnlyRoutes(app: express.Application, deps: TestOnlyRoutesDeps): void {
  // Lenient page routes (no auth) so integration tests can load /users/:userId/decks by role name
  const noCache = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  app.get('/users/:userId/decks', (_req, res) => {
    res.set(noCache);
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });
  app.get('/users/:userId/decks/:deckId/edit', (req, res) => {
    res.set({ ...noCache, 'Last-Modified': new Date().toUTCString(), 'ETag': `"${Date.now()}"` });
    res.sendFile(pathToDeckEditorHtml());
  });
  app.get('/users/:userId/decks/:deckId', (_req, res) => {
    res.set({ ...noCache, 'Last-Modified': new Date().toUTCString(), 'ETag': `"${Date.now()}"` });
    res.sendFile(pathToDeckEditorHtml());
  });

  app.get('/deck-editor/:deckId', deps.authenticateUser, async (req: Request, res) => {
    const { deckId } = req.params;
    const deck = await deps.deckRepository.getDeckById(deckId);
    if (!deck) {
      return res.status(404).send('Deck not found');
    }
    const deckRecord = deck as { user_id?: string };
    const isReadOnly = req.user && deckRecord.user_id !== req.user!.id;
    const reserveButtons = isReadOnly
      ? ''
      : `
                    <div class="deck-card-editor" data-card-id="char-1">
                        <div class="deck-card-editor-reserve">
                            <button class="reserve-btn" data-character-id="char-1">Reserve</button>
                        </div>
                    </div>
                    <div class="deck-card-editor" data-card-id="char-2">
                        <div class="deck-card-editor-reserve">
                            <button class="reserve-btn" data-character-id="char-2">Reserve</button>
                        </div>
                    </div>
                    <div class="deck-card-editor" data-card-id="char-3">
                        <div class="deck-card-editor-reserve">
                            <button class="reserve-btn" data-character-id="char-3">Reserve</button>
                        </div>
                    </div>
                    <div class="deck-card-editor" data-card-id="char-4">
                        <div class="deck-card-editor-reserve">
                            <button class="reserve-btn" data-character-id="char-4">Reserve</button>
                        </div>
                    </div>`;

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Deck Editor</title>
    </head>
    <body>
        <h1>Deck Editor</h1>
        <p>Deck ID: ${deckId}</p>
        <div id="deckEditorModal" style="display: block;">
            <div class="deck-editor-content">
                <h3 id="deckEditorTitle" class="editable-title">Test Deck</h3>
                <p id="deckEditorDescription" class="deck-description editable-description">Test Description</p>
                <div id="deckCardsEditor">
                    ${reserveButtons}
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
  });
}
