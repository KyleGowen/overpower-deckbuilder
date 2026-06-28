module.exports = {
  rootDir: '../../',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/tests/integration/**/*.test.ts',
    '**/tests/integration/**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '.*/tests/integration/characterLimitValidation\\.test\\.ts$',
    '.*/tests/integration/character-column-layout\\.test\\.ts$',
    '.*/tests/integration/special-character-threat-display\\.test\\.ts$',
    '.*/tests/integration/reserve-character.*\\.test\\.ts$',
    '.*/tests/integration/power.*\\.test\\.ts$',
    '.*/tests/integration/teamwork.*\\.test\\.ts$',
    '.*/tests/integration/event-mission-filtering-integration\\.test\\.ts$',
    '.*/tests/integration/guest-reserve-character-integration\\.test\\.ts$',
    '.*/tests/integration/deck-ownership-security.*\\.test\\.ts$',
    '.*/tests/integration/deck-save-security.*\\.test\\.ts$',
    '.*/tests/integration/deck-save-frontend-validation\\.test\\.ts$',
    // Legacy v1 `public/` UI — disabled after v2 SPA cutover (see tests/integration/V1_FRONTEND_TESTS_DISABLED.md)
    '.*/tests/integration/deck-editor-search-results-visible\\.test\\.ts$',
    '.*/tests/integration/deck-editor-search-visible-results\\.test\\.ts$',
    '.*/tests/integration/deck-editor-search-bar-basic\\.test\\.ts$',
    '.*/tests/integration/deck-editor-character-stacks\\.test\\.ts$',
    '.*/tests/integration/deckEditabilityHTML\\.test\\.ts$',
    '.*/tests/integration/deckEditabilityBrowser\\.test\\.ts$',
    '.*/tests/integration/deckClickability\\.test\\.ts$',
    '.*/tests/integration/deckTitleDescriptionEditability\\.test\\.ts$',
    '.*/tests/integration/view-button-readonly\\.test\\.ts$',
    '.*/tests/integration/toast-notification-role-based\\.test\\.ts$',
    '.*/tests/integration/collection/collection-guest-sandbox-ui\\.test\\.ts$'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts', // Exclude main entry point from coverage
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.ts'],
  globalTeardown: '<rootDir>/tests/teardown-integration.ts',
  testTimeout: 30000, // Longer timeout for integration tests
  verbose: true,
  // Environment variables for integration tests
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    PORT: '3000'
  },
  // Run integration tests sequentially to avoid port conflicts
  maxWorkers: 1
};
