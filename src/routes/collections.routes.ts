import express, { Request } from 'express';
import type { CollectionRoutesDeps } from './types';

/** Legacy collection routes: history only (P3c). Card CRUD lives under `/api/v1/collections/me/cards` — see API_V1.md. */
export function registerCollectionRoutes(app: express.Application, deps: CollectionRoutesDeps): void {
  app.get('/api/collections/me/history', deps.authenticateUser, async (req: Request, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      if (limit !== undefined && (isNaN(limit) || limit < 1)) {
        return res.status(400).json({ success: false, error: 'limit must be a positive integer' });
      }

      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const history = await deps.collectionService.getCollectionHistory(collectionId, limit);

      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Error getting collection history:', error);
      res.status(500).json({ success: false, error: 'Failed to get collection history' });
    }
  });
}
