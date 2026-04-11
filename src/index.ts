import 'dotenv/config';
import express from 'express';
import { DataSourceConfig } from './config/DataSourceConfig';
import { DeckPersistenceService } from './services/deckPersistence';
import { DatabaseInitializationService } from './services/databaseInitialization';
import { DeckService } from './services/deckService';
import { AuthenticationService } from './services/AuthenticationService';
import { NewUserSampleDeckService } from './services/newUserSampleDeckService';
import { DeckValidationService } from './services/deckValidationService';
import { CollectionsRepository } from './database/collectionsRepository';
import { createSessionRepositoryFromDataSource } from './database/sessionRepository';
import { CollectionService } from './services/collectionService';
import { DeckBackgroundService } from './services/deckBackgroundService';
import { GuestDeckPersistenceService } from './services/guestDeckPersistence';
import { FoilCardMapRepository } from './database/foilCardMapRepository';
import { registerRoutes, type RouteDependencies } from './routes';
import { transformDeckList } from './api/deckTransform';
import { CatalogService } from './api/services/catalogService';
import { registerApiV1Routes } from './api/http/registerApiV1Routes';
import { registerLegacyDeckReadCompatRoutes } from './api/http/legacyDeckReadCompat.http';
import { DbvSupportService } from './api/services/dbvSupportService';
import { DeckListService } from './api/services/deckListService';
import { DeckStatsService } from './api/services/deckStatsService';
import { DeckWriteService } from './api/services/deckWriteService';
import { DeckDetailService } from './api/services/deckDetailService';
import { DeckCardsService } from './api/services/deckCardsService';
import { DeckUIPreferencesService } from './api/services/deckUIPreferencesService';
import { GuestDeckService } from './api/services/guestDeckService';
import { AdminService } from './api/services/adminService';
import { requireAdmin, blockGuestMutation, requireDeckOwner } from './middleware/authorizationHelpers';
import { setupMiddleware } from './middleware/setup';
import {
  createEndpointHitMetricsMiddleware,
  enumerateExpressRoutes,
  pruneStaleEndpointHitCounts,
  seedEndpointHitCounts
} from './metrics/endpointHitMetrics';
import { execSync } from 'child_process';
import { createDeckAddValidation } from './services/deck-add-validation/deck-add-validation';

export const app = express();
const PORT = process.env.PORT || 8085;

// Trust proxy for correct req.ip when behind nginx/load balancer (see src/middleware/README.md)
app.set('trust proxy', 1);

// Initialize services
new DeckPersistenceService();
const databaseInit = new DatabaseInitializationService();
const dataSource = DataSourceConfig.getInstance();
const userRepository = dataSource.getUserRepository();
const deckRepository = dataSource.getDeckRepository();
const cardRepository = dataSource.getCardRepository();
const deckAddValidation = createDeckAddValidation(cardRepository);
export const {
  validateCardAddition,
  checkIfCardIsCataclysm,
  checkIfCardIsAssist,
  checkIfCardIsAmbush,
  checkIfCardIsFortification,
  checkIfCardIsOnePerDeck
} = deckAddValidation;
const deckValidationService = new DeckValidationService(cardRepository);

// Initialize business logic service
const deckBusinessService = new DeckService(deckRepository);

// Initialize authentication service
const newUserSampleDeckService = new NewUserSampleDeckService(userRepository, deckRepository);
const sessionRepository = createSessionRepositoryFromDataSource(dataSource);
const authService = new AuthenticationService(userRepository, sessionRepository, newUserSampleDeckService);

// Initialize collection repository and service
const collectionsRepository = new CollectionsRepository(dataSource.getPool());
const collectionService = new CollectionService(collectionsRepository);

// Initialize deck background service
const deckBackgroundService = new DeckBackgroundService();

// Initialize guest deck persistence (session-scoped, in-memory; not persisted to DB)
const guestDeckPersistence = new GuestDeckPersistenceService();

// Exported for test server bootstrap (M2) so test app can reuse same DB init and guest deck cleanup
export { databaseInit, guestDeckPersistence };

// Initialize foil card map repository
const foilCardMapRepository = new FoilCardMapRepository(dataSource.getPool());

const catalogService = new CatalogService(cardRepository, foilCardMapRepository);
const dbvSupportService = new DbvSupportService(() => dataSource.getPool());
const deckListService = new DeckListService(deckRepository);
const deckStatsService = new DeckStatsService(deckRepository);
const deckWriteService = new DeckWriteService(deckBusinessService, deckValidationService);
const deckDetailService = new DeckDetailService(deckRepository);
const deckCardsService = new DeckCardsService(deckRepository, {
  validateCardAddition,
  checkIfCardIsCataclysm,
  checkIfCardIsAssist,
  checkIfCardIsAmbush,
  checkIfCardIsFortification,
  checkIfCardIsOnePerDeck
});
const deckUIPreferencesService = new DeckUIPreferencesService(deckRepository);

const guestDeckService = new GuestDeckService({
  guestDeckPersistence,
  deckRepository,
  validateCardAddition,
  checkIfCardIsOnePerDeck,
  checkIfCardIsCataclysm
});

const adminService = new AdminService({
  userRepository,
  deckRepository,
  cardRepository,
  databaseInit
});

// Function to get git information
function getGitInfo() {
  // In production (Docker), use environment variables set during build
  if (process.env.NODE_ENV === 'production') {
    return {
      commit: process.env.GIT_COMMIT || 'unknown',
      shortCommit: process.env.GIT_SHORT_COMMIT || 'unknown',
      branch: process.env.GIT_BRANCH || 'unknown',
      commitDate: process.env.GIT_COMMIT_DATE || 'unknown',
      commitMessage: process.env.GIT_COMMIT_MESSAGE || 'unknown',
      commitAuthor: process.env.GIT_COMMIT_AUTHOR || 'unknown',
      commitEmail: process.env.GIT_COMMIT_EMAIL || 'unknown'
    };
  }
  
  // In development, try to run git commands
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const shortCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
    const commitMessage = execSync('git log -1 --format=%s', { encoding: 'utf8' }).trim();
    const commitAuthor = execSync('git log -1 --format=%an', { encoding: 'utf8' }).trim();
    const commitEmail = execSync('git log -1 --format=%ae', { encoding: 'utf8' }).trim();
    return { 
      commit, 
      shortCommit,
      branch, 
      commitDate,
      commitMessage,
      commitAuthor,
      commitEmail
    };
  } catch {
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
}

// Middleware (first block: body, cookie, static image mounts)
setupMiddleware(app);

if (process.env.NODE_ENV !== 'test') {
  app.use(createEndpointHitMetricsMiddleware(dataSource.getPool()));
}

// Initialize database
async function initializeServer() {
  try {
    console.log('🔄 Starting server initialization...');
    
    // First, initialize database with Flyway migrations and data
    await databaseInit.initializeDatabase();

    if (process.env.NODE_ENV !== 'test') {
      const endpointKeys = enumerateExpressRoutes(app);
      await seedEndpointHitCounts(dataSource.getPool(), endpointKeys);
      await pruneStaleEndpointHitCounts(dataSource.getPool(), endpointKeys);
    }

    // Migrations may have changed card rows; drop cached catalog payloads from any prior in-process state
    (cardRepository as { clearCaches?: () => void }).clearCaches?.();
    
    // Then initialize the in-memory repositories
    await Promise.all([
      userRepository.initialize(),
      deckRepository.initialize(),
      cardRepository.initialize()
    ]);
    
    console.log('🚀 Excelsior Deckbuilder server running on port', PORT);
    console.log('📖 API documentation available at http://localhost:' + PORT);
    
    // Start the server
    // In production/Docker, bind to 0.0.0.0 to accept connections from nginx
    // In development, bind to 127.0.0.1 to avoid macOS firewall restrictions
    const port = typeof PORT === 'string' ? parseInt(PORT) : PORT;
    const bindAddress = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
    app.listen(port, bindAddress, () => {
      console.log('🌐 Server is listening on port', port, 'on', bindAddress);
    });
    
    // Try to get card stats in the background (non-blocking)
    cardRepository.getCardStats()
      .then(cardStats => {
        console.log('🔍 Database loaded:', cardStats.characters, 'characters,', cardStats.locations, 'locations');
      })
      .catch(err => {
        console.warn('⚠️ Could not load card stats (server still running):', err.message);
      });
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      // In tests, rethrow to allow the test runner to handle the failure without exiting
      throw error;
    }
  }
}

// Start the server (skip during unit tests)
if (process.env.NODE_ENV !== 'test') {
  initializeServer();
}

// Authentication middleware
const authenticateUser = authService.createAuthMiddleware();

registerRoutes(app, {
  authService,
  authenticateUser,
  deckRepository,
  cardRepository,
  catalogService,
  userRepository,
  deckValidationService,
  deckBusinessService,
  collectionService,
  deckBackgroundService,
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
  transformDeckList
} as unknown as RouteDependencies);

registerApiV1Routes(app, {
  authenticationService: authService,
  userRepository,
  catalogService,
  dbvSupportService,
  authenticateUser,
  deckBackgroundService,
  deckListService,
  deckStatsService,
  deckWriteService,
  deckDetailService,
  deckCardsService,
  deckUIPreferencesService,
  collectionService,
  guestDeckService,
  adminService
});

registerLegacyDeckReadCompatRoutes(app, {
  authenticateUser,
  deckDetailService
});

