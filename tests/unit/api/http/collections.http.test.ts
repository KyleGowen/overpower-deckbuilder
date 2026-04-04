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
  const router = express.Router();
  registerCollectionsV1HttpRoutes(router, deps);
  app.use(router);
  return app;
}

describe('collections.http', () => {
  it('GET /collections/me returns v1 envelope when authenticated', async () => {
    const collectionService = {
      getOrCreateCollection: jest.fn().mockResolvedValue('col-uuid')
    } as unknown as Pick<CollectionService, 'getOrCreateCollection'>;
    const deps: CollectionsV1HttpDeps = {
      collectionService,
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).get('/collections/me').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual({ id: 'col-uuid', user_id: 'user-1' });
    expect(collectionService.getOrCreateCollection).toHaveBeenCalledWith('user-1');
  });

  it('GET /collections/me returns 500 on service error', async () => {
    const collectionService = {
      getOrCreateCollection: jest.fn().mockRejectedValue(new Error('db'))
    } as unknown as Pick<CollectionService, 'getOrCreateCollection'>;
    const deps: CollectionsV1HttpDeps = {
      collectionService,
      authenticateUser: passAuth
    };
    const res = await request(buildApp(deps)).get('/collections/me').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].code).toBe('COLLECTION_ME_ERROR');
  });
});
