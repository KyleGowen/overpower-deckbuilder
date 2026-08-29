import { describeGoogleSignInError } from '../../../frontend/src/lib/auth/googleSignInErrors';

describe('describeGoogleSignInError', () => {
  it('offers an in-window fallback when Firebase reports a closed popup', () => {
    expect(describeGoogleSignInError({ code: 'auth/popup-closed-by-user' })).toEqual({
      message: 'Google sign-in did not finish. Your browser may have closed the sign-in window.',
      offerRedirect: true,
    });
  });

  it('offers an in-window fallback when the popup is blocked', () => {
    expect(describeGoogleSignInError({ code: 'auth/popup-blocked' })).toEqual({
      message: 'Your browser blocked the Google sign-in window.',
      offerRedirect: true,
    });
  });

  it('offers an in-window fallback for privacy or network failures', () => {
    expect(describeGoogleSignInError({ code: 'auth/network-request-failed' })).toEqual({
      message:
        'Google sign-in could not reach Google. Check your connection or browser privacy settings.',
      offerRedirect: true,
    });
  });

  it('does not expose raw unknown Firebase errors', () => {
    expect(
      describeGoogleSignInError({
        code: 'auth/internal-error',
        message: 'Firebase: Error (auth/internal-error).',
      }),
    ).toEqual({
      message: 'Google sign-in failed. Please try again.',
      offerRedirect: false,
    });
  });
});
