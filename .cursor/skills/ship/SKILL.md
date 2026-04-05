---
name: ship
description: >-
  Runs lint, conditional unit tests (and optional conditional integration tests)
  via scripts/ship-conditional-test.sh so suites re-run only after working-tree
  changes, SOC 2 when HTTP paths change, optional daily npm audit, removes debug
  logging, then stages, commits, and pushes. Prefers parallel Task subagents for
  independent checks. Use when the user says "ship", "ship it", or asks to commit
  and push after checks; also for the Excelsior release gate.
---

# Ship (commit and push)

## Canonical definition

Project rules in [`.cursorrules`](.cursorrules) (section **Ship Command**) are the source of truth. This skill repeats that workflow so the agent discovers and applies it without relying on chat memory.

## Meaning

When the user says **"ship"**, it means: **commit and push everything to git** after the gates below pass, in **this exact order**.

## Parallel execution (user preference — fast turnaround)

**Default:** Use as much **parallelism via Task subagents** as practical. The owner wants **short wall-clock time** for ship, not strictly serial check execution.

1. **Quick triage first** (main agent is fine): determine whether SOC 2 applies (endpoint path diff — see §3) and whether `npm audit` is required today (see §4). These are cheap; do not spawn agents just for this unless remote-heavy.
2. **Run independent gates concurrently:** In **one assistant turn**, start **multiple `Task` subagents** (typically `subagent_type: "shell"`) in **parallel** — one per command — for every check that applies, for example:
   - `npx eslint src --ext .ts --max-warnings 0`
   - `bash scripts/ship-conditional-test.sh unit` (re-runs `npm run test:unit` only if the working tree changed since the last successful unit run — see **§2**)
   - `bash scripts/ship-conditional-test.sh integration` (only when integration tests are in scope for this ship — same skip logic)
   - `bash scripts/soc2-compliance-checks.sh` (only if §3 triggered)
   - `npm audit` (only if §4 required)
3. **Collect results** after all parallel tasks finish. **All must pass** before proceeding. If several fail, fix issues, then **re-run only what failed** (again in parallel if multiple reruns).
4. **Keep serial on purpose:** debug cleanup (edits in the repo) and the **git** workflow (stage / commit / push) happen **after** checks are green; use subagent(s) for git per §6, not parallel pushes.

**Rule of thumb:** If two commands do not depend on each other’s output, they should run in **parallel subagents**, not back-to-back in one shell.

## Checklist (execute in order)

Copy and track progress:

```
Ship progress:
- [ ] 1. ESLint clean
- [ ] 2. Unit tests pass (`bash scripts/ship-conditional-test.sh unit` — ok if skipped when tree unchanged)
- [ ] 2b. Integration tests (only if in scope — `bash scripts/ship-conditional-test.sh integration`)
- [ ] 3. SOC 2 script (when endpoint paths changed — see below)
- [ ] 4. npm audit (when required — see below)
- [ ] 5. No debug statements
- [ ] 6. Stage, commit, push
```

### 1. Lint

- Run from repo root: `npx eslint src --ext .ts --max-warnings 0`
- Fix every warning and error before continuing
- **Do not commit** if lint is not clean (matches CI zero-warning policy)

### 2. Unit tests (conditional re-run)

- Run from repo root: `bash scripts/ship-conditional-test.sh unit`
- This invokes `npm run test:unit` **only when** the repo fingerprint changed since the last **successful** unit run (HEAD + staged/unstaged diffs + untracked files and their hashes). If nothing relevant changed, the script exits **0** and prints a skip line — treat that as **pass** for ship.
- To **always** run unit tests regardless of cache: `SHIP_TESTS_FORCE=1 bash scripts/ship-conditional-test.sh unit`
- Fix failures before continuing; **never commit** if unit tests fail
- For an unconditional run outside ship (e.g. explicit “run all unit tests”), use `npm run test:unit` directly

### 2b. Integration tests (when included in this ship)

- When [.cursorrules](.cursorrules) or the user implies integration tests before push: `bash scripts/ship-conditional-test.sh integration` (same fingerprint/skip behavior vs. last successful IT run)
- `SHIP_TESTS_FORCE=1` forces a full `npm run test:integration`
- Skip message + exit 0 counts as pass for ship

### 3. SOC 2 compliance checks (conditional)

**When required:** If the change set about to be shipped touches **HTTP endpoint surfaces**, run the same technical compliance script as CI (**Run SOC 2 technical compliance checks** in `.github/workflows/deploy.yml`).

**Trigger paths** — if any file matches (use `git diff --name-only HEAD` against the last commit, including staged and unstaged):

- `src/index.ts`
- anything under `src/routes/`
- anything under `src/api/http/`

**Command** (repo root): `bash scripts/soc2-compliance-checks.sh`

- Exit code **0** required before continuing
- If it fails, update code or [scripts/soc2-compliance-checks.sh](scripts/soc2-compliance-checks.sh) so the controls still reflect reality (e.g. after route migrations), then re-run

**When skipped:** No changes under those paths (e.g. docs-only, CSS-only, tests-only outside route wiring).

### 4. Dependency audit (`npm audit`)

Aligned with **Dependency Vulnerability Audit (Daily)** in [`.cursorrules`](.cursorrules):

- Run **`npm audit`** before the **first `git push` of each calendar day**
- If the audit reports vulnerabilities **with available fixes**, run **`npm audit fix`**, then re-run **`npm audit`** until clean (or stop and explain what cannot be auto-fixed)
- **Once per day** is enough for routine pushes **unless** `package.json` or `package-lock.json` changed — **always re-audit** after lockfile or dependency manifest changes, even if the daily audit already ran
- Mirrors CI Trivy expectations: address fixable issues rather than ignoring them

### 5. Debug cleanup

- Remove temporary debug output: `console.log`, `console.debug`, and similar
- Keep appropriate production logging (e.g. `console.error` where the codebase already uses it for real errors)

### 6. Git: stage, commit, push

- **Stage all** intended changes (`git add -A` or equivalent for the full ship intent)
- **Commit** with a **descriptive message** (see [`.cursorrules`](.cursorrules) Git Workflow)
- **Push** to the configured remote

#### Git execution (this workspace)

Per [`.cursor/rules/git-subagent.mdc`](.cursor/rules/git-subagent.mdc): **do not** run `git` commands from the main agent’s shell. Use the **Task** tool with a subagent (e.g. `subagent_type: "generalPurpose"` or `"shell"`) to perform staging, commit, and push; have the subagent return exit code, branch, and commit hash as needed.

**Checks (lint, unit tests, SOC 2, audit):** Prefer **parallel Task subagents** per **Parallel execution** above. **Git** steps still go through the subagent rule (typically one coherent git workflow, not parallel pushes).

## Hard stops

| Condition | Action |
|-----------|--------|
| ESLint warnings/errors | Fix and re-run step 1 (can parallel with other reruns) |
| Unit test failures | Fix and re-run step 2 (can parallel with other reruns). Same tree after a failed run: use `SHIP_TESTS_FORCE=1` so tests run again |
| Integration test failures (when step 2b applies) | Fix and re-run `bash scripts/ship-conditional-test.sh integration`; use `SHIP_TESTS_FORCE=1` if the fingerprint is unchanged |
| Endpoint diff and SOC 2 script exits non-zero | Fix or update checks, re-run step 3 |
| Audit required and vulnerabilities with fixes remain | Fix or stop and notify the user |
| Debug noise left in diff | Remove and re-check step 5 |

## Optional cross-checks

- If the change touched HTTP contracts, follow [`.cursorrules`](.cursorrules) / [AGENTS.md](AGENTS.md) for updating **API_DOCUMENTATION.md** (legacy) or **API_V1.md** (`/api/v1`) as applicable
- **Ship** does not substitute for integration tests when the change is large; [`.cursorrules`](.cursorrules) still recommends running them after significant changes

## Related project rules (not duplicated here)

- **Linting Requirements**, **Testing Requirements**, **Git Workflow** — [`.cursorrules`](.cursorrules)
- **API migration** layering — [AGENTS.md](AGENTS.md), [MIGRATION_ARCHITECTURE.md](MIGRATION_ARCHITECTURE.md)
