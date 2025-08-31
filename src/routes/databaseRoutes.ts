import { Router, Request, Response } from 'express';
import { database } from '../database/inMemoryDatabase';
import { ApiResponse } from '../types';

export const databaseRoutes = Router();

// GET /api/database/stats - Get database statistics
databaseRoutes.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = database.getStats();
    const response: ApiResponse<any> = {
      success: true,
      data: stats,
      message: 'Database statistics retrieved successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve database statistics'
    };
    res.status(500).json(response);
  }
});

