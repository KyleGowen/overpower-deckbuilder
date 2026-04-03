import crypto from 'crypto';
import type { RequestHandler, Router } from 'express';
import type { DeckListService } from '../services/deckListService';
import type { V1Envelope } from './v1Envelope';
import { sendV1Json } from './v1Envelope';

export interface DecksV1HttpDeps {
  deckListService: DeckListService;
  authenticateUser: RequestHandler;
}

function stableV1DeckListBody<T>(data: T): string {
  const envelope: V1Envelope<T> = { data, meta: {}, errors: [] };
  return JSON.stringify(envelope);
}

export function registerDecksV1HttpRoutes(router: Router, deps: DecksV1HttpDeps): void {
  router.get('/decks', deps.authenticateUser, async (req, res) => {
    try {
      const userId = req.user!.id;
      const list = await deps.deckListService.getTransformedListForUser(userId);
      const body = stableV1DeckListBody(list);
      const etag = `"${crypto.createHash('sha1').update(body).digest('hex')}"`;

      res.set('Cache-Control', 'private, max-age=30');
      res.set('Vary', 'Cookie');
      res.set('ETag', etag);

      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }

      res.status(200).type('application/json').send(body);
    } catch (error) {
      console.error('v1 GET /decks error:', error);
      sendV1Json(res, 500, null, [{ code: 'DECK_LIST_ERROR', message: 'Failed to fetch decks' }]);
    }
  });
}
