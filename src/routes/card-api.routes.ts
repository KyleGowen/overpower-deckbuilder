import express, { Request } from 'express';
import type { CardApiRoutesDeps } from './types';

export function registerCardApiRoutes(app: express.Application, deps: CardApiRoutesDeps): void {
  app.get('/api/characters', async (req, res) => {
    try {
      const characters = await deps.cardRepository.getAllCharacters();
      res.json({ success: true, data: characters });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch characters' });
    }
  });

  app.get('/api/locations', async (req, res) => {
    try {
      const locations = await deps.cardRepository.getAllLocations();
      res.json({ success: true, data: locations });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch locations' });
    }
  });

  app.get('/api/special-cards', async (req, res) => {
    try {
      const specialCards = await deps.cardRepository.getAllSpecialCards();
      res.json({ success: true, data: specialCards });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch special cards' });
    }
  });

  app.get('/api/missions', async (req, res) => {
    try {
      const missions = await deps.cardRepository.getAllMissions();
      res.json({ success: true, data: missions });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch missions' });
    }
  });

  app.get('/api/events', async (req, res) => {
    try {
      const events = await deps.cardRepository.getAllEvents();
      res.json({ success: true, data: events });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
  });

  app.get('/api/aspects', async (req, res) => {
    try {
      const aspects = await deps.cardRepository.getAllAspects();
      res.json({ success: true, data: aspects });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch aspects' });
    }
  });

  app.get('/api/advanced-universe', async (req, res) => {
    try {
      const advancedUniverse = await deps.cardRepository.getAllAdvancedUniverse();
      res.json({ success: true, data: advancedUniverse });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch advanced universe' });
    }
  });

  app.get('/api/teamwork', async (req, res) => {
    try {
      const teamwork = await deps.cardRepository.getAllTeamwork();
      res.json({ success: true, data: teamwork });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch teamwork' });
    }
  });

  app.get('/api/ally-universe', async (req, res) => {
    try {
      const ally = await deps.cardRepository.getAllAllyUniverse();
      res.json({ success: true, data: ally });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch ally universe' });
    }
  });

  app.get('/api/training', async (req, res) => {
    try {
      const training = await deps.cardRepository.getAllTraining();
      res.json({ success: true, data: training });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch training cards' });
    }
  });

  app.get('/api/basic-universe', async (req, res) => {
    try {
      const basicUniverse = await deps.cardRepository.getAllBasicUniverse();
      res.json({ success: true, data: basicUniverse });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch basic universe cards' });
    }
  });

  app.get('/api/power-cards', async (req, res) => {
    try {
      const powerCards = await deps.cardRepository.getAllPowerCards();
      res.json({ success: true, data: powerCards });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch power cards' });
    }
  });

  app.get('/api/foil-card-map', async (_req, res) => {
    try {
      const entries = await deps.foilCardMapRepository.getFoilCardMap();
      res.json({ success: true, data: entries });
    } catch {
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
    const characters = (await deps.cardRepository.getAllCharacters()) as unknown[];
    const locations = (await deps.cardRepository.getAllLocations()) as unknown[];

    res.json({
      characters: characters.length,
      locations: locations.length,
      stats: await deps.cardRepository.getCardStats(),
      sampleLocation: locations[0]
    });
  });
}
