# Login screen (`/login`)

Standalone auth screen (no AppShell). Left: brand hero ("Build. Battle. OverPower.") with
a decorative card-fan background built from real card art. Right: the auth card.

## Capabilities
- **Log in** with username/email + password (`useAuth().login`).
- **Sign up** (username, email, password) → `signUp`.
- **Continue as Guest** → `loginAsGuest` (shared `guest` session; decks/collection are
  session/local only).
- **Sign in with Google** → Firebase popup → `signInWithGoogle`.
- Shows inline validation/error messages; buttons disable + show a busy label while
  submitting.

## After auth
On success the user is routed into the app (`/home`). `ProtectedRoute` sends unauthenticated
users here.

## Notes
- The backend login endpoint expects `{ username, password }` and returns `{ userId, ... }`;
  `me` returns `{ id, name, ... }`. `normaliseUser` handles both shapes — keep that in sync
  if the API changes.
- See `STYLE_GUIDE_V2.md` for the card-fan and surface treatment.
