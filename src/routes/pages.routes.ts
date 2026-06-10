import express, { Request } from 'express';
import path from 'path';
import type { PageRoutesDeps } from './types';
import { pathToDeckEditorHtml } from './deckEditorPagePath';
import { clearSessionCookieOptions } from '../services/authCookieOptions';
import { resolveSpaIndexPath, isSpaBuilt } from './spaIndexPath';

const NO_CACHE_HTML = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0'
} as const;

/** Serve the app HTML shell: the v2 SPA when built, else legacy public/index.html. */
function sendAppShell(res: express.Response, legacyFallback: string): void {
  res.set({ ...NO_CACHE_HTML, ...HTML_POPUP_FRIENDLY_HEADERS });
  res.sendFile(isSpaBuilt() ? resolveSpaIndexPath() : legacyFallback);
}

function legacyIndex(): string {
  return path.join(process.cwd(), 'public/index.html');
}

/** Lets Firebase (and other) OAuth popups communicate with the opener; avoids COOP blocking `window.closed`. */
const HTML_POPUP_FRIENDLY_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
} as const;

export function registerPageRoutes(app: express.Application, deps: PageRoutesDeps): void {
  // GET /logout - clears session and redirects to home (for testing/browser automation)
  app.get('/logout', async (req, res, next) => {
    try {
      const sessionId = req.cookies?.sessionId;
      if (sessionId) {
        await deps.authService.destroySession(sessionId);
      }
      res.clearCookie('sessionId', clearSessionCookieOptions(req));
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  });
  
  // Main page route - displays characters table
  // Main application route - serves the app with login modal
  app.get('/', (req, res) => {
    sendAppShell(res, legacyIndex());
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

    sendAppShell(res, legacyIndex());
  });
  
  // Deck Editor route - serve deck editor for specific deck (no auth required for read-only viewing)
  app.get('/users/:userId/decks/:deckId', (req: Request, res) => {
    // SPA handles the deck editor; legacy deck-editor HTML is the fallback.
    sendAppShell(res, pathToDeckEditorHtml());
  });
  
  // Collection View route - serve collection view for specific user
  app.get('/users/:userId/collection', deps.authenticateUser, (req: Request, res) => {
    sendAppShell(res, legacyIndex());
  });
  
  // Database View route (Image 3) - serve original database view
  app.get('/data', (req, res) => {
    sendAppShell(res, legacyIndex());
  });

  // SPA client-side routes that have no dedicated server route (e.g. /home,
  // /login). Serve the app shell so deep links / refreshes work. Skipped when
  // the SPA isn't built (legacy site has its own routing).
  app.get('/home', (req, res) => {
    sendAppShell(res, legacyIndex());
  });
  app.get('/login', (req, res) => {
    sendAppShell(res, legacyIndex());
  });
}
