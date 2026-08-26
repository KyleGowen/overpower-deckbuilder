# GitHub Actions recovery

Read this only when the workflow for the exact pushed SHA is absent, stalled before job allocation, terminal with `startup_failure`, represented inconsistently by GitHub APIs, or the same logical GitHub-dependent operation fails twice.

## Two-failure circuit breaker

Failures belong to the same logical operation even when a retry changes the command, endpoint, agent, or mutation variant. For example, cancel followed by force-cancel is still one logical cancellation operation. Carry the count across the Git agent handoff and reset it only after success.

After the second consecutive failure:

1. Record both commands, errors, timestamps, and the intended logical operation.
2. Make no third attempt and no alternate GitHub mutation.
3. Query both live status endpoints:
   - `https://www.githubstatus.com/api/v2/summary.json`
   - `https://www.githubstatus.com/api/v2/incidents/unresolved.json`
4. Inspect the component relevant to the failed operation:
   - `Git Operations` for push, fetch, or remote-ref failures;
   - `API Requests` for `gh` and REST/GraphQL failures;
   - `Actions` for workflow lookup, rerun, cancel, dispatch, or job-allocation failures.
5. Run one appropriate read-only availability probe:
   - Git transport: `git ls-remote --exit-code origin HEAD`;
   - GitHub API/CLI: `gh api rate_limit --jq '.resources.core.remaining'`.

If either status endpoint is unavailable, the relevant component is not `operational`, a relevant incident is unresolved, or the availability probe fails, open the circuit: stop all retries and recovery mutations, report the external blocker, and wait for a material GitHub status change. Do not keep polling the failing command.

Only when the relevant components are operational **and** the availability probe succeeds may the main agent authorize one final bounded retry. If that retry fails, stop; do not begin another diagnosis/retry cycle.

## Diagnose before mutating

1. Immediately query the live status endpoints above and inspect the relevant component plus unresolved incidents. Do not rely on cached search results or an older status-page render.
2. If Actions is not `operational`, make no recovery mutation. Record the SHA and run URL if available, report the incident, and wait for service recovery. A progressing exact-SHA run may still be monitored, but do not cancel, rerun, dispatch, or push another commit.
3. If `gh` cannot reach `api.github.com`, query GitHub Status once. Do not repeat the same doomed API command while the incident remains materially unchanged.
4. If Actions is operational, allow webhook/job allocation up to five minutes from push. Look up the exact SHA after 30 seconds, then at roughly 60-second intervals; do not add tighter polling.
5. After five minutes, inspect the exact run, other queued/in-progress runs, workflow state, and—if accessible—Actions usage or billing.

## One bounded recovery attempt

- Terminal `startup_failure`: wait until the API consistently reports terminal state, then run `gh run rerun <run-id>` once.
- Genuinely queued and cancellable with no jobs: cancel once, wait for terminal cancellation, then dispatch `.github/workflows/deploy.yml` on `main` once with `gh workflow run deploy.yml --ref main`.
- If cancel, force-cancel, rerun, and run-view endpoints disagree, stop mutating Actions and report the contradictory states.
- If the replacement also fails to allocate jobs, stop. Treat deployment as externally blocked and do not claim production is updated.

An outage does not consume the one recovery attempt. Never create an empty restart commit automatically, never stack runs, and never let an obsolete run supersede the newest intended SHA.
