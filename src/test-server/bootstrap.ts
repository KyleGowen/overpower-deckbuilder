/**
 * Test app bootstrap: builds Express app with test deps and shared route registration.
 * Reuses registerRoutes from main app so test server does not duplicate route handlers.
 */
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

import { DataSourceConfig } from '../config/DataSourceConfig';
import { DeckPersistenceService } from '../services/deckPersistence';
import { DeckValidationService } from '../services/deckValidationService';
import { DeckService } from '../services/deckService';
import { AuthenticationService } from '../services/AuthenticationService';
import { NewUserSampleDeckService } from '../services/newUserSampleDeckService';
import { DeckBackgroundService } from '../services/deckBackgroundService';
import { CollectionsRepository } from '../database/collectionsRepository';
import { CollectionService } from '../services/collectionService';
import { FoilCardMapRepository } from '../database/foilCardMapRepository';
import { createDeckRoutes } from '../routes/decks.routes';
import { registerRoutes, type RouteDependencies } from '../routes';
import { transformDeckList } from '../api/deckTransform';
import { CatalogService } from '../api/services/catalogService';
import { registerApiV1Routes } from '../api/http/registerApiV1Routes';
import { requireAdmin, blockGuestMutation, requireDeckOwner } from '../middleware/authorizationHelpers';
import { setupMiddleware } from '../middleware/setup';

import {
  validateCardAddition,
  checkIfCardIsCataclysm,
  checkIfCardIsAssist,
  checkIfCardIsAmbush,
  checkIfCardIsFortification,
  checkIfCardIsOnePerDeck,
  databaseInit,
  guestDeckPersistence
} from '../index';

import { registerTestOnlyRoutes, type TestOnlyRoutesDeps } from './testOnlyRoutes';

// Importing from index runs it and ensures DataSourceConfig / DB init exist

// Build services/repos (same singletons as main app via DataSourceConfig)
new DeckPersistenceService();
const dataSource = DataSourceConfig.getInstance();
const userRepository = dataSource.getUserRepository();
const deckRepository = dataSource.getDeckRepository();
const cardRepository = dataSource.getCardRepository();
const deckValidationService = new DeckValidationService(cardRepository);
const deckBusinessService = new DeckService(deckRepository);
const newUserSampleDeckService = new NewUserSampleDeckService(userRepository, deckRepository);
const authService = new AuthenticationService(userRepository, newUserSampleDeckService);
const collectionsRepository = new CollectionsRepository(dataSource.getPool());
const collectionService = new CollectionService(collectionsRepository);
const deckBackgroundService = new DeckBackgroundService();
const foilCardMapRepository = new FoilCardMapRepository(dataSource.getPool());
const catalogService = new CatalogService(cardRepository);

// Test auth: session cookie or x-test-user-id header; otherwise 401 (so routes that require auth still get 401 when unauthenticated)
const authenticateUser = authService.createAuthMiddleware();
const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.cookie && req.headers.cookie.includes('sessionId=')) {
      await authenticateUser(req, res, next);
    } else if (req.headers['x-test-user-id']) {
      const userId = Array.isArray(req.headers['x-test-user-id'])
        ? req.headers['x-test-user-id'][0]
        : (req.headers['x-test-user-id'] as string);
      const user = await userRepository.getUserById(userId);
      if (user) req.user = user;
      next();
    } else {
      res.status(401).json({ success: false, error: 'Authentication required' });
    }
  } catch {
    next();
  }
};

function getGitInfo() {
  return {
    commit: 'unknown',
    shortCommit: 'unknown',
    branch: 'unknown',
    commitDate: 'unknown',
    commitMessage: 'unknown',
    commitAuthor: 'unknown',
    commitEmail: 'unknown'
  };
}

const testDeps = {
  authService,
  authenticateUser: optionalAuth,
  deckRepository,
  cardRepository,
  catalogService,
  userRepository,
  deckValidationService,
  deckBusinessService,
  collectionService,
  deckBackgroundService,
  guestDeckPersistence,
  foilCardMapRepository,
  databaseInit,
  dataSource,
  validateCardAddition,
  checkIfCardIsCataclysm,
  checkIfCardIsAssist,
  checkIfCardIsAmbush,
  checkIfCardIsFortification,
  checkIfCardIsOnePerDeck,
  getGitInfo,
  requireAdmin,
  blockGuestMutation,
  requireDeckOwner,
  createDeckRoutes,
  transformDeckList
} as unknown as RouteDependencies;

const app = express();
setupMiddleware(app);

// Global nav component files (test server used these explicit routes)
app.get('/components/globalNav.html', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'components', 'globalNav.html'));
});
app.get('/components/globalNav.css', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'components', 'globalNav.css'));
});
app.get('/components/globalNav.js', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'components', 'globalNav.js'));
});

// Test-only routes first so lenient /users/:userId/decks take precedence over auth-required page routes
registerTestOnlyRoutes(app, {
  deckRepository,
  cardRepository,
  authenticateUser: optionalAuth
} as TestOnlyRoutesDeps);
registerRoutes(app, testDeps);

registerApiV1Routes(app, {
  authenticationService: authService,
  userRepository,
  catalogService
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  if (err instanceof SyntaxError && (err as SyntaxError & { status?: number }).status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON' });
  }
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Re-export for lifecycle (closeTestServer needs guestDeckPersistence)
export { app, guestDeckPersistence, databaseInit, userRepository, deckRepository, cardRepository };
