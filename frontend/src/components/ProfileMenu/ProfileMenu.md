# ProfileMenu

Account menu contents (file is `ProfileMenuContent.tsx`): user header, "Create New Deck", and
inline subforms for display name / email / password, plus log out. Rendered inside a desktop
dropdown or a mobile sheet by the nav.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `onClose` | `() => void` | – | Closes the host dropdown/sheet (called before navigation and on logout). |
| `variant` | `'dropdown' \| 'sheet'` | `'dropdown'` | Root class `profile-menu--{variant}` for desktop vs mobile presentation. |

## Notes
- Reads the session via [`useAuth()`](../../app/AuthProvider.tsx); renders nothing when there
  is no user. Header shows display name (or "Guest"), email, and deck count from
  `['decks','mine',userId]`.
- Capability gating:
  - Guests: only Create Deck + "Exit Guest" (no name/email/password forms).
  - Google (SSO) users: can set a separate **Display name** but cannot change email/password
    (those forms auto-close); password users edit their unique **Username**.
- Only one subform open at a time (`openForm`). Mutations call `lib/api/account`
  (`setDisplayName`/`changeEmail`/`changePassword`), then `refresh()` +
  `invalidateQueries(['auth','me'])`. Password subform uses two
  [`PasswordInput`](../PasswordInput/PasswordInput.md)s with live match validation.
- Create Deck navigates to `/users/:id/decks?create=1`; logout clears auth and routes to
  `/login`. Styling in `ProfileMenuContent.css`.
