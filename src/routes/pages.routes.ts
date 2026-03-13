import express, { Request } from 'express';
import path from 'path';
import type { PageRoutesDeps } from './types';

export function registerPageRoutes(app: express.Application, deps: PageRoutesDeps): void {
  // GET /logout - clears session and redirects to home (for testing/browser automation)
  app.get('/logout', (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      deps.authService.destroySession(sessionId);
    }
    res.clearCookie('sessionId');
    res.redirect('/');
  });
  
  // Main page route - displays characters table
  // Main application route - serves the app with login modal
  app.get('/', (req, res) => {
    // Add cache-busting headers to prevent HTML caching during development
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
  });
  
  // Deck Builder route (Image 2)
  app.get('/users/:userId/decks', deps.authenticateUser, (req: Request, res) => {
    const { userId } = req.params;
    const user = req.user!;
    
    // Check if user has access to this route
    const isGuestAccess = userId === 'guest' && user.role === 'GUEST';
    const isOwnAccess = user.id === userId;
    
    if (!isGuestAccess && !isOwnAccess) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
  
    // Prevent stale HTML in production (critical for new script tags like /js/alphabetization.js)
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
  });
  
  // Deck Editor route - serve deck editor for specific deck (no auth required for read-only viewing)
  app.get('/users/:userId/decks/:deckId', (req: Request, res) => {
    const { userId: _userId, deckId: _deckId } = req.params;
    
    // Add cache-busting headers to prevent HTML caching during development
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'ETag': `"${Date.now()}"`
    });
    
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
  });
  
  // Collection View route - serve collection view for specific user
  app.get('/users/:userId/collection', deps.authenticateUser, (req: Request, res) => {
    // Add cache-busting headers to prevent HTML caching during development
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'ETag': `"${Date.now()}"`
    });
    
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
  });
  
  // Database View route (Image 3) - serve original database view
  app.get('/data', (req, res) => {
    // Prevent stale HTML in production
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
  });
}
