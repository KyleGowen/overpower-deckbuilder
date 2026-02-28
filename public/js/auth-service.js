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
    window.__flashDebug && window.__flashDebug('FrontendAuthService: constructor start');
    this.currentUser = null;
    this.isReadOnlyMode = false;
    this.initializeFromStorage();
    window.__flashDebug && window.__flashDebug('FrontendAuthService: constructor done');
  }

  initializeFromStorage() {
    window.__flashDebug && window.__flashDebug('FrontendAuthService.initializeFromStorage: start');
    try {
      const storedUser = this.getStoredUser();
      window.__flashDebug && window.__flashDebug('FrontendAuthService.initializeFromStorage: storedUser=' + !!storedUser);
      if (storedUser) {
        this.currentUser = storedUser;
        window.__flashDebug && window.__flashDebug('FrontendAuthService.initializeFromStorage: calling hideLoginModal');
        this.hideLoginModal();
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
    }
    window.__flashDebug && window.__flashDebug('FrontendAuthService.initializeFromStorage: done');
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

  async checkAuthentication() {
    window.__flashDebug && window.__flashDebug('FrontendAuthService.checkAuthentication: start');
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
    window.__flashDebug && window.__flashDebug('FrontendAuthService.checkAuthentication: storedUser=' + !!storedUser);
    if (storedUser) {
      this.currentUser = storedUser;
      authResult.currentUser = this.currentUser;

      // Verify the session is still valid
      try {
        window.__flashDebug && window.__flashDebug('FrontendAuthService.checkAuthentication: fetching /api/auth/me');
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        window.__flashDebug && window.__flashDebug('FrontendAuthService.checkAuthentication: /api/auth/me response status=' + response.status);
        
        if (response.ok) {
          const data = await response.json();
          this.currentUser = data.data;
          this.storeUser(this.currentUser);
          authResult.isAuthenticated = true;
          authResult.currentUser = this.currentUser;
          window.__flashDebug && window.__flashDebug('FrontendAuthService.checkAuthentication: session valid, isAuthenticated=true');
        } else {
          // Session expired, clear stored user
          window.__flashDebug && window.__flashDebug('FrontendAuthService.checkAuthentication: session EXPIRED (non-ok response), calling showLoginModal');
          this.clearStoredUser();
          this.currentUser = null;
          authResult.currentUser = null;
          // Show login modal when session expires
          await this.showLoginModal();
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        window.__flashDebug && window.__flashDebug('FrontendAuthService.checkAuthentication: /api/auth/me ERROR, calling showLoginModal', String(error));
        this.clearStoredUser();
        this.currentUser = null;
        authResult.currentUser = null;
        // Show login modal on error
        await this.showLoginModal();
      }
    }

    // Read-only mode removed - now handled by backend flag

    window.__flashDebug && window.__flashDebug('FrontendAuthService.checkAuthentication: done, isAuthenticated=' + authResult.isAuthenticated);
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
    window.__flashDebug && window.__flashDebug('FrontendAuthService.logout: start, calling /api/auth/logout');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.__flashDebug && window.__flashDebug('FrontendAuthService.logout: fetch completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      window.__flashDebug && window.__flashDebug('FrontendAuthService.logout: fetch ERRORED', String(error));
    } finally {
      window.__flashDebug && window.__flashDebug('FrontendAuthService.logout: finally block start');
      window.__flashDebug && window.__flashDebug('FrontendAuthService.logout: loginModal state in finally',
          (function() { var lm = document.getElementById('loginModal'); return lm ? 'display=' + (lm.style.display || '(css)') : 'absent'; })()
      );
      this.currentUser = null;
      this.clearStoredUser();
      window.__flashDebug && window.__flashDebug('FrontendAuthService.logout: after clearStoredUser, localStorage.currentUser=' + !!localStorage.getItem('currentUser'));
      // Do NOT call showLoginModal() here — the caller (auth-app-init.logout) always redirects
      // to '/', so the new page handles showing the login modal. Calling showLoginModal() here
      // causes the login modal to flash on top of the current app page before the redirect fires.
      window.__flashDebug && window.__flashDebug('FrontendAuthService.logout: finally block done (no showLoginModal called)');
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

  async loginWithGoogle(idToken) {
    try {
      const response = await fetch('/api/auth/google', {
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
    window.__flashDebug && window.__flashDebug('FrontendAuthService.hideLoginModal: called');
    console.trace('[FLASH] hideLoginModal stack');
    const loginModal = document.getElementById('loginModal');
    window.__flashDebug && window.__flashDebug('FrontendAuthService.hideLoginModal: loginModal=' + !!loginModal);
    if (loginModal) {
      loginModal.style.display = 'none';
    }
  }

  async showLoginModal() {
    window.__flashDebug && window.__flashDebug('FrontendAuthService.showLoginModal: start');
    // Ensure login modal exists before showing it
    let loginModal = document.getElementById('loginModal');
    window.__flashDebug && window.__flashDebug('FrontendAuthService.showLoginModal: loginModal in DOM=' + !!loginModal);
    
    if (!loginModal) {
      // Try to load login template if available
      window.__flashDebug && window.__flashDebug('FrontendAuthService.showLoginModal: no loginModal, calling loadLoginTemplate');
      if (typeof loadLoginTemplate === 'function') {
        await loadLoginTemplate();
      } else if (typeof window.loadLoginTemplate === 'function') {
        await window.loadLoginTemplate();
      }
      
      // Try again after loading
      loginModal = document.getElementById('loginModal');
      window.__flashDebug && window.__flashDebug('FrontendAuthService.showLoginModal: after loadLoginTemplate, loginModal=' + !!loginModal);
    }
    
    if (loginModal) {
      window.__flashDebug && window.__flashDebug('FrontendAuthService.showLoginModal: setting loginModal.style.display = flex');
      loginModal.style.display = 'flex';
    } else {
      // If still no modal, call the global showLoginModal function which has fallback
      window.__flashDebug && window.__flashDebug('FrontendAuthService.showLoginModal: still no modal, delegating to global showLoginModal');
      if (typeof showLoginModal === 'function') {
        await showLoginModal();
      } else if (typeof window.showLoginModal === 'function') {
        await window.showLoginModal();
      }
    }
    window.__flashDebug && window.__flashDebug('FrontendAuthService.showLoginModal: done');
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
