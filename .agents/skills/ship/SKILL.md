---
name: ship
description: >-
  Ships approved Excelsior changes with one scope snapshot, cached and parallel
  release gates, a dedicated low-cost Git execution agent, exact-SHA GitHub
  Actions monitor, and production health verification. Use when the user says
  "ship", "ship it", or asks for the Excelsior release gate.
---

# Ship (fast validate, push, deploy, verify)

## Outcome and authority

Project rules in [`AGENTS.md`](../../../AGENTS.md) and [`.cursorrules`](../../../.cursorrules) remain authoritative.

**Ship** means: validate the intended changes, commit and push only that scope, follow the matching deployment, and verify production health for the pushed commit. The word **ship** authorizes `git add`, `git commit`, `git push`, normal deployment monitoring, and one bounded Actions recovery attempt. It does not authorize unrelated changes, repeated trigger commits, workflow rewrites, or other production mutations.

## Model and responsibility boundary

The originating/main agent owns every decision-bearing phase:

- determine intended versus unrelated changes;
- select and run gates, interpret failures, and make fixes;
- choose the exact staged path list and commit message;
- find and interpret the exact Actions run, decide whether recovery is safe,
  and verify production.

Do **not** move any of those phases to a lower-cost model.
Do not spawn additional lower-cost agents for triage, validation, fixes, Actions
recovery, or health checks. The passive Actions monitor defined below is the
only exception.

After all gates pass, delegate only the mechanical Git commands to one dedicated agent created with:

- model: `gpt-5.6-luna`
- reasoning effort: `medium`
- context: `fork_turns: "none"`
- task name: `ship_git`

Luna medium is sufficient because the main agent supplies a complete, exact handoff and retains all judgment. If that model is unavailable, use the least-cost available model adequate for this bounded Git task; do not move any other ship work to it.

## Fast path

### 1. Freeze scope once

At ship start, take one compact snapshot:

```bash
git status --short --branch
git diff --name-only HEAD
git diff --check
```

Record:

- current branch;
- exact intended paths to include;
- every pre-existing or unrelated path to exclude;
- whether the triggers below apply.

Once required current-session instructions are loaded, do not repeatedly reread project documentation, rescan the entire repository, or ask Kyle to reconfirm Git authorization when the current request and scope are clear. Reuse validation already completed in the current task when it was run against the exact same working-tree fingerprint.

Before expensive gates, inspect newly added diff lines for temporary `console.log`, `console.debug`, or equivalent debug output and remove only genuine temporary logging. This prevents cleanup edits from invalidating completed gates.

### 2. Classify conditional gates

- **Unit tests:** always invoke `bash scripts/ship-conditional-test.sh unit`. Its exact-tree cache may safely skip a previously successful run.
- **Integration tests:** invoke `bash scripts/ship-conditional-test.sh integration` only when the user, `AGENTS.md`, path-specific instructions, or the risk of the change requires integration coverage. A successful exact-tree cache hit counts as pass.
- **SOC 2:** run `bash scripts/soc2-compliance-checks.sh` only when the ship scope includes `src/index.ts`, `src/routes/**`, or `src/api/http/**`.
- **Dependency audit:** run `npm audit` before the first push of the calendar day in Kyle's Pacific time and whenever `package.json` or `package-lock.json` changed. Reuse same-day evidence only when its timestamp is known and no dependency manifest changed afterward; when uncertain, run it.
- **Changed-area checks:** include any focused typecheck, build, or verification required by `AGENTS.md` or nested instructions for the files being shipped. Do not invent unrelated broad checks.

### 3. Run one parallel gate batch

Start every applicable independent read-only gate together, not in separate tool round trips:

```text
npx eslint src --ext .ts --max-warnings 0
bash scripts/ship-conditional-test.sh unit
bash scripts/ship-conditional-test.sh integration   # only when triggered
bash scripts/soc2-compliance-checks.sh              # only when triggered
npm audit                                            # only when triggered
changed-area checks                                  # only when required
```

Collect all results once. All applicable gates must pass before Git delegation.

If a gate fails, fix the cause and rerun only checks whose inputs or coverage changed. Let the conditional test script decide whether unit or integration tests need to execute again. Do not force a full rerun merely because a command was already used earlier in the conversation.

Known fast recoveries:

- If a socket-based test fails only with sandbox `listen EPERM`, rerun that same command once with the required local-network permission before treating it as a code regression.
- If integration tests alone rewrite `data/sessions.json`, restore it only when the initial scope snapshot proved it had no user change, then rerun the conditional integration command. Never overwrite a pre-existing edit.
- If multiple gates fail independently, correct them and rerun the affected gates together.

### GitHub two-failure circuit breaker

Apply this to any command whose success depends on GitHub, Git transport, the GitHub API, or Actions—for example `git push`, `git ls-remote`, `gh run`, `gh workflow`, or `gh api`.

- Do not blindly retry. After the first transient-looking failure, inspect the error and allow at most one retry.
- If the same **logical operation** fails twice consecutively, stop before a third attempt or any alternate mutation. Switching subcommands, endpoints, agents, or from cancel to force-cancel does not reset the count.
- The originating/main agent must then read [Actions recovery](references/actions-recovery.md), query GitHub's live status and unresolved incidents, and run the appropriate read-only availability probe. This diagnosis must not be delegated to Luna.
- Reset the counter only after the logical operation succeeds. Errors accumulated by the Git agent and main agent count together.
- Deterministic errors such as invalid arguments, authentication denial, authorization denial, or branch protection are not transient: do not spend a second attempt before diagnosing or reporting them.

### 4. Delegate the serial Git handoff

The main agent prepares a self-contained prompt for `ship_git` containing:

- repository root, expected branch, and exact remote/ref to push;
- exact paths to stage, listed individually;
- exact paths that must remain untouched;
- descriptive commit message;
- confirmation that required gates passed for the current tree.

The Git agent must:

1. Run `git status --short --branch` and confirm the expected branch and path scope.
2. Stage only the supplied paths with explicit pathspecs. Never use `git add -A`, `git add .`, or a broad directory when unrelated changes exist.
3. Run `git diff --cached --check` and `git diff --cached --name-only`; stop if the staged set differs from the supplied manifest.
4. Commit with the supplied message, push only the supplied remote/ref, and return the full commit SHA plus push result.
5. Retry a transient GitHub-facing failure at most once. After two consecutive failures of the same logical operation, stop and return both exact errors so the main agent can execute the GitHub circuit breaker.

The Git agent must not edit files, choose scope, run gates, pull, fetch, merge, rebase, reset, switch branches, create empty commits, recover Actions, or monitor deployment. Git commands remain serial. The main agent waits for this agent to finish before continuing.

### 5. Monitor the exact deployment

Back on the originating model:

1. Confirm the returned SHA is local `HEAD` and the remote branch points to it.
2. Look up the workflow once by exact SHA:
   `gh run list --commit <sha> --json databaseId,status,conclusion,url,headSha,createdAt`.
3. If the exact run already exists and is progressing, attach to it. Never create a second run merely because an older run is queued or GitHub Status still shows recovery in progress.
4. Once the exact run ID is known, delegate only passive polling to one dedicated agent created with:

   - model: `gpt-5.6-luna`
   - reasoning effort: `minimal`
   - context: `fork_turns: "none"`
   - task name: `ship_actions_monitor`

   Supply the repository root, pushed SHA, run ID, and run URL. Luna minimal
   is sufficient for this fixed, read-only wait loop; the main agent retains
   all status interpretation, recovery decisions, and production verification.
   If unavailable, use the least-cost available model with minimal reasoning
   effort that can execute this bounded command. Do not move any other ship
   responsibility to the monitor.
5. The monitor may run only this compact read-only query, normally no more
   often than every 60 seconds while the run is active:
   `gh run view <run-id> --json status,conclusion,jobs,url,headSha`.
   It reports only a meaningful status change, terminal result, or the exact
   error, then returns control to the main agent. It must not list runs,
   trigger, rerun, cancel, or recover workflows; retry a GitHub command; make
   Git changes; inspect GitHub Status; poll production; or diagnose a failure.
   On any GitHub error it stops immediately and returns the raw error for the
   main agent to handle under the circuit breaker.
6. After the monitor reports a terminal result, the main agent verifies that
   the returned `headSha` is the shipped SHA and interprets the conclusion.
   On success, it makes a cache-bypassed request to production `/health` and
   confirms the exact shipped commit, database status `OK`, and expected latest
   migration. Do not poll production before deployment succeeds.

If the exact run is absent, has `jobs: []`, returns `startup_failure`, GitHub APIs disagree, or a GitHub-dependent operation fails twice, read [Actions recovery](references/actions-recovery.md). Do not load or execute that recovery path during a normal progressing deployment.

## Hard stops

- Never commit unless all applicable gates passed for the final tree.
- Never stage files outside the frozen manifest.
- Any edit after validation invalidates only the gates that cover that edit; rerun those before delegating Git.
- Never treat `git push` as completion. Exact-SHA Actions success and cache-bypassed production health are required.
- Do not ask for information that can be derived safely from the repository or current run.
- Do not create a trigger-only or empty commit unless Kyle explicitly requests that exact fallback after seeing the evidence.
- Never make a third attempt at a twice-failed GitHub operation until the main agent has checked live GitHub status and availability; stop entirely if either check is unhealthy.

## Reporting cadence

Use concise updates at four points: scope/gates started, actionable validation failure, pushed SHA/run URL, and final production result. During long checks, provide only the brief progress updates needed to avoid leaving Kyle without status; do not narrate every command or unchanged poll.
