// CI config: extends the unit config with CI-specific overrides for
// parallelism, sharding, and coverage format. Does NOT change mock
// behavior -- tests are authored against the unit config defaults.
const unitConfig = require('./jest.unit.config');

module.exports = {
  ...unitConfig,
  // Disable ts-jest type checking in CI -- the build job already runs tsc
  // for full type checking. This prevents TS diagnostic errors from failing
  // tests that are functionally correct (e.g., missing type stubs).
  transform: {
    '^.+\\.ts$': ['ts-jest', { diagnostics: false }],
  },
  // Override coverage reporters to include JSON for shard merging
  coverageReporters: ['text', 'lcov', 'json'],
  // Reduce log noise in CI
  verbose: false,
  // Pin to 2 workers — safe for 2-vCPU GitHub-hosted runners and avoids
  // over-subscribing memory on runners with more cores.
  maxWorkers: 2,
  // Force exit after tests complete (avoid hanging on open handles)
  forceExit: true,
};
