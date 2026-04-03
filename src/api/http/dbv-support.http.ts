import type { Router } from 'express';
import { DbvSupportService } from '../services/dbvSupportService';
import { sendV1Json, sendV1Success } from './v1Envelope';

export interface DbvSupportV1HttpDeps {
  dbvSupportService: DbvSupportService;
}

export function registerDbvSupportV1HttpRoutes(router: Router, deps: DbvSupportV1HttpDeps): void {
  router.get('/dbv/sets', async (_req, res) => {
    try {
      const data = await deps.dbvSupportService.getAllSets();
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 /dbv/sets error:', error);
      sendV1Json(res, 500, null, [{ code: 'DBV_SUPPORT_ERROR', message: 'Failed to load sets' }]);
    }
  });
}
