#!/usr/bin/env ts-node

import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:1337/overpower'
});

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data for integration tests...');
    
    // Create guest user if it doesn't exist
    const guestUserResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['guest']
    );
    
    if (guestUserResult.rows.length === 0) {
      // Hash the guest password
      const guestHashedPassword = await bcrypt.hash('guest', 10);
      
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [
          '00000000-0000-0000-0000-000000000001',
          'guest',
          'guest@example.com',
          guestHashedPassword,
          'GUEST'
        ]
      );
      console.log('✅ Guest user created');
    } else {
      console.log('✅ Guest user already exists');
    }
    
    // Create community_decks user if it doesn't exist
    const communityDecksResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['community_decks']
    );

    if (communityDecksResult.rows.length === 0) {
      const communityHashedPassword = await bcrypt.hash('5101', 10);
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [
          '00000000-0000-0000-0000-000000000002',
          'community_decks',
          'community_decks@example.com',
          communityHashedPassword,
          'USER',
        ]
      );
      console.log('✅ community_decks user created');
    } else {
      console.log('✅ community_decks user already exists');
    }

    // Create tournament_decks user if it doesn't exist
    const tournamentDecksResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['tournament_decks']
    );

    if (tournamentDecksResult.rows.length === 0) {
      const tournamentHashedPassword = await bcrypt.hash('5101', 10);
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [
          '00000000-0000-0000-0000-000000000003',
          'tournament_decks',
          'tournament_decks@example.com',
          tournamentHashedPassword,
          'USER',
        ]
      );
      console.log('✅ tournament_decks user created');
    } else {
      console.log('✅ tournament_decks user already exists');
    }

    // Create kyle user if it doesn't exist
    const kyleUserResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['kyle']
    );
    
    if (kyleUserResult.rows.length === 0) {
      // Hash the kyle password
      const kyleHashedPassword = await bcrypt.hash('test', 10);
      
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [
          'c567175f-a07b-41b7-b274-e82901d1b4f1',
          'kyle',
          'kyle@example.com',
          kyleHashedPassword,
          'ADMIN'
        ]
      );
      console.log('✅ Kyle user created');
    } else {
      console.log('✅ Kyle user already exists');
    }
    
    // Clean up any test data from previous runs
    await pool.query('DELETE FROM deck_cards WHERE deck_id::text LIKE \'test_%\'');
    await pool.query('DELETE FROM decks WHERE id::text LIKE \'test_%\'');
    await pool.query('DELETE FROM users WHERE username LIKE \'Test%\' OR username LIKE \'Jest%\'');
    
    console.log('✅ Test data setup complete');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupTestData();
