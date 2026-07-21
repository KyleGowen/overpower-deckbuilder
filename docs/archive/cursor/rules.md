# Cursor Rules (migrated)

Project rules have been split into individual `.mdc` files under [`.cursor/rules/`](rules/) so Cursor picks them up automatically.

| Rule file | Scope |
|-----------|--------|
| [project-overview.mdc](rules/project-overview.mdc) | Always apply — project context, local dev (port 5173) |
| [local-dev-lan.mdc](rules/local-dev-lan.mdc) | Always apply — LAN access for Vite dev server |
| [code-style-patterns.mdc](rules/code-style-patterns.mdc) | Always apply — TS/JS, DB, API, frontend patterns |
| [project-domain-rules.mdc](rules/project-domain-rules.mdc) | Card data, decks, auth, images, performance |
| [power-type-sorting.mdc](rules/power-type-sorting.mdc) | OverPower power type sort order |
| [testing-protocol.mdc](rules/testing-protocol.mdc) | Always apply — mandatory testing rules |
| [git-permissions.mdc](rules/git-permissions.mdc) | Always apply — never commit/push without permission |
| [security.mdc](rules/security.mdc) | Always apply — input validation, no credential logging |
| [overpower-game-rules.mdc](rules/overpower-game-rules.mdc) | Full OverPower game rules reference |
| [deployment-protocol.mdc](rules/deployment-protocol.mdc) | AWS/EC2/Docker deployment workflow |
| [foil-card-map.mdc](rules/foil-card-map.mdc) | Foil card DB map and frontend lookup |
| [foil-css-effect.mdc](rules/foil-css-effect.mdc) | `.foil-shimmer` CSS effect |
| [collection-feature.mdc](rules/collection-feature.mdc) | Collection feature (GUEST sandbox + API) |
| [login-signup-modal.mdc](rules/login-signup-modal.mdc) | Modal-based login/signup (no `/login` route) |
| [google-sign-in-firebase.mdc](rules/google-sign-in-firebase.mdc) | Firebase Admin Google Sign-In |
| [trivy-ci.mdc](rules/trivy-ci.mdc) | Trivy vulnerability scanning in CI |
| [legacy-type-names.mdc](rules/legacy-type-names.mdc) | Legacy → modern power type name mapping |
| [ui-ux-designer.mdc](rules/ui-ux-designer.mdc) | Desktop UI/UX review and improvement |
| [mobile-ui-ux-designer.mdc](rules/mobile-ui-ux-designer.mdc) | Mobile UI/UX review and improvement |

Authoritative workflow rules (ship, lint, tests, infra lock) remain in the repo root [`.cursorrules`](../.cursorrules) and [`AGENTS.md`](../AGENTS.md).
