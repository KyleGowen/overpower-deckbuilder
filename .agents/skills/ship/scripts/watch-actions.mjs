#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function fail(message, code = 2) {
  process.stderr.write(`ship-watch-actions: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  let runId = '';
  let sha = '';
  let pollSeconds = 60;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--run-id') runId = argv[++index] ?? fail('--run-id requires a value');
    else if (arg === '--sha') sha = argv[++index] ?? fail('--sha requires a value');
    else if (arg === '--poll-seconds') pollSeconds = Number(argv[++index]);
    else fail(`unknown argument: ${arg}`);
  }

  if (!/^\d+$/.test(runId)) fail('--run-id must be numeric');
  if (!/^[0-9a-f]{40}$/i.test(sha)) fail('--sha must be a full 40-character commit SHA');
  if (!Number.isFinite(pollSeconds) || pollSeconds < 0) fail('--poll-seconds must be non-negative');
  return { runId, sha: sha.toLowerCase(), pollMilliseconds: pollSeconds * 1000 };
}

function queryRun(runId) {
  const gh = process.env.SHIP_GH_BIN || 'gh';
  const result = spawnSync(
    gh,
    ['run', 'view', runId, '--json', 'status,conclusion,jobs,url,headSha'],
    { encoding: 'utf8' },
  );

  if (result.error) fail(result.error.message);
  if (result.status !== 0) {
    const rawError = `${result.stderr ?? ''}${result.stdout ?? ''}`.trim();
    fail(rawError || `gh exited ${result.status}`);
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    fail(`invalid gh JSON: ${error.message}`);
  }
}

function summarize(run) {
  const jobs = (run.jobs ?? []).map(job => ({
    name: job.name,
    status: job.status,
    conclusion: job.conclusion,
  }));
  const attentionJobs = jobs.filter(job =>
    job.status !== 'completed' ||
      (job.conclusion && !['success', 'skipped'].includes(job.conclusion)),
  );

  return {
    status: run.status,
    conclusion: run.conclusion,
    url: run.url,
    headSha: run.headSha,
    jobCounts: {
      total: jobs.length,
      completed: jobs.filter(job => job.status === 'completed').length,
      successful: jobs.filter(job => job.conclusion === 'success').length,
      attention: attentionJobs.length,
    },
    attentionJobs,
  };
}

const { runId, sha, pollMilliseconds } = parseArgs(process.argv.slice(2));
let previousState = '';

while (true) {
  const run = summarize(queryRun(runId));
  if ((run.headSha ?? '').toLowerCase() !== sha) {
    fail(`run headSha ${run.headSha || '<missing>'} does not match ${sha}`, 3);
  }

  const state = JSON.stringify(run);
  if (state !== previousState) {
    process.stdout.write(`${JSON.stringify(run)}\n`);
    previousState = state;
  }

  if (run.status === 'completed') process.exit(run.conclusion === 'success' ? 0 : 1);
  await new Promise(resolve => setTimeout(resolve, pollMilliseconds));
}
