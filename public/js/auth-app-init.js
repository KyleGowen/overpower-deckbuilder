// Authentication and App Initialization Functions
// Extracted from index.html for better modularity

/**
 * Show the login modal and hide main application views
 * Ensures login modal exists before showing it
 */
async function showLoginModal() {
    window.__flashDebug && window.__flashDebug('auth-app-init.showLoginModal: start');
    // Ensure login modal exists before trying to show it
    let loginModal = document.getElementById('loginModal');
    window.__flashDebug && window.__flashDebug('auth-app-init.showLoginModal: loginModal in DOM=' + !!loginModal);
    
    if (!loginModal) {
        // login.js (loaded via defer) always defines loadLoginTemplate globally,
        // including its own createFallbackLoginModal fallback on fetch error.
        window.__flashDebug && window.__flashDebug('auth-app-init.showLoginModal: loginModal absent, calling loadLoginTemplate');
        if (typeof loadLoginTemplate === 'function') {
            await loadLoginTemplate();
        } else if (typeof window.loadLoginTemplate === 'function') {
            await window.loadLoginTemplate();
        }
        
        loginModal = document.getElementById('loginModal');
        window.__flashDebug && window.__flashDebug('auth-app-init.showLoginModal: after loadLoginTemplate, loginModal=' + !!loginModal);
    }
    
    // Show the login modal if it exists, and ensure login view is visible (not signup view)
    if (loginModal) {
        window.__flashDebug && window.__flashDebug('auth-app-init.showLoginModal: setting loginModal.style.display = flex');
        loginModal.style.display = 'flex';
        const loginView = document.getElementById('loginView');
        const signupView = document.getElementById('signupView');
        if (loginView) loginView.style.display = 'block';
        if (signupView) signupView.style.display = 'none';
    }
    
    // Hide main application views
    const mainContainer = document.getElementById('mainContainer');
    window.__flashDebug && window.__flashDebug('auth-app-init.showLoginModal: hiding mainContainer (present=' + !!mainContainer + ')');
    if (mainContainer) mainContainer.style.display = 'none';
    
    const databaseView = document.getElementById('database-view');
    const deckBuilder = document.getElementById('deck-builder');
    if (databaseView) databaseView.classList.add('view-removed');
    if (deckBuilder) deckBuilder.classList.add('view-removed');
    window.__flashDebug && window.__flashDebug('auth-app-init.showLoginModal: done');
}

/**
 * Display login error message to user
 * @param {string} message - Error message to display
 */
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

/**
 * Hide login error message
 */
function hideLoginError() {
    const el = document.getElementById('loginError');
    if (el) el.style.display = 'none';
}

/**
 * Display signup error message to user
 * @param {string} message - Error message to display
 */
function showSignupError(message) {
    const errorDiv = document.getElementById('signupError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

/**
 * Hide signup error message
 */
function hideSignupError() {
    const el = document.getElementById('signupError');
    if (el) el.style.display = 'none';
}

/**
 * Check authentication status using the auth service
 * @returns {Promise<Object>} Authentication result with user and read-only mode
 */
async function checkAuthentication() {
    const authResult = await window.authService.checkAuthentication();
    currentUser = authResult.currentUser;
    isReadOnlyMode = authResult.isReadOnlyMode;
    return authResult;
}

/**
 * Login user with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 */
async function login(username, password) {
    const result = await window.authService.login({ username, password });
    if (result.success) {
        currentUser = result.data;
        if (typeof window !== 'undefined') window.currentUser = currentUser;

        if (typeof updateUserWelcome === 'function') {
            updateUserWelcome();
        }

        // Client-side navigation: show deck builder without full page reload (switchToDeckBuilder updates URL)
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) mainContainer.style.display = 'block';
        if (typeof showMainApp === 'function') {
            showMainApp();
        }
    } else {
        showLoginError(result.error || 'Login failed');
    }
}

/**
 * Sign up user with username, email, and password
 * @param {Object} credentials - { username, email, password }
 */
async function signup(credentials) {
    const result = await window.authService.signup(credentials);
    if (result.success) {
        currentUser = result.data;
        if (typeof window !== 'undefined') window.currentUser = currentUser;

        if (typeof updateUserWelcome === 'function') {
            updateUserWelcome();
        }

        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) mainContainer.style.display = 'block';
        if (typeof showMainApp === 'function') {
            showMainApp();
        }
    } else {
        showSignupError(result.error || 'Failed to create account');
    }
}

/**
 * Logout current user and redirect to home page
 */
async function logout() {
    window.__flashDebug && window.__flashDebug('auth-app-init.logout: START');
    window.__flashDebug && window.__flashDebug('auth-app-init.logout: loginModal visible BEFORE authService.logout?',
        (function() { var lm = document.getElementById('loginModal'); return lm ? 'display=' + (lm.style.display || '(css)') : 'absent'; })()
    );
    await window.authService.logout();
    window.__flashDebug && window.__flashDebug('auth-app-init.logout: authService.logout() RETURNED');
    window.__flashDebug && window.__flashDebug('auth-app-init.logout: loginModal state AFTER authService.logout',
        (function() { var lm = document.getElementById('loginModal'); return lm ? 'display=' + (lm.style.display || '(css)') : 'absent'; })()
    );
    currentUser = null;
    // Hide main UI immediately to prevent flash before redirect
    const mainContainer = document.getElementById('mainContainer');
    window.__flashDebug && window.__flashDebug('auth-app-init.logout: hiding mainContainer (present=' + !!mainContainer + ', current=' + (mainContainer ? mainContainer.style.display || '(css)' : 'n/a') + ')');
    if (mainContainer) mainContainer.style.display = 'none';
    const databaseView = document.getElementById('database-view');
    const deckBuilder = document.getElementById('deck-builder');
    if (databaseView) databaseView.classList.add('view-removed');
    if (deckBuilder) deckBuilder.classList.add('view-removed');
    // Redirect to root page
    window.__flashDebug && window.__flashDebug('auth-app-init.logout: ABOUT TO REDIRECT to / — this is the last log on this page');
    window.location.href = '/';
}
