module.exports = {
  rootDir: '../../',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  // Only role-based-restrictions; deck-ownership and deck-save run in their own matrix jobs
  testMatch: [
    '**/tests/integration/role-based-restrictions.test.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage/integration-security',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.ts'],
  globalTeardown: '<rootDir>/tests/teardown-integration.ts',
  testTimeout: 60000,
  verbose: true,
  forceExit: true, // Security job only: ensure Jest exits after tests (supertest/pool may leave handles)
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    PORT: '3005'
  },
  maxWorkers: 1
};
