const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ DB Connection Failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ DB Connection Success:', res.rows[0]);
        process.exit(0);
    }
});
