/**
 * Route dependency types. RouteDependencies is provided by the composition root (src/index.ts).
 * Narrow *RoutesDeps types are used by each registerXxxRoutes so modules only declare what they use.
 */
import express, { Request, Response } from 'express';
import type { CatalogService } from '../api/services/catalogService';
export interface RouteDependencies {
  authService: { handleLogin: (req: express.Request, res: Response) => void; handleSignup: (req: express.Request, res: Response) => void; handleGoogleLoginPreview: (req: express.Request, res: Response) => void; handleGoogleLogin: (req: express.Request, res: Response) => void; handleLogout: (req: express.Request, res: Response) => void; handleSessionValidation: (req: express.Request, res: Response) => void; createAuthMiddleware: () => express.RequestHandler; destroySession: (sessionId: string) => Promise<void> };
  authenticateUser: express.RequestHandler;
  deckRepository: {
    getDecksByUserId: (userId: string) => Promise<unknown[]>;
    getDeckById: (id: string) => Promise<Record<string, unknown>>;
    getDeckSummaryWithAllCards: (id: string) => Promise<Record<string, unknown>>;
    getDeckCards?: (deckId: string) => Promise<Array<{ type: string; cardId: string }>>;
    updateDeck: (id: string, updates: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteDeck: (id: string) => Promise<boolean>;
    addCardToDeck: (deckId: string, cardType: string, cardId: string, quantity: number) => Promise<boolean>;
    replaceAllCardsInDeck: (deckId: string, cards: unknown[]) => Promise<void>;
    removeCardFromDeck: (deckId: string, cardType: string, cardId: string, quantity: number) => Promise<boolean>;
    removeAllCardsFromDeck: (deckId: string) => Promise<boolean>;
    userOwnsDeck: (deckId: string, userId: string) => Promise<boolean>;
    doesCardExistInDeck: (deckId: string, cardType: string, cardId: string) => Promise<boolean>;
    getUIPreferences: (id: string) => Promise<unknown>;
    updateUIPreferences: (id: string, preferences: unknown) => Promise<boolean>;
  };
  cardRepository: Record<string, (...args: unknown[]) => Promise<unknown>>;
  /** Card catalog + foil map reads for `/api/v1/catalog/*` (via `CatalogService` in the API layer). */
  catalogService: CatalogService;
  userRepository: Record<string, (...args: unknown[]) => Promise<unknown>>;
  deckValidationService: { validateDeck: (cards: unknown[]) => Promise<unknown[]> };
  deckBusinessService: { createDeck: (userId: string, name: string, description: string, characters?: unknown) => Promise<unknown> };
  collectionService: Record<string, (...args: unknown[]) => Promise<unknown>>;
  deckBackgroundService: Record<string, (...args: unknown[]) => Promise<unknown>>;
  foilCardMapRepository: { getFoilCardMap: () => Promise<unknown[]> };
  databaseInit: { validateDatabase: () => Promise<boolean>; checkDatabaseStatus: () => Promise<boolean> };
  dataSource: { getPool: () => {
    connect: () => Promise<{ query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>; release: () => void }>;
    query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  } };
  validateCardAddition: (currentCards: { type: string; cardId: string; quantity: number }[], cardType: string, cardId: string, quantity: number) => Promise<string | null>;
  checkIfCardIsCataclysm: (cardType: string, cardId: string) => Promise<boolean>;
  checkIfCardIsAssist: (cardType: string, cardId: string) => Promise<boolean>;
  checkIfCardIsAmbush: (cardType: string, cardId: string) => Promise<boolean>;
  checkIfCardIsFortification: (cardType: string, cardId: string) => Promise<boolean>;
  checkIfCardIsOnePerDeck: (cardType: string, cardId: string) => Promise<boolean>;
  getGitInfo: () => { commit: string; shortCommit: string; branch: string; commitDate: string; commitMessage: string; commitAuthor: string; commitEmail: string };
  requireAdmin: (req: Request, res: Response) => boolean;
  blockGuestMutation: (req: Request, res: Response, operation: string) => boolean;
  requireDeckOwner: (deckUserId: string, reqUserId: string, res: Response) => boolean | Promise<boolean>;
  transformDeckList: (decks: unknown[]) => unknown[];
  userAccountService: {
    changePassword: (
      userId: string,
      role: import('../types').UserRole | undefined,
      newPassword: string,
      confirmPassword: string
    ) => Promise<
      | { ok: true; status: number; data: { message: string } }
      | { ok: false; status: number; code: string; message: string }
    >;
  };
}

/** Dependencies for auth and config routes only. */
export type AuthRoutesDeps = Pick<RouteDependencies, 'authService'>;

/** Dependencies for legacy `POST /api/users/change-password` only. */
export type UsersDebugRoutesDeps = Pick<RouteDependencies, 'authenticateUser' | 'userAccountService'>;

/** Dependencies for page/SPA routes. */
export type PageRoutesDeps = Pick<RouteDependencies, 'authService' | 'authenticateUser'>;

/** Dependencies for static and health routes. */
export type StaticHealthRoutesDeps = Pick<RouteDependencies, 'getGitInfo' | 'dataSource' | 'authenticateUser'>;

/** Shape of deck record returned by deckRepository.getDeckById / getDeckSummaryWithAllCards (typed for route handlers). */
export interface DeckRecord {
  id?: string;
  user_id?: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  cards?: Array<{ type: string; cardId: string; quantity?: number }>;
  card_count?: number;
  ui_preferences?: unknown;
  is_limited?: boolean;
  reserve_character?: string;
  display_mission_card_id?: string | null;
  background_image_path?: string;
}

/** Validation error shape from deckValidationService.validateDeck. */
export interface DeckValidationError {
  message: string;
}
