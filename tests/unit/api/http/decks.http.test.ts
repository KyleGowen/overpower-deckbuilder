import express, { type Request, type RequestHandler } from 'express';
import request from 'supertest';
import crypto from 'crypto';
import { registerDecksV1HttpRoutes, type DecksV1HttpDeps } from '../../../../src/api/http/decks.http';
import type { DeckListService } from '../../../../src/api/services/deckListService';

const passAuth: RequestHandler = (req: Request, _res, next) => {
  (req as Request & { user?: { id: string; name: string; email: string; role: string } }).user = {
    id: 'user-1',
    name: 't',
    email: 't@example.com',
    role: 'USER'
  };
  next();
};

function buildApp(deps: DecksV1HttpDeps): express.Application {
  const app = express();
  const router = express.Router();
  registerDecksV1HttpRoutes(router, deps);
  app.use(router);
  return app;
}

describe('decks.http', () => {
  const sampleList = [
    {
      metadata: { id: 'd1', name: 'A', cardCount: 0 },
      cards: [] as unknown[]
    }
  ];

  it('GET /decks returns v1 envelope with ETag and Cache-Control', async () => {
    const deckListService = {
      getTransformedListForUser: jest.fn().mockResolvedValue(sampleList)
    } as unknown as DeckListService;
    const deps: DecksV1HttpDeps = { deckListService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/decks').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual(sampleList);
    expect(res.headers['cache-control']).toBe('private, max-age=30');
    expect(res.headers.vary).toBe('Cookie');
    expect(res.headers.etag).toMatch(/^"[a-f0-9]{40}"$/);
    expect(deckListService.getTransformedListForUser).toHaveBeenCalledWith('user-1');
  });

  it('GET /decks returns 304 when If-None-Match matches ETag', async () => {
    const deckListService = {
      getTransformedListForUser: jest.fn().mockResolvedValue(sampleList)
    } as unknown as DeckListService;
    const deps: DecksV1HttpDeps = { deckListService, authenticateUser: passAuth };
    const app = buildApp(deps);
    const first = await request(app).get('/decks').expect(200);
    const etag = first.headers.etag;
    expect(etag).toBeDefined();
    const second = await request(app).get('/decks').set('If-None-Match', etag!).expect(304);
    expect(second.text).toBe('');
    expect(deckListService.getTransformedListForUser).toHaveBeenCalledTimes(2);
  });

  it('GET /decks ETag matches full JSON body bytes', async () => {
    const deckListService = {
      getTransformedListForUser: jest.fn().mockResolvedValue(sampleList)
    } as unknown as DeckListService;
    const deps: DecksV1HttpDeps = { deckListService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/decks').expect(200);
    const expectedBody = JSON.stringify({ data: sampleList, meta: {}, errors: [] });
    const expectedEtag = `"${crypto.createHash('sha1').update(expectedBody).digest('hex')}"`;
    expect(res.headers.etag).toBe(expectedEtag);
  });

  it('GET /decks returns 500 v1 envelope on service error', async () => {
    const deckListService = {
      getTransformedListForUser: jest.fn().mockRejectedValue(new Error('db'))
    } as unknown as DeckListService;
    const deps: DecksV1HttpDeps = { deckListService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/decks').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].code).toBe('DECK_LIST_ERROR');
  });
});
