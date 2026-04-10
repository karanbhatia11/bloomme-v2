const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Connection Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
  
  console.log('✅ Connected to PostgreSQL!');
  
  // Test a simple query
  client.query('SELECT NOW()', (err, result) => {
    release();
    
    if (err) {
      console.error('❌ Query Error:', err.message);
      process.exit(1);
    }
    
    console.log('✅ Query successful!');
    console.log('Current DB time:', result.rows[0]);
    
    pool.end();
  });
});
