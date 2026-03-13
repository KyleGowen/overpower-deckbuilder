/**
 * Test server entry: re-exports app and lifecycle for integration/unit tests.
 * Implementation lives in src/test-server/ (bootstrap, lifecycle, testOnlyRoutes).
 */
export { app } from './test-server/bootstrap';
export { initializeTestServer, closeTestServer } from './test-server/lifecycle';
