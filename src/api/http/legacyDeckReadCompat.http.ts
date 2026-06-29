import type { Application, Request, RequestHandler, Response } from 'express';
import type { DeckDetailService } from '../services/deckDetailService';
import { sendV1Json, sendV1Success } from './v1Envelope';

/**
 * Read-only compatibility mounts for cached clients that still call legacy URLs.
 * Responses use the same v1 JSON envelope as GET /api/v1/decks/:id (see deckDetailPayload).
 * Register /full before /:id so "full" is not captured as an id.
 */
export function registerLegacyDeckReadCompatRoutes(
  app: Application,
  deps: {
    authenticateUser: RequestHandler;
    optionalAuthenticate?: RequestHandler;
    deckDetailService: DeckDetailService;
  }
): void {
  const deckViewAuth = deps.optionalAuthenticate ?? deps.authenticateUser;

  app.get('/api/decks/:id/full', deckViewAuth, async (req: Request, res: Response) => {
    try {
      const viewerId = req.user?.id ?? '';
      const detail = await deps.deckDetailService.getDeckFullDetail(req.params.id, viewerId);
      if (!detail) {
        sendV1Json(res, 404, null, [{ code: 'DECK_NOT_FOUND', message: 'Deck not found' }]);
        return;
      }
      sendV1Success(res, detail);
    } catch (error) {
      console.error('compat GET /api/decks/:id/full error:', error);
      sendV1Json(res, 500, null, [{ code: 'DECK_FETCH_ERROR', message: 'Failed to fetch full deck data' }]);
    }
  });

  app.get('/api/decks/:id', deckViewAuth, async (req: Request, res: Response) => {
    try {
      const viewerId = req.user?.id ?? '';
      const detail = await deps.deckDetailService.getDeckDetail(req.params.id, viewerId);
      if (!detail) {
        sendV1Json(res, 404, null, [{ code: 'DECK_NOT_FOUND', message: 'Deck not found' }]);
        return;
      }
      sendV1Success(res, detail);
    } catch (error) {
      console.error('compat GET /api/decks/:id error:', error);
      sendV1Json(res, 500, null, [{ code: 'DECK_FETCH_ERROR', message: 'Failed to fetch deck' }]);
    }
  });
}
