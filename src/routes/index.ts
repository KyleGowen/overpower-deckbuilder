// Route registration orchestration. Types match composition root (src/index.ts).
import express from 'express';
import { registerAuthRoutes } from './auth.routes';
import { registerCardApiRoutes } from './card-api.routes';
import { registerUsersDebugRoutes } from './users-debug.routes';
import { registerGuestDeckRoutes } from './guest-decks.routes';
import { registerDeckApiRoutes } from './deck-api.routes';
import { registerCollectionRoutes } from './collections.routes';
import { registerPageRoutes } from './pages.routes';
import { registerStaticAndHealthRoutes } from './static-health.routes';
import type { RouteDependencies } from './types';

export type { RouteDependencies } from './types';

export function registerRoutes(app: express.Application, deps: RouteDependencies): void {
  registerAuthRoutes(app, deps);
  registerCardApiRoutes(app, deps);
  registerUsersDebugRoutes(app, deps);
  app.use('/api', deps.createDeckRoutes({ deckRepository: deps.deckRepository, authenticateUser: deps.authenticateUser }));
  registerGuestDeckRoutes(app, deps);
  registerDeckApiRoutes(app, deps);
  registerCollectionRoutes(app, deps);
  registerPageRoutes(app, deps);
  registerStaticAndHealthRoutes(app, deps);
}

