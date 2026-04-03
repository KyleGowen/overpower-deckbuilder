import express from 'express';
import request from 'supertest';
import { registerDbvSupportV1HttpRoutes } from '../../../../src/api/http/dbv-support.http';
import type { DbvSupportService } from '../../../../src/api/services/dbvSupportService';

function buildApp(service: DbvSupportService): express.Application {
  const app = express();
  const router = express.Router();
  registerDbvSupportV1HttpRoutes(router, { dbvSupportService: service });
  app.use(router);
  return app;
}

describe('dbv-support.http', () => {
  it('GET /dbv/sets returns v1 envelope with data', async () => {
    const service = {
      getAllSets: jest.fn().mockResolvedValue([{ code: 'ERB', name: 'Edgar Rice Burroughs…' }])
    } as unknown as DbvSupportService;
    const res = await request(buildApp(service)).get('/dbv/sets').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.meta).toEqual({});
    expect(res.body.data).toEqual([{ code: 'ERB', name: 'Edgar Rice Burroughs…' }]);
  });

  it('GET /dbv/sets returns 500 on service error', async () => {
    const service = {
      getAllSets: jest.fn().mockRejectedValue(new Error('db down'))
    } as unknown as DbvSupportService;
    const res = await request(buildApp(service)).get('/dbv/sets').expect(500);
    expect(res.body.data).toBeNull();
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].code).toBe('DBV_SUPPORT_ERROR');
  });
});
