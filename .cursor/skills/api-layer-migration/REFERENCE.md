# API layer migration — reference (evolving)

## Conventions (v0)

- **`src/api/`** — HTTP-agnostic logic, transforms, orchestration. Subfolders by domain as the tree grows.
- **`src/routes/`** — Wire-up only: deps, validation, call `src/api/`, `res.json` / `res.status`.
- **Naming** — Prefer `verbNoun` or domain-specific module names; avoid generic `utils.ts` at domain root.

## API_DOCUMENTATION.md snippets

**Per-route implementation line (after migration):**

```markdown
**API module:** `src/api/<relative-path>.ts` · **Route wiring:** `src/routes/<file>.ts`
```

**Route index** — add column or row suffix, e.g.:

| Method | Path | File | API module |
|--------|------|------|------------|
| GET | `/api/example` | `example.routes.ts` | `src/api/example/getThing.ts` |

## Changelog (skill + layer)

| Date | Note |
|------|------|
| 2026-04-03 | Initial skill: doc + Cursor context updates required per migration. |
