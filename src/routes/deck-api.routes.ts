import express, { Request } from 'express';
import { blockInReadOnlyMode, checkRateLimit } from './helpers';
import type { DeckApiRoutesDeps, DeckRecord } from './types';

export function registerDeckApiRoutes(app: express.Application, deps: DeckApiRoutesDeps): void {
  const MAX_CARD_QUANTITY_PER_ENTRY = 100;
  // POST /api/decks and POST /api/decks/validate removed — use POST /api/v1/decks and POST /api/v1/decks/validate (see API_V1.md).
  // GET/PUT/DELETE /api/decks/:id and GET /api/decks/:id/full removed — use /api/v1/decks/... (see API_V1.md).

  app.get('/api/decks/:id/cards', deps.authenticateUser, async (req: Request, res) => {
    try {
      if (!deps.deckRepository.getDeckCards) {
        return res.status(501).json({ success: false, error: 'Not implemented' });
      }
      const cards = await deps.deckRepository.getDeckCards(req.params.id);
      res.json({ success: true, data: cards });
    } catch (error) {
      console.error('Error fetching deck cards:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch deck cards' });
    }
  });
  
  app.post('/api/decks/:id/cards', deps.authenticateUser, async (req: Request, res) => {
    try {
      // SECURITY: Rate limiting for card addition
      if (checkRateLimit(req, res, 'card addition')) {
        return;
      }
      
      // SECURITY: Block card addition in read-only mode
      if (blockInReadOnlyMode(req, res, 'card addition')) {
        return;
      }
      // GUEST may not mutate database decks; they use session-scoped guest decks only
      if (deps.blockGuestMutation(req, res, 'modify decks')) return;
      const { cardType, cardId, quantity } = req.body;
      
      // SECURITY: Comprehensive input validation
      if (!cardType || typeof cardType !== 'string' || cardType.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Card type is required and must be a non-empty string' });
      }
      
      if (!cardId || typeof cardId !== 'string' || cardId.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Card ID is required and must be a non-empty string' });
      }
      
      if (cardType.length > 50) {
        return res.status(400).json({ success: false, error: 'Card type must be 50 characters or less' });
      }
      
      if (cardId.length > 100) {
        return res.status(400).json({ success: false, error: 'Card ID must be 100 characters or less' });
      }
      
      if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 1 || quantity > MAX_CARD_QUANTITY_PER_ENTRY)) {
        return res.status(400).json({ success: false, error: `Quantity must be a number between 1 and ${MAX_CARD_QUANTITY_PER_ENTRY}` });
      }
      
      // SECURITY: Check if user owns this deck
      if (!await deps.deckRepository.userOwnsDeck(req.params.id, req.user!.id)) {
        console.log('🔒 SECURITY: Blocking card addition - user does not own this deck');
        return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
      }
      
      const currentDeck = (await deps.deckRepository.getDeckById(req.params.id)) as DeckRecord | null;
      if (!currentDeck) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      const currentCards = (currentDeck.cards || []) as { type: string; cardId: string; quantity: number }[];
      const validationError = await deps.validateCardAddition(currentCards, cardType, cardId, quantity || 1);
      if (validationError) {
        return res.status(400).json({ success: false, error: validationError });
      }
      
      // Additional validation: Check if card is one-per-deck and already exists in deck
      const isOnePerDeck = await deps.checkIfCardIsOnePerDeck(cardType, cardId);
      if (isOnePerDeck) {
        const cardExists = await deps.deckRepository.doesCardExistInDeck(req.params.id, cardType, cardId);
        if (cardExists) {
          return res.status(400).json({ 
            success: false, 
            error: `Cannot add more copies of this card - it is limited to one per deck` 
          });
        }
      }
      
      // Additional validation: Check if card is cataclysm and deck already has a cataclysm
      const isCataclysm = await deps.checkIfCardIsCataclysm(cardType, cardId);
      if (isCataclysm) {
        let hasExistingCataclysm = false;
        for (const card of currentCards) {
          const cardIsCataclysm = await deps.checkIfCardIsCataclysm(card.type, card.cardId);
          if (cardIsCataclysm) {
            hasExistingCataclysm = true;
            break;
          }
        }
        if (hasExistingCataclysm) {
          return res.status(400).json({ 
            success: false, 
            error: `Cannot add more than 1 Cataclysm to a deck` 
          });
        }
      }
      
          // Additional validation: Check if card is assist and deck already has an assist
          const isAssist = await deps.checkIfCardIsAssist(cardType, cardId);
          if (isAssist) {
            let hasExistingAssist = false;
            for (const card of currentCards) {
              const cardIsAssist = await deps.checkIfCardIsAssist(card.type, card.cardId);
              if (cardIsAssist) {
                hasExistingAssist = true;
                break;
              }
            }
            if (hasExistingAssist) {
              return res.status(400).json({ 
                success: false, 
                error: `Cannot add more than 1 Assist to a deck` 
              });
            }
          }
  
          // Additional validation: Check if card is ambush and deck already has an ambush
          const isAmbush = await deps.checkIfCardIsAmbush(cardType, cardId);
          if (isAmbush) {
            let hasExistingAmbush = false;
            for (const card of currentCards) {
              const cardIsAmbush = await deps.checkIfCardIsAmbush(card.type, card.cardId);
              if (cardIsAmbush) {
                hasExistingAmbush = true;
                break;
              }
            }
            if (hasExistingAmbush) {
              return res.status(400).json({ 
                success: false, 
                error: `Cannot add more than 1 Ambush to a deck` 
              });
            }
          }
  
          // Additional validation: Check if card is fortification and deck already has a fortification
          const isFortification = await deps.checkIfCardIsFortification(cardType, cardId);
          if (isFortification) {
            let hasExistingFortification = false;
            for (const card of currentCards) {
              const cardIsFortification = await deps.checkIfCardIsFortification(card.type, card.cardId);
              if (cardIsFortification) {
                hasExistingFortification = true;
                break;
              }
            }
            if (hasExistingFortification) {
              return res.status(400).json({ 
                success: false, 
                error: `Cannot add more than 1 Fortification to a deck` 
              });
            }
          }
      
      const success = await deps.deckRepository.addCardToDeck(req.params.id, cardType, cardId, quantity || 1);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Deck not found or failed to add card' });
      }
      
      // Return the updated deck
      const updatedDeck = await deps.deckRepository.getDeckById(req.params.id);
      res.json({ success: true, data: updatedDeck });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to add card to deck' });
    }
  });
  
  // Bulk replace all cards in a deck (used for save operations)
  app.put('/api/decks/:id/cards', deps.authenticateUser, async (req: Request, res) => {
    try {
      // SECURITY: Rate limiting for card replacement
      if (checkRateLimit(req, res, 'card replacement')) {
        return;
      }
      
      // SECURITY: Block card replacement in read-only mode
      if (blockInReadOnlyMode(req, res, 'card replacement')) {
        return;
      }
      // GUEST may not mutate database decks; they use session-scoped guest decks only
      if (deps.blockGuestMutation(req, res, 'modify decks')) return;
      const { cards } = req.body;
      
      // SECURITY: Comprehensive input validation
      if (!Array.isArray(cards)) {
        return res.status(400).json({ success: false, error: 'Cards must be an array' });
      }
      
      if (cards.length > 100) {
        return res.status(400).json({ success: false, error: 'Cannot replace more than 100 cards at once' });
      }
      
      // Validate each card in the array
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card || typeof card !== 'object') {
          return res.status(400).json({ success: false, error: `Card at index ${i} must be an object` });
        }
        
        if (!card.cardType || typeof card.cardType !== 'string' || card.cardType.trim().length === 0) {
          return res.status(400).json({ success: false, error: `Card at index ${i}: cardType is required and must be a non-empty string` });
        }
        
        if (!card.cardId || typeof card.cardId !== 'string' || card.cardId.trim().length === 0) {
          return res.status(400).json({ success: false, error: `Card at index ${i}: cardId is required and must be a non-empty string` });
        }
        
        if (card.quantity !== undefined && (typeof card.quantity !== 'number' || card.quantity < 1 || card.quantity > MAX_CARD_QUANTITY_PER_ENTRY)) {
          return res.status(400).json({ success: false, error: `Card at index ${i}: quantity must be a number between 1 and ${MAX_CARD_QUANTITY_PER_ENTRY}` });
        }
      }
      
      // SECURITY: Check if user owns this deck
      if (!await deps.deckRepository.userOwnsDeck(req.params.id, req.user!.id)) {
        console.log('🔒 SECURITY: Blocking card replacement - user does not own this deck');
        return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
      }
      
      console.log('Attempting to replace cards in deck:', req.params.id);
      console.log('Cards to replace:', JSON.stringify(cards, null, 2));
      
      try {
        await deps.deckRepository.replaceAllCardsInDeck(req.params.id, cards);
      } catch (error: unknown) {
        const err = error as { stack?: string; message?: string };
        console.error('Error in replaceAllCardsInDeck:', error);
        console.error('Error stack:', err?.stack);
        console.error('Deck ID:', req.params.id);
        console.error('Cards being replaced:', JSON.stringify(cards, null, 2));
        // Return 400 if it's a validation error (card doesn't exist), 500 for other errors
        const statusCode = err?.message?.includes('does not exist') ? 400 : 500;
        return res.status(statusCode).json({ 
          success: false, 
          error: 'Failed to replace cards in deck',
          details: err?.message || String(error)
        });
      }
      
      console.log('Successfully replaced cards in deck:', req.params.id);
      
      // Return the updated deck
      const updatedDeck = await deps.deckRepository.getDeckById(req.params.id);
      res.json({ success: true, data: updatedDeck });
    } catch (error) {
      console.error('Error replacing cards in deck:', error);
      res.status(500).json({ success: false, error: 'Failed to replace cards in deck' });
    }
  });
  
  app.delete('/api/decks/:id/cards', deps.authenticateUser, async (req: Request, res) => {
    try {
      // SECURITY: Rate limiting for card removal
      if (checkRateLimit(req, res, 'card removal')) {
        return;
      }
      
      // SECURITY: Block card removal in read-only mode
      if (blockInReadOnlyMode(req, res, 'card removal')) {
        return;
      }
      // GUEST may not mutate database decks; they use session-scoped guest decks only
      if (deps.blockGuestMutation(req, res, 'modify decks')) return;
      const { cardType, cardId, quantity } = req.body;
      
      // SECURITY: Comprehensive input validation
      if (!cardType || typeof cardType !== 'string' || cardType.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Card type is required and must be a non-empty string' });
      }
      
      if (!cardId || typeof cardId !== 'string' || cardId.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Card ID is required and must be a non-empty string' });
      }
      
      if (cardType.length > 50) {
        return res.status(400).json({ success: false, error: 'Card type must be 50 characters or less' });
      }
      
      if (cardId.length > 100) {
        return res.status(400).json({ success: false, error: 'Card ID must be 100 characters or less' });
      }
      
      if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 1 || quantity > MAX_CARD_QUANTITY_PER_ENTRY)) {
        return res.status(400).json({ success: false, error: `Quantity must be a number between 1 and ${MAX_CARD_QUANTITY_PER_ENTRY}` });
      }
      
      // SECURITY: Check if user owns this deck
      if (!await deps.deckRepository.userOwnsDeck(req.params.id, req.user!.id)) {
        console.log('🔒 SECURITY: Blocking card removal - user does not own this deck');
        return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
      }
      
      let success;
      
      // Special case: clear all cards
      if (cardType === 'all' && cardId === 'all') {
        success = await deps.deckRepository.removeAllCardsFromDeck(req.params.id);
      } else {
        success = await deps.deckRepository.removeCardFromDeck(req.params.id, cardType, cardId, quantity || 1);
      }
      
      if (!success) {
        return res.status(404).json({ success: false, error: 'Deck not found or failed to remove card' });
      }
      
      // Return the updated deck
      const updatedDeck = await deps.deckRepository.getDeckById(req.params.id);
      res.json({ success: true, data: updatedDeck });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to remove card from deck' });
    }
  });
  
  app.get('/api/deck-stats', deps.authenticateUser, async (req: Request, res) => {
    try {
      const userDecks = (await deps.deckRepository.getDecksByUserId(req.user!.id)) as DeckRecord[];
      const totalDecks = userDecks.length;
      const decksWithCards = await Promise.all(userDecks.map(async (deck) => {
        const fullDeck = (await deps.deckRepository.getDeckById(deck.id!)) as DeckRecord | null;
        return fullDeck || deck;
      }));
      const totalCards = decksWithCards.reduce((total, deck) => {
        const cards = deck.cards ?? [];
        return total + cards.reduce((deckTotal: number, card: { quantity?: number }) => deckTotal + (card.quantity || 1), 0);
      }, 0);
      const averageCardsPerDeck = totalDecks > 0 ? Math.round(totalCards / totalDecks) : 0;
      const largestDeckSize = decksWithCards.reduce((max, deck) => {
        const cards = deck.cards ?? [];
        const deckSize = cards.reduce((deckTotal: number, card: { quantity?: number }) => deckTotal + (card.quantity || 1), 0);
        return Math.max(max, deckSize);
      }, 0);
      
      const stats = { 
        totalDecks, 
        totalCards, 
        averageCardsPerDeck, 
        largestDeckSize 
      };
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching deck stats:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch deck stats' });
    }
  });
  
  // UI Preferences API routes
  app.get('/api/decks/:id/ui-preferences', deps.authenticateUser, async (req: Request, res) => {
    try {
      const { id } = req.params;
      
      // Check if user owns this deck
      if (!await deps.deckRepository.userOwnsDeck(id, req.user!.id)) {
        return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
      }
      
      const preferences = await deps.deckRepository.getUIPreferences(id);
      res.json({ success: true, data: preferences || {} });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch UI preferences' });
    }
  });
  
  app.put('/api/decks/:id/ui-preferences', deps.authenticateUser, async (req: Request, res) => {
    try {
      // SECURITY: Rate limiting for UI preferences save
      if (checkRateLimit(req, res, 'UI preferences save')) {
        return;
      }
      
      // SECURITY: Block UI preferences save in read-only mode
      if (blockInReadOnlyMode(req, res, 'UI preferences save')) {
        return;
      }
      
      // SECURITY: Check if user is guest - guests cannot modify decks
      if (deps.blockGuestMutation(req, res, 'modify decks')) return;
      
      const { id } = req.params;
      const preferences = req.body;
      
      // SECURITY: Comprehensive input validation
      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ success: false, error: 'Preferences must be an object' });
      }
      
      // Validate specific preference fields if they exist
      if (preferences.viewMode && !['tile', 'list'].includes(preferences.viewMode)) {
        return res.status(400).json({ success: false, error: 'viewMode must be either "tile" or "list"' });
      }
      
      if (preferences.sortBy && (typeof preferences.sortBy !== 'string' || preferences.sortBy.length > 50)) {
        return res.status(400).json({ success: false, error: 'sortBy must be a string with 50 characters or less' });
      }
      
      if (preferences.filterBy && (typeof preferences.filterBy !== 'string' || preferences.filterBy.length > 50)) {
        return res.status(400).json({ success: false, error: 'filterBy must be a string with 50 characters or less' });
      }
      
      // Limit the size of the preferences object
      const preferencesString = JSON.stringify(preferences);
      if (preferencesString.length > 1000) {
        return res.status(400).json({ success: false, error: 'Preferences object is too large (max 1000 characters)' });
      }
      
      // Check if deck exists
      const deck = await deps.deckRepository.getDeckById(id);
      if (!deck) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      
      // SECURITY: Check if user owns this deck
      if (!await deps.deckRepository.userOwnsDeck(id, req.user!.id)) {
        console.log('🔒 SECURITY: Blocking UI preferences save - user does not own this deck');
        return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
      }
      
      const success = await deps.deckRepository.updateUIPreferences(id, preferences);
      if (success) {
        res.json({ success: true, data: preferences });
      } else {
        res.status(404).json({ success: false, error: 'Deck not found' });
      }
    } catch (error) {
      console.error('Error updating UI preferences:', error);
      res.status(500).json({ success: false, error: 'Failed to update UI preferences' });
    }
  });
}
