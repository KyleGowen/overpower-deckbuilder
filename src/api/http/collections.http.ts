import type { RequestHandler, Router } from 'express';
import type { CollectionService } from '../../services/collectionService';
import type { CollectionMeV1DataDto } from '../dto/v1/CollectionMeV1DataDto';
import { isValidCollectionCardType } from '../../validation/collectionCardType';
import { setPrivateUserCacheHeaders } from './privateUserCache';
import { sendV1Json, sendV1Success } from './v1Envelope';

export interface CollectionsV1HttpDeps {
  collectionService: CollectionService;
  authenticateUser: RequestHandler;
}

function firstQueryString(q: unknown): string | undefined {
  if (typeof q === 'string' && q.length > 0) return q;
  if (Array.isArray(q) && typeof q[0] === 'string') return q[0];
  return undefined;
}

export function registerCollectionsV1HttpRoutes(router: Router, deps: CollectionsV1HttpDeps): void {
  router.get('/collections/me', deps.authenticateUser, async (req, res) => {
    try {
      const userId = req.user!.id;
      const collectionId = await deps.collectionService.getOrCreateCollection(userId);
      const data: CollectionMeV1DataDto = { id: collectionId, user_id: userId };
      setPrivateUserCacheHeaders(res);
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 GET /collections/me error:', error);
      sendV1Json(res, 500, null, [{ code: 'COLLECTION_ME_ERROR', message: 'Failed to get collection' }]);
    }
  });

  router.get('/collections/me/cards', deps.authenticateUser, async (req, res) => {
    try {
      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const cards = await deps.collectionService.getCollectionCards(collectionId);
      setPrivateUserCacheHeaders(res);
      sendV1Success(res, cards);
    } catch (error) {
      console.error('v1 GET /collections/me/cards error:', error);
      const message =
        error instanceof Error && error.message ? error.message : 'Failed to get collection cards';
      sendV1Json(res, 500, null, [{ code: 'COLLECTION_CARDS_FETCH_ERROR', message }]);
    }
  });

  router.get('/collections/me/history', deps.authenticateUser, async (req, res) => {
    try {
      const limitRaw = firstQueryString(req.query.limit);
      let limit: number | undefined;
      if (limitRaw !== undefined) {
        const n = parseInt(limitRaw, 10);
        if (Number.isNaN(n) || n < 1) {
          return sendV1Json(res, 400, null, [
            { code: 'VALIDATION_ERROR', message: 'limit must be a positive integer' }
          ]);
        }
        limit = n;
      }

      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const history = await deps.collectionService.getCollectionHistory(collectionId, limit);
      setPrivateUserCacheHeaders(res);
      sendV1Success(res, history);
    } catch (error) {
      console.error('v1 GET /collections/me/history error:', error);
      sendV1Json(res, 500, null, [
        { code: 'COLLECTION_HISTORY_ERROR', message: 'Failed to get collection history' }
      ]);
    }
  });

  router.post('/collections/me/cards', deps.authenticateUser, async (req, res) => {
    try {
      const { cardId, cardType, quantity, imagePath } = req.body as Record<string, unknown>;

      if (!cardId || !cardType) {
        return sendV1Json(res, 400, null, [
          { code: 'VALIDATION_ERROR', message: 'cardId and cardType are required' }
        ]);
      }
      if (!isValidCollectionCardType(cardType)) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'Invalid cardType' }]);
      }

      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const qty =
        typeof quantity === 'number' && !Number.isNaN(quantity) ? quantity || 1 : 1;
      const card = await deps.collectionService.addCardToCollection(
        collectionId,
        String(cardId),
        cardType,
        qty,
        typeof imagePath === 'string' ? imagePath : undefined
      );

      sendV1Success(res, card);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('does not exist')) {
        return sendV1Json(res, 404, null, [{ code: 'COLLECTION_CARD_NOT_FOUND', message: error.message }]);
      }
      console.error('v1 POST /collections/me/cards error:', error);
      const message =
        error instanceof Error && error.message ? error.message : 'Failed to add card to collection';
      sendV1Json(res, 500, null, [{ code: 'COLLECTION_CARD_ADD_ERROR', message }]);
    }
  });

  router.post('/collections/me/cards/remove-one', deps.authenticateUser, async (req, res) => {
    try {
      const { cardId, cardType, imagePath } = req.body as Record<string, unknown>;

      if (!cardId || typeof cardId !== 'string' || cardId.trim().length === 0) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'cardId is required' }]);
      }
      if (!cardType || typeof cardType !== 'string' || cardType.trim().length === 0) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'cardType is required' }]);
      }
      if (!imagePath || typeof imagePath !== 'string' || imagePath.trim().length === 0) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'imagePath is required' }]);
      }
      if (!isValidCollectionCardType(cardType)) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'Invalid cardType' }]);
      }

      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const updatedCard = await deps.collectionService.removeOneFromCollection(
        collectionId,
        cardId.trim(),
        cardType.trim(),
        imagePath.trim()
      );

      sendV1Success(res, updatedCard);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Card not found in collection')) {
        return sendV1Json(res, 404, null, [{ code: 'COLLECTION_REMOVE_ONE_NOT_FOUND', message: error.message }]);
      }
      console.error('v1 POST /collections/me/cards/remove-one error:', error);
      const message =
        error instanceof Error && error.message ? error.message : 'Failed to remove one from collection';
      sendV1Json(res, 500, null, [{ code: 'COLLECTION_REMOVE_ONE_ERROR', message }]);
    }
  });

  router.put('/collections/me/cards/:cardId', deps.authenticateUser, async (req, res) => {
    try {
      const { cardId } = req.params;
      const { quantity, cardType, imagePath, oldImagePath } = req.body as Record<string, unknown>;

      if (quantity === undefined || quantity === null) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'quantity is required' }]);
      }

      if (!cardType) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'cardType is required' }]);
      }
      if (!isValidCollectionCardType(cardType)) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'Invalid cardType' }]);
      }

      if (!imagePath) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'imagePath is required' }]);
      }

      if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'quantity must be a number' }]);
      }
      if (quantity < 0) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'Quantity cannot be negative' }]);
      }

      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const updatedCard = await deps.collectionService.updateCardQuantity(
        collectionId,
        cardId,
        cardType,
        quantity,
        String(imagePath),
        typeof oldImagePath === 'string' ? oldImagePath : undefined
      );

      if (updatedCard === null && quantity === 0) {
        sendV1Success(res, null);
      } else if (updatedCard === null) {
        sendV1Json(res, 404, null, [{ code: 'COLLECTION_CARD_NOT_IN_COLLECTION', message: 'Card not found in collection' }]);
      } else {
        sendV1Success(res, updatedCard);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('cannot be negative')) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: error.message }]);
      }
      console.error('v1 PUT /collections/me/cards/:cardId error:', error);
      const message =
        error instanceof Error && error.message ? error.message : 'Failed to update card quantity';
      sendV1Json(res, 500, null, [{ code: 'COLLECTION_CARD_UPDATE_ERROR', message }]);
    }
  });

  router.delete('/collections/me/cards/:cardId', deps.authenticateUser, async (req, res) => {
    try {
      const { cardId } = req.params;
      const cardType = firstQueryString(req.query.cardType);

      if (!cardType) {
        return sendV1Json(res, 400, null, [
          { code: 'VALIDATION_ERROR', message: 'cardType query parameter is required' }
        ]);
      }
      if (!isValidCollectionCardType(cardType)) {
        return sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: 'Invalid cardType' }]);
      }

      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const ok = await deps.collectionService.removeCardFromCollection(collectionId, cardId, cardType);

      if (ok) {
        sendV1Success(res, { message: 'Card removed from collection' });
      } else {
        sendV1Json(res, 404, null, [{ code: 'COLLECTION_CARD_NOT_IN_COLLECTION', message: 'Card not found in collection' }]);
      }
    } catch (error) {
      console.error('v1 DELETE /collections/me/cards/:cardId error:', error);
      sendV1Json(res, 500, null, [{ code: 'COLLECTION_CARD_DELETE_ERROR', message: 'Failed to remove card from collection' }]);
    }
  });
}
