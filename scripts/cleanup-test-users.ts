#!/usr/bin/env ts-node

/**
 * Script to clean up orphaned test users from the local database.
 * Run manually after integration tests leave users behind (e.g. from failed runs or Ctrl+C).
 *
 * Usage:
 *   npx ts-node scripts/cleanup-test-users.ts        # Delete matching users
 *   npx ts-node scripts/cleanup-test-users.ts --dry-run   # List matches without deleting
 */

import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower';

const PRESERVED_USERNAMES = ['guest', 'kyle'];

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('🔍 Dry run - no users will be deleted\n');
  }

  const pool = new Pool({ connectionString });

  try {
    // Build WHERE: match test patterns, exclude preserved users and Google accounts
    const selectQuery = `
      SELECT id, username, email, role, created_at
      FROM users
      WHERE (
        username LIKE 'collection-%'
        OR username LIKE 'list-test-user%'
        OR username LIKE 'signupuser%'
        OR username LIKE 'dupuser%'
        OR username LIKE 'dup1%'
        OR username LIKE 'dup2%'
        OR username LIKE 'dupemail%'
        OR username = 'test-sign-up'
        OR username = 'Test-Guest'
        OR username LIKE 'testuser_%'
        OR username LIKE 'admin-test-user%'
        OR username LIKE 'regular-test-user%'
        OR username LIKE 'new-test-user'
        OR username LIKE 'default-role-user'
        OR username LIKE 'email-test-user'
        OR username LIKE 'no-password-hash-user'
        OR username LIKE 'duplicate-test-user'
        OR username LIKE 'unique-user-%'
        OR username LIKE 'login-test-user'
        OR username LIKE 'wrong-password-user'
        OR email LIKE '%@doopy.doop'
      )
      AND username NOT IN (${PRESERVED_USERNAMES.map((u) => `'${u}'`).join(', ')})
      AND (auth_provider IS NULL OR auth_provider != 'google')
      ORDER BY created_at DESC
    `;

    const selectResult = await pool.query(selectQuery);
    const users = selectResult.rows;

    if (users.length === 0) {
      console.log('✅ No orphaned test users found.');
      return;
    }

    console.log(`Found ${users.length} orphaned test user(s):\n`);
    for (const u of users) {
      console.log(`  - ${u.username} (${u.email}) [${u.role}] - ${u.id}`);
    }

    if (!dryRun) {
      const ids = users.map((u: { id: string }) => u.id);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Disable trigger that inserts into collection_history on collection_cards delete;
        // otherwise cascade deletes conflict (trigger tries to insert ref to collection being deleted)
        await client.query(
          'ALTER TABLE collection_cards DISABLE TRIGGER trigger_log_collection_history_delete'
        );
        await client.query('ALTER TABLE collection_cards DISABLE TRIGGER trigger_log_collection_history_update');
        await client.query('ALTER TABLE collection_cards DISABLE TRIGGER trigger_log_collection_history_insert');
        await client.query('DELETE FROM users WHERE id = ANY($1)', [ids]);
        await client.query('COMMIT');
        console.log(`\n✅ Deleted ${users.length} test user(s).`);
      } catch (e) {
        await client.query('ROLLBACK');
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
      console.log(`\n🔍 Would delete ${users.length} user(s). Run without --dry-run to delete.`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
