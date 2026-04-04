import express, { Request } from 'express';
import { isValidCollectionCardType } from './helpers';
import type { CollectionRoutesDeps } from './types';

export function registerCollectionRoutes(app: express.Application, deps: CollectionRoutesDeps): void {
  // Get all cards in user's collection
  app.get('/api/collections/me/cards', deps.authenticateUser, async (req: Request, res) => {
    try {
      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const cards = await deps.collectionService.getCollectionCards(collectionId);
      res.json({ success: true, data: cards });
    } catch (error: unknown) {
      console.error('Error getting collection cards:', error);
      const errorMessage = (error as { message?: string })?.message || 'Failed to get collection cards';
      res.status(500).json({ success: false, error: errorMessage });
    }
  });
  
  // Add card to collection
  app.post('/api/collections/me/cards', deps.authenticateUser, async (req: Request, res) => {
    try {
      console.log('🟢 [API] POST /api/collections/me/cards - Request received:', {
        userId: req.user!.id,
        role: req.user!.role,
        body: req.body
      });
  
      const { cardId, cardType, quantity, imagePath } = req.body;
  
      if (!cardId || !cardType) {
        return res.status(400).json({ success: false, error: 'cardId and cardType are required' });
      }
      if (!isValidCollectionCardType(cardType)) {
        return res.status(400).json({ success: false, error: 'Invalid cardType' });
      }
  
      console.log('🟢 [API] Getting or creating collection for user:', req.user!.id);
      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      console.log('🟢 [API] Collection ID:', collectionId);
      
      console.log('🟢 [API] Calling addCardToCollection with:', {
        collectionId,
        cardId,
        cardType,
        quantity: quantity || 1,
        imagePath
      });
      
    const card = (await deps.collectionService.addCardToCollection(
      collectionId,
      cardId,
      cardType,
      quantity || 1,
      imagePath
    )) as { card_id: string; card_type: string; image_path: string; quantity: number };

    console.log('🟢 [API] Successfully added card, returning:', {
      cardId: card.card_id,
      cardType: card.card_type,
      image_path: card.image_path,
      quantity: card.quantity
    });
  
      res.json({ success: true, data: card });
    } catch (error: unknown) {
      console.error('Error adding card to collection:', error);
      console.error('Request body:', req.body);
      if (error instanceof Error && error.message.includes('does not exist')) {
        return res.status(404).json({ success: false, error: error.message });
      }
      const err = error as { message?: string; stack?: string };
      const errorMessage = err?.message || 'Failed to add card to collection';
      console.error('Full error details:', {
        message: err?.message,
        stack: err?.stack,
        body: req.body
      });
      res.status(500).json({ success: false, error: errorMessage });
    }
  });
  
  // Remove one copy of a card variant from collection (respects foil/alternate art via imagePath)
  app.post('/api/collections/me/cards/remove-one', deps.authenticateUser, async (req: Request, res) => {
    try {
      const { cardId, cardType, imagePath } = req.body;
  
      if (!cardId || typeof cardId !== 'string' || cardId.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'cardId is required' });
      }
      if (!cardType || typeof cardType !== 'string' || cardType.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'cardType is required' });
      }
      if (!imagePath || typeof imagePath !== 'string' || imagePath.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'imagePath is required' });
      }
      if (!isValidCollectionCardType(cardType)) {
        return res.status(400).json({ success: false, error: 'Invalid cardType' });
      }
  
      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const updatedCard = await deps.collectionService.removeOneFromCollection(
        collectionId,
        cardId.trim(),
        cardType.trim(),
        imagePath.trim()
      );
  
      res.json({
        success: true,
        data: updatedCard,
        message: 'One copy removed from collection'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Card not found in collection')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      console.error('Error removing one from collection:', error);
      res.status(500).json({
        success: false,
        error: (error as { message?: string })?.message || 'Failed to remove one from collection'
      });
    }
  });
  
  // Update card quantity in collection
  app.put('/api/collections/me/cards/:cardId', deps.authenticateUser, async (req: Request, res) => {
    try {
      console.log('🟢 [API] PUT /api/collections/me/cards/:cardId - Request received:', {
        userId: req.user!.id,
        role: req.user!.role,
        cardId: req.params.cardId,
        body: req.body
      });
  
      const { cardId } = req.params;
      const { quantity, cardType, imagePath, oldImagePath } = req.body;
  
      if (quantity === undefined || quantity === null) {
        return res.status(400).json({ success: false, error: 'quantity is required' });
      }
  
      if (!cardType) {
        return res.status(400).json({ success: false, error: 'cardType is required' });
      }
      if (!isValidCollectionCardType(cardType)) {
        return res.status(400).json({ success: false, error: 'Invalid cardType' });
      }
  
      if (!imagePath) {
        return res.status(400).json({ success: false, error: 'imagePath is required' });
      }
  
      if (quantity < 0) {
        return res.status(400).json({ success: false, error: 'Quantity cannot be negative' });
      }
  
      console.log('🟢 [API] Getting or creating collection for user:', req.user!.id);
      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      console.log('🟢 [API] Collection ID:', collectionId);
      
      console.log('🟢 [API] Calling updateCardQuantity with:', {
        collectionId,
        cardId,
        cardType,
        quantity,
        imagePath,
        oldImagePath
      });
      
      const updatedCard = await deps.collectionService.updateCardQuantity(
        collectionId,
        cardId,
        cardType,
        quantity,
        imagePath,
        oldImagePath
      );
  
      console.log('🟢 [API] updateCardQuantity returned:', updatedCard);
  
      if (updatedCard === null && quantity === 0) {
        // Card was removed
        console.log('🟢 [API] Card removed (quantity set to 0)');
        res.json({ success: true, data: null, message: 'Card removed from collection' });
      } else if (updatedCard === null) {
        console.warn('🟢 [API] Card not found in collection');
        res.status(404).json({ success: false, error: 'Card not found in collection' });
      } else {
        console.log('🟢 [API] Card quantity updated successfully');
        res.json({ success: true, data: updatedCard });
      }
    } catch (error: unknown) {
      const err = error as { message?: string; stack?: string };
      console.error('🟢 [API] Error updating card quantity:', error);
      console.error('🟢 [API] Error details:', {
        message: err?.message,
        stack: err?.stack,
        params: req.params,
        body: req.body
      });
      if (error instanceof Error && error.message.includes('cannot be negative')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: err?.message || 'Failed to update card quantity' });
    }
  });
  
  // Remove card from collection
  app.delete('/api/collections/me/cards/:cardId', deps.authenticateUser, async (req: Request, res) => {
    try {
      const { cardId } = req.params;
      const { cardType } = req.query;
  
      if (!cardType) {
        return res.status(400).json({ success: false, error: 'cardType query parameter is required' });
      }
      if (!isValidCollectionCardType(cardType)) {
        return res.status(400).json({ success: false, error: 'Invalid cardType' });
      }
  
      const collectionId = await deps.collectionService.getOrCreateCollection(req.user!.id);
      const success = await deps.collectionService.removeCardFromCollection(
        collectionId,
        cardId,
        cardType as string
      );
  
      if (success) {
        res.json({ success: true, message: 'Card removed from collection' });
      } else {
        res.status(404).json({ success: false, error: 'Card not found in collection' });
      }
    } catch (error) {
      console.error('Error removing card from collection:', error);
      res.status(500).json({ success: false, error: 'Failed to remove card from collection' });
    }
  });
  
  // Get collection history
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
