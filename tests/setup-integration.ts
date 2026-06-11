// Integration test setup - uses real database and server
// No mocking - tests against actual PostgreSQL database

// Set test environment variables
process.env.NODE_ENV = 'test';
if (!process.env.PORT) {
  // Avoid EADDRINUSE when Jest runs multiple workers (e.g. CI passes --maxWorkers=2).
  const worker = Number(process.env.JEST_WORKER_ID ?? '0');
  process.env.PORT = String(3000 + worker);
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'integration-test-jwt-secret-not-for-production';
}
// Note: SKIP_MIGRATIONS removed to ensure database schema is properly initialized

// Polyfill for TextEncoder/TextDecoder (required by pg library)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// No FakePool: Integration tests require real PostgreSQL in CI. If DATABASE_URL is missing locally,
// tests may fail fast, which is acceptable; CI provides the database service.

// Import test server
import { app, initializeTestServer, closeTestServer } from '../src/test-server';

// Track test-created deck and user IDs to ensure we only delete what tests create
const testCreatedDeckIds = new Set<string>();
const testCreatedUserIds = new Set<string>();

// Debug function to log all deck deletions
const logDeckDeletion = (source: string, deckId: string, reason: string = '') => {
  const timestamp = new Date().toISOString();
  
  // Check if this is a protected deck
  const protectedDeckIds = [
    'be383a46-c8e0-4f85-8fc7-2a3b33048ced', // V113 "Ungodly Powers" deck
    'c17c8b37-6d6a-41ca-8460-c7eb4648406f', // Current "Ungodly Powers" deck
  ];
  
  if (protectedDeckIds.includes(deckId)) {
    console.error(`❌❌❌ CRITICAL: Protected deck ${deckId} is being deleted from ${source}! ❌❌❌`);
  }
};

// Global test utilities for integration tests
export const integrationTestUtils = {
  // Helper to track a deck created by tests
  trackTestDeck: (deckId: string) => {
    testCreatedDeckIds.add(deckId);
    console.log(`✅ DEBUG: Deck ${deckId} added to tracking set. Current tracked decks: [${Array.from(testCreatedDeckIds).join(', ')}]`);
  },

  // Helper to track a user created by tests
  trackTestUser: (userId: string) => {
    testCreatedUserIds.add(userId);
  },

  // Helper to untrack a deck (when it's deleted by tests)
  untrackTestDeck: (deckId: string) => {
    testCreatedDeckIds.delete(deckId);
  },

  // Helper to get all tracked test deck IDs
  getTrackedTestDeckIds: () => {
    return Array.from(testCreatedDeckIds);
  },
  // Helper to create test user in database
  createTestUser: async (userData: { name: string; email: string; role?: string; password?: string }) => {
    const { Pool } = require('pg');
    const crypto = require('crypto');
    const bcrypt = require('bcrypt');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
    
    try {
      // Ensure uniqueness to avoid constraint violations across tests
      const uniqueSuffix = `_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const username = (userData.name && userData.name.length > 0) ? `${userData.name}${uniqueSuffix}` : `testuser${uniqueSuffix}`;
      const email = userData.email ? userData.email.replace('@', `${uniqueSuffix}@`) : `testuser${uniqueSuffix}@example.com`;
      
      // Hash the password
      const passwordToHash = userData.password || 'password123';
      const hashedPassword = await bcrypt.hash(passwordToHash, 10);
      
      const result = await pool.query(
        'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
          crypto.randomUUID(), // Generate proper UUID
          username,
          email,
          hashedPassword,
          userData.role || 'USER'
        ]
      );
      // Track created user for automatic cleanup
      if (result.rows[0]?.id) {
        testCreatedUserIds.add(result.rows[0].id);
      }
      return result.rows[0];
    } catch (err: any) {
      console.warn('⚠️ Failed to create test user in database:', err?.message || err);
      // Return a mock user object for tests that don't need real database
      return {
        id: crypto.randomUUID(),
        username: `testuser_${Date.now()}`,
        email: `testuser_${Date.now()}@example.com`,
        role: userData.role || 'USER'
      };
    } finally {
      await pool.end();
    }
  },
  
  // Helper to create test deck in database
  createTestDeck: async (userId: string, deckData: any) => {
    
    const { Pool } = require('pg');
    const crypto = require('crypto');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
    
    try {
      const deckId = crypto.randomUUID();
      
      const result = await pool.query(
        'INSERT INTO decks (id, user_id, name, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [
          deckId,
          userId,
          deckData.name,
          deckData.description || ''
        ]
      );
      
      // Track this deck as test-created
      testCreatedDeckIds.add(deckId);
      console.log(`✅ DEBUG: createTestDeck() - Deck ${deckId} added to tracking set. Current tracked decks: [${Array.from(testCreatedDeckIds).join(', ')}]`);
      
      return result.rows[0];
    } catch (err: any) {
      console.warn('⚠️ Failed to create test deck in database:', err?.message || err);
      // Return a mock deck object for tests that don't need real database
      const deckId = crypto.randomUUID();
      testCreatedDeckIds.add(deckId);
      return {
        id: deckId,
        user_id: userId,
        name: deckData.name,
        description: deckData.description || ''
      };
    } finally {
      await pool.end();
    }
  },
  
  // Helper to clean up test data - DEPRECATED: Use tracked deck IDs instead
  // This function is kept for backwards compatibility but should not be used
  // All cleanup should use trackTestDeck() and the tracked ID-based cleanup
  cleanupTestData: async () => {
    console.warn('⚠️ cleanupTestData() is deprecated. All cleanup should use trackTestDeck() and tracked ID-based cleanup.');
    // No operation - cleanup is handled by tracked IDs only
  },

  // Comprehensive cleanup function for manual cleanup of all test data
  cleanupAllTestData: async () => {
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
    
    try {
      console.log('🧹 Starting comprehensive test data cleanup...');
      
      // Get tracked test deck IDs
      const trackedDeckIds = Array.from(testCreatedDeckIds);
      
      // Only delete tracked test decks - no complex protection needed
      
      if (trackedDeckIds.length > 0) {
        console.log(`🗑️ Deleting ${trackedDeckIds.length} test-created decks: ${trackedDeckIds.join(', ')}`);
        
        // First, delete all deck cards for tracked test decks
        await pool.query(`
          DELETE FROM deck_cards WHERE deck_id = ANY($1)
        `, [trackedDeckIds]);
        
        // Then delete the tracked test decks
        for (const deckId of trackedDeckIds) {
          logDeckDeletion('cleanupAllTestData', deckId, 'tracked test deck');
        }
        const deckResult = await pool.query(`
          DELETE FROM decks WHERE id = ANY($1)
        `, [trackedDeckIds]);
        
        console.log(`✅ Deleted ${deckResult.rowCount} test-created decks`);
      } else {
        console.log('ℹ️ No tracked test decks to delete');
      }
      
      // Clear the deck tracking set
      testCreatedDeckIds.clear();
      
      // Delete tracked test users (disable collection_cards triggers first to avoid
      // FK violation when cascade delete fires trigger that inserts into collection_history)
      if (testCreatedUserIds.size > 0) {
        const userIds = Array.from(testCreatedUserIds);
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(
            'ALTER TABLE collection_cards DISABLE TRIGGER trigger_log_collection_history_delete'
          );
          await client.query(
            'ALTER TABLE collection_cards DISABLE TRIGGER trigger_log_collection_history_update'
          );
          await client.query(
            'ALTER TABLE collection_cards DISABLE TRIGGER trigger_log_collection_history_insert'
          );
          await client.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
          await client.query('COMMIT');
          console.log(`✅ Deleted ${userIds.length} test-created users`);
        } catch (e) {
          await client.query('ROLLBACK').catch(() => {});
          throw e;
        } finally {
          try {
            await client.query(
              'ALTER TABLE collection_cards ENABLE TRIGGER trigger_log_collection_history_delete'
            );
            await client.query(
              'ALTER TABLE collection_cards ENABLE TRIGGER trigger_log_collection_history_update'
            );
            await client.query(
              'ALTER TABLE collection_cards ENABLE TRIGGER trigger_log_collection_history_insert'
            );
          } catch {
            /* best-effort re-enable */
          }
          client.release();
        }
      } else {
        console.log('ℹ️ No tracked test users to delete');
      }
      // Clear user tracking set
      testCreatedUserIds.clear();
    } catch (err: any) {
      console.warn('⚠️ Failed to cleanup test data:', err?.message || err);
      // Clear tracking sets even if cleanup failed
      testCreatedDeckIds.clear();
      testCreatedUserIds.clear();
    } finally {
      await pool.end();
    }
  },
  
  // Helper to ensure test guest user exists (separate from production guest)
  ensureGuestUser: async () => {
    const { Pool } = require('pg');
    const bcrypt = require('bcrypt');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
    
    try {
      // Check if test guest user exists
      const result = await pool.query('SELECT * FROM users WHERE username = $1', ['Test-Guest']);
      const TEST_GUEST_ID = '00000000-0000-0000-0000-000000000002';
      
      if (result.rows.length === 0) {
        // Hash the test guest password
        const hashedPassword = await bcrypt.hash('test-guest', 10);
        
        // Create test guest user if it doesn't exist
        await pool.query(
          'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
          [
            TEST_GUEST_ID, // Different ID from production guest
            'Test-Guest',
            'test-guest@example.com',
            hashedPassword,
            'GUEST'
          ]
        );
        testCreatedUserIds.add(TEST_GUEST_ID);
        console.log('✅ Test-Guest user created for integration tests');
      } else {
        testCreatedUserIds.add(TEST_GUEST_ID);
        console.log('✅ Test-Guest user already exists');
      }
    } catch (err: any) {
      console.warn('⚠️ Skipping ensureGuestUser: database not reachable or query failed in CI environment.', err?.message || err);
    } finally {
      await pool.end();
    }
  }
  ,
  // Helper to ensure admin user (kyle) exists
  ensureAdminUser: async () => {
    const { Pool } = require('pg');
    const bcrypt = require('bcrypt');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
    try {
      // Hash the admin password
      const hashedPassword = await bcrypt.hash('test', 10);
      
      const result = await pool.query('SELECT * FROM users WHERE username = $1', ['kyle']);
      
      if (result.rows.length === 0) {
        // Create new user
        await pool.query(
          'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
          [
            'c567175f-a07b-41b7-b274-e82901d1b4f1',
            'kyle',
            'kyle@example.com',
            hashedPassword,
            'ADMIN'
          ]
        );
        console.log('✅ Admin user created for integration tests');
      } else {
        // Update existing user's password
        await pool.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE username = $2',
          [hashedPassword, 'kyle']
        );
        console.log('✅ Admin user password updated for integration tests');
      }
    } catch (err: any) {
      console.warn('⚠️ Skipping ensureAdminUser: database not reachable or query failed in CI environment.', err?.message || err);
    } finally {
      await pool.end();
    }
  },

  // Internal pool user for tournament deck integration tests (V280)
  ensureTournamentDecksUser: async () => {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
    const TOURNAMENT_DECKS_USER_ID = '00000000-0000-0000-0000-000000000003';
    const POOL_PASSWORD_HASH = '$2b$10$4y9lsEvvADN1Q2LuP4Pd2.VMFT4Qdt5HPpA6mmnq.LS3nBdXa15dW';

    try {
      const result = await pool.query('SELECT id FROM users WHERE username = $1', ['tournament_decks']);
      if (result.rows.length === 0) {
        await pool.query(
          `INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [
            TOURNAMENT_DECKS_USER_ID,
            'tournament_decks',
            'tournament_decks@example.com',
            POOL_PASSWORD_HASH,
            'USER'
          ]
        );
        console.log('✅ tournament_decks user created for integration tests');
      }
    } catch (err: any) {
      console.warn(
        '⚠️ Skipping ensureTournamentDecksUser: database not reachable or query failed.',
        err?.message || err
      );
    } finally {
      await pool.end();
    }
  }
};

// Ensure guest user exists before running integration tests
beforeAll(async () => {
  try {
    await integrationTestUtils.ensureGuestUser();
    await integrationTestUtils.ensureAdminUser();
    await integrationTestUtils.ensureTournamentDecksUser();
    // Initialize test server
    await initializeTestServer();
  } catch (err: any) {
    console.warn('⚠️ Failed to initialize test setup:', err?.message || err);
    // Continue with tests even if setup fails
  }
});

// Clean up test data after each test suite (not after each individual test)
// This prevents deleting users that are needed for subsequent tests in the same suite
afterEach(async () => {
  
  // Only clean up specific test data that should be cleaned after each test
  // Don't clean up users as they may be needed for subsequent tests in the same suite
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
  });
  
  try {
    // Get tracked test deck IDs for this test run
    const trackedDeckIds = Array.from(testCreatedDeckIds);
    
    if (trackedDeckIds.length > 0) {
      console.log(`🧹 Cleaning up ${trackedDeckIds.length} test-created decks after test: ${trackedDeckIds.join(', ')}`);
      
      // Only delete tracked test decks - no complex protection needed
      // First, delete all deck cards for tracked test decks
      await pool.query(`
        DELETE FROM deck_cards WHERE deck_id = ANY($1)
      `, [trackedDeckIds]);
      
      // Then delete the tracked test decks
      for (const deckId of trackedDeckIds) {
        logDeckDeletion('afterEach cleanup', deckId, 'tracked test deck');
      }
      await pool.query(`
        DELETE FROM decks WHERE id = ANY($1)
      `, [trackedDeckIds]);
      
      // Clear the tracking set for this test run
      testCreatedDeckIds.clear();
    } else {
    }

    // Note: Do not delete tracked users after each test, as some suites
    // create users in beforeAll and reuse them across multiple tests.
  } catch (err: any) {
    console.warn('⚠️ Failed to cleanup test data after test:', err?.message || err);
    // Clear tracking sets even if cleanup failed
    testCreatedDeckIds.clear();
  } finally {
    await pool.end();
  }
});

// Global cleanup after all tests
afterAll(async () => {
  console.log('🧹 Global test cleanup...');
  try {
    // Check V113 deck before cleanup
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
    
    try {
      const beforeResult = await pool.query('SELECT id, name, user_id FROM decks WHERE id = $1', ['be383a46-c8e0-4f85-8fc7-2a3b33048ced']);
    } catch (err: any) {
      console.warn('⚠️ Could not check V113 deck before cleanup:', err?.message || err);
    }
    
    // Run comprehensive cleanup of all test data
    await integrationTestUtils.cleanupAllTestData();
    
    try {
      // Check V113 deck after cleanup
      const afterResult = await pool.query('SELECT id, name, user_id FROM decks WHERE id = $1', ['be383a46-c8e0-4f85-8fc7-2a3b33048ced']);
    } catch (err: any) {
      console.warn('⚠️ Could not check V113 deck after cleanup:', err?.message || err);
    }
    
    await pool.end();
    
    // Close test server
    try {
      await closeTestServer();
    } catch (err: any) {
      console.warn('⚠️ Could not close test server:', err?.message || err);
    }
    
    // Close any remaining database connections
    try {
      const { DataSourceConfig } = require('../src/config/DataSourceConfig');
      const dataSourceConfig = DataSourceConfig.getInstance();
      await dataSourceConfig.close();
      console.log('✅ All database connections closed');
    } catch (err: any) {
      console.warn('⚠️ Could not close database connections:', err?.message || err);
    }
  } catch (error: any) {
    console.error('❌ Error during global cleanup:', error?.message || error);
  }
});

// Export the app and logging function for use in tests
export { app, logDeckDeletion };
