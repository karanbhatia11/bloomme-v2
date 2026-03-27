import pool from './src/db';

async function updateDb() {
    try {
        await pool.query('ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;');
        await pool.query('ALTER TABLE plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
        console.log('Database updated: plans table now has is_active and updated_at columns.');
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error(err);
        await pool.end();
        process.exit(1);
    }
}

updateDb();
