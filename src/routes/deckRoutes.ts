import { Router, Request, Response } from 'express';
import { database } from '../database/inMemoryDatabase';
import { Deck, CreateDeckRequest, UpdateDeckRequest, ApiResponse } from '../types';

export const deckRoutes = Router();

// GET /api/decks - Get all decks
deckRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const decks = await database.getAllDecks();
    const response: ApiResponse<Deck[]> = {
      success: true,
      data: decks,
      message: `Retrieved ${decks.length} decks`
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve decks'
    };
    res.status(500).json(response);
  }
});

// GET /api/decks/public - Get public decks only
deckRoutes.get('/public', async (req: Request, res: Response) => {
  try {
    const decks = await database.getPublicDecks();
    const response: ApiResponse<Deck[]> = {
      success: true,
      data: decks,
      message: `Retrieved ${decks.length} public decks`
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve public decks'
    };
    res.status(500).json(response);
  }
});

// GET /api/decks/:id - Get deck by ID
deckRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Deck ID is required'
      };
      return res.status(400).json(response);
    }
    
    const deck = await database.getDeckById(id);
    
    if (!deck) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Deck not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Deck> = {
      success: true,
      data: deck
    };
    return res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve deck'
    };
    return res.status(500).json(response);
  }
});

// POST /api/decks - Create a new deck
deckRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const deckData: CreateDeckRequest = req.body;
    
    // Basic validation
    if (!deckData.name) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Deck name is required'
      };
      return res.status(400).json(response);
    }

    // Validate that all cards in the deck exist
    if (deckData.cards && deckData.cards.length > 0) {
      for (const deckCard of deckData.cards) {
        const card = await database.getCardById(deckCard.cardId);
        if (!card) {
          const response: ApiResponse<null> = {
            success: false,
            error: `Card with ID ${deckCard.cardId} not found`
          };
          return res.status(400).json(response);
        }
      }
    }

    const newDeck = await database.createDeck(deckData);
    
    const response: ApiResponse<Deck> = {
      success: true,
      data: newDeck,
      message: 'Deck created successfully'
    };
    return res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create deck'
    };
    return res.status(500).json(response);
  }
});

// PUT /api/decks/:id - Update a deck
deckRoutes.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Deck ID is required'
      };
      return res.status(400).json(response);
    }
    
    const updates: UpdateDeckRequest = req.body;
    
    // Validate that all cards in the deck exist if cards are being updated
    if (updates.cards && updates.cards.length > 0) {
      for (const deckCard of updates.cards) {
        const card = await database.getCardById(deckCard.cardId);
        if (!card) {
          const response: ApiResponse<null> = {
            success: false,
            error: `Card with ID ${deckCard.cardId} not found`
          };
          return res.status(400).json(response);
        }
      }
    }

    const updatedDeck = await database.updateDeck(id, updates);
    
    if (!updatedDeck) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Deck not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Deck> = {
      success: true,
      data: updatedDeck,
      message: 'Deck updated successfully'
    };
    return res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update deck'
    };
    return res.status(500).json(response);
  }
});

// DELETE /api/decks/:id - Delete a deck
deckRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Deck ID is required'
      };
      return res.status(400).json(response);
    }
    
    const deleted = await database.deleteDeck(id);
    
    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Deck not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Deck deleted successfully'
    };
    return res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete deck'
    };
    return res.status(500).json(response);
  }
});

// POST /api/decks/sandbox/clear - Clear the Sandbox deck
deckRoutes.post('/sandbox/clear', async (req: Request, res: Response) => {
  try {
    const clearedDeck = await database.clearSandboxDeck();
    
    const response: ApiResponse<Deck> = {
      success: true,
      data: clearedDeck,
      message: 'Sandbox deck cleared successfully'
    };
    return res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to clear Sandbox deck'
    };
    return res.status(500).json(response);
  }
});

