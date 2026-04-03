import express, { Request } from 'express';
import type { CardApiRoutesDeps } from './types';

export function registerCardApiRoutes(app: express.Application, deps: CardApiRoutesDeps): void {
  // GET /api/characters, /locations, /special-cards, /missions, /events, /aspects, /advanced-universe, /teamwork, /ally-universe, /training removed — use GET /api/v1/catalog/... (API_V1.md).

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
