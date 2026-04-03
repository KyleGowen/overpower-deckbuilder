import express from 'express';
import request from 'supertest';
import { registerDbvCatalogV1HttpRoutes } from '../../../../src/api/http/dbv-catalog.http';
import type { CatalogCardRepository } from '../../../../src/api/services/catalogService';
import { CatalogService } from '../../../../src/api/services/catalogService';

const foilStub = () => ({ getFoilCardMap: jest.fn().mockResolvedValue([]) });

function buildApp(catalogService: CatalogService): express.Application {
  const app = express();
  const router = express.Router();
  registerDbvCatalogV1HttpRoutes(router, { catalogService });
  app.use(router);
  return app;
}

describe('dbv-catalog.http', () => {
  it('GET /catalog/characters returns v1 envelope with data', async () => {
    const cards: Partial<CatalogCardRepository> = {
      getAllCharacters: jest.fn().mockResolvedValue([{ id: 'c1', name: 'Hero' }])
    };
    const catalogService = new CatalogService(cards as CatalogCardRepository, foilStub());
    const res = await request(buildApp(catalogService)).get('/catalog/characters').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual([{ id: 'c1', name: 'Hero' }]);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /catalog/characters returns 500 on service error', async () => {
    const cards: Partial<CatalogCardRepository> = {
      getAllCharacters: jest.fn().mockRejectedValue(new Error('db down'))
    };
    const catalogService = new CatalogService(cards as CatalogCardRepository, foilStub());
    const res = await request(buildApp(catalogService)).get('/catalog/characters').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].code).toBe('CATALOG_ERROR');
  });

  it('GET /catalog/locations returns v1 envelope with data', async () => {
    const cards: Partial<CatalogCardRepository> = {
      getAllLocations: jest.fn().mockResolvedValue([{ id: 'l1', name: 'Gotham' }])
    };
    const catalogService = new CatalogService(cards as CatalogCardRepository, foilStub());
    const res = await request(buildApp(catalogService)).get('/catalog/locations').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual([{ id: 'l1', name: 'Gotham' }]);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /catalog/locations returns 500 on service error', async () => {
    const cards: Partial<CatalogCardRepository> = {
      getAllLocations: jest.fn().mockRejectedValue(new Error('db down'))
    };
    const catalogService = new CatalogService(cards as CatalogCardRepository, foilStub());
    const res = await request(buildApp(catalogService)).get('/catalog/locations').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].code).toBe('CATALOG_ERROR');
  });

  it('GET /catalog/special-cards returns v1 envelope with data', async () => {
    const cards: Partial<CatalogCardRepository> = {
      getAllSpecialCards: jest.fn().mockResolvedValue([{ id: 's1', name: 'Ancient Wisdom' }])
    };
    const catalogService = new CatalogService(cards as CatalogCardRepository, foilStub());
    const res = await request(buildApp(catalogService)).get('/catalog/special-cards').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual([{ id: 's1', name: 'Ancient Wisdom' }]);
  });

  it('GET /catalog/special-cards returns 500 on service error', async () => {
    const cards: Partial<CatalogCardRepository> = {
      getAllSpecialCards: jest.fn().mockRejectedValue(new Error('db down'))
    };
    const catalogService = new CatalogService(cards as CatalogCardRepository, foilStub());
    const res = await request(buildApp(catalogService)).get('/catalog/special-cards').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].code).toBe('CATALOG_ERROR');
  });

  it('GET /catalog/missions returns v1 envelope with data', async () => {
    const cards: Partial<CatalogCardRepository> = {
      getAllMissions: jest.fn().mockResolvedValue([{ id: 'm1', card_name: 'Test Mission' }])
    };
    const catalogService = new CatalogService(cards as CatalogCardRepository, foilStub());
    const res = await request(buildApp(catalogService)).get('/catalog/missions').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual([{ id: 'm1', card_name: 'Test Mission' }]);
  });

  it('GET /catalog/missions returns 500 on service error', async () => {
    const cards: Partial<CatalogCardRepository> = {
      getAllMissions: jest.fn().mockRejectedValue(new Error('db down'))
    };
    const catalogService = new CatalogService(cards as CatalogCardRepository, foilStub());
    const res = await request(buildApp(catalogService)).get('/catalog/missions').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].code).toBe('CATALOG_ERROR');
  });
});
