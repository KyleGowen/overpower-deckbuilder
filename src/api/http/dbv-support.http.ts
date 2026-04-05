import type { RequestHandler, Router } from 'express';
import { DbvSupportService } from '../services/dbvSupportService';
import { sendV1Json, sendV1Success } from './v1Envelope';

export interface DeckBackgroundListReader {
  getAvailableBackgrounds(): Promise<string[]>;
  validateBackgroundPath(imagePath: string | null): Promise<boolean>;
}

export interface DbvSupportV1HttpDeps {
  dbvSupportService: DbvSupportService;
  /** Session cookie and/or Bearer JWT (same as catalog; see `createV1SessionOrBearerAuthMiddleware`). */
  catalogAuth: RequestHandler;
  deckBackgroundService: DeckBackgroundListReader;
}

export function registerDbvSupportV1HttpRoutes(router: Router, deps: DbvSupportV1HttpDeps): void {
  router.get('/dbv/sets', deps.catalogAuth, async (_req, res) => {
    try {
      const data = await deps.dbvSupportService.getAllSets();
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 /dbv/sets error:', error);
      sendV1Json(res, 500, null, [{ code: 'DBV_SUPPORT_ERROR', message: 'Failed to load sets' }]);
    }
  });

  router.get('/dbv/deck-backgrounds', deps.catalogAuth, async (_req, res) => {
    try {
      const data = await deps.deckBackgroundService.getAvailableBackgrounds();
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 /dbv/deck-backgrounds error:', error);
      sendV1Json(res, 500, null, [
        { code: 'DBV_SUPPORT_ERROR', message: 'Failed to fetch background images' }
      ]);
    }
  });
}
