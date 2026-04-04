import express, { Request } from 'express';
import { blockInReadOnlyMode, checkRateLimit } from './helpers';
import type { DeckApiRoutesDeps, DeckRecord } from './types';

export function registerDeckApiRoutes(app: express.Application, deps: DeckApiRoutesDeps): void {
  // POST /api/decks and POST /api/decks/validate removed — use POST /api/v1/decks and POST /api/v1/decks/validate (see API_V1.md).
  // GET/PUT/DELETE /api/decks/:id and GET /api/decks/:id/full removed — use /api/v1/decks/... (see API_V1.md).
  // GET/POST/PUT/DELETE /api/decks/:id/cards removed — use /api/v1/decks/:id/cards (see API_V1.md).

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
