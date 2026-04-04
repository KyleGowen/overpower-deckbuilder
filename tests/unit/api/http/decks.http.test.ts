import express, { type Request, type RequestHandler } from 'express';
import request from 'supertest';
import crypto from 'crypto';
import { registerDecksV1HttpRoutes, type DecksV1HttpDeps } from '../../../../src/api/http/decks.http';
import type { DeckListService } from '../../../../src/api/services/deckListService';
import type { DeckWriteService } from '../../../../src/api/services/deckWriteService';
import type { DeckDetailService } from '../../../../src/api/services/deckDetailService';
import type { DeckCardsService } from '../../../../src/api/services/deckCardsService';

const noopDeckBackground = {
  getAvailableBackgrounds: jest.fn().mockResolvedValue([]),
  validateBackgroundPath: jest.fn().mockResolvedValue(true)
};

function stubDeckCards(): DeckCardsService {
  return {
    getDeckCards: jest.fn(),
    postCard: jest.fn(),
    putReplaceCards: jest.fn(),
    deleteCards: jest.fn()
  } as unknown as DeckCardsService;
}

function stubDeckRepository(): DecksV1HttpDeps['deckRepository'] {
  return {
    getUIPreferences: jest.fn().mockResolvedValue({}),
    updateUIPreferences: jest.fn().mockResolvedValue(true),
    getDeckById: jest.fn().mockResolvedValue({ id: 'd1', user_id: 'user-1' }),
    userOwnsDeck: jest.fn().mockResolvedValue(true)
  };
}

function stubDetail(): DeckDetailService {
  return {
    getDeckDetail: jest.fn(),
    getDeckFullDetail: jest.fn(),
    updateDeckMetadata: jest.fn(),
    deleteDeckIfOwner: jest.fn()
  } as unknown as DeckDetailService;
}

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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuthGuest
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
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
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService: stubDetail(),
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).post('/decks/validate').send({}).expect(400);
    expect(res.body.errors[0].field).toBe('cards');
    expect(deckWriteService.validateDeckCards).not.toHaveBeenCalled();
  });

  const sampleDetail = {
    metadata: {
      id: 'd1',
      name: 'N',
      description: '',
      created: '2026-01-01T00:00:00.000Z',
      lastModified: '2026-01-01T00:00:00.000Z',
      cardCount: 0,
      userId: 'user-1',
      uiPreferences: {},
      isOwner: true,
      is_limited: false,
      reserve_character: null,
      display_mission_card_id: null,
      background_image_path: null
    },
    cards: [] as unknown[]
  };

  it('GET /decks/:id returns 200 v1 envelope', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = { createDeck: jest.fn(), validateDeckCards: jest.fn() } as unknown as DeckWriteService;
    const deckDetailService = {
      getDeckDetail: jest.fn().mockResolvedValue(sampleDetail),
      getDeckFullDetail: jest.fn(),
      updateDeckMetadata: jest.fn(),
      deleteDeckIfOwner: jest.fn()
    } as unknown as DeckDetailService;
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService,
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).get('/decks/d1').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toEqual(sampleDetail);
    expect(deckDetailService.getDeckDetail).toHaveBeenCalledWith('d1', 'user-1');
  });

  it('GET /decks/:id/full returns 200 v1 envelope', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = { createDeck: jest.fn(), validateDeckCards: jest.fn() } as unknown as DeckWriteService;
    const deckDetailService = {
      getDeckDetail: jest.fn(),
      getDeckFullDetail: jest.fn().mockResolvedValue(sampleDetail),
      updateDeckMetadata: jest.fn(),
      deleteDeckIfOwner: jest.fn()
    } as unknown as DeckDetailService;
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService,
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).get('/decks/d1/full').expect(200);
    expect(res.body.data).toEqual(sampleDetail);
    expect(deckDetailService.getDeckFullDetail).toHaveBeenCalledWith('d1', 'user-1');
  });

  it('GET /decks/:id returns 404 when missing', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = { createDeck: jest.fn(), validateDeckCards: jest.fn() } as unknown as DeckWriteService;
    const deckDetailService = {
      getDeckDetail: jest.fn().mockResolvedValue(null),
      getDeckFullDetail: jest.fn(),
      updateDeckMetadata: jest.fn(),
      deleteDeckIfOwner: jest.fn()
    } as unknown as DeckDetailService;
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService,
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).get('/decks/missing').expect(404);
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].code).toBe('DECK_NOT_FOUND');
  });

  it('PUT /decks/:id returns 200 on success', async () => {
    const updated = {
      metadata: { ...sampleDetail.metadata, name: 'X' },
      cards: []
    };
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = { createDeck: jest.fn(), validateDeckCards: jest.fn() } as unknown as DeckWriteService;
    const deckDetailService = {
      getDeckDetail: jest.fn(),
      getDeckFullDetail: jest.fn(),
      updateDeckMetadata: jest.fn().mockResolvedValue({ ok: true, data: updated }),
      deleteDeckIfOwner: jest.fn()
    } as unknown as DeckDetailService;
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService,
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).put('/decks/d1').send({ name: 'X' }).expect(200);
    expect(res.body.data).toEqual(updated);
    expect(deckDetailService.updateDeckMetadata).toHaveBeenCalledWith('d1', 'user-1', { name: 'X' }, {
      strictReserveTestValidation: false
    });
  });

  it('PUT /decks/:id returns 403 for GUEST', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = { createDeck: jest.fn(), validateDeckCards: jest.fn() } as unknown as DeckWriteService;
    const deckDetailService = stubDetail();
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService,
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuthGuest
    };
    const res = await request(buildApp(deps)).put('/decks/d1').send({ name: 'X' }).expect(403);
    expect(res.body.errors[0].code).toBe('GUEST_FORBIDDEN');
  });

  it('DELETE /decks/:id returns 200 with message', async () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = { createDeck: jest.fn(), validateDeckCards: jest.fn() } as unknown as DeckWriteService;
    const deckDetailService = {
      getDeckDetail: jest.fn(),
      getDeckFullDetail: jest.fn(),
      updateDeckMetadata: jest.fn(),
      deleteDeckIfOwner: jest.fn().mockResolvedValue({ ok: true })
    } as unknown as DeckDetailService;
    const deps: DecksV1HttpDeps = {
      deckListService,
      deckWriteService,
      deckDetailService,
      deckBackgroundService: noopDeckBackground,
      deckCardsService: stubDeckCards(),
      deckRepository: stubDeckRepository(),
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).delete('/decks/d1').expect(200);
    expect(res.body.data.message).toBe('Deck deleted successfully');
  });

  describe('deck cards /decks/:id/cards', () => {
    const deckListService = { getTransformedListForUser: jest.fn() } as unknown as DeckListService;
    const deckWriteService = { createDeck: jest.fn(), validateDeckCards: jest.fn() } as unknown as DeckWriteService;

    it('GET returns 200 with card rows', async () => {
      const deckCardsService = stubDeckCards();
      (deckCardsService.getDeckCards as jest.Mock).mockResolvedValue({
        ok: true,
        data: [{ type: 'character', cardId: 'c1', quantity: 1 }]
      });
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuth
      };
      const res = await request(buildApp(deps)).get('/decks/d1/cards').expect(200);
      expect(res.body.errors).toEqual([]);
      expect(res.body.data).toEqual([{ type: 'character', cardId: 'c1', quantity: 1 }]);
    });

    it('GET returns 501 when service reports not implemented', async () => {
      const deckCardsService = stubDeckCards();
      (deckCardsService.getDeckCards as jest.Mock).mockResolvedValue({ ok: false, kind: 'not_implemented' });
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuth
      };
      const res = await request(buildApp(deps)).get('/decks/d1/cards').expect(501);
      expect(res.body.errors[0].code).toBe('NOT_IMPLEMENTED');
    });

    it('GET returns 500 on server_error from service', async () => {
      const deckCardsService = stubDeckCards();
      (deckCardsService.getDeckCards as jest.Mock).mockResolvedValue({ ok: false, kind: 'server_error' });
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuth
      };
      const res = await request(buildApp(deps)).get('/decks/d1/cards').expect(500);
      expect(res.body.errors[0].code).toBe('DECK_CARDS_FETCH_ERROR');
    });

    it('POST returns 200 with deck detail', async () => {
      const deckCardsService = stubDeckCards();
      (deckCardsService.postCard as jest.Mock).mockResolvedValue({ ok: true, data: sampleDetail });
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuth
      };
      const res = await request(buildApp(deps))
        .post('/decks/d1/cards')
        .send({ cardType: 'character', cardId: 'x', quantity: 1 })
        .expect(200);
      expect(res.body.data).toEqual(sampleDetail);
    });

    it('POST returns 403 for GUEST', async () => {
      const deckCardsService = stubDeckCards();
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuthGuest
      };
      const res = await request(buildApp(deps))
        .post('/decks/d1/cards')
        .send({ cardType: 'character', cardId: 'x', quantity: 1 })
        .expect(403);
      expect(res.body.errors[0].code).toBe('GUEST_FORBIDDEN');
      expect(deckCardsService.postCard).not.toHaveBeenCalled();
    });

    it('POST returns 400 when body invalid', async () => {
      const deckCardsService = stubDeckCards();
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuth
      };
      const res = await request(buildApp(deps)).post('/decks/d1/cards').send({}).expect(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
      expect(deckCardsService.postCard).not.toHaveBeenCalled();
    });

    it('POST maps forbidden / not_found / bad_request from service', async () => {
      const deckCardsService = stubDeckCards();
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuth
      };
      (deckCardsService.postCard as jest.Mock).mockResolvedValue({
        ok: false,
        kind: 'forbidden',
        message: 'no'
      });
      expect(
        (await request(buildApp(deps)).post('/decks/d1/cards').send({ cardType: 'c', cardId: 'i', quantity: 1 }))
          .status
      ).toBe(403);

      (deckCardsService.postCard as jest.Mock).mockResolvedValue({
        ok: false,
        kind: 'not_found',
        message: 'nf'
      });
      expect(
        (await request(buildApp(deps)).post('/decks/d1/cards').send({ cardType: 'c', cardId: 'i', quantity: 1 }))
          .status
      ).toBe(404);

      (deckCardsService.postCard as jest.Mock).mockResolvedValue({
        ok: false,
        kind: 'bad_request',
        message: 'bad'
      });
      const bad = await request(buildApp(deps))
        .post('/decks/d1/cards')
        .send({ cardType: 'c', cardId: 'i', quantity: 1 })
        .expect(400);
      expect(bad.body.errors[0].code).toBe('VALIDATION_ERROR');
    });

    it('PUT returns 200 after bulk replace', async () => {
      const deckCardsService = stubDeckCards();
      (deckCardsService.putReplaceCards as jest.Mock).mockResolvedValue({ ok: true, data: sampleDetail });
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuth
      };
      const res = await request(buildApp(deps))
        .put('/decks/d1/cards')
        .send({ cards: [{ cardType: 'character', cardId: 'x', quantity: 1 }] })
        .expect(200);
      expect(res.body.data).toEqual(sampleDetail);
    });

    it('PUT returns 403 for GUEST', async () => {
      const deckCardsService = stubDeckCards();
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuthGuest
      };
      await request(buildApp(deps))
        .put('/decks/d1/cards')
        .send({ cards: [{ cardType: 'character', cardId: 'x', quantity: 1 }] })
        .expect(403);
      expect(deckCardsService.putReplaceCards).not.toHaveBeenCalled();
    });

    it('PUT maps replace_failed status from service', async () => {
      const deckCardsService = stubDeckCards();
      (deckCardsService.putReplaceCards as jest.Mock).mockResolvedValue({
        ok: false,
        kind: 'replace_failed',
        status: 400,
        message: 'Failed to replace cards in deck',
        details: 'does not exist'
      });
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuth
      };
      const res = await request(buildApp(deps))
        .put('/decks/d1/cards')
        .send({ cards: [{ cardType: 'character', cardId: 'x', quantity: 1 }] })
        .expect(400);
      expect(res.body.errors[0].code).toBe('DECK_CARDS_REPLACE_FAILED');
    });

    it('DELETE returns 200 after remove', async () => {
      const deckCardsService = stubDeckCards();
      (deckCardsService.deleteCards as jest.Mock).mockResolvedValue({ ok: true, data: sampleDetail });
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuth
      };
      const res = await request(buildApp(deps))
        .delete('/decks/d1/cards')
        .send({ cardType: 'character', cardId: 'x', quantity: 1 })
        .expect(200);
      expect(res.body.data).toEqual(sampleDetail);
    });

    it('DELETE returns 403 for GUEST', async () => {
      const deckCardsService = stubDeckCards();
      const deps: DecksV1HttpDeps = {
        deckListService,
        deckWriteService,
        deckDetailService: stubDetail(),
        deckBackgroundService: noopDeckBackground,
        deckCardsService,
        deckRepository: stubDeckRepository(),
        authenticateUser: passAuthGuest
      };
      await request(buildApp(deps))
        .delete('/decks/d1/cards')
        .send({ cardType: 'character', cardId: 'x', quantity: 1 })
        .expect(403);
      expect(deckCardsService.deleteCards).not.toHaveBeenCalled();
    });
  });
});
