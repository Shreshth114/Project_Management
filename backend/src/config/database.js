'use strict';

const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL connection pool.
 *
 * Reads DATABASE_URL from the environment (set via .env or the host environment).
 * Using a Pool means connections are reused across queries rather than
 * opening and closing a fresh TCP connection for every request.
 *
 * Supabase Session Pooler URIs (port 5432) are fully compatible with pg.Pool.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Supabase requires SSL in production; 'rejectUnauthorized: false' trusts
  // Supabase's CA without needing to bundle a certificate locally.
  ssl: {
    rejectUnauthorized: false,
  },

  // Pool tuning defaults (adjust as the application grows)
  max: 10,               // Maximum number of pooled connections
  idleTimeoutMillis: 30000,  // Close idle connections after 30 s
  connectionTimeoutMillis: 5000, // Fail fast if a connection cannot be acquired in 5 s
});

// Emit a warning if the pool encounters an unexpected error on an idle client
pool.on('error', (err) => {
  console.error('[database] Unexpected error on idle client:', err.message);
});

module.exports = pool;
