import express, { type Request, type RequestHandler } from 'express';
import request from 'supertest';
import {
  registerCollectionsV1HttpRoutes,
  type CollectionsV1HttpDeps
} from '../../../../src/api/http/collections.http';
import type { CollectionService } from '../../../../src/services/collectionService';

const passAuth: RequestHandler = (req: Request, _res, next) => {
  (req as Request & { user?: { id: string; name: string; email: string; role: string } }).user = {
    id: 'user-1',
    name: 't',
    email: 't@example.com',
    role: 'USER'
  };
  next();
};

function buildApp(deps: CollectionsV1HttpDeps): express.Application {
  const app = express();
  app.use(express.json());
  const router = express.Router();
  registerCollectionsV1HttpRoutes(router, deps);
  app.use(router);
  return app;
}

function stubCollectionService(over: Partial<CollectionService> = {}): CollectionService {
  return {
    getOrCreateCollection: jest.fn().mockResolvedValue('col-uuid'),
    getCollectionCards: jest.fn().mockResolvedValue([]),
    getCollectionHistory: jest.fn().mockResolvedValue([]),
    addCardToCollection: jest.fn(),
    updateCardQuantity: jest.fn(),
    removeOneFromCollection: jest.fn(),
    removeCardFromCollection: jest.fn(),
    ...over
  } as unknown as CollectionService;
}

describe('collections.http', () => {
  it('GET /collections/me returns v1 envelope when authenticated', async () => {
    const collectionService = stubCollectionService({
      getOrCreateCollection: jest.fn().mockResolvedValue('col-uuid')
    });
    const deps: CollectionsV1HttpDeps = {
      collectionService,
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).get('/collections/me').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual({ id: 'col-uuid', user_id: 'user-1' });
    expect(res.headers['cache-control']).toBe('private, max-age=0, must-revalidate');
    expect(res.headers.vary).toContain('Cookie');
    expect(collectionService.getOrCreateCollection).toHaveBeenCalledWith('user-1');
  });

  it('GET /collections/me returns 500 on service error', async () => {
    const collectionService = stubCollectionService({
      getOrCreateCollection: jest.fn().mockRejectedValue(new Error('db'))
    });
    const deps: CollectionsV1HttpDeps = {
      collectionService,
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).get('/collections/me').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].code).toBe('COLLECTION_ME_ERROR');
  });

  it('GET /collections/me/cards returns card rows', async () => {
    const rows = [{ id: 'r1', card_id: 'c1', card_type: 'character', quantity: 1, image_path: '/a.webp' }];
    const collectionService = stubCollectionService({
      getCollectionCards: jest.fn().mockResolvedValue(rows)
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/collections/me/cards').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toEqual(rows);
    expect(res.headers['cache-control']).toBe('private, max-age=0, must-revalidate');
    expect(res.headers.vary).toContain('Cookie');
  });

  it('GET /collections/me/cards returns 500 on error', async () => {
    const collectionService = stubCollectionService({
      getCollectionCards: jest.fn().mockRejectedValue(new Error('db'))
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/collections/me/cards').expect(500);
    expect(res.body.errors[0].code).toBe('COLLECTION_CARDS_FETCH_ERROR');
  });

  it('POST /collections/me/cards validates body', async () => {
    const collectionService = stubCollectionService();
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/collections/me/cards')
      .send({ cardType: 'character' })
      .expect(400);
    expect(res.body.errors[0].message).toContain('cardId and cardType');
    expect(collectionService.addCardToCollection).not.toHaveBeenCalled();
  });

  it('POST /collections/me/cards rejects invalid cardType', async () => {
    const collectionService = stubCollectionService();
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/collections/me/cards')
      .send({ cardId: 'x', cardType: 'bogus' })
      .expect(400);
    expect(res.body.errors[0].message).toContain('Invalid cardType');
  });

  it('POST /collections/me/cards adds card', async () => {
    const added = { card_id: 'c1', card_type: 'character', quantity: 1, image_path: '/i.webp' };
    const collectionService = stubCollectionService({
      addCardToCollection: jest.fn().mockResolvedValue(added)
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/collections/me/cards')
      .send({ cardId: 'c1', cardType: 'character', quantity: 2, imagePath: '/i.webp' })
      .expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toEqual(added);
    expect(collectionService.addCardToCollection).toHaveBeenCalledWith('col-uuid', 'c1', 'character', 2, '/i.webp');
  });

  it('POST /collections/me/cards returns 404 when card missing in catalog', async () => {
    const collectionService = stubCollectionService({
      addCardToCollection: jest.fn().mockRejectedValue(new Error('Card with ID x does not exist in table character'))
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/collections/me/cards')
      .send({ cardId: 'x', cardType: 'character', imagePath: '/i.webp' })
      .expect(404);
    expect(res.body.errors[0].code).toBe('COLLECTION_CARD_NOT_FOUND');
  });

  it('POST /collections/me/cards/remove-one validates fields', async () => {
    const collectionService = stubCollectionService();
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/collections/me/cards/remove-one')
      .send({ cardId: 'c1', cardType: 'character' })
      .expect(400);
    expect(res.body.errors[0].message).toContain('imagePath');
  });

  it('POST /collections/me/cards/remove-one removes one', async () => {
    const updated = { card_id: 'c1', card_type: 'character', quantity: 1, image_path: '/i.webp' };
    const collectionService = stubCollectionService({
      removeOneFromCollection: jest.fn().mockResolvedValue(updated)
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/collections/me/cards/remove-one')
      .send({ cardId: 'c1', cardType: 'character', imagePath: '/i.webp' })
      .expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toEqual(updated);
  });

  it('POST /collections/me/cards/remove-one returns 404 when not in collection', async () => {
    const collectionService = stubCollectionService({
      removeOneFromCollection: jest
        .fn()
        .mockRejectedValue(new Error('Card not found in collection or quantity already 0'))
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/collections/me/cards/remove-one')
      .send({ cardId: 'c1', cardType: 'character', imagePath: '/i.webp' })
      .expect(404);
    expect(res.body.errors[0].code).toBe('COLLECTION_REMOVE_ONE_NOT_FOUND');
  });

  it('PUT /collections/me/cards/:cardId validates quantity', async () => {
    const collectionService = stubCollectionService();
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .put('/collections/me/cards/c1')
      .send({ cardType: 'character', imagePath: '/i.webp' })
      .expect(400);
    expect(res.body.errors[0].message).toContain('quantity is required');
  });

  it('PUT /collections/me/cards/:cardId updates quantity', async () => {
    const updated = { card_id: 'c1', card_type: 'character', quantity: 3, image_path: '/i.webp' };
    const collectionService = stubCollectionService({
      updateCardQuantity: jest.fn().mockResolvedValue(updated)
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .put('/collections/me/cards/c1')
      .send({ quantity: 3, cardType: 'character', imagePath: '/i.webp' })
      .expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toEqual(updated);
  });

  it('PUT /collections/me/cards/:cardId returns null data when quantity 0 removes row', async () => {
    const collectionService = stubCollectionService({
      updateCardQuantity: jest.fn().mockResolvedValue(null)
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .put('/collections/me/cards/c1')
      .send({ quantity: 0, cardType: 'character', imagePath: '/i.webp' })
      .expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toBeNull();
  });

  it('PUT /collections/me/cards/:cardId returns 404 when card not found', async () => {
    const collectionService = stubCollectionService({
      updateCardQuantity: jest.fn().mockResolvedValue(null)
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .put('/collections/me/cards/c1')
      .send({ quantity: 2, cardType: 'character', imagePath: '/i.webp' })
      .expect(404);
    expect(res.body.errors[0].code).toBe('COLLECTION_CARD_NOT_IN_COLLECTION');
  });

  it('DELETE /collections/me/cards/:cardId requires cardType query', async () => {
    const collectionService = stubCollectionService();
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).delete('/collections/me/cards/c1').expect(400);
    expect(res.body.errors[0].message).toContain('cardType query parameter');
  });

  it('DELETE /collections/me/cards/:cardId removes card', async () => {
    const collectionService = stubCollectionService({
      removeCardFromCollection: jest.fn().mockResolvedValue(true)
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .delete('/collections/me/cards/c1?cardType=character')
      .expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data.message).toContain('removed');
  });

  it('DELETE /collections/me/cards/:cardId returns 404 when not found', async () => {
    const collectionService = stubCollectionService({
      removeCardFromCollection: jest.fn().mockResolvedValue(false)
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .delete('/collections/me/cards/c1?cardType=character')
      .expect(404);
    expect(res.body.errors[0].code).toBe('COLLECTION_CARD_NOT_IN_COLLECTION');
  });

  it('GET /collections/me/history returns history rows', async () => {
    const entries = [
      {
        id: 'h1',
        collection_id: 'col-uuid',
        card_id: 'c1',
        action: 'ADD' as const,
        new_quantity: 1,
        created_at: '2020-01-01T00:00:00.000Z'
      }
    ];
    const collectionService = stubCollectionService({
      getCollectionHistory: jest.fn().mockResolvedValue(entries)
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/collections/me/history').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toEqual(entries);
    expect(res.headers['cache-control']).toBe('private, max-age=0, must-revalidate');
    expect(res.headers.vary).toContain('Cookie');
    expect(collectionService.getCollectionHistory).toHaveBeenCalledWith('col-uuid', undefined);
  });

  it('GET /collections/me/history passes limit query', async () => {
    const collectionService = stubCollectionService({
      getCollectionHistory: jest.fn().mockResolvedValue([])
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    await request(buildApp(deps)).get('/collections/me/history?limit=50').expect(200);
    expect(collectionService.getCollectionHistory).toHaveBeenCalledWith('col-uuid', 50);
  });

  it('GET /collections/me/history returns 400 for invalid limit', async () => {
    const collectionService = stubCollectionService();
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/collections/me/history?limit=0').expect(400);
    expect(res.body.errors[0].message).toContain('positive integer');
    expect(collectionService.getCollectionHistory).not.toHaveBeenCalled();
  });

  it('GET /collections/me/history returns 500 on service error', async () => {
    const collectionService = stubCollectionService({
      getCollectionHistory: jest.fn().mockRejectedValue(new Error('db'))
    });
    const deps: CollectionsV1HttpDeps = { collectionService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).get('/collections/me/history').expect(500);
    expect(res.body.errors[0].code).toBe('COLLECTION_HISTORY_ERROR');
  });
});
