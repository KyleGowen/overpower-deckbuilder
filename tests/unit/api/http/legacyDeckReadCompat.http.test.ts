import express, { type RequestHandler } from 'express';
import request from 'supertest';
import { registerLegacyDeckReadCompatRoutes } from '../../../../src/api/http/legacyDeckReadCompat.http';
import type { DeckDetailService } from '../../../../src/api/services/deckDetailService';

const passOptionalAuth: RequestHandler = (_req, _res, next) => next();

const detail = {
  metadata: { id: 'public-deck', name: 'Public deck', cardCount: 52 },
  cards: []
};

function buildApp(deckDetailService: DeckDetailService): express.Application {
  const app = express();
  registerLegacyDeckReadCompatRoutes(app, {
    authenticateUser: passOptionalAuth,
    optionalAuthenticate: passOptionalAuth,
    deckDetailService
  });
  return app;
}

describe('legacyDeckReadCompat.http', () => {
  it('marks compact public deck reads as no-store', async () => {
    const deckDetailService = {
      getDeckDetail: jest.fn().mockResolvedValue(detail),
      getDeckFullDetail: jest.fn()
    } as unknown as DeckDetailService;

    const res = await request(buildApp(deckDetailService)).get('/api/decks/public-deck').expect(200);

    expect(res.body.data).toEqual(detail);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('marks fully hydrated public deck reads as no-store', async () => {
    const deckDetailService = {
      getDeckDetail: jest.fn(),
      getDeckFullDetail: jest.fn().mockResolvedValue(detail)
    } as unknown as DeckDetailService;

    const res = await request(buildApp(deckDetailService)).get('/api/decks/public-deck/full').expect(200);

    expect(res.body.data).toEqual(detail);
    expect(res.headers['cache-control']).toBe('no-store');
  });
});
