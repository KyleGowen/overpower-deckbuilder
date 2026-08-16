# AgentOS Inheritance

Excelsior permanently inherits Kyle's global cross-project operating rules from
the committed `main` branch of
[`KyleGowen/AgentOS`](https://github.com/KyleGowen/AgentOS). Excelsior remains
authoritative for its product, codebase, architecture, users, data, operations,
releases, and repo-local workflows.

## Checked-in contract

- [`.agentos/inheritance.json`](../../.agentos/inheritance.json) is the
  machine-readable source configuration, cached upstream SHA, source-category
  map, and provenance manifest.
- [`.agentos/global-rules.md`](../../.agentos/global-rules.md) is the compact,
  reviewable rules cache loaded for substantive Excelsior tasks.
- [`scripts/agentos-inheritance-status.mjs`](../../scripts/agentos-inheritance-status.mjs)
  checks source availability, fetch freshness, SHA drift, and relevant changed
  files without changing either worktree.
- Root [`AGENTS.md`](../../AGENTS.md) makes this contract discoverable to future
  sessions and establishes instruction precedence.

The cache contains identity and working style, communication preferences,
privacy and secret handling, verification and source grounding, approval
boundaries, memory and compaction, GitHub synchronization, and general
skill-learning/documentation practices. The manifest records the AgentOS source
files for each category.

## Source resolution and freshness

The configured, non-secret local checkout defaults to:

```text
C:\Users\Player.NUCBOXG3_PLUS\Documents\ChatGPT\AgentOS
```

Set `EXCELSIOR_AGENTOS_PATH` to use another local checkout without editing the
manifest. For example, on macOS:

```bash
EXCELSIOR_AGENTOS_PATH=/Users/kyle/Documents/AgentOS npm run agentos:status
```

The status script follows this order:

1. Prefer the environment override, then the configured local checkout.
2. Confirm the checkout's `origin` is `KyleGowen/AgentOS` before trusting it.
3. Run `git fetch origin`. Fetch may update Git metadata, but the script never
   pulls, merges, rebases, switches branches, stages files, or changes either
   worktree.
4. Use committed `origin/main` after a successful fetch.
5. If fetch fails, use the last locally committed `main`, report its SHA, and
   mark freshness unverified.
6. If the local checkout is unavailable or invalid, query GitHub `main`
   read-only for its SHA. When content inspection is required, use a read-only
   GitHub connector or API; AgentOS writes require a configured local checkout.
7. Ignore uncommitted AgentOS files as inherited state, while reporting whether
   the upstream worktree is dirty.

The script does not print credentials or credential-bearing remote URLs. Its
human output is concise; `npm run agentos:status -- --json` produces structured
status for automation.

## Token-efficient refresh

At the first substantive task in a session, run the status command and load the
compact cache. Do not reread large AgentOS files when the cached and upstream
SHAs match.

When the upstream SHA changes, the script diffs only the AgentOS source paths
listed in the manifest:

- If none changed, inspect no AgentOS content and update only cache provenance
  after approval.
- If some changed, inspect only those files or their committed diff and refresh
  only affected categories.
- If the cached commit is unavailable locally, inspect the manifest's source
  files through the selected committed source and report that a full provenance
  refresh is required.

The status script is deliberately read-only with respect to cache content.
Refreshes remain reviewable Excelsior changes and follow normal approval,
validation, commit, and push rules.

## Precedence and conflicts

Apply instructions in this order:

1. Kyle's current request.
2. Excelsior root and nested instructions for Excelsior behavior.
3. The inherited global AgentOS cache where Excelsior has no more-specific rule.

Material conflicts must be reported. Global AgentOS preferences cannot weaken
Excelsior's user-data preservation, production safety, service continuity,
database migration discipline, API/architecture conventions, security, SOC 2,
testing, lint, release gates, repo-local skills, desktop/mobile UX requirements,
or production approval boundaries.

## Deliberate exclusions

Never import context belonging to ThraxOS, the home media server, AI coaching
workflows, Measurabl/work projects, plants, card searches, course projects,
other AgentOS projects, or their skills, agents, automations, reports, and
runtime state. Do not copy credentials, private operational data, database/user
records, large generated artifacts, or volatile technical inventories.

AgentOS keeps only a compact Excelsior summary. Detailed and fast-changing
technical truth belongs in this repository, its issues, pull requests, runtime
evidence, and production evidence.

## AgentOS write allowlist

After explicit approval, Excelsior work may update only:

- `os/context/excelsior.md`.
- The Excelsior section of `os/context/current-projects.md`.
- The Excelsior section of `os/memory/home-memory.md`.
- Relevant Excelsior handoff state in `os/memory/working-memory.md`.
- Excelsior durable decisions in `os/memory/decisions.md`.
- Meaningful Excelsior milestones in `os/memory/project-history.md`.
- Excelsior-specific entries in `PLAYBOOK.md`.
- Existing AgentOS Excelsior skill-catalog/archive entries only when an
  Excelsior skill is intentionally added, changed, renamed, or removed.

Within shared files, edit only the Excelsior entry or the minimum shared status
text needed for accuracy. Do not edit another tracked project; AgentOS root
`AGENTS.md`; `os/memory/README.md`; `os/agents/os-thought-partner.md`;
`PROJECT_TRACKER.md`; course-project folders; general governance; or unrelated
skills, agents, automations, reports, and state. Ask Kyle to expand the allowlist
before any out-of-scope AgentOS edit.

Good AgentOS updates are durable releases, architectural decisions, stable
safety/product boundaries, major workflow changes, meaningful milestones,
high-level status/next actions, and durable lessons. Keep implementation detail,
full issue/PR text, temporary debugging notes, credentials, private data,
generated artifacts, and rapidly changing inventories in Excelsior.

## Approval and recovery boundaries

- A status check or fetch authorizes no source edits or Git operations beyond
  the fetch.
- Do not pull, merge, rebase, reset, switch branches, overwrite user work, or
  resolve conflicting changes without explicit approval.
- AgentOS writes require an available configured local checkout, review of the
  exact allowlisted diff, a separate commit, and a separate push.
- If AgentOS and GitHub are unavailable, continue from the checked-in cache,
  report the cached SHA, and say that freshness could not be verified.
- If the cache is stale and relevant upstream sources cannot be read, do not
  guess at inherited changes; use the existing cache and report the blocked
  refresh.

## Validation

Run:

```bash
npm run test:agentos-inheritance
EXCELSIOR_AGENTOS_PATH=/path/to/AgentOS npm run agentos:status
npm run agentos:status -- --json
```

Before committing, also verify links, JSON formatting, cached/source SHAs,
changed-file scope, and both repositories' status. Use the normal Excelsior
release gates when shipping the resulting changes.
