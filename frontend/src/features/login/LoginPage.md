# Login screen (`/login`)

Standalone auth screen (no AppShell). Left (DTV): brand hero ("Build. Battle. OverPower.")
with the enlarged Excelsior wordmark (`Logo height={210}`). Right: the auth card.

## Visuals (DTV)
- **Background:** full-bleed nebula image at `src/resources/images/login/login-bg.png`,
  rendered as `.login__bg-image` (`object-fit: cover`) and **dimmed to 80% brightness**
  (`filter: brightness(0.8)`). Loaded via `assetUrl()` so it resolves through the CDN in prod.
- **Card fan:** the decorative real-card-art fan (`.login__fan`) sits on the right edge,
  above the nebula; `.login__bg-veil` adds a subtle dark gradient for text legibility while
  keeping the nebula visible behind the brand panel.
- **Auth card top glow:** `.login__card` has a bright teal top edge — a 1px accent border,
  an outer cyan glow, and a centered `::before` gradient bar — over the frosted
  `rgba(13,21,38,0.82)` + `backdrop-filter: blur(16px)` surface.

## Visuals (MV)
- **Brand column hidden:** `.layout-mobile .login__brand` is not shown.
- **Card logo:** `.login__card-logo` shows the Excelsior wordmark (`Logo height={100}`)
  centered above the auth card heading so mobile users see branding at the top.

## Copy
- **Login subheading:** "Log in to access your decks, collections, and card database."
- **Support footer:** email `kyle@excelsior.cards`; Discord handle `@GirlsGoneKyle` links to
  `https://discord.com/users/414971289267339274` (opens profile / Message in Discord).

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
