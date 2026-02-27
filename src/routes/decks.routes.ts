import crypto from 'crypto';
import express, { Request, RequestHandler } from 'express';
import { transformDeckList } from '../api/deckTransform';
import { Deck } from '../types';

type DeckRoutesDeps = {
  deckRepository: {
    getDecksByUserId: (userId: string) => Promise<Deck[]>;
  };
  authenticateUser: RequestHandler;
};

export function createDeckRoutes(deps: DeckRoutesDeps) {
  const router = express.Router();

  router.get('/decks', deps.authenticateUser, async (req: Request, res) => {
    try {
      const decks = await deps.deckRepository.getDecksByUserId(req.user!.id);

      // Transform deck data to match frontend expectations
      // Note: getDecksByUserId now returns decks with metadata columns for performance
      const transformedDecks = transformDeckList(decks);

      const body = JSON.stringify({ success: true, data: transformedDecks });

      // ETag: SHA-1 fingerprint of the response body.
      // If the client sends If-None-Match and it matches, respond with 304
      // and skip transmitting the body — the browser re-uses its local copy.
      const etag = `"${crypto.createHash('sha1').update(body).digest('hex')}"`;

      res.set('Cache-Control', 'private, max-age=30');
      // Vary: Cookie ensures each unique session cookie gets its own browser cache entry.
      // Without this, a guest session and a real user session share the same cached response
      // for the URL GET /api/decks, causing the guest's deck list to appear after login.
      res.set('Vary', 'Cookie');
      res.set('ETag', etag);

      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(body);
    } catch (error) {
      console.error('Error fetching decks:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch decks' });
    }
  });

  return router;
}

