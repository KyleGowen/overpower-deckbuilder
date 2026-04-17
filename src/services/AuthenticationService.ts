import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repository/UserRepository';
import { User } from '../types';
import crypto from 'crypto';
import { sendV1Unauthorized } from '../api/http/v1Envelope';
import { initializeFirebaseAdmin, getFirebaseAdmin } from '../config/firebaseAdmin';
import { checkLimit, recordCreation } from '../middleware/newAccountRateLimiter';
import { NewUserSampleDeckService } from './newUserSampleDeckService';
import { type ISessionRepository, SESSION_TTL_MS } from '../database/sessionRepository';
import { buildSessionCookieOptions } from './authCookieOptions';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    userId: string;
    username: string;
  };
  error?: string;
}

export class AuthenticationService {
  private userRepository: UserRepository;
  private sessionRepository: ISessionRepository;
  private newUserSampleDeckService: NewUserSampleDeckService | null;

  constructor(
    userRepository: UserRepository,
    sessionRepository: ISessionRepository,
    newUserSampleDeckService?: NewUserSampleDeckService
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.newUserSampleDeckService = newUserSampleDeckService ?? null;
    initializeFirebaseAdmin();
  }

  /**
   * Authenticate user with username and password
   * Uses database authentication only
   */
  public async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    try {
      // Use database authentication only
      const dbUser = await this.userRepository.authenticateUser(credentials.username, credentials.password);
      return dbUser || null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Create a new session for the user (persisted in Postgres).
   */
  public async createSession(user: User): Promise<string> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await this.sessionRepository.insert(user.id, sessionId, expiresAt);
    return sessionId;
  }

  /**
   * Validate a session and return user if valid; slides expiry on success.
   */
  public async validateSession(sessionId: string): Promise<{ userId: string } | null> {
    try {
      const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
      const userId = await this.sessionRepository.validateAndSlideExpiry(sessionId, newExpiresAt);
      if (!userId) {
        return null;
      }
      return { userId };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Destroy a session
   */
  public async destroySession(sessionId: string): Promise<void> {
    try {
      await this.sessionRepository.deleteByToken(sessionId);
    } catch (error) {
      console.error('Session destroy error:', error);
    }
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: string): Promise<User | null> {
    try {
      // Use database only
      const user = await this.userRepository.getUserById(userId);
      return user || null;
    } catch (error) {
      console.error('Error getting user by ID from database:', error);
      return null;
    }
  }

  /**
   * Handle login request
   */
  public async handleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ success: false, error: 'Username and password are required' });
        return;
      }

      const user = await this.authenticateUser({ username, password });

      if (user) {
        const sessionId = await this.createSession(user);

        res.cookie('sessionId', sessionId, buildSessionCookieOptions(req, SESSION_TTL_MS));
        // Update last_login_at on successful login/session creation
        try {
          await this.userRepository.updateLastLoginAt(user.id);
        } catch (e) {
          // Do not fail login if timestamp update fails; log and continue
          console.error('Warning: failed to update last_login_at:', e);
        }

        res.json({
          success: true,
          data: {
            userId: user.id,
            username: user.name,
            role: user.role
          }
        });
      } else {
        res.status(401).json({ success: false, error: 'Invalid username or password' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  }

  /**
   * Handle logout request
   */
  public async handleLogout(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.cookies?.sessionId;

      if (sessionId) {
        await this.destroySession(sessionId);
      }

      res.clearCookie('sessionId');
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, error: 'Logout failed' });
    }
  }

  /**
   * Handle Google login request.
   * Verifies Firebase ID token, finds or creates user, creates session.
   */
  public async handleGoogleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;
      if (!idToken || typeof idToken !== 'string') {
        res.status(400).json({ success: false, error: 'idToken is required' });
        return;
      }

      const firebaseAdmin = getFirebaseAdmin();
      if (!firebaseAdmin) {
        res.status(503).json({ success: false, error: 'Google sign-in is not configured' });
        return;
      }

      let decodedToken: { uid: string; email?: string; name?: string };
      try {
        decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      } catch (err) {
        console.error('Firebase token verification failed:', err);
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
        return;
      }

      const firebaseUid = decodedToken.uid;
      const email = decodedToken.email || '';
      const name = decodedToken.name || decodedToken.email?.split('@')[0] || 'Google User';

      // 1. Lookup by Firebase UID first
      let user = await this.userRepository.getUserByFirebaseUid(firebaseUid);

      // 2. If no user by Firebase UID, lookup by email for linking (exclude GUEST)
      if (!user && email) {
        const existingByEmail = await this.userRepository.getUserByEmail(email);
        if (existingByEmail && existingByEmail.role !== 'GUEST') {
          await this.userRepository.linkGoogleToUser(existingByEmail.id, firebaseUid);
          user = existingByEmail;
        }
      }

      // 3. If no user, create new Google user (with rate limit check)
      if (!user) {
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        if (!checkLimit(ip)) {
          res.status(429).json({ success: false, error: 'Too many new accounts. Please try again later.' });
          return;
        }
        recordCreation(ip);
        user = await this.userRepository.createGoogleUser(email, name, firebaseUid);
        if (this.newUserSampleDeckService) {
          try {
            await this.newUserSampleDeckService.copyRandomGuestDeckForUser(user.id);
          } catch (e) {
            console.error('Warning: failed to copy sample deck for new Google user:', e);
          }
        }
      }

      const sessionId = await this.createSession(user);
      res.cookie('sessionId', sessionId, buildSessionCookieOptions(req, SESSION_TTL_MS));

      try {
        await this.userRepository.updateLastLoginAt(user.id);
      } catch (e) {
        console.error('Warning: failed to update last_login_at:', e);
      }

      res.json({
        success: true,
        data: { userId: user.id, username: user.name, role: user.role }
      });
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).json({ success: false, error: 'Google sign-in failed' });
    }
  }

  /** Simple email format validation - requires local@domain.tld pattern */
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Handle signup request (public, unauthenticated).
   * Creates user, applies rate limit (5/IP/min, 10 global/min), establishes session.
   */
  public async handleSignup(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || typeof username !== 'string' || !username.trim()) {
        res.status(400).json({ success: false, error: 'Username is required' });
        return;
      }
      if (!email || typeof email !== 'string' || !email.trim()) {
        res.status(400).json({ success: false, error: 'Email is required' });
        return;
      }
      if (!password || typeof password !== 'string') {
        res.status(400).json({ success: false, error: 'Password is required' });
        return;
      }

      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim();

      if (!AuthenticationService.EMAIL_REGEX.test(trimmedEmail)) {
        res.status(400).json({ success: false, error: 'Invalid email format' });
        return;
      }

      const ip = req.ip || req.socket?.remoteAddress || 'unknown';
      if (!checkLimit(ip)) {
        res.status(429).json({ success: false, error: 'Too many new accounts. Please try again later.' });
        return;
      }

      const existingByUsername = await this.userRepository.getUserByUsername(trimmedUsername);
      if (existingByUsername) {
        res.status(409).json({ success: false, error: 'Username already exists' });
        return;
      }

      const existingByEmail = await this.userRepository.getUserByEmail(trimmedEmail);
      if (existingByEmail) {
        res.status(409).json({ success: false, error: 'Email already exists' });
        return;
      }

      recordCreation(ip);
      const user = await this.userRepository.createUser(trimmedUsername, trimmedEmail, password, 'USER');

      if (this.newUserSampleDeckService) {
        try {
          await this.newUserSampleDeckService.copyRandomGuestDeckForUser(user.id);
        } catch (e) {
          console.error('Warning: failed to copy sample deck for new user:', e);
        }
      }

      const sessionId = await this.createSession(user);
      res.cookie('sessionId', sessionId, buildSessionCookieOptions(req, SESSION_TTL_MS));

      try {
        await this.userRepository.updateLastLoginAt(user.id);
      } catch (e) {
        console.error('Warning: failed to update last_login_at:', e);
      }

      res.status(201).json({
        success: true,
        data: { userId: user.id, username: user.name, role: user.role }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ success: false, error: 'Failed to create account' });
    }
  }

  /**
   * Handle session validation request
   */
  public async handleSessionValidation(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.cookies?.sessionId;

      if (!sessionId) {
        res.status(401).json({ success: false, error: 'No session found' });
        return;
      }

      const session = await this.validateSession(sessionId);

      if (!session) {
        res.status(401).json({ success: false, error: 'Invalid or expired session' });
        return;
      }

      // Get the full user object
      const user = await this.getUserById(session.userId);

      if (!user) {
        res.status(401).json({ success: false, error: 'User not found' });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({ success: false, error: 'Session validation failed' });
    }
  }

  /**
   * Authentication middleware
   */
  public createAuthMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const sessionId = req.cookies?.sessionId;
      const { userId } = req.params;

      // Special handling for guest routes - allow access without session for any user with GUEST role
      if (userId === 'guest') {
        // Find any user with GUEST role
        const allUsers = await this.userRepository.getAllUsers();
        const guestUser = allUsers.find(user => user.role === 'GUEST');
        if (guestUser) {
          (req as unknown as Record<string, unknown>).user = guestUser;
          return next();
        }
      }

      if (!sessionId) {
        // Return JSON error for API calls, redirect for page requests
        if (req.originalUrl.startsWith('/api/v1')) {
          return sendV1Unauthorized(res, 'Authentication required');
        }
        if (req.originalUrl.startsWith('/api/')) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        return res.redirect('/');
      }

      const session = await this.validateSession(sessionId);

      if (!session) {
        if (req.originalUrl.startsWith('/api/v1')) {
          return sendV1Unauthorized(res, 'Invalid or expired session');
        }
        if (req.originalUrl.startsWith('/api/')) {
          return res.status(401).json({ success: false, error: 'Invalid or expired session' });
        }
        return res.redirect('/');
      }

      // Get the full user object from the database
      const user = await this.getUserById(session.userId);
      if (!user) {
        if (req.originalUrl.startsWith('/api/v1')) {
          return sendV1Unauthorized(res, 'User not found');
        }
        if (req.originalUrl.startsWith('/api/')) {
          return res.status(401).json({ success: false, error: 'User not found' });
        }
        return res.redirect('/');
      }

      (req as unknown as Record<string, unknown>).user = user;
      next();
    };
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    // Conservative hardening: crypto-strong session IDs without changing cookie flags.
    return crypto.randomBytes(32).toString('hex');
  }
}
