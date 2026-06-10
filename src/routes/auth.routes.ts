import express from 'express';
import type { AuthRoutesDeps } from './types';
import { debugAuth, requestAuthContext } from '../services/authDebug';
import { GUEST_USER_ID } from '../constants/guestUser';

export function registerAuthRoutes(app: express.Application, deps: AuthRoutesDeps): void {
  // Lightweight request logger for the auth surface (DEBUG_AUTH). Shows whether
  // the incoming request carried a sessionId cookie and over which protocol —
  // the fastest way to spot proxy/HSTS-driven cookie drops.
  app.use('/api/auth', (req, _res, next) => {
    debugAuth('incoming /api/auth request', requestAuthContext(req));
    next();
  });

  app.post('/api/auth/login', (req, res) => deps.authService.handleLogin(req, res));
  app.post('/api/auth/signup', (req, res) => deps.authService.handleSignup(req, res));
  app.post('/api/auth/google/preview', (req, res) => deps.authService.handleGoogleLoginPreview(req, res));
  app.post('/api/auth/google', (req, res) => deps.authService.handleGoogleLogin(req, res));
  app.post('/api/auth/logout', (req, res) => deps.authService.handleLogout(req, res));
  app.get('/api/auth/me', (req, res) => deps.authService.handleSessionValidation(req, res));

  app.get('/api/config/firebase', (req, res) => {
    const apiKey = process.env.FIREBASE_API_KEY || '';
    const authDomain = process.env.FIREBASE_AUTH_DOMAIN || '';
    const projectId = process.env.FIREBASE_PROJECT_ID || '';
    const appId = process.env.FIREBASE_APP_ID || '';
    res.json({ apiKey, authDomain, projectId, appId });
  });

  app.get('/js/app-config.js', (req, res) => {
    const cdnBaseUrl = process.env.CDN_BASE_URL || '';
    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'public, max-age=300');
    res.send(`window.APP_CDN_BASE = ${JSON.stringify(cdnBaseUrl)};`);
  });

  // Framework-friendly JSON equivalent of /js/app-config.js.
  // New frontend consumes this instead of eval-ing the JS snippet.
  // Retire /js/app-config.js once the old vanilla frontend is replaced.
  app.get('/api/v1/config/app', (req, res) => {
    const cdnBase = process.env.CDN_BASE_URL || '';
    res.set('Cache-Control', 'public, max-age=300');
    // communityGuestUserId: the GUEST account whose decks back the Home
    // "Community Decks" pool (placeholder until real community decks exist).
    res.json({ cdnBase, communityGuestUserId: GUEST_USER_ID });
  });
}
