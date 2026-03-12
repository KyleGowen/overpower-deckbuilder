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
    window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: called', 'loginModal in DOM=' + !!document.getElementById('loginModal'));
    // Already in the DOM — nothing to do
    if (document.getElementById('loginModal')) {
        window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: loginModal already in DOM, returning early');
        return;
    }
    // A load is already in progress — wait for it instead of starting a second fetch
    if (_loginTemplateLoadPromise) {
        window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: reusing in-flight singleton promise');
        return _loginTemplateLoadPromise;
    }
    window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: starting new fetch of login.html');
    _loginTemplateLoadPromise = (async () => {
        try {
            const response = await fetch('/components/login/login.html');
            const html = await response.text();
            window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: fetch complete, loginModal in DOM before inject=' + !!document.getElementById('loginModal'));
            // Re-check after the async fetch in case a concurrent caller already injected it
            if (!document.getElementById('loginModal')) {
                window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: injecting HTML into body (insertAdjacentHTML afterbegin)');
                document.body.insertAdjacentHTML('afterbegin', html);
                window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: HTML injected, calling setupLoginEventListeners');
                setupLoginEventListeners();
            } else {
                window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: loginModal appeared while fetching (concurrent call), skipping inject');
            }
        } catch (error) {
            console.error('Error loading login template:', error);
            window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: FETCH ERROR, using fallback', String(error));
            if (!document.getElementById('loginModal')) {
                createFallbackLoginModal();
                setupLoginEventListeners();
            }
        } finally {
            // Reset so future calls (after DOM is cleared, e.g. on page transition) start fresh.
            // The getElementById guard at the top still prevents redundant re-fetches when the
            // modal is already present.
            _loginTemplateLoadPromise = null;
            window.__flashDebug && window.__flashDebug('login.js loadLoginTemplate: done, singleton promise reset');
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
                        <button type="button" id="guestLoginBtn" class="guest-btn">Continue as Guest</button>
                    </div>
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
    window.__flashDebug && window.__flashDebug('login.js initializeLoginComponent: called', 'readyState=' + document.readyState);
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        window.__flashDebug && window.__flashDebug('login.js initializeLoginComponent: DOM loading, attaching DOMContentLoaded listener');
        document.addEventListener('DOMContentLoaded', async () => {
            window.__flashDebug && window.__flashDebug('login.js initializeLoginComponent: DOMContentLoaded fired, calling loadLoginTemplate');
            await loadLoginTemplate();
        });
    } else {
        window.__flashDebug && window.__flashDebug('login.js initializeLoginComponent: DOM already ready, calling loadLoginTemplate immediately');
        loadLoginTemplate();
    }
}

/**
 * Setup event listeners for login form and guest login
 */
function setupLoginEventListeners() {
    window.__flashDebug && window.__flashDebug('login.js setupLoginEventListeners: called');
    const loginForm = document.getElementById('loginForm');
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', handleGuestLogin);
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

// Note: showLoginError and hideLoginError are defined in auth-app-init.js
// We don't redefine them here to avoid recursion issues

// Initialize login component when script loads
initializeLoginComponent();

