// Authentication and App Initialization Functions
// Extracted from index.html for better modularity

/**
 * Show the login modal and hide main application views
 * Ensures login modal exists before showing it
 */
async function showLoginModal() {
    // Ensure login modal exists before trying to show it
    let loginModal = document.getElementById('loginModal');
    
    if (!loginModal) {
        // Login modal doesn't exist, try to load it
        if (typeof loadLoginTemplate === 'function') {
            await loadLoginTemplate();
        } else if (typeof window.loadLoginTemplate === 'function') {
            await window.loadLoginTemplate();
        } else {
            // Fallback: create basic login modal if loading fails
            if (typeof createFallbackLoginModal === 'function') {
                createFallbackLoginModal();
            } else if (typeof window.createFallbackLoginModal === 'function') {
                window.createFallbackLoginModal();
            } else {
                // Last resort: create minimal login modal inline
                const fallbackHTML = `
                    <div id="loginModal" class="login-modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; justify-content: center; align-items: center;">
                        <div class="login-modal-content" style="background: #2c3e50; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;">
                            <div id="loginView">
                                <div class="login-header" style="text-align: center; margin-bottom: 20px;">
                                    <h2 style="color: #ecf0f1; margin: 0;">Please Log In</h2>
                                </div>
                                <form id="loginForm" class="login-form">
                                    <div class="form-group" style="margin-bottom: 15px;">
                                        <label for="username" style="display: block; color: #ecf0f1; margin-bottom: 5px;">Username</label>
                                        <input type="text" id="username" name="username" autocomplete="username" required style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #34495e; background: #34495e; color: #ecf0f1;">
                                    </div>
                                    <div class="form-group" style="margin-bottom: 15px;">
                                        <label for="password" style="display: block; color: #ecf0f1; margin-bottom: 5px;">Password</label>
                                        <input type="password" id="password" name="password" autocomplete="current-password" required style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #34495e; background: #34495e; color: #ecf0f1;">
                                    </div>
                                    <div id="loginError" class="error-message" style="display: none; color: #e74c3c; margin-bottom: 10px;"></div>
                                </form>
                                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
                                    <button type="submit" form="loginForm" class="login-btn" style="width: 100%; padding: 8px 14px; background: #4ecdc4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Log In</button>
                                    <button type="button" id="googleLoginBtn" class="google-btn" style="width: 100%; padding: 8px 14px; background: #4285f4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Sign in with Google</button>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 10px;">
                                        <button type="button" id="guestLoginBtn" class="guest-btn" style="width: 100%; padding: 8px 14px; background: transparent; color: #4ecdc4; border: 1px solid #4ecdc4; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Continue as Guest</button>
                                        <button type="button" id="signUpBtn" class="signup-btn" style="width: 100%; padding: 8px 14px; background: transparent; color: #4ecdc4; border: 1px solid #4ecdc4; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Sign Up</button>
                                    </div>
                                </div>
                            </div>
                            <div id="signupView" style="display: none;">
                                <div class="login-header" style="text-align: center; margin-bottom: 20px;">
                                    <h2 style="color: #4ecdc4; margin: 0;">Create Account</h2>
                                </div>
                                <form id="signupForm" class="login-form">
                                    <div class="form-group" style="margin-bottom: 15px;">
                                        <label for="signupUsername" style="display: block; color: #ecf0f1; margin-bottom: 5px;">Username</label>
                                        <input type="text" id="signupUsername" name="username" autocomplete="username" required style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #34495e; background: #34495e; color: #ecf0f1;">
                                    </div>
                                    <div class="form-group" style="margin-bottom: 15px;">
                                        <label for="signupEmail" style="display: block; color: #ecf0f1; margin-bottom: 5px;">Email</label>
                                        <input type="email" id="signupEmail" name="email" autocomplete="email" required style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #34495e; background: #34495e; color: #ecf0f1;">
                                    </div>
                                    <div class="form-group" style="margin-bottom: 15px;">
                                        <label for="signupPassword" style="display: block; color: #ecf0f1; margin-bottom: 5px;">Password</label>
                                        <input type="password" id="signupPassword" name="password" autocomplete="new-password" required style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #34495e; background: #34495e; color: #ecf0f1;">
                                    </div>
                                    <div class="form-group" style="margin-bottom: 15px;">
                                        <label for="signupPasswordConfirm" style="display: block; color: #ecf0f1; margin-bottom: 5px;">Repeat Password</label>
                                        <input type="password" id="signupPasswordConfirm" name="passwordConfirm" autocomplete="new-password" required style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #34495e; background: #34495e; color: #ecf0f1;">
                                    </div>
                                    <div id="signupError" class="error-message" style="display: none; color: #e74c3c; margin-bottom: 10px;"></div>
                                    <button type="submit" class="login-btn" style="width: 100%; padding: 12px; background: #4ecdc4; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-bottom: 10px;">Create Account</button>
                                </form>
                                <a href="#" id="signupBackLink" style="display: block; margin-top: 10px; color: #4ecdc4; font-size: 14px;">Already have an account? Log in</a>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('afterbegin', fallbackHTML);

                // Setup event listeners for the fallback modal
                const loginForm = document.getElementById('loginForm');
                const guestLoginBtn = document.getElementById('guestLoginBtn');
                if (loginForm) {
                    loginForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const username = document.getElementById('username').value;
                        const password = document.getElementById('password').value;
                        if (typeof login === 'function') {
                            await login(username, password);
                        } else if (typeof window.login === 'function') {
                            await window.login(username, password);
                        }
                    });
                }
                const googleLoginBtn = document.getElementById('googleLoginBtn');
                if (googleLoginBtn) {
                    googleLoginBtn.addEventListener('click', async () => {
                        if (typeof handleGoogleLogin === 'function') {
                            await handleGoogleLogin();
                        } else if (typeof window.handleGoogleLogin === 'function') {
                            await window.handleGoogleLogin();
                        }
                    });
                }
                if (guestLoginBtn) {
                    guestLoginBtn.addEventListener('click', async () => {
                        if (typeof login === 'function') {
                            await login('guest', 'guest');
                        } else if (typeof window.login === 'function') {
                            await window.login('guest', 'guest');
                        }
                    });
                }
                const signUpBtn = document.getElementById('signUpBtn');
                if (signUpBtn) {
                    signUpBtn.addEventListener('click', () => {
                        if (typeof handleSignUpClick === 'function') {
                            handleSignUpClick();
                        } else if (typeof window.handleSignUpClick === 'function') {
                            window.handleSignUpClick();
                        } else {
                            document.getElementById('loginView').style.display = 'none';
                            document.getElementById('signupView').style.display = 'block';
                        }
                    });
                }
                const signupForm = document.getElementById('signupForm');
                if (signupForm) {
                    signupForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        if (typeof handleSignupSubmit === 'function') {
                            await handleSignupSubmit(e);
                        } else if (typeof window.handleSignupSubmit === 'function') {
                            await window.handleSignupSubmit(e);
                        } else {
                            const username = document.getElementById('signupUsername')?.value?.trim();
                            const email = document.getElementById('signupEmail')?.value?.trim();
                            const password = document.getElementById('signupPassword')?.value;
                            const passwordConfirm = document.getElementById('signupPasswordConfirm')?.value;
                            if (!username || !email || !password || !passwordConfirm) {
                                const err = document.getElementById('signupError');
                                if (err) { err.textContent = 'Please fill in all fields'; err.style.display = 'block'; }
                                return;
                            }
                            if (password !== passwordConfirm) {
                                const err = document.getElementById('signupError');
                                if (err) { err.textContent = 'Passwords do not match'; err.style.display = 'block'; }
                                return;
                            }
                            if (typeof signup === 'function') {
                                await signup({ username, email, password });
                            } else if (typeof window.signup === 'function') {
                                await window.signup({ username, email, password });
                            }
                        }
                    });
                }
                const signupBackLink = document.getElementById('signupBackLink');
                if (signupBackLink) {
                    signupBackLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (typeof handleSignupBackClick === 'function') {
                            handleSignupBackClick();
                        } else if (typeof window.handleSignupBackClick === 'function') {
                            window.handleSignupBackClick();
                        } else {
                            document.getElementById('loginView').style.display = 'block';
                            document.getElementById('signupView').style.display = 'none';
                        }
                    });
                }
            }
        }
        
        // Try to get the modal again after loading
        loginModal = document.getElementById('loginModal');
    }
    
    // Show the login modal if it exists, and ensure login view is visible (not signup view)
    if (loginModal) {
        loginModal.style.display = 'flex';
        const loginView = document.getElementById('loginView');
        const signupView = document.getElementById('signupView');
        if (loginView) loginView.style.display = 'block';
        if (signupView) signupView.style.display = 'none';
    }
    
    // Hide main application views
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) mainContainer.style.display = 'none';
    
    const databaseView = document.getElementById('database-view');
    const deckBuilder = document.getElementById('deck-builder');
    if (databaseView) databaseView.classList.add('view-removed');
    if (deckBuilder) deckBuilder.classList.add('view-removed');
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
    await window.authService.logout();
    currentUser = null;
    // Hide main UI immediately to prevent flash before redirect
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) mainContainer.style.display = 'none';
    const databaseView = document.getElementById('database-view');
    const deckBuilder = document.getElementById('deck-builder');
    if (databaseView) databaseView.classList.add('view-removed');
    if (deckBuilder) deckBuilder.classList.add('view-removed');
    // Redirect to root page
    window.location.href = '/';
}
