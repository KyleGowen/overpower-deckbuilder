import express from 'express';
import {
  buildEndpointMetricKey,
  enumerateExpressRoutes,
  normalizeEndpointPath,
  pruneStaleEndpointHitCounts
} from '../../../src/metrics/endpointHitMetrics';

describe('endpointHitMetrics', () => {
  describe('normalizeEndpointPath', () => {
    it('collapses duplicate slashes', () => {
      expect(normalizeEndpointPath('//api//v1//x')).toBe('/api/v1/x');
    });
  });

  describe('enumerateExpressRoutes', () => {
    it('includes nested router routes with METHOD and full mount path', () => {
      const app = express();
      const r = express.Router();
      r.get('/catalog/characters', (_q, s) => s.end());
      app.use('/api/v1', r);
      const keys = enumerateExpressRoutes(app);
      expect(keys).toContain('GET /api/v1/catalog/characters');
      expect(keys).toContain('HEAD /api/v1/catalog/characters');
    });

    it('includes param routes in mount path', () => {
      const app = express();
      const r = express.Router();
      r.post('/x', (_q, s) => s.end());
      app.use('/prefix/:foo', r);
      const keys = enumerateExpressRoutes(app);
      expect(keys.some((k) => k.includes('/prefix/:foo'))).toBe(true);
      expect(keys).toContain('POST /prefix/:foo/x');
    });
  });

  describe('buildEndpointMetricKey', () => {
    it('returns METHOD baseUrl+route.path', () => {
      expect(
        buildEndpointMetricKey({
          method: 'get',
          baseUrl: '/api/v1',
          route: { path: '/decks/:id' }
        })
      ).toBe('GET /api/v1/decks/:id');
    });

    it('returns null when no route matched', () => {
      const req = { method: 'GET', baseUrl: '' };
      expect(buildEndpointMetricKey(req)).toBeNull();
    });
  });

  describe('pruneStaleEndpointHitCounts', () => {
    it('runs DELETE with current route keys', async () => {
      const pool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 })
      };
      await pruneStaleEndpointHitCounts(pool as never, ['GET /a', 'POST /b']);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('DELETE FROM endpoint_hit_counts');
      expect(pool.query.mock.calls[0][1]).toEqual([['GET /a', 'POST /b']]);
    });

    it('does not query when keys is empty', async () => {
      const pool = { query: jest.fn() };
      await pruneStaleEndpointHitCounts(pool as never, []);
      expect(pool.query).not.toHaveBeenCalled();
    });
  });
});
