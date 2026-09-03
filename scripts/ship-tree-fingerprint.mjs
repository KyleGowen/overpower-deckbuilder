#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function git(repoRoot, args, encoding = null) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding,
    maxBuffer: 128 * 1024 * 1024,
  });
}

function addPart(hash, label, value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(String(value));
  hash.update(`${label}\0${buffer.length}\0`);
  hash.update(buffer);
  hash.update('\0');
}

export function computeShipTreeFingerprint(repoRoot = process.cwd()) {
  const root = git(repoRoot, ['rev-parse', '--show-toplevel'], 'utf8').trim();
  const hash = createHash('sha256');

  addPart(hash, 'head', git(root, ['rev-parse', 'HEAD'], 'utf8').trim());
  addPart(hash, 'unstaged', git(root, ['diff', '--no-ext-diff', '--binary']));
  addPart(hash, 'staged', git(root, ['diff', '--cached', '--no-ext-diff', '--binary']));

  const untracked = git(root, ['ls-files', '-z', '--others', '--exclude-standard'])
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .sort();

  for (const relativePath of untracked) {
    addPart(hash, 'untracked-path', relativePath);
    addPart(hash, 'untracked-content', readFileSync(`${root}/${relativePath}`));
  }

  return hash.digest('hex');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(`${computeShipTreeFingerprint(process.argv[2])}\n`);
}
