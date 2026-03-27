import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bloom_secret_key';

router.post('/signup', async (req, res) => {
    console.log('Signup request received:', req.body.email);
    try {
        const { name, phone, email, password } = req.body;

        // Input validation
        if (!name || !phone || !email || !password) {
            console.log('Signup failed: Missing fields');
            return res.status(400).json({ error: 'All fields are required.' });
        }
        if (password.length < 6) {
            console.log('Signup failed: Password too short');
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }
        if (!/^\d{10}$/.test(phone)) {
            console.log('Signup failed: Invalid phone');
            return res.status(400).json({ error: 'Phone must be a valid 10-digit number.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.log('Signup failed: Invalid email');
            return res.status(400).json({ error: 'Invalid email address.' });
        }

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = `BLOOM${Math.floor(1000 + Math.random() * 9000)}`;

        console.log('Inserting user into DB...');
        const newUser = await pool.query(
            'INSERT INTO users (name, phone, email, password, referral_code) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, email, role, referral_code, referral_points, created_at',
            [name, phone, email, hashedPassword, referralCode]
        );
        console.log('User inserted successfully:', newUser.rows[0].id);

        // Check if restricted mode is enabled
        console.log('Checking site mode...');
        const configResult = await pool.query("SELECT value FROM app_config WHERE key = 'site_mode'");
        const siteMode = configResult.rows.length > 0 ? configResult.rows[0].value.mode : 'none';
        console.log('siteMode:', siteMode);

        // Always generate token, even in site mode
        const userObj = newUser.rows[0];
        const token = jwt.sign({ id: userObj.id, email: userObj.email, role: userObj.role }, JWT_SECRET, { expiresIn: '1d' });

        // Transform snake_case to camelCase for frontend
        const userResponse = {
            id: userObj.id,
            name: userObj.name,
            phone: userObj.phone,
            email: userObj.email,
            role: userObj.role,
            referralCode: userObj.referral_code,
            referralBalance: userObj.referral_points,
            createdAt: userObj.created_at,
        };

        if (siteMode !== 'none') {
            console.log('Site mode active, returning with token and site status');
            return res.status(201).json({
                token,
                user: userResponse,
                coming_soon: siteMode === 'coming_soon',
                maintenance: siteMode === 'maintenance',
                message: siteMode === 'coming_soon'
                    ? 'Account created! We are coming soon, you will be notified.'
                    : 'Account created! Site is currently under maintenance.'
            });
        }

        console.log('Returning signup response');
        res.status(201).json({ token, user: userResponse });
    } catch (err: any) {
        console.error('Signup error:', err);
        res.status(400).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    console.log("Login Request Start V2", req.body.email);
    try {
        const { email, password } = req.body;
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        // Check if restricted mode is enabled
        const configResult = await pool.query("SELECT value FROM app_config WHERE key = 'site_mode'");
        const siteMode = configResult.rows.length > 0 ? configResult.rows[0].value.mode : 'none';
        const userRole = (user.rows[0].role || '').toString().toLowerCase().trim();

        console.log('[AuthV2] Login attempt:', { email, siteMode, userRole });

        const userObj = user.rows[0];
        const { id, name, phone, email: userEmail, role, referral_code, referral_points, created_at } = userObj;

        // Always generate token
        const token = jwt.sign({ id, email: userEmail, role: userRole }, JWT_SECRET, { expiresIn: '1d' });

        // Transform snake_case to camelCase for frontend
        const userResponse = {
            id,
            name,
            phone,
            email: userEmail,
            role: userRole,
            referralCode: referral_code,
            referralBalance: referral_points,
            createdAt: created_at,
        };

        if (siteMode !== 'none' && userRole !== 'admin') {
            console.log('Blocking login: siteMode active and NOT admin');
            return res.status(200).json({
                token,
                user: userResponse,
                coming_soon: siteMode === 'coming_soon',
                maintenance: siteMode === 'maintenance',
                message: siteMode === 'coming_soon' ? 'We are coming soon!' : 'Site is under maintenance.'
            });
        }

        console.log('Allowing login');
        res.json({ token, user: userResponse });
    } catch (err: any) {
        console.error('Login error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
