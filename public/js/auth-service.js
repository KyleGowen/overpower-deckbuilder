/* ========================================
 * PHASE 5: AUTHENTICATION FUNCTIONS
 * ========================================
 * 
 * This file contains user authentication and session management functions
 * extracted from index.html during Phase 5 of the refactoring project.
 * 
 * Purpose: User authentication and session management
 * Created: Phase 5 of 12-phase refactoring project
 * Contains:
 *   - login() - User login functionality
 *   - logout() - User logout functionality
 *   - checkAuthentication() - Session verification
 *   - showLoginModal() - Login modal management
 *   - showLoginError() / hideLoginError() - Error handling
 * 
 * ======================================== */


class FrontendAuthService {
  constructor() {
    this.currentUser = null;
    this.isReadOnlyMode = false;
    this.initializeFromStorage();
  }

  initializeFromStorage() {
    try {
      const storedUser = this.getStoredUser();
      if (storedUser) {
        this.currentUser = storedUser;
        this.hideLoginModal();
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  isInReadOnlyMode() {
    return this.isReadOnlyMode;
  }

  setReadOnlyMode(readOnly) {
    this.isReadOnlyMode = readOnly;
  }

  /**
   * Map GET /api/auth/me `data` (full User or legacy { userId, username }) to a stable client user shape.
   */
  normalizeUserFromSessionPayload(u) {
    if (!u || typeof u !== 'object') return null;
    const id = u.id ?? u.userId;
    if (!id) return null;
    return {
      id,
      name: u.name ?? u.username ?? '',
      email: u.email ?? '',
      role: u.role || 'USER'
    };
  }

  async checkAuthentication() {
    const authResult = {
      isAuthenticated: false,
      currentUser: null,
      deckId: null,
      urlUserId: null,
      isReadOnlyMode: false
    };

    // Extract deck ID and user ID from URL
    const deckUrlMatch = window.location.pathname.match(/\/users\/([^\/]+)\/decks\/([^\/]+)/);
    if (deckUrlMatch) {
      authResult.urlUserId = deckUrlMatch[1];
      authResult.deckId = deckUrlMatch[2];
      console.log('Detected deck editor route for deck:', authResult.deckId, 'user:', authResult.urlUserId);
    }

    // Check if we have a user in localStorage
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.currentUser = storedUser;
      authResult.currentUser = this.currentUser;

      // Verify the session is still valid
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const normalized = this.normalizeUserFromSessionPayload(data.data);
          if (normalized) {
            this.currentUser = normalized;
            this.storeUser(this.currentUser);
            authResult.isAuthenticated = true;
            authResult.currentUser = this.currentUser;
          } else {
            this.clearStoredUser();
            this.currentUser = null;
            authResult.currentUser = null;
            await this.showLoginModal();
          }
        } else {
          // Sessions live in server memory — restart drops them while localStorage still has the user.
          // GUEST: transparently re-establish session so guest decks and /api/v1/guest/* keep working.
          let recovered = false;
          if (storedUser.role === 'GUEST') {
            const gr = await this.guestLogin();
            recovered = !!(gr.success && gr.data);
          }
          if (recovered) {
            authResult.isAuthenticated = true;
            authResult.currentUser = this.currentUser;
            this.hideLoginModal();
          } else {
            this.clearStoredUser();
            this.currentUser = null;
            authResult.currentUser = null;
            await this.showLoginModal();
          }
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        this.clearStoredUser();
        this.currentUser = null;
        authResult.currentUser = null;
        // Show login modal on error
        await this.showLoginModal();
      }
    }

    // Read-only mode removed - now handled by backend flag

    return authResult;
  }

  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Login response parse error:', parseError);
        return {
          success: false,
          error: response.status >= 500
            ? 'Server is temporarily unavailable. Please try again in a few moments.'
            : 'Login failed'
        };
      }

      if (data.success && data.data) {
        this.currentUser = {
          id: data.data.userId,
          name: data.data.username,
          email: '',
          role: data.data.role || 'USER'
        };
        this.storeUser(this.currentUser);
        this.hideLoginModal();
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.signOutFirebaseIfInitialized();
      this.currentUser = null;
      this.clearStoredUser();
      // Do NOT call showLoginModal() here — the caller (auth-app-init.logout) always redirects
      // to '/', so the new page handles showing the login modal. Calling showLoginModal() here
      // causes the login modal to flash on top of the current app page before the redirect fires.
    }
  }

  async signOutFirebaseIfInitialized() {
    try {
      if (typeof initializeFirebase === 'function') {
        const auth = await initializeFirebase();
        if (auth && typeof auth.signOut === 'function') {
          await auth.signOut();
        }
      }
    } catch (error) {
      console.error('Firebase sign-out error:', error);
    }
  }

  async previewGoogleLogin(idToken) {
    try {
      const response = await fetch('/api/auth/google/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken })
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Google preview response parse error:', parseError);
        return {
          success: false,
          error: response.status >= 500
            ? 'Server is temporarily unavailable. Please try again in a few moments.'
            : 'Google sign-in failed'
        };
      }

      if (!response.ok && !data.error) {
        data.success = false;
        data.error = data.error || 'Google sign-in failed';
      }

      return data;
    } catch (error) {
      console.error('Google preview error:', error);
      return { success: false, error: 'Google sign-in failed' };
    }
  }

  async guestLogin() {
    return this.login({ username: 'guest', password: 'guest' });
  }

  async signup(credentials) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        // Server returned HTML (e.g. 502 Bad Gateway) or other non-JSON
        console.error('Signup response parse error:', parseError);
        return {
          success: false,
          error: response.status >= 500
            ? 'Server is temporarily unavailable. Please try again in a few moments.'
            : 'Failed to create account'
        };
      }

      if (data.success && data.data) {
        this.currentUser = {
          id: data.data.userId,
          name: data.data.username,
          email: '',
          role: data.data.role || 'USER'
        };
        this.storeUser(this.currentUser);
        this.hideLoginModal();
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }

  async loginWithGoogle(idToken, options = {}) {
    try {
      const payload = { idToken };
      if (options.confirmRegistration === true) {
        payload.confirmRegistration = true;
      }

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Google login response parse error:', parseError);
        return {
          success: false,
          error: response.status >= 500
            ? 'Server is temporarily unavailable. Please try again in a few moments.'
            : 'Google sign-in failed'
        };
      }

      if (data.success && data.data) {
        this.currentUser = {
          id: data.data.userId,
          name: data.data.username,
          email: '',
          role: data.data.role || 'USER'
        };
        this.storeUser(this.currentUser);
        this.hideLoginModal();
      }

      return data;
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Google sign-in failed' };
    }
  }

  getStoredUser() {
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
    return null;
  }

  storeUser(user) {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  clearStoredUser() {
    try {
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error clearing stored user:', error);
    }
  }

  hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      loginModal.style.display = 'none';
    }
  }

  async showLoginModal() {
    // Ensure login modal exists before showing it
    let loginModal = document.getElementById('loginModal');
    
    if (!loginModal) {
      // Try to load login template if available
      if (typeof loadLoginTemplate === 'function') {
        await loadLoginTemplate();
      } else if (typeof window.loadLoginTemplate === 'function') {
        await window.loadLoginTemplate();
      }
      
      // Try again after loading
      loginModal = document.getElementById('loginModal');
    }
    
    if (loginModal) {
      loginModal.style.display = 'flex';
    } else {
      // If still no modal, call the global showLoginModal function which has fallback
      if (typeof showLoginModal === 'function') {
        await showLoginModal();
      } else if (typeof window.showLoginModal === 'function') {
        await window.showLoginModal();
      }
    }
  }

  getUserId() {
    return this.currentUser ? this.currentUser.id : null;
  }

  getUsername() {
    return this.currentUser ? this.currentUser.name : null;
  }

  getUserIdForUrl() {
    if (this.currentUser) {
      // Handle both 'userId' and 'id' properties for backward compatibility
      return this.currentUser.userId || this.currentUser.id;
    }
    return 'guest';
  }
}

// Create global instance
window.authService = new FrontendAuthService();

// Legacy compatibility functions
function getCurrentUser() {
  return window.authService.getCurrentUser();
}

// isReadOnlyMode is managed as a global variable in the main script

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FrontendAuthService;
}
