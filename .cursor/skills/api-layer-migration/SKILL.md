---
name: api-layer-migration
description: >-
  Migrates Express HTTP routes to an encapsulated backend API layer under
  src/api/, keeps API_DOCUMENTATION.md accurate, and updates Cursor context
  files. Use when the user asks to migrate routes, encapsulate handlers, thin
  route files, move logic out of src/routes, or build a backend API layer
  aligned with API_DOCUMENTATION.md.
---

# API layer migration (Excelsior)

## Goal

Move **business logic, orchestration, and response shaping** out of `src/routes/*.ts` into **`src/api/`** (HTTP-agnostic modules). Route files stay **thin**: parse request → call API module → map status/body → send response. Contract for clients remains **`API_DOCUMENTATION.md`** at repo root.

**Existing pattern:** `src/api/deckTransform.ts` (pure transforms). Extend with domain modules (e.g. `src/api/decks/…`, `src/api/collections/…`) as migrations proceed.

## When to read

1. **`API_DOCUMENTATION.md`** — authoritative method, path, auth, status codes, and JSON shapes for the route(s) being migrated.
2. **Actual route implementation** — source file named in the doc / Route index.
3. **`REFERENCE.md`** in this skill — evolving conventions and doc templates (update `REFERENCE.md` when team agrees new rules).

## Migration workflow (per route or small group)

1. **Identify scope** — method(s), path(s), and `src/routes/*.ts` handlers. Confirm behavior matches `API_DOCUMENTATION.md`; if code and doc diverge, fix the **code** to match the documented contract unless the user explicitly wants a contract change.
2. **Add or extend `src/api/`** — extract logic into typed functions or small modules. Prefer pure functions where possible; inject DB/services via parameters or a narrow factory if needed. **Do not** import `Express` types into the core of the module unless unavoidable; keep `Request`/`Response` in routes.
3. **Thin the route** — validate input, call `src/api/`, translate errors to the same HTTP status and JSON shape clients already expect.
4. **Tests** — move or add **unit** tests next to `src/api/` (or existing `tests/unit/` patterns). Keep **integration** tests passing; update only if behavior intentionally changes.
5. **Update `API_DOCUMENTATION.md`** (required after each migration):
   - In the route’s section: add an **Implementation** line: `**API module:** \`src/api/<path>.ts\` (handlers in \`src/routes/<file>.ts\`).`
   - In **[Route index](#route-index)**: add column **API module** for migrated rows, or a footnote listing `path → module` if the table gets too wide.
   - Under **Maintaining this document**: ensure the bullet about migrations mentions that migrated routes reference `src/api/` (edit that subsection if it does not).
6. **Update Cursor context** (required after each migration):
   - **`src/routes/.cursorrules`** — if registration split, naming, or handler patterns change.
   - **`src/api/.cursorrules`** — create or refresh when new subfolders or conventions are introduced (purpose, naming, “no Express in pure logic”).
   - **`src/.cursorrules`** — if the high-level backend layout description should mention `src/api/`.
   - **Domain `.cursorrules`** (e.g. `src/database/deck/`) — only if migration changes how DB helpers are used from routes vs API layer.
   - Do **not** edit unrelated `.cursorrules` files.

## Anti-patterns

- Changing external JSON shapes or status codes without updating **`API_DOCUMENTATION.md`** and tests.
- Leaving **`API_DOCUMENTATION.md`** listing only old file paths after logic moved to **`src/api/`**.
- Skipping **`src/api/.cursorrules`** when `src/api/` gains new domains or rules.

## Evolving this skill

After significant migrations, append a one-line note to **`REFERENCE.md`** (date + what changed). Propose updates to **`SKILL.md`** when a new mandatory step or location becomes standard.
