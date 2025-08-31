import { Router, Request, Response } from 'express';
import { database } from '../database/inMemoryDatabase';
import { ApiResponse } from '../types';

export const cardRoutes = Router();

// GET /api/cards - Get all character cards
cardRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const cards = database.getAllCards();
    const response: ApiResponse<any[]> = {
      success: true,
      data: cards,
      message: `Retrieved ${cards.length} cards`
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve cards'
    };
    res.status(500).json(response);
  }
});

// GET /api/cards/:id - Get card by ID
cardRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const card = database.getCardById(id);
    
    if (!card) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Card not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: card
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve card'
    };
    res.status(500).json(response);
  }
});

