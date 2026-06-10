import express, { type RequestHandler } from 'express';
import request from 'supertest';
import {
  registerRecentUpdatesV1HttpRoutes,
  type RecentUpdatesV1HttpDeps
} from '../../../../src/api/http/recent-updates.http';
import type { RecentUpdatesService } from '../../../../src/api/services/recentUpdatesService';

const passCatalogAuth: RequestHandler = (_req, _res, next) => {
  next();
};

function buildApp(deps: RecentUpdatesV1HttpDeps): express.Application {
  const app = express();
  const router = express.Router();
  registerRecentUpdatesV1HttpRoutes(router, deps);
  app.use(router);
  return app;
}

describe('recent-updates.http', () => {
  const sampleRow = {
    id: 'a1000001-0000-4000-8000-000000000001',
    title: 'A fresh new Excelsior',
    type: 'update',
    description: 'The site has been rebuilt from the ground up.',
    cardImageUrl: 'characters/carson_of_venus.webp',
    createdAt: '2026-06-09T12:00:00.000Z',
    updatedAt: '2026-06-09T12:00:00.000Z'
  };

  it('GET /recent-updates returns v1 envelope with data', async () => {
    const recentUpdatesService = {
      listRecentUpdates: jest.fn().mockResolvedValue([sampleRow])
    } as unknown as RecentUpdatesService;
    const deps: RecentUpdatesV1HttpDeps = {
      recentUpdatesService,
      catalogAuth: passCatalogAuth
    };
    const res = await request(buildApp(deps)).get('/recent-updates').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toEqual([sampleRow]);
  });

  it('GET /recent-updates returns 500 on service error', async () => {
    const recentUpdatesService = {
      listRecentUpdates: jest.fn().mockRejectedValue(new Error('db down'))
    } as unknown as RecentUpdatesService;
    const deps: RecentUpdatesV1HttpDeps = {
      recentUpdatesService,
      catalogAuth: passCatalogAuth
    };
    const res = await request(buildApp(deps)).get('/recent-updates').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].code).toBe('RECENT_UPDATES_ERROR');
  });
});
