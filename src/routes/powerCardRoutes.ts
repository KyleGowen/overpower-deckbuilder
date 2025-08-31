import { Router, Request, Response } from 'express';
import { database } from '../database/inMemoryDatabase';
import { ApiResponse } from '../types';

const powerCardRoutes = Router();

// GET /api/power-cards - Get all power cards
powerCardRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const cards = database.getAllPowerCards();
    const response: ApiResponse<any[]> = {
      success: true,
      data: cards,
      message: `Retrieved ${cards.length} power cards`
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve power cards'
    };
    res.status(500).json(response);
  }
});

export default powerCardRoutes;

