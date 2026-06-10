import type { RequestHandler, Router } from 'express';
import type { RecentUpdatesService } from '../services/recentUpdatesService';
import { sendV1Json, sendV1Success } from './v1Envelope';

export interface RecentUpdatesV1HttpDeps {
  recentUpdatesService: RecentUpdatesService;
  /** Session cookie and/or Bearer JWT (same as catalog; see `createV1SessionOrBearerAuthMiddleware`). */
  catalogAuth: RequestHandler;
}

export function registerRecentUpdatesV1HttpRoutes(
  router: Router,
  deps: RecentUpdatesV1HttpDeps
): void {
  router.get('/recent-updates', deps.catalogAuth, async (_req, res) => {
    try {
      const data = await deps.recentUpdatesService.listRecentUpdates();
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 GET /recent-updates error:', error);
      sendV1Json(res, 500, null, [
        { code: 'RECENT_UPDATES_ERROR', message: 'Failed to load recent updates' }
      ]);
    }
  });
}
