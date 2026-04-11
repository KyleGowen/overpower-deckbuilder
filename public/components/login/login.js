/**
 * Login Component
 * Handles login modal display, form submission, and guest login functionality
 */

// Singleton promise — prevents concurrent calls from fetching and injecting the template twice
let _loginTemplateLoadPromise = null;

/**
 * Load login HTML template and inject into body.
 * Multiple concurrent callers share a single in-flight promise so the template
 * is never fetched or injected more than once.
 */
async function loadLoginTemplate() {
    // Already in the DOM — nothing to do
    if (document.getElementById('loginModal')) {
        return;
    }
    // A load is already in progress — wait for it instead of starting a second fetch
    if (_loginTemplateLoadPromise) {
        return _loginTemplateLoadPromise;
    }
    _loginTemplateLoadPromise = (async () => {
        try {
            const response = await fetch('/components/login/login.html');
            const html = await response.text();
            // Re-check after the async fetch in case a concurrent caller already injected it
            if (!document.getElementById('loginModal')) {
                document.body.insertAdjacentHTML('afterbegin', html);
                setupLoginEventListeners();
            }
        } catch (error) {
            console.error('Error loading login template:', error);
            if (!document.getElementById('loginModal')) {
                createFallbackLoginModal();
                setupLoginEventListeners();
            }
        } finally {
            // Reset so future calls (after DOM is cleared, e.g. on page transition) start fresh.
            // The getElementById guard at the top still prevents redundant re-fetches when the
            // modal is already present.
            _loginTemplateLoadPromise = null;
        }
    })();
    return _loginTemplateLoadPromise;
}

/**
 * Create fallback login modal if template loading fails
 */
function createFallbackLoginModal() {
    const fallbackHTML = `
        <div id="loginModal" class="login-modal">
            <div class="login-modal-content">
                <div id="loginView" class="login-view">
                    <div class="login-header">
                        <img src="/src/resources/images/logo/logo5.png" alt="Excelsior Deckbuilder" style="max-width: 300px; height: auto; display: block; margin: 0 auto;" data-click-handler="handleLoginLogoClick">
                    </div>
                    <form id="loginForm" class="login-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" autocomplete="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" autocomplete="current-password" required>
                        </div>
                        <div id="loginError" class="error-message" style="display: none;"></div>
                    </form>
                    <div class="login-buttons-grid">
                        <button type="submit" form="loginForm" class="login-btn">Log In</button>
                        <button type="button" id="googleLoginBtn" class="google-btn">Sign in with Google</button>
                        <button type="button" id="guestLoginBtn" class="guest-btn">Continue as Guest</button>
                        <button type="button" id="signUpBtn" class="signup-btn">Sign Up</button>
                    </div>
                    <div class="login-contact" aria-label="Contact">
                        For questions or comments, email
                        <a class="login-contact-link" href="mailto:kyle@excelsior.cards">kyle@excelsior.cards</a>.
                        <br>
                        Or message me at the
                        <a class="login-contact-link" href="https://discord.com/invite/overpowerlives" target="_blank" rel="noopener noreferrer">OverPower Discord</a>: <a class="login-contact-link" href="https://discord.com/users/414971289267339274" target="_blank" rel="noopener noreferrer">@GirlsGoneKyle</a>.
                    </div>
                </div>
                <div id="signupView" class="signup-view" style="display: none;">
                    <div class="login-header">
                        <img src="/src/resources/images/logo/logo5.png" alt="Excelsior Deckbuilder" style="max-width: 300px; height: auto; display: block; margin: 0 auto;" data-click-handler="handleLoginLogoClick">
                    </div>
                    <h2 class="signup-heading">Create Account</h2>
                    <form id="signupForm" class="signup-form login-form">
                        <div class="form-group">
                            <label for="signupUsername">Username</label>
                            <input type="text" id="signupUsername" name="username" autocomplete="username" required>
                        </div>
                        <div class="form-group">
                            <label for="signupEmail">Email</label>
                            <input type="email" id="signupEmail" name="email" autocomplete="email" required>
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">Password</label>
                            <input type="password" id="signupPassword" name="password" autocomplete="new-password" required>
                        </div>
                        <div class="form-group">
                            <label for="signupPasswordConfirm">Repeat Password</label>
                            <input type="password" id="signupPasswordConfirm" name="passwordConfirm" autocomplete="new-password" required>
                        </div>
                        <div id="signupError" class="error-message" style="display: none;"></div>
                        <button type="submit" class="login-btn">Create Account</button>
                    </form>
                    <a href="#" id="signupBackLink" class="signup-back-link">Already have an account? Log in</a>
                    <div class="login-contact" aria-label="Contact">
                        For questions or comments, email
                        <a class="login-contact-link" href="mailto:kyle@excelsior.cards">kyle@excelsior.cards</a>.
                        <br>
                        Or message me at the
                        <a class="login-contact-link" href="https://discord.com/invite/overpowerlives" target="_blank" rel="noopener noreferrer">OverPower Discord</a>: <a class="login-contact-link" href="https://discord.com/users/414971289267339274" target="_blank" rel="noopener noreferrer">@GirlsGoneKyle</a>.
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', fallbackHTML);
}

/**
 * Initialize login component
 * Sets up event listeners for login form and guest login button
 */
function initializeLoginComponent() {
    const afterTemplate = () => {
        void attemptGoogleRedirectCompletion();
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await loadLoginTemplate();
            afterTemplate();
        });
    } else {
        void loadLoginTemplate().then(afterTemplate);
    }
}

/**
 * Setup event listeners for login form, guest login, sign up, and signup form
 */
function setupLoginEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const signupForm = document.getElementById('signupForm');
    const signupBackLink = document.getElementById('signupBackLink');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', handleGuestLogin);
    }
    if (signUpBtn) {
        signUpBtn.addEventListener('click', handleSignUpClick);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }
    if (signupBackLink) {
        signupBackLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleSignupBackClick();
        });
    }
}

/**
 * Switch from login view to signup view
 */
function handleSignUpClick() {
    if (typeof window.hideLoginError === 'function') {
        window.hideLoginError();
    }
    if (typeof window.hideSignupError === 'function') {
        window.hideSignupError();
    }
    const loginView = document.getElementById('loginView');
    const signupView = document.getElementById('signupView');
    if (loginView) loginView.style.display = 'none';
    if (signupView) signupView.style.display = 'block';
}

/**
 * Switch from signup view back to login view
 */
function handleSignupBackClick() {
    if (typeof window.hideSignupError === 'function') {
        window.hideSignupError();
    }
    const loginView = document.getElementById('loginView');
    const signupView = document.getElementById('signupView');
    if (loginView) loginView.style.display = 'block';
    if (signupView) signupView.style.display = 'none';
}

/**
 * Handle signup form submission
 * @param {Event} e - Form submit event
 */
async function handleSignupSubmit(e) {
    e.preventDefault();
    
    if (typeof window.hideSignupError === 'function') {
        window.hideSignupError();
    }
    
    const username = document.getElementById('signupUsername')?.value?.trim();
    const email = document.getElementById('signupEmail')?.value?.trim();
    const password = document.getElementById('signupPassword')?.value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm')?.value;
    
    if (!username || !email || !password || !passwordConfirm) {
        if (typeof window.showSignupError === 'function') {
            window.showSignupError('Please fill in all fields');
        }
        return;
    }
    
    if (password !== passwordConfirm) {
        if (typeof window.showSignupError === 'function') {
            window.showSignupError('Passwords do not match');
        }
        return;
    }
    
    const signupFn = typeof signup === 'function' ? signup : (typeof window.signup === 'function' ? window.signup : null);
    if (signupFn) {
        await signupFn({ username, email, password });
    } else {
        console.error('Signup function not available');
        if (typeof window.showSignupError === 'function') {
            window.showSignupError('Signup functionality not available');
        }
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    // Use hideLoginError from auth-app-init.js (don't define our own to avoid recursion)
    if (typeof window.hideLoginError === 'function') {
        window.hideLoginError();
    }
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        // Use showLoginError from auth-app-init.js
        if (typeof window.showLoginError === 'function') {
            window.showLoginError('Please enter both username and password');
        } else {
            const errorDiv = document.getElementById('loginError');
            if (errorDiv) {
                errorDiv.textContent = 'Please enter both username and password';
                errorDiv.style.display = 'block';
            }
        }
        return;
    }
    
    // Use the login function from auth-app-init.js
    const loginFn = typeof login === 'function' ? login : (typeof window.login === 'function' ? window.login : null);
    if (loginFn) {
        await loginFn(username, password);
    } else {
        console.error('Login function not available');
        if (typeof window.showLoginError === 'function') {
            window.showLoginError('Login functionality not available');
        }
    }
}

/**
 * Handle guest login button click
 */
async function handleGuestLogin() {
    // Use hideLoginError from auth-app-init.js (don't define our own to avoid recursion)
    if (typeof window.hideLoginError === 'function') {
        window.hideLoginError();
    }
    
    // Use the login function from auth-app-init.js
    const loginFn = typeof login === 'function' ? login : (typeof window.login === 'function' ? window.login : null);
    if (loginFn) {
        await loginFn('guest', 'guest');
    } else {
        console.error('Login function not available');
        if (typeof window.showLoginError === 'function') {
            window.showLoginError('Guest login functionality not available');
        }
    }
}

/**
 * Finish Google sign-in after we have a Firebase ID token (popup or redirect return).
 */
async function finalizeGoogleSessionWithIdToken(idToken) {
    const result2 = await window.authService.loginWithGoogle(idToken);
    if (result2.success) {
        const user = result2.data;
        if (typeof currentUser !== 'undefined') currentUser = user;
        if (typeof window !== 'undefined') window.currentUser = user;
        if (typeof updateUserWelcome === 'function') updateUserWelcome();
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) mainContainer.style.display = 'grid';
        if (typeof showMainApp === 'function') showMainApp();
    } else if (typeof window.showLoginError === 'function') {
        window.showLoginError(result2.error || 'Google sign-in failed');
    }
}

/**
 * After returning from signInWithRedirect, exchange Firebase user for app session.
 */
async function attemptGoogleRedirectCompletion() {
    try {
        const auth = await (typeof initializeFirebase === 'function' ? initializeFirebase() : null);
        if (!auth || typeof auth.getRedirectResult !== 'function') {
            return;
        }
        const result = await auth.getRedirectResult();
        if (!result || !result.user) {
            return;
        }
        const idToken = await result.user.getIdToken();
        if (!idToken) {
            if (typeof window.showLoginError === 'function') {
                window.showLoginError('Could not get Google credentials');
            }
            return;
        }
        await finalizeGoogleSessionWithIdToken(idToken);
    } catch (err) {
        console.error('Google redirect completion error:', err);
        if (typeof window.showLoginError === 'function') {
            window.showLoginError(err.message || 'Google sign-in failed');
        }
    }
}

/**
 * Handle Google login button click
 */
async function handleGoogleLogin() {
    if (typeof window.hideLoginError === 'function') {
        window.hideLoginError();
    }
    try {
        const auth = await (typeof initializeFirebase === 'function' ? initializeFirebase() : null);
        if (!auth) {
            if (typeof window.showLoginError === 'function') {
                window.showLoginError('Google sign-in is not available');
            }
            return;
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        // HTTP origins are not "secure" in the browser; popup COOP breaks window.closed / close.
        if (typeof window.isSecureContext === 'boolean' && !window.isSecureContext) {
            await auth.signInWithRedirect(provider);
            return;
        }
        const result = await auth.signInWithPopup(provider);
        const idToken = result.user ? await result.user.getIdToken() : null;
        if (!idToken) {
            if (typeof window.showLoginError === 'function') {
                window.showLoginError('Could not get Google credentials');
            }
            return;
        }
        await finalizeGoogleSessionWithIdToken(idToken);
    } catch (err) {
        console.error('Google login error:', err);
        if (typeof window.showLoginError === 'function') {
            window.showLoginError(err.message || 'Google sign-in failed');
        }
    }
}


// Note: showLoginError and hideLoginError are defined in auth-app-init.js
// We don't redefine them here to avoid recursion issues

// Initialize login component when script loads
initializeLoginComponent();

