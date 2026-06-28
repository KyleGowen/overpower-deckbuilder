# Dead Code Policy

This document defines conventions for identifying, handling, and removing unused code in the Overpower Deckbuilder project.

## Canonical UI surface

**The production frontend is the v2 React SPA in `frontend/`.** New code belongs there. The legacy v1 vanilla-JS UI in `public/` is **deprecated** (served only as a rollback via `EXCELSIOR_DISABLE_SPA=1`) — see the dedicated section below before touching or removing it.

## v1 `public/` deprecation and removal

- **Do not build new features in `public/`.** It is the deprecated v1 UI. All UI work goes in `frontend/` (see [`docs/current/FRONTEND_V2.md`](docs/current/FRONTEND_V2.md)).
- **Do NOT bulk-delete `public/` yet.** Until the v2 cutover has been validated in production for a stable period, `public/` is the **instant rollback path**: Express serves it when `EXCELSIOR_DISABLE_SPA=1` (or when `frontend/dist/` is absent). It is intentionally still copied into the Docker image and committed to git for this reason.
- **Knip / unused-code scans** continue to exclude `public/` (`knip.json`), so they will not flag legacy v1 files. Do not "clean up" `public/` based on Knip output.
- **Planned removal (future, separate change):** once v2 is confirmed stable and the rollback is no longer needed, removing `public/` should be done as one deliberate change that also: drops the `public/` `COPY` from the [`Dockerfile`](Dockerfile), removes the v1 fallback branches in [`src/routes/spaIndexPath.ts`](src/routes/spaIndexPath.ts) / [`src/routes/static-health.routes.ts`](src/routes/static-health.routes.ts) / [`src/routes/pages.routes.ts`](src/routes/pages.routes.ts) and the `EXCELSIOR_DISABLE_SPA` escape hatch, deletes the `public/`-only docs, and updates the image-verification steps in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Until then, treat `public/` as frozen legacy, not dead code to delete.

## When to Remove vs. Archive

### Remove (Delete)
- Orphaned files never imported or loaded (e.g. refactored modules that were never integrated)
- Backup files (`.backup`, `.bak`) after confirming they are obsolete
- Duplicate directories (e.g. `src/public/` when `public/` is the canonical location)
- Code that has been commented out indefinitely with no plan to re-enable
- Unit tests for code that has been removed

### Archive (Move to scripts/archive/)
- One-off fix scripts that may have historical value
- Scripts that were used for production debugging or migrations
- Prefer archive over delete when there is uncertainty about future need

## How to Run Knip

Knip scans for unused exports, unused files, unused dependencies, and other dead code.

```bash
# Run full analysis (includes dev deps, tests)
npm run find:unused

# Run in production mode (excludes dev deps; use in CI)
npx knip --production
```

The `--production` flag focuses on production code and fails on critical unused exports. Use this in CI/CD to block merges when dead code is introduced.

## Conventions

1. **Before removing**: Verify the file is truly unused (grep for imports, check HTML script tags for frontend JS)
2. **Frontend JS**: Files in `public/js/` are loaded via `<script src="">` in HTML. See [docs/FRONTEND_SCRIPT_MANIFEST.md](docs/FRONTEND_SCRIPT_MANIFEST.md) for which files are active
3. **After removal**: Run `npm run test:unit` and fix or remove any broken tests
4. **Knip config**: `knip.json` excludes `public/`, `scripts/`, and test files from "unused files" reporting (vanilla JS and scripts have different entry points)

## CI Integration

The GitHub Actions pipeline runs `npm run find:unused` as a required step. Configure the workflow to use `npx knip --production` for production-focused analysis that fails on critical findings.
