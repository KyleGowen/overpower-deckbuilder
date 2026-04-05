import express, { type RequestHandler } from 'express';
import request from 'supertest';
import {
  registerDbvSupportV1HttpRoutes,
  type DbvSupportV1HttpDeps
} from '../../../../src/api/http/dbv-support.http';
import type { DbvSupportService } from '../../../../src/api/services/dbvSupportService';

const passCatalogAuth: RequestHandler = (_req, _res, next) => {
  next();
};

function buildApp(deps: DbvSupportV1HttpDeps): express.Application {
  const app = express();
  const router = express.Router();
  registerDbvSupportV1HttpRoutes(router, deps);
  app.use(router);
  return app;
}

describe('dbv-support.http', () => {
  const emptySetsService = {
    getAllSets: jest.fn().mockResolvedValue([])
  } as unknown as DbvSupportService;

  const emptyBackgrounds = {
    getAvailableBackgrounds: jest.fn().mockResolvedValue([]),
    validateBackgroundPath: jest.fn().mockResolvedValue(true)
  };

  it('GET /dbv/sets returns v1 envelope with data', async () => {
    const dbvSupportService = {
      getAllSets: jest.fn().mockResolvedValue([{ code: 'ERB', name: 'Edgar Rice Burroughs…' }])
    } as unknown as DbvSupportService;
    const deps: DbvSupportV1HttpDeps = {
      dbvSupportService,
      catalogAuth: passCatalogAuth,
      deckBackgroundService: emptyBackgrounds
    };
    const res = await request(buildApp(deps)).get('/dbv/sets').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual([{ code: 'ERB', name: 'Edgar Rice Burroughs…' }]);
  });

  it('GET /dbv/sets returns 500 on service error', async () => {
    const dbvSupportService = {
      getAllSets: jest.fn().mockRejectedValue(new Error('db down'))
    } as unknown as DbvSupportService;
    const deps: DbvSupportV1HttpDeps = {
      dbvSupportService,
      catalogAuth: passCatalogAuth,
      deckBackgroundService: emptyBackgrounds
    };
    const res = await request(buildApp(deps)).get('/dbv/sets').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].code).toBe('DBV_SUPPORT_ERROR');
  });

  it('GET /dbv/deck-backgrounds returns v1 envelope when authenticated', async () => {
    const paths = ['src/resources/images/backgrounds/landscape/x.png'];
    const deckBackgroundService = {
      getAvailableBackgrounds: jest.fn().mockResolvedValue(paths),
      validateBackgroundPath: jest.fn().mockResolvedValue(true)
    };
    const deps: DbvSupportV1HttpDeps = {
      dbvSupportService: emptySetsService,
      catalogAuth: passCatalogAuth,
      deckBackgroundService
    };
    const res = await request(buildApp(deps)).get('/dbv/deck-backgrounds').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toEqual(paths);
  });

  it('GET /dbv/deck-backgrounds returns 500 on service error', async () => {
    const deckBackgroundService = {
      getAvailableBackgrounds: jest.fn().mockRejectedValue(new Error('fs')),
      validateBackgroundPath: jest.fn().mockResolvedValue(true)
    };
    const deps: DbvSupportV1HttpDeps = {
      dbvSupportService: emptySetsService,
      catalogAuth: passCatalogAuth,
      deckBackgroundService
    };
    const res = await request(buildApp(deps)).get('/dbv/deck-backgrounds').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].code).toBe('DBV_SUPPORT_ERROR');
  });
});
