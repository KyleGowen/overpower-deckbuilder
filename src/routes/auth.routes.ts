import express from 'express';
import type { AuthRoutesDeps } from './types';

export function registerAuthRoutes(app: express.Application, deps: AuthRoutesDeps): void {
  app.post('/api/auth/login', (req, res) => deps.authService.handleLogin(req, res));
  app.post('/api/auth/signup', (req, res) => deps.authService.handleSignup(req, res));
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
}
