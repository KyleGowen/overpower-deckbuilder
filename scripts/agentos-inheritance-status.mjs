#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const DEFAULT_CONFIG = resolve(REPO_ROOT, '.agentos/inheritance.json');

export function normalizeRemote(remote) {
  return remote
    .trim()
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

export function flattenSourceFiles(sourceCategories) {
  return [...new Set(Object.values(sourceCategories).flat())].sort();
}

export function filterRelevantChangedFiles(changedFiles, sourceFiles) {
  const allowed = new Set(sourceFiles);
  return changedFiles.filter((file) => allowed.has(file)).sort();
}

export function resolveConfiguredPath(config, environment = process.env) {
  const variable = config.upstream.pathEnvironmentVariable;
  const override = variable ? environment[variable] : undefined;
  return {
    path: override || config.upstream.configuredLocalPath,
    source: override ? `environment:${variable}` : 'manifest',
  };
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
      ...(options.env || {}),
    },
  }).trim();
}

function tryRun(command, args, options = {}) {
  try {
    return { ok: true, output: run(command, args, options), error: null };
  } catch (error) {
    const stderr = error?.stderr?.toString().trim();
    return {
      ok: false,
      output: '',
      error: stderr || error?.message || 'command failed',
    };
  }
}

function safeError(error) {
  return String(error || 'unknown error')
    .replace(/https:\/\/[^\s/@]+@github\.com/gi, 'https://github.com')
    .split('\n')[0];
}

function localStatus(config, configured) {
  const checkout = resolve(configured.path);
  const gitDir = resolve(checkout, '.git');
  if (!existsSync(gitDir)) {
    return null;
  }

  const remote = tryRun('git', ['remote', 'get-url', 'origin'], { cwd: checkout });
  if (!remote.ok) {
    return null;
  }

  const expectedRemote = normalizeRemote(config.upstream.remoteUrl);
  const actualRemote = normalizeRemote(remote.output);
  if (actualRemote !== expectedRemote) {
    return {
      mode: 'local-invalid',
      checkout,
      pathSource: configured.source,
      error: `Configured checkout origin does not match ${config.upstream.repository}.`,
    };
  }

  const branch = tryRun('git', ['branch', '--show-current'], { cwd: checkout });
  const dirty = tryRun('git', ['status', '--porcelain'], { cwd: checkout });
  const fetch = tryRun('git', ['fetch', 'origin'], { cwd: checkout });

  let sourceRef;
  let upstreamSha;
  let freshnessVerified = false;
  if (fetch.ok) {
    sourceRef = `refs/remotes/origin/${config.upstream.branch}`;
    const fetched = tryRun('git', ['rev-parse', '--verify', sourceRef], { cwd: checkout });
    if (fetched.ok) {
      upstreamSha = fetched.output;
      freshnessVerified = true;
    }
  }

  if (!upstreamSha) {
    sourceRef = `refs/heads/${config.upstream.branch}`;
    const localMain = tryRun('git', ['rev-parse', '--verify', sourceRef], { cwd: checkout });
    if (!localMain.ok) {
      return {
        mode: 'local-invalid',
        checkout,
        pathSource: configured.source,
        error: `No committed local ${config.upstream.branch} is available.`,
      };
    }
    upstreamSha = localMain.output;
  }

  const cachedSha = config.cache.upstreamCommit;
  const sourceFiles = flattenSourceFiles(config.cache.sourceCategories);
  let relevantChangedFiles = [];
  let inspection = 'none';

  if (upstreamSha !== cachedSha) {
    const cachedExists = tryRun('git', ['cat-file', '-e', `${cachedSha}^{commit}`], {
      cwd: checkout,
    });
    if (cachedExists.ok) {
      const changed = tryRun(
        'git',
        ['diff', '--name-only', `${cachedSha}..${upstreamSha}`, '--', ...sourceFiles],
        { cwd: checkout },
      );
      if (changed.ok) {
        relevantChangedFiles = filterRelevantChangedFiles(
          changed.output ? changed.output.split('\n') : [],
          sourceFiles,
        );
        inspection = relevantChangedFiles.length ? 'changed-sources-only' : 'provenance-only';
      } else {
        relevantChangedFiles = sourceFiles;
        inspection = 'all-manifest-sources';
      }
    } else {
      relevantChangedFiles = sourceFiles;
      inspection = 'all-manifest-sources';
    }
  }

  return {
    mode: 'local',
    checkout,
    pathSource: configured.source,
    branch: branch.ok ? branch.output : null,
    worktreeDirty: dirty.ok ? Boolean(dirty.output) : null,
    fetchAttempted: true,
    fetchSucceeded: fetch.ok,
    fetchError: fetch.ok ? null : safeError(fetch.error),
    freshnessVerified,
    sourceRef,
    upstreamSha,
    cachedSha,
    refreshNeeded: upstreamSha !== cachedSha,
    inspection,
    relevantChangedFiles,
  };
}

function githubFallbackStatus(config, configured, localProblem = null) {
  const ref = `refs/heads/${config.upstream.branch}`;
  const remote = tryRun('git', ['ls-remote', '--exit-code', config.upstream.remoteUrl, ref]);
  const cachedSha = config.cache.upstreamCommit;
  const upstreamSha = remote.ok ? remote.output.split(/\s+/)[0] : null;

  return {
    mode: 'github-read-only',
    checkout: configured.path,
    pathSource: configured.source,
    localProblem,
    fetchAttempted: false,
    fetchSucceeded: false,
    freshnessVerified: remote.ok,
    githubError: remote.ok ? null : safeError(remote.error),
    sourceRef: remote.ok ? ref : 'checked-in-cache',
    upstreamSha: upstreamSha || cachedSha,
    cachedSha,
    refreshNeeded: upstreamSha ? upstreamSha !== cachedSha : false,
    inspection:
      upstreamSha && upstreamSha !== cachedSha
        ? 'read-manifest-sources-through-github'
        : 'none',
    relevantChangedFiles: null,
  };
}

export function loadConfig(configPath = DEFAULT_CONFIG) {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function collectStatus(configPath = DEFAULT_CONFIG, environment = process.env) {
  const config = loadConfig(configPath);
  const configured = resolveConfiguredPath(config, environment);
  const local = localStatus(config, configured);
  if (local?.mode === 'local') {
    return local;
  }
  return githubFallbackStatus(config, configured, local?.error || 'Configured checkout unavailable.');
}

function printHuman(status) {
  const lines = [
    `AgentOS source: ${status.mode}`,
    `Configured checkout: ${status.checkout} (${status.pathSource})`,
    `Upstream SHA: ${status.upstreamSha}`,
    `Cached SHA: ${status.cachedSha}`,
    `Freshness verified: ${status.freshnessVerified ? 'yes' : 'no'}`,
    `Refresh needed: ${status.refreshNeeded ? 'yes' : 'no'}`,
    `Inspection: ${status.inspection}`,
  ];

  if (status.mode === 'local') {
    lines.splice(2, 0, `Branch: ${status.branch || '(detached or unknown)'}`);
    lines.splice(3, 0, `Worktree dirty: ${status.worktreeDirty ? 'yes (ignored)' : 'no'}`);
    lines.push(`Fetch: ${status.fetchSucceeded ? 'succeeded' : `failed (${status.fetchError})`}`);
  } else if (status.localProblem) {
    lines.push(`Local checkout: ${status.localProblem}`);
  }

  if (Array.isArray(status.relevantChangedFiles) && status.relevantChangedFiles.length) {
    lines.push('Relevant changed files:');
    lines.push(...status.relevantChangedFiles.map((file) => `- ${file}`));
  }

  if (!status.freshnessVerified) {
    lines.push('Recovery: using committed cached/local state; upstream freshness could not be verified.');
  }

  process.stdout.write(`${lines.join('\n')}\n`);
}

function parseArguments(argv) {
  const json = argv.includes('--json');
  const configIndex = argv.indexOf('--config');
  let configPath = DEFAULT_CONFIG;
  if (configIndex >= 0 && !argv[configIndex + 1]) {
    throw new Error('--config requires a path');
  }
  if (configIndex >= 0) {
    configPath = resolve(argv[configIndex + 1]);
  }
  return { json, configPath };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const { json, configPath } = parseArguments(process.argv.slice(2));
    const status = collectStatus(configPath);
    if (json) {
      process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
    } else {
      printHuman(status);
    }
  } catch (error) {
    process.stderr.write(`AgentOS inheritance status failed: ${safeError(error?.message)}\n`);
    process.exitCode = 1;
  }
}
