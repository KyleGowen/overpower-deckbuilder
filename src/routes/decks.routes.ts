import crypto from 'crypto';
import express from 'express';
import { transformDeckList } from '../api/deckTransform';

type DeckRoutesDeps = {
  deckRepository: {
    getDecksByUserId: (userId: string) => Promise<any[]>;
  };
  authenticateUser: any;
};

export function createDeckRoutes(deps: DeckRoutesDeps) {
  const router = express.Router();

  router.get('/decks', deps.authenticateUser, async (req: any, res) => {
    try {
      const decks = await deps.deckRepository.getDecksByUserId(req.user.id);

      // Transform deck data to match frontend expectations
      // Note: getDecksByUserId now returns decks with metadata columns for performance
      const transformedDecks = transformDeckList(decks);

      const body = JSON.stringify({ success: true, data: transformedDecks });

      // ETag: SHA-1 fingerprint of the response body.
      // If the client sends If-None-Match and it matches, respond with 304
      // and skip transmitting the body — the browser re-uses its local copy.
      const etag = `"${crypto.createHash('sha1').update(body).digest('hex')}"`;

      res.set('Cache-Control', 'private, max-age=30');
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

