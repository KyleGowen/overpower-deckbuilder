import express from 'express';
import request from 'supertest';
import { registerDbvCatalogV1HttpRoutes } from '../../../../src/api/http/dbv-catalog.http';
import { CatalogService } from '../../../../src/api/services/catalogService';

function buildApp(catalogService: CatalogService): express.Application {
  const app = express();
  const router = express.Router();
  registerDbvCatalogV1HttpRoutes(router, { catalogService });
  app.use(router);
  return app;
}

describe('dbv-catalog.http', () => {
  it('GET /catalog/characters returns v1 envelope with data', async () => {
    const catalogService = new CatalogService({
      getAllCharacters: jest.fn().mockResolvedValue([{ id: 'c1', name: 'Hero' }])
    });
    const res = await request(buildApp(catalogService)).get('/catalog/characters').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual([{ id: 'c1', name: 'Hero' }]);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /catalog/characters returns 500 on service error', async () => {
    const catalogService = new CatalogService({
      getAllCharacters: jest.fn().mockRejectedValue(new Error('db down'))
    });
    const res = await request(buildApp(catalogService)).get('/catalog/characters').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].code).toBe('CATALOG_ERROR');
  });
});
