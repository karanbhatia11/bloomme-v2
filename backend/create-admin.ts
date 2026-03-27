import pool from './src/db';
import bcrypt from 'bcrypt';

async function createAdmin() {
    const name = 'Admin User';
    const email = 'karanpartner@gmail.com';
    const password = 'rushilpartner'; // Securely hashed before insertion
    const phone = '0000000000';
    const role = 'admin';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = `ADMIN${Math.floor(1000 + Math.random() * 9000)}`;

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            console.log('User already exists. Updating role to admin...');
            await pool.query('UPDATE users SET role = $1 WHERE email = $2', [role, email]);
        } else {
            console.log('Creating new admin user...');
            await pool.query(
                'INSERT INTO users (name, phone, email, password, role, referral_code) VALUES ($1, $2, $3, $4, $5, $6)',
                [name, phone, email, hashedPassword, role, referralCode]
            );
        }
        console.log('Admin user setup successfully!');
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        await pool.end();
        process.exit(1);
    }
}

createAdmin();
