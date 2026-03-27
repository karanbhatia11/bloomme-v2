const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    // Add notifications column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{"email":true,"sms":false,"push":true}';
    `);
    console.log('✓ notifications column added');
    await pool.end();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
