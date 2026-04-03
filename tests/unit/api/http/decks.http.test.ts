import express, { type Request, type RequestHandler } from 'express';
import request from 'supertest';
import crypto from 'crypto';
import { registerDecksV1HttpRoutes, type DecksV1HttpDeps } from '../../../../src/api/http/decks.http';
import type { DeckListService } from '../../../../src/api/services/deckListService';
import type { DeckWriteService } from '../../../../src/api/services/deckWriteService';

const passAuth: RequestHandler = (req: Request, _res, next) => {
  (req as Request & { user?: { id: string; name: string; email: string; role: string } }).user = {
    id: 'user-1',
    name: 't',
    email: 't@example.com',
    role: 'USER'
  };
  next();
};

const passAuthGuest: RequestHandler = (req: Request, _res, next) => {
  (req as Request & { user?: { id: string; name: string; email: string; role: string } }).user = {
    id: 'guest-1',
    name: 'g',
    email: 'g@example.com',
    role: 'GUEST'
  };
  next();
};

function buildApp(deps: DecksV1HttpDeps): express.Application {
  const app = express();
  app.use(express.json());
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
    const deckWriteService = {
      createDeck: jest.fn(),
      validateDeckCards: jest.fn()
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
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
    const deckWriteService = {
      createDeck: jest.fn(),
      validateDeckCards: jest.fn()
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
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
    const deckWriteService = {
      createDeck: jest.fn(),
      validateDeckCards: jest.fn()
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/decks').expect(200);
    const expectedBody = JSON.stringify({ data: sampleList, meta: {}, errors: [] });
    const expectedEtag = `"${crypto.createHash('sha1').update(expectedBody).digest('hex')}"`;
    expect(res.headers.etag).toBe(expectedEtag);
  });

  it('GET /decks returns 500 v1 envelope on service error', async () => {
    const deckListService = {
      getTransformedListForUser: jest.fn().mockRejectedValue(new Error('db'))
    } as unknown as DeckListService;
    const deckWriteService = {
      createDeck: jest.fn(),
      validateDeckCards: jest.fn()
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/decks').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].code).toBe('DECK_LIST_ERROR');
  });

  it('POST /decks returns 201 with created deck in data', async () => {
    const created = {
      id: 'deck-new',
      user_id: 'user-1',
      name: 'N',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z'
    };
    const deckListService = {
      getTransformedListForUser: jest.fn()
    } as unknown as DeckListService;
    const deckWriteService = {
      createDeck: jest.fn().mockResolvedValue(created),
      validateDeckCards: jest.fn()
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/decks')
      .send({ name: 'N', description: 'd' })
      .expect(201);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toEqual(created);
    expect(deckWriteService.createDeck).toHaveBeenCalledWith('user-1', 'N', 'd', undefined);
  });

  it('POST /decks returns 400 v1 envelope for invalid name', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = {
      createDeck: jest.fn(),
      validateDeckCards: jest.fn()
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).post('/decks').send({ name: '   ' }).expect(400);
    expect(res.body.data).toBeNull();
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(deckWriteService.createDeck).not.toHaveBeenCalled();
  });

  it('POST /decks returns 403 for GUEST', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = {
      createDeck: jest.fn(),
      validateDeckCards: jest.fn()
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuthGuest };
    const res = await request(buildApp(deps)).post('/decks').send({ name: 'x' }).expect(403);
    expect(res.body.errors[0].code).toBe('GUEST_FORBIDDEN');
    expect(deckWriteService.createDeck).not.toHaveBeenCalled();
  });

  it('POST /decks maps Maximum 4 characters to 400', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = {
      createDeck: jest.fn().mockRejectedValue(new Error('Maximum 4 characters allowed per deck')),
      validateDeckCards: jest.fn()
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/decks')
      .send({ name: 'x', characters: ['a', 'b', 'c', 'd', 'e'] })
      .expect(400);
    expect(res.body.errors[0].message).toContain('Maximum 4 characters');
  });

  it('POST /decks/validate returns 200 when valid', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = {
      createDeck: jest.fn(),
      validateDeckCards: jest.fn().mockResolvedValue([])
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/decks/validate')
      .send({ cards: [{ cardType: 'character', cardId: 'x', quantity: 1 }] })
      .expect(200);
    expect(res.body.data.valid).toBe(true);
    expect(res.body.data.message).toBe('Deck is valid');
    expect(res.body.errors).toEqual([]);
  });

  it('POST /decks/validate returns 400 with validationErrors when invalid', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = {
      createDeck: jest.fn(),
      validateDeckCards: jest.fn().mockResolvedValue([{ rule: 'r', message: 'bad' }])
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/decks/validate')
      .send({ cards: [] })
      .expect(400);
    expect(res.body.data.validationErrors).toEqual([{ rule: 'r', message: 'bad' }]);
    expect(res.body.errors[0].code).toBe('DECK_VALIDATION_FAILED');
  });

  it('POST /decks/validate returns 400 when cards missing', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = {
      createDeck: jest.fn(),
      validateDeckCards: jest.fn()
    } as unknown as DeckWriteService;
    const deps: DecksV1HttpDeps = { deckListService, deckWriteService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).post('/decks/validate').send({}).expect(400);
    expect(res.body.errors[0].field).toBe('cards');
    expect(deckWriteService.validateDeckCards).not.toHaveBeenCalled();
  });
});
