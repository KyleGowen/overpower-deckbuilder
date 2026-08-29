export interface GoogleSignInErrorInfo {
  message: string;
  offerRedirect: boolean;
}

function errorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('code' in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

/** Converts Firebase implementation details into safe, actionable login copy. */
export function describeGoogleSignInError(error: unknown): GoogleSignInErrorInfo {
  switch (errorCode(error)) {
    case 'auth/popup-closed-by-user':
      return {
        message:
          'Google sign-in did not finish. Your browser may have closed the sign-in window.',
        offerRedirect: true,
      };
    case 'auth/popup-blocked':
      return {
        message: 'Your browser blocked the Google sign-in window.',
        offerRedirect: true,
      };
    case 'auth/cancelled-popup-request':
      return {
        message: 'Another Google sign-in attempt replaced this one. Please try again.',
        offerRedirect: false,
      };
    case 'auth/network-request-failed':
      return {
        message:
          'Google sign-in could not reach Google. Check your connection or browser privacy settings.',
        offerRedirect: true,
      };
    case 'auth/unauthorized-domain':
      return {
        message: 'Google sign-in is not configured for this site.',
        offerRedirect: false,
      };
    default:
      return {
        message: 'Google sign-in failed. Please try again.',
        offerRedirect: false,
      };
  }
}
