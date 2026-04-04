import express, { Request } from 'express';
import { blockInReadOnlyMode, checkRateLimit } from './helpers';
import type { DeckApiRoutesDeps } from './types';

export function registerDeckApiRoutes(app: express.Application, deps: DeckApiRoutesDeps): void {
  // POST /api/decks and POST /api/decks/validate removed — use POST /api/v1/decks and POST /api/v1/decks/validate (see API_V1.md).
  // GET/PUT/DELETE /api/decks/:id and GET /api/decks/:id/full removed — use /api/v1/decks/... (see API_V1.md).
  // GET/POST/PUT/DELETE /api/decks/:id/cards removed — use /api/v1/decks/:id/cards (see API_V1.md).

  // GET /api/deck-stats removed — use GET /api/v1/decks/stats (see API_V1.md).

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
