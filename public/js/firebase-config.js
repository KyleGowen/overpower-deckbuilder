/**
 * Firebase client configuration and initialization.
 * Fetches config from /api/config/firebase and initializes Firebase Auth.
 */

window.firebaseApp = null;
window.firebaseAuth = null;
window.firebaseInitialized = false;

async function initializeFirebase() {
  if (window.firebaseInitialized) return window.firebaseAuth;

  try {
    const response = await fetch('/api/config/firebase', { credentials: 'include' });
    const config = await response.json();

    if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      console.warn('Firebase not configured (missing env vars). Google sign-in disabled.');
      return null;
    }

    const firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      appId: config.appId
    };

    if (typeof firebase === 'undefined' || !firebase.initializeApp) {
      console.warn('Firebase SDK not loaded. Google sign-in disabled.');
      return null;
    }

    window.firebaseApp = firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseInitialized = true;
    return window.firebaseAuth;
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    return null;
  }
}
