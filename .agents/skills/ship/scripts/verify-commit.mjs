#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { resolve, relative, sep } from 'node:path';

function fail(message) {
  process.stderr.write(`ship-verify-commit: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  let repo = process.cwd();
  let sha = '';
  const intended = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo') repo = argv[++index] ?? fail('--repo requires a value');
    else if (arg === '--sha') sha = argv[++index] ?? fail('--sha requires a value');
    else if (arg === '--include') intended.push(argv[++index] ?? fail('--include requires a path'));
    else fail(`unknown argument: ${arg}`);
  }

  if (!/^[0-9a-f]{40}$/i.test(sha)) fail('--sha must be a full 40-character commit SHA');
  if (intended.length === 0) fail('provide each intended path with --include');
  return { repo, sha: sha.toLowerCase(), intended };
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

const { repo, sha, intended } = parseArgs(process.argv.slice(2));
const root = git(repo, ['rev-parse', '--show-toplevel']);
const normalizePath = input => relative(root, resolve(root, input)).split(sep).join('/');
const expectedPaths = [...new Set(intended.map(normalizePath))].sort();
if (expectedPaths.some(path => !path || path === '..' || path.startsWith('../'))) {
  fail('an intended path is outside the repository');
}

const head = git(root, ['rev-parse', 'HEAD']).toLowerCase();
const committedPaths = git(root, ['diff-tree', '--no-commit-id', '--name-only', '-r', sha])
  .split('\n')
  .filter(Boolean)
  .sort();

const result = { sha, head, expectedPaths, committedPaths };
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

if (head !== sha) fail(`HEAD ${head} does not match returned SHA ${sha}`);
if (JSON.stringify(committedPaths) !== JSON.stringify(expectedPaths)) {
  fail('commit path set does not match the frozen manifest');
}
