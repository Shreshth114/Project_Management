'use strict';

/**
 * db-connection-test.js
 *
 * A lightweight, one-shot script that:
 *   1. Loads environment variables from backend/.env via dotenv
 *   2. Creates a PostgreSQL connection pool using the shared database module
 *   3. Runs a harmless SELECT NOW() query
 *   4. Prints ONLY a success/failure message and the returned timestamp
 *   5. Closes the pool cleanly — no connections left dangling
 *
 * IMPORTANT: This file intentionally never prints DATABASE_URL, passwords,
 * host names, or any other secret. Keep it that way.
 */

// Load .env from the backend directory (one level up from tests/)
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = require('../src/config/database');

async function testConnection() {
  let client;

  try {
    // Acquire a client from the pool
    client = await pool.connect();

    // Run a completely harmless read-only query
    const result = await client.query('SELECT NOW() AS current_time;');

    const timestamp = result.rows[0].current_time;

    console.log('✅  Database connection successful!');
    console.log(`    Server time: ${timestamp}`);

  } catch (err) {
    console.error('❌  Database connection FAILED.');
    // Print only the error message — err.message never contains credentials
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;

  } finally {
    // Always release the client back to the pool before ending
    if (client) client.release();

    // Drain and close the pool so the process exits cleanly
    await pool.end();
  }
}

testConnection();
