import pool from './src/db';

async function checkUsers() {
    try {
        const users = await pool.query('SELECT name, email, role FROM users');
        console.table(users.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
