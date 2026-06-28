# `public/` — Legacy v1 UI (DEPRECATED)

> ⚠️ **This directory is the deprecated v1 frontend** (vanilla JS/HTML/CSS, no framework).
> The production UI is the **v2 React SPA in [`frontend/`](../frontend/)**.

## Status

- **Not the active UI.** Express serves the v2 SPA (`frontend/dist/`) whenever it has been
  built. The selection happens at runtime in
  [`src/routes/spaIndexPath.ts`](../src/routes/spaIndexPath.ts) (`isSpaBuilt()`): if
  `frontend/dist/index.html` exists, v2 is served; otherwise this `public/index.html` is the
  fallback.
- **Kept only for rollback.** Setting the container env var **`EXCELSIOR_DISABLE_SPA=1`**
  forces Express to serve this legacy v1 UI again — an instant rollback that needs no
  rebuild or redeploy. `public/` is still copied into the production Docker image for exactly
  this reason.

## Rules for agents

- **Do not build new features here.** All new UI work goes in `frontend/`
  (see [`docs/current/FRONTEND_V2.md`](../docs/current/FRONTEND_V2.md) and
  [`frontend/.cursorrules`](../frontend/.cursorrules)).
- Only touch `public/` for **rollback-critical** fixes, and prefer fixing the v2 SPA instead.
- Per-area context lives in the `.cursorrules` files here (`public/.cursorrules`,
  `public/js/.cursorrules`, `public/css/.cursorrules`, `public/components/.cursorrules`).

## Removal

Eventual deletion of `public/` is tracked in
[`DEAD_CODE_POLICY.md`](../DEAD_CODE_POLICY.md) (v1 deprecation/removal section). Do not delete
it ad-hoc — the rollback path depends on it until that policy says otherwise.
