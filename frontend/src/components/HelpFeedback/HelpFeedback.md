# HelpFeedback

Shared authenticated support workflow mounted by desktop `UserMenu` and mobile
`MobileBottomNav`. `HelpFeedbackFlow` renders a compact desktop inspector or mobile
bottom sheet with four actions:

- Report a bug and Request a feature or change open accessible text-entry dialogs and
  submit `{ category, message }` to `POST /api/v1/feedback`.
- Email support opens the user's preferred mail client with `mailto:kyle@excelsior.cards`.
- Message on Discord shows `@GirlsGoneKyle` and opens the OverPower invite at
  `https://discord.gg/overpowerlives` in a new tab.

The dialogs trim and require feedback, cap it at 4,000 characters, trap keyboard focus,
support Escape/backdrop dismissal, show server errors without losing text, and render a
confirmation state only after the API accepts delivery.
