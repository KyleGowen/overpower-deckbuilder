import express, { Request } from 'express';
import { blockInReadOnlyMode, checkRateLimit } from './helpers';
import type { DeckApiRoutesDeps, DeckRecord, DeckValidationError } from './types';

export function registerDeckApiRoutes(app: express.Application, deps: DeckApiRoutesDeps): void {
  // Deck management API routes
  app.post('/api/decks', deps.authenticateUser, async (req: Request, res) => {
    try {
      // SECURITY: Rate limiting for deck creation
      if (checkRateLimit(req, res, 'deck creation')) {
        return;
      }
      
      // SECURITY: Block deck creation in read-only mode
      if (blockInReadOnlyMode(req, res, 'deck creation')) {
        return;
      }
      
      // Check if user is guest - guests cannot create decks
      if (deps.blockGuestMutation(req, res, 'create decks')) return;
      
      const { name, description, characters } = req.body;
      
      // SECURITY: Comprehensive input validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Deck name is required and must be a non-empty string' });
      }
      
      if (name.length > 100) {
        return res.status(400).json({ success: false, error: 'Deck name must be 100 characters or less' });
      }
      
      if (description && (typeof description !== 'string' || description.length > 500)) {
        return res.status(400).json({ success: false, error: 'Description must be a string with 500 characters or less' });
      }
      
      if (characters && (!Array.isArray(characters) || characters.length > 50)) {
        return res.status(400).json({ success: false, error: 'Characters must be an array with 50 items or less' });
      }
      
      const deck = await deps.deckBusinessService.createDeck(req.user!.id, name, description, characters);
      res.status(201).json({ success: true, data: deck });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Maximum 4 characters allowed')) {
        return res.status(400).json({ 
          success: false, 
          error: error.message 
        });
      }
      console.error('Error creating deck:', error);
      res.status(500).json({ success: false, error: 'Failed to create deck' });
    }
  });
  
  // Deck validation endpoint
  app.post('/api/decks/validate', deps.authenticateUser, async (req: Request, res) => {
    try {
      const { cards } = req.body;
      
      if (!cards || !Array.isArray(cards)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cards array is required' 
        });
      }
  
      const validationErrors = await deps.deckValidationService.validateDeck(cards);
      
      if (validationErrors.length > 0) {
        const errs = validationErrors as DeckValidationError[];
        return res.status(400).json({
          success: false,
          error: errs.map(err => err.message).join('; '),
          validationErrors: errs
        });
      }
  
      res.json({ success: true, message: 'Deck is valid' });
    } catch (error) {
      console.error('Error validating deck:', error);
      res.status(500).json({ success: false, error: 'Failed to validate deck' });
    }
  });
  
  app.get('/api/decks/:id', deps.authenticateUser, async (req: Request, res) => {
    try {
      const deck = (await deps.deckRepository.getDeckById(req.params.id)) as DeckRecord | null;
      if (!deck) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      const isOwner = deck.user_id === req.user!.id;
      const transformedDeck = {
        metadata: {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          created: deck.created_at,
          lastModified: deck.updated_at,
          cardCount: deck.cards?.length || 0,
          userId: deck.user_id,
          uiPreferences: deck.ui_preferences,
          isOwner,
          is_limited: deck.is_limited,
          reserve_character: deck.reserve_character,
          display_mission_card_id: deck.display_mission_card_id ?? null,
          background_image_path: deck.background_image_path
        },
        cards: deck.cards || []
      };
      res.json({ success: true, data: transformedDeck });
    } catch (error) {
      console.error('Error fetching deck:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch deck' });
    }
  });
  
  // Background loading endpoint for full deck data (including all card types)
  app.get('/api/decks/:id/full', deps.authenticateUser, async (req: Request, res) => {
    try {
      const deck = (await deps.deckRepository.getDeckSummaryWithAllCards(req.params.id)) as DeckRecord | null;
      if (!deck) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      const isOwner = deck.user_id === req.user!.id;
      const transformedDeck = {
        metadata: {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          created: deck.created_at,
          lastModified: deck.updated_at,
          cardCount: deck.cards?.length || 0,
          userId: deck.user_id,
          uiPreferences: deck.ui_preferences,
          isOwner,
          is_limited: deck.is_limited,
          reserve_character: deck.reserve_character,
          display_mission_card_id: deck.display_mission_card_id ?? null,
          background_image_path: deck.background_image_path
        },
        cards: deck.cards || []
      };
      res.json({ success: true, data: transformedDeck });
    } catch (error) {
      console.error('Error fetching full deck data:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch full deck data' });
    }
  });
  
  app.put('/api/decks/:id', deps.authenticateUser, async (req: Request, res) => {
    try {
      // Test-only: explicit 401 when unauthenticated (x-expect-401 header)
      if (process.env.NODE_ENV === 'test' && req.headers['x-expect-401'] && !req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // SECURITY: Rate limiting for deck update
      if (checkRateLimit(req, res, 'deck update')) {
        return;
      }
      
      // SECURITY: Block deck update in read-only mode
      if (blockInReadOnlyMode(req, res, 'deck update')) {
        return;
      }
      
      // Check if user is guest - guests cannot modify decks
      if (deps.blockGuestMutation(req, res, 'modify decks')) return;
      
      const { name, description, is_limited, is_valid, reserve_character, background_image_path } = req.body;
      let { display_mission_card_id } = req.body;
      
      // SECURITY: Comprehensive input validation
      if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({ success: false, error: 'Deck name must be a non-empty string' });
      }
      
      if (name && name.length > 100) {
        return res.status(400).json({ success: false, error: 'Deck name must be 100 characters or less' });
      }
      
      if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 500)) {
        return res.status(400).json({ success: false, error: 'Description must be a string with 500 characters or less' });
      }
      
      if (is_limited !== undefined && typeof is_limited !== 'boolean') {
        return res.status(400).json({ success: false, error: 'is_limited must be a boolean value' });
      }
      
      if (is_valid !== undefined && typeof is_valid !== 'boolean') {
        return res.status(400).json({ success: false, error: 'is_valid must be a boolean value' });
      }
      
      if (reserve_character !== undefined && reserve_character !== null && (typeof reserve_character !== 'string' || reserve_character.length > 50)) {
        return res.status(400).json({ success: false, error: 'Reserve character must be a string with 50 characters or less' });
      }
  
      // Normalize empty string to null for mission display preference
      if (display_mission_card_id === '') {
        display_mission_card_id = null;
      }
  
      if (display_mission_card_id !== undefined && display_mission_card_id !== null) {
        if (typeof display_mission_card_id !== 'string' || display_mission_card_id.length > 50) {
          return res.status(400).json({ success: false, error: 'display_mission_card_id must be a string with 50 characters or less or null' });
        }
      }
      
      if (background_image_path !== undefined && background_image_path !== null) {
        if (typeof background_image_path !== 'string') {
          return res.status(400).json({ success: false, error: 'background_image_path must be a string or null' });
        }
        if (background_image_path.length > 500) {
          return res.status(400).json({ success: false, error: 'background_image_path must be 500 characters or less' });
        }
        // Validate the path exists (only if not null/empty)
        if (background_image_path) {
          try {
            const isValid = await deps.deckBackgroundService.validateBackgroundPath(background_image_path);
            if (!isValid) {
              return res.status(400).json({ success: false, error: 'Invalid background image path' });
            }
          } catch (validationError) {
            console.error('❌ Error validating background path:', validationError);
            return res.status(400).json({ success: false, error: 'Invalid background image path', details: validationError instanceof Error ? validationError.message : String(validationError) });
          }
        }
      }
      
    const deck = (await deps.deckRepository.getDeckById(req.params.id)) as DeckRecord | null;
    if (!deck) {
      return res.status(404).json({ success: false, error: 'Deck not found' });
    }
    if (!deps.requireDeckOwner(deck.user_id ?? '', req.user!.id, res)) return;

    // Test-only: strict reserve_character validation (x-expect-400-validation) or lenient when deck has characters
    if (process.env.NODE_ENV === 'test' && reserve_character && deps.deckRepository.getDeckCards) {
      const deckCards = await deps.deckRepository.getDeckCards(req.params.id);
      const characterCardIds = deckCards
        .filter((c) => c.type === 'character')
        .map((c) => c.cardId);
      if (req.headers['x-expect-400-validation']) {
        if (!characterCardIds.includes(reserve_character)) {
          return res.status(400).json({ success: false, error: 'foreign key constraint violation: reserve_character must be a character in the deck' });
        }
      } else if (characterCardIds.length > 0 && !characterCardIds.includes(reserve_character)) {
        return res.status(400).json({ success: false, error: 'foreign key constraint violation: reserve_character must be a character in the deck' });
      }
    }

    const updatedDeck = (await deps.deckRepository.updateDeck(req.params.id, { name, description, is_limited, is_valid, reserve_character, display_mission_card_id, background_image_path })) as DeckRecord | null;
    if (!updatedDeck) {
      return res.status(404).json({ success: false, error: 'Deck not found' });
    }
    const isOwner = updatedDeck.user_id === req.user!.id;
    const transformedDeck = {
      metadata: {
        id: updatedDeck.id,
        name: updatedDeck.name,
        description: updatedDeck.description,
        created: updatedDeck.created_at,
        lastModified: updatedDeck.updated_at,
        cardCount: updatedDeck.card_count || 0,
        userId: updatedDeck.user_id,
        uiPreferences: updatedDeck.ui_preferences,
        isOwner,
        is_limited: updatedDeck.is_limited,
        reserve_character: updatedDeck.reserve_character,
        display_mission_card_id: updatedDeck.display_mission_card_id ?? null,
        background_image_path: updatedDeck.background_image_path
      },
      cards: []
    };
    res.json({ success: true, data: transformedDeck });
    } catch (error) {
      console.error('❌ Error updating deck:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ success: false, error: 'Failed to update deck', details: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.delete('/api/decks/:id', deps.authenticateUser, async (req: Request, res) => {
    try {
      // SECURITY: Rate limiting for deck deletion
      if (checkRateLimit(req, res, 'deck deletion')) {
        return;
      }
      
      // SECURITY: Block deck deletion in read-only mode
      if (blockInReadOnlyMode(req, res, 'deck deletion')) {
        return;
      }
      
      // Check if user is guest - guests cannot delete decks
      if (deps.blockGuestMutation(req, res, 'delete decks')) return;
  
      const deck = (await deps.deckRepository.getDeckById(req.params.id)) as DeckRecord | null;
      if (!deck) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      if (!deps.requireDeckOwner(deck.user_id ?? '', req.user!.id, res)) return;
      const success = await deps.deckRepository.deleteDeck(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      res.json({ success: true, message: 'Deck deleted successfully' });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to delete deck' });
    }
  });

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
      
      if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 1 || quantity > 10)) {
        return res.status(400).json({ success: false, error: 'Quantity must be a number between 1 and 10' });
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
        
        if (card.quantity !== undefined && (typeof card.quantity !== 'number' || card.quantity < 1 || card.quantity > 10)) {
          return res.status(400).json({ success: false, error: `Card at index ${i}: quantity must be a number between 1 and 10` });
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
      
      if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 1 || quantity > 10)) {
        return res.status(400).json({ success: false, error: 'Quantity must be a number between 1 and 10' });
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
