# AppShell

The application chrome for all primary routes (everything except Login and the Deck
Editor). Renders a responsive navigation frame around its `children`.

## Layout
- **Desktop** (`useLayoutMode().isMobile === false`): sticky **top nav** with the `Logo`,
  primary tabs (Home, Database, Decks, Collection), and `UserMenu` on the right.
- **Mobile**: fixed **bottom nav** with icon+label tabs ordered **Database, Decks, Home,
  Collection, Profile** (Home centered; its icon is 15% larger via `.bottom-nav__item--home`).
  Profile opens a bottom-sheet `SlideOutPanel` ("account sheet") with My Decks,
  Collection, a **Use desktop layout** toggle (`preferDesktop`), and Log Out / Exit Guest.

## Nav model
`NAV_ITEMS` defines each tab's `to(userId)` target and `match(pathname)` predicate. Decks
and Collection are user-scoped (`/users/:userId/...`); Home and Database are global. Active
state is computed from the current pathname.

## Dependencies
- `useAuth()` for the user, guest flag, and logout.
- `useLayoutMode()` for the mobile/desktop split and the desktop-layout override.

## Notes
- Nav sits at `--z-nav` (9999) so dropdowns/sheets always clear page content.
- This component must wrap routes via `ShelledLayout` in `app/router.tsx`; pages should not
  render their own shell.
