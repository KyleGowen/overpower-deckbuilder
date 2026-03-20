import type { Application, Request, Response } from 'express';
import type { Pool } from 'pg';
import type { RouteDependencies } from './types';
import { listAllSets } from '../database/setsLookup';

type SetsRoutesDeps = Pick<RouteDependencies, 'dataSource'>;

/**
 * Read-only reference data for card sets (code → display name).
 */
export function registerSetsRoutes(app: Application, deps: SetsRoutesDeps): void {
  app.get('/api/sets', async (_req: Request, res: Response) => {
    try {
      const pool = deps.dataSource.getPool() as Pool;
      const data = await listAllSets(pool);
      res.json({ success: true, data });
    } catch (error) {
      console.error('GET /api/sets:', error);
      res.status(500).json({ success: false, error: 'Failed to load sets' });
    }
  });
}
