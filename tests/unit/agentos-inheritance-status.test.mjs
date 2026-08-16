import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterRelevantChangedFiles,
  flattenSourceFiles,
  normalizeRemote,
  resolveConfiguredPath,
} from '../../scripts/agentos-inheritance-status.mjs';

test('normalizes supported GitHub remote forms', () => {
  const expected = 'https://github.com/kylegowen/agentos';
  assert.equal(normalizeRemote('git@github.com:KyleGowen/AgentOS.git'), expected);
  assert.equal(normalizeRemote('https://github.com/KyleGowen/AgentOS.git'), expected);
  assert.equal(normalizeRemote('ssh://git@github.com/KyleGowen/AgentOS.git'), expected);
});

test('flattens and de-duplicates source category files', () => {
  assert.deepEqual(
    flattenSourceFiles({
      identity: ['os/context/identity.md'],
      communication: ['os/context/identity.md', 'os/context/communication-style.md'],
    }),
    ['os/context/communication-style.md', 'os/context/identity.md'],
  );
});

test('reports only changed files that are inheritance sources', () => {
  assert.deepEqual(
    filterRelevantChangedFiles(
      ['os/context/identity.md', 'os/context/thraxos.md', 'PLAYBOOK.md'],
      ['os/context/identity.md', 'PLAYBOOK.md'],
    ),
    ['PLAYBOOK.md', 'os/context/identity.md'],
  );
});

test('environment path overrides the portable manifest default', () => {
  const config = {
    upstream: {
      configuredLocalPath: 'C:\\AgentOS',
      pathEnvironmentVariable: 'EXCELSIOR_AGENTOS_PATH',
    },
  };

  assert.deepEqual(resolveConfiguredPath(config, {}), {
    path: 'C:\\AgentOS',
    source: 'manifest',
  });
  assert.deepEqual(
    resolveConfiguredPath(config, { EXCELSIOR_AGENTOS_PATH: '/tmp/AgentOS' }),
    {
      path: '/tmp/AgentOS',
      source: 'environment:EXCELSIOR_AGENTOS_PATH',
    },
  );
});
