import express, { Request } from 'express';
import type { CardApiRoutesDeps } from './types';

export function registerCardApiRoutes(app: express.Application, deps: CardApiRoutesDeps): void {
  // GET /api/characters, /api/locations, /api/special-cards, /api/missions, /api/events, /api/aspects removed — use GET /api/v1/catalog/... (API_V1.md).

  app.get('/api/advanced-universe', async (req, res) => {
    try {
      const advancedUniverse = await deps.catalogService.getAllAdvancedUniverse();
      res.json({ success: true, data: advancedUniverse });
    } catch (error) {
      console.error('Error fetching advanced universe:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch advanced universe' });
    }
  });

  app.get('/api/teamwork', async (req, res) => {
    try {
      const teamwork = await deps.catalogService.getAllTeamwork();
      res.json({ success: true, data: teamwork });
    } catch (error) {
      console.error('Error fetching teamwork:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch teamwork' });
    }
  });

  app.get('/api/ally-universe', async (req, res) => {
    try {
      const ally = await deps.catalogService.getAllAllyUniverse();
      res.json({ success: true, data: ally });
    } catch (error) {
      console.error('Error fetching ally universe:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch ally universe' });
    }
  });

  app.get('/api/training', async (req, res) => {
    try {
      const training = await deps.catalogService.getAllTraining();
      res.json({ success: true, data: training });
    } catch (error) {
      console.error('Error fetching training cards:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch training cards' });
    }
  });

  app.get('/api/basic-universe', async (req, res) => {
    try {
      const basicUniverse = await deps.catalogService.getAllBasicUniverse();
      res.json({ success: true, data: basicUniverse });
    } catch (error) {
      console.error('Error fetching basic universe cards:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch basic universe cards' });
    }
  });

  app.get('/api/power-cards', async (req, res) => {
    try {
      const powerCards = await deps.catalogService.getAllPowerCards();
      res.json({ success: true, data: powerCards });
    } catch (error) {
      console.error('Error fetching power cards:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch power cards' });
    }
  });

  app.get('/api/foil-card-map', async (_req, res) => {
    try {
      const entries = await deps.catalogService.getFoilCardMap();
      res.json({ success: true, data: entries });
    } catch (error) {
      console.error('Error fetching foil card map:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch foil card map' });
    }
  });

  app.get('/api/deck-backgrounds', deps.authenticateUser, async (req: Request, res) => {
    try {
      const backgrounds = await deps.deckBackgroundService.getAvailableBackgrounds();
      res.json({ success: true, data: backgrounds });
    } catch (error) {
      console.error('Error fetching background images:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch background images' });
    }
  });

  app.get('/test', async (req, res) => {
    const characters = (await deps.catalogService.getAllCharacters()) as unknown[];
    const locations = (await deps.catalogService.getAllLocations()) as unknown[];

    res.json({
      characters: characters.length,
      locations: locations.length,
      stats: await deps.catalogService.getCardStats(),
      sampleLocation: locations[0]
    });
  });
}
