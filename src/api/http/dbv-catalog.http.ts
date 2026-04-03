import type { Router } from 'express';
import { CatalogService } from '../services/catalogService';
import { sendV1Json, sendV1Success } from './v1Envelope';

export interface DbvCatalogV1HttpDeps {
  catalogService: CatalogService;
}

export function registerDbvCatalogV1HttpRoutes(router: Router, deps: DbvCatalogV1HttpDeps): void {
  router.get('/catalog/characters', async (_req, res) => {
    try {
      const data = await deps.catalogService.getAllCharacters();
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 /catalog/characters error:', error);
      sendV1Json(res, 500, null, [
        { code: 'CATALOG_ERROR', message: 'Failed to fetch characters' }
      ]);
    }
  });

  router.get('/catalog/locations', async (_req, res) => {
    try {
      const data = await deps.catalogService.getAllLocations();
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 /catalog/locations error:', error);
      sendV1Json(res, 500, null, [
        { code: 'CATALOG_ERROR', message: 'Failed to fetch locations' }
      ]);
    }
  });

  router.get('/catalog/special-cards', async (_req, res) => {
    try {
      const data = await deps.catalogService.getAllSpecialCards();
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 /catalog/special-cards error:', error);
      sendV1Json(res, 500, null, [
        { code: 'CATALOG_ERROR', message: 'Failed to fetch special cards' }
      ]);
    }
  });

  router.get('/catalog/missions', async (_req, res) => {
    try {
      const data = await deps.catalogService.getAllMissions();
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 /catalog/missions error:', error);
      sendV1Json(res, 500, null, [
        { code: 'CATALOG_ERROR', message: 'Failed to fetch missions' }
      ]);
    }
  });
}
