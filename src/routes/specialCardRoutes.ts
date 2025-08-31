import { Router, Request, Response } from 'express';
import { database } from '../database/inMemoryDatabase';
import { ApiResponse } from '../types';

export const specialCardRoutes = Router();

// GET /api/special-cards - Get all special cards
specialCardRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const cards = database.getAllSpecialCards();
    const response: ApiResponse<any[]> = {
      success: true,
      data: cards,
      message: `Retrieved ${cards.length} special cards`
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve special cards'
    };
    res.status(500).json(response);
  }
});

