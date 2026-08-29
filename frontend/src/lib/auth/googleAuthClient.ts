import type { UserCredential } from 'firebase/auth';
import { fetchFirebaseConfig } from '../api/auth';

export interface GoogleAuthClient {
  signInWithPopup: () => Promise<UserCredential>;
  signInWithRedirect: () => Promise<never>;
  getRedirectResult: () => Promise<UserCredential | null>;
}

let clientPromise: Promise<GoogleAuthClient> | null = null;

/**
 * Loads Firebase before the user clicks the Google button. Keeping the ready
 * client in memory lets `signInWithPopup` run directly from the click handler,
 * which is important in browsers with strict popup/user-activation handling.
 */
export function preloadGoogleAuthClient(): Promise<GoogleAuthClient> {
  if (!clientPromise) {
    clientPromise = createGoogleAuthClient();
  }
  return clientPromise;
}

async function createGoogleAuthClient(): Promise<GoogleAuthClient> {
  const cfg = await fetchFirebaseConfig();
  if (!cfg) throw new Error('Google sign-in is not configured.');

  const [{ initializeApp, getApps }, authModule] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
  ]);
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  const auth = authModule.getAuth(app);

  const createProvider = () => {
    const provider = new authModule.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  };

  let redirectResultPromise: Promise<UserCredential | null> | null = null;

  return {
    signInWithPopup: () => authModule.signInWithPopup(auth, createProvider()),
    signInWithRedirect: () => authModule.signInWithRedirect(auth, createProvider()),
    getRedirectResult: () => {
      if (!redirectResultPromise) {
        redirectResultPromise = authModule.getRedirectResult(auth);
      }
      return redirectResultPromise;
    },
  };
}
