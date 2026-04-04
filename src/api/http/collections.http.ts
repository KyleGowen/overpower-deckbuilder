import type { RequestHandler, Router } from 'express';
import type { CollectionService } from '../../services/collectionService';
import type { CollectionMeV1DataDto } from '../dto/v1/CollectionMeV1DataDto';
import { sendV1Json, sendV1Success } from './v1Envelope';

export interface CollectionsV1HttpDeps {
  collectionService: Pick<CollectionService, 'getOrCreateCollection'>;
  authenticateUser: RequestHandler;
}

export function registerCollectionsV1HttpRoutes(router: Router, deps: CollectionsV1HttpDeps): void {
  router.get('/collections/me', deps.authenticateUser, async (req, res) => {
    try {
      const userId = req.user!.id;
      const collectionId = await deps.collectionService.getOrCreateCollection(userId);
      const data: CollectionMeV1DataDto = { id: collectionId, user_id: userId };
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 GET /collections/me error:', error);
      sendV1Json(res, 500, null, [
        { code: 'COLLECTION_ME_ERROR', message: 'Failed to get collection' }
      ]);
    }
  });
}
