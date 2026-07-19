---
name: fix-trivy
description: Debug and fix Excelsior GitHub Actions Trivy failures. Use when a pipeline, Actions job, or CI run fails in "Trivy (dependency vulnerabilities)", when Trivy reports dependency CVEs from package-lock/go.mod manifests, or when the user asks to fix Trivy in /Users/kyle/cursored. Reproduce the scan with a fresh Trivy DB, make the narrow dependency/config fix, verify Trivy is healthy, verify app functionality is intact, then commit and push when requested or clearly implied.
---

# Fix Trivy

## Workflow

Use this skill in the Excelsior repo for Trivy CI failures.

1. Read `.cursorrules` and inspect `git status --short`.
2. Identify the failing Actions run/job.
   - If `gh auth status` works, use `gh run view` / `gh run view --log`.
   - If `gh` auth is invalid, use the public GitHub Actions API with `curl` for run/job metadata. Job logs and artifacts may still require auth.
3. Inspect `.github/workflows/deploy.yml` for the Trivy command. In this repo the CI gate is:
   - `trivy fs --ignorefile .trivyignore --severity CRITICAL,HIGH,MEDIUM,LOW,UNKNOWN --exit-code 1 --ignore-unfixed --scanners vuln .`
4. Reproduce locally with a fresh vulnerability DB:
   - Prefer `python .agents/skills/fix-trivy/scripts/run_trivy_ci_scan.py`.
   - If the script reports vulnerabilities, use its output to identify the exact target manifest, package, installed version, and fixed version.
   - If local Trivy fails before scanning on macOS with Docker credential errors, keep using the script. It supplies a temporary empty `DOCKER_CONFIG` and isolated Trivy cache to avoid Docker Desktop credential helper failures for public DB pulls.
5. Fix the smallest dependency/config surface that removes the finding.
   - For npm findings, update the owning `package-lock.json` via npm tooling, then rerun `npm audit` for that workspace.
   - For Go module findings, update only the affected `go.mod`/`go.sum` metadata to the fixed version when these are legacy scanner manifests and no runtime code depends on them.
   - Use `.trivyignore` only when the finding is understood, documented, not practically reachable, and the user accepts suppression.
6. Verify Trivy is healthy.
   - Rerun `python .agents/skills/fix-trivy/scripts/run_trivy_ci_scan.py`.
   - Do not stop while it still exits nonzero or cannot refresh/use the vulnerability DB.
7. Verify app functionality is intact before ending.
   - Run `npx eslint src --ext .ts --max-warnings 0`.
   - Run `bash scripts/ship-conditional-test.sh unit`.
   - Run `npm run build`.
   - Run `npm --prefix frontend run build`.
   - Start or reuse local dev with `$start-local-dev` if available, or manually start root API and Vite, then verify `http://localhost:8085/health`.
   - If the fix touched frontend behavior or UI files, do a browser smoke check at `http://localhost:5173`.
8. Commit and push when the user asked to fix the pipeline or ship the fix.
9. After pushing, poll the new Actions run until the Trivy job reaches `success` or a new actionable failure appears.

## Useful Commands

Run current Trivy gate locally:

```bash
python .agents/skills/fix-trivy/scripts/run_trivy_ci_scan.py
```

Inspect public job metadata when `gh` auth is broken:

```bash
curl -s https://api.github.com/repos/KyleGowen/excelsior/actions/runs/<run-id>/jobs
```

Check the latest main run:

```bash
curl -s "https://api.github.com/repos/KyleGowen/excelsior/actions/runs?branch=main&per_page=3"
```

## Reporting

Report the root cause in terms of:

- failing job and run URL
- vulnerable target file
- package and CVE
- installed version and fixed version
- exact files changed
- local verification results
- pushed commit and whether the new Trivy job passed

Keep uncertainty explicit when authenticated logs or artifacts could not be fetched.
