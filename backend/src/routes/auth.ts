import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { loginLimiter, signupLimiter } from '../middleware/rateLimiter';
import { generateToken, hashToken, verifyToken } from '../utils/crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { awardCredits } from './credits';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

router.post('/signup', signupLimiter, async (req, res) => {
    console.log('Signup request received:', req.body.email);
    try {
        const { name, phone, email, password, referred_by_code } = req.body;

        // Input validation
        if (!name || !phone || !email || !password) {
            console.log('Signup failed: Missing fields');
            return res.status(400).json({ error: 'All fields are required.' });
        }
        if (password.length < 8) {
            console.log('Signup failed: Password too short');
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        }
        if (!/^\d{10}$/.test(phone)) {
            console.log('Signup failed: Invalid phone');
            return res.status(400).json({ error: 'Phone must be a valid 10-digit number.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.log('Signup failed: Invalid email');
            return res.status(400).json({ error: 'Invalid email address.' });
        }

        // Check if email already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            console.log('Signup failed: Email already exists');
            return res.status(400).json({ error: 'This email is already registered. Please log in or use a different email.' });
        }

        // Check if phone already exists
        const existingPhone = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
        if (existingPhone.rows.length > 0) {
            console.log('Signup failed: Phone already exists');
            return res.status(400).json({ error: 'This phone number is already registered. Please use a different number.' });
        }

        // Validate referral code if provided
        let referrerId: number | null = null;
        if (referred_by_code) {
            const referrer = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referred_by_code.toUpperCase()]);
            if (referrer.rows.length === 0) {
                console.log('Signup failed: Invalid referral code');
                return res.status(400).json({ error: 'Invalid referral code.' });
            }
            referrerId = referrer.rows[0].id;
            console.log('Valid referral code found, referrer ID:', referrerId);
        }

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique referral code with retry logic (6-char alphanumeric = 2.1B possibilities)
        let referralCode: string;
        let inserted = false;
        let retries = 0;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        do {
            referralCode = 'BLOOM' + Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            const existing = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
            if (existing.rows.length === 0) {
                inserted = true;
            } else {
                retries++;
            }
        } while (!inserted && retries < 5);

        if (!inserted) {
            console.error('Failed to generate unique referral code after 5 retries');
            return res.status(500).json({ error: 'Unable to create account, please try again.' });
        }

        console.log('Inserting user into DB...');

        // Generate email verification token
        const verificationToken = generateToken();
        const hashedVerificationToken = hashToken(verificationToken);
        const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newUser = await pool.query(
            'INSERT INTO users (name, phone, email, password, referral_code, email_verification_token, email_verification_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, phone, email, role, referral_code, referral_points, created_at',
            [name, phone, email, hashedPassword, referralCode, hashedVerificationToken, verificationExpiry]
        );
        const newUserId = newUser.rows[0].id;
        console.log('User inserted successfully:', newUserId);

        // Link any existing guest customer records with this email to the new user
        await pool.query(
            `UPDATE customers SET user_id = $1 WHERE LOWER(email) = LOWER($2) AND user_id IS NULL`,
            [newUserId, email]
        );

        // Claim guest subscriptions created from orders placed with this email
        await pool.query(
            `UPDATE subscriptions SET user_id = $1
             WHERE user_id IS NULL
               AND id IN (
                 SELECT s.id
                 FROM subscriptions s
                 JOIN order_items oi ON oi.item_type = 'subscription'
                 JOIN orders o ON o.id = oi.order_id
                 JOIN customers c ON c.id = o.customer_id
                 WHERE LOWER(c.email) = LOWER($2)
                   AND s.user_id IS NULL
               )`,
            [newUserId, email]
        );

        // Award credits for any paid guest orders placed with this email
        const guestOrders = await pool.query(
            `SELECT o.id, o.amount FROM orders o
             JOIN customers c ON c.id = o.customer_id
             WHERE LOWER(c.email) = LOWER($1)
               AND o.status = 'paid'
               AND o.user_id IS NULL`,
            [email]
        );
        if (guestOrders.rows.length > 0) {
            let totalCredits = 0;
            for (const order of guestOrders.rows) {
                const credits = Math.ceil((order.amount / 100) / 10);
                if (credits > 0) {
                    await awardCredits(newUserId, credits, 'earn_purchase',
                        `Credits claimed for guest order #${order.id}`, order.id);
                    totalCredits += credits;
                }
                // Claim the order under the new user
                await pool.query(`UPDATE orders SET user_id = $1 WHERE id = $2`, [newUserId, order.id]);
            }
            console.log(`Awarded ${totalCredits} retroactive credits to new user ${newUserId} for ${guestOrders.rows.length} guest order(s)`);
        }

        // Send verification email
        await sendVerificationEmail(email, verificationToken, name);

        // Record referral if referral code was provided
        if (referrerId) {
            await pool.query(
                'INSERT INTO referrals (referrer_id, referred_user_id, status) VALUES ($1, $2, $3)',
                [referrerId, newUserId, 'pending']
            );
            console.log('Referral recorded:', { referrer_id: referrerId, referred_user_id: newUserId });
        }

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

router.post('/login', loginLimiter, async (req, res) => {
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

        // Claim any guest orders/subscriptions placed with this email
        await pool.query(
            `UPDATE customers SET user_id = $1 WHERE LOWER(email) = LOWER($2) AND user_id IS NULL`,
            [id, userEmail]
        );
        await pool.query(
            `UPDATE subscriptions SET user_id = $1
             WHERE user_id IS NULL
               AND id IN (
                 SELECT s.id FROM subscriptions s
                 JOIN order_items oi ON oi.item_type = 'subscription'
                 JOIN orders o ON o.id = oi.order_id
                 JOIN customers c ON c.id = o.customer_id
                 WHERE LOWER(c.email) = LOWER($2) AND s.user_id IS NULL
               )`,
            [id, userEmail]
        );
        const guestOrders = await pool.query(
            `SELECT o.id, o.amount FROM orders o
             JOIN customers c ON c.id = o.customer_id
             WHERE LOWER(c.email) = LOWER($1) AND o.status = 'paid' AND o.user_id IS NULL`,
            [userEmail]
        );
        if (guestOrders.rows.length > 0) {
            for (const order of guestOrders.rows) {
                const credits = Math.ceil((order.amount / 100) / 10);
                if (credits > 0) {
                    await awardCredits(id, credits, 'earn_purchase',
                        `Credits claimed for guest order #${order.id}`, order.id);
                }
                await pool.query(`UPDATE orders SET user_id = $1 WHERE id = $2`, [id, order.id]);
            }
            console.log(`Claimed ${guestOrders.rows.length} guest order(s) on login for user ${id}`);
        }

        console.log('Allowing login');
        res.json({ token, user: userResponse });
    } catch (err: any) {
        console.error('Login error:', err);
        res.status(400).json({ error: err.message });
    }
});

/**
 * Verify email address
 */
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required.' });
        }

        const hashedToken = hashToken(token);

        const user = await pool.query(
            'SELECT id, name, phone, email, role, referral_code, referral_points, created_at FROM users WHERE email_verification_token = $1 AND email_verification_expires_at > NOW()',
            [hashedToken]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification token.' });
        }

        const userObj = user.rows[0];

        // Mark email as verified and clear token
        await pool.query(
            'UPDATE users SET email_verified = true, email_verification_token = NULL, email_verification_expires_at = NULL WHERE id = $1',
            [userObj.id]
        );

        // Return a JWT so the frontend can auto-login
        const jwtToken = jwt.sign({ id: userObj.id, email: userObj.email, role: userObj.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Email verified successfully!',
            token: jwtToken,
            user: {
                id: userObj.id,
                name: userObj.name,
                phone: userObj.phone,
                email: userObj.email,
                role: userObj.role,
                referralCode: userObj.referral_code,
                referralBalance: userObj.referral_points,
                createdAt: userObj.created_at,
            }
        });
    } catch (err: any) {
        console.error('Email verification error:', err);
        res.status(400).json({ error: err.message });
    }
});

/**
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        const user = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
        }

        const userId = user.rows[0].id;
        const userName = user.rows[0].name;
        const resetToken = generateToken();
        const hashedResetToken = hashToken(resetToken);
        const resetExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // Store reset token
        await pool.query(
            'UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE id = $3',
            [hashedResetToken, resetExpiry, userId]
        );

        // Send reset email
        await sendPasswordResetEmail(email, resetToken, userName);

        res.json({ message: 'If an account exists, a reset link has been sent.' });
    } catch (err: any) {
        console.error('Forgot password error:', err);
        res.status(400).json({ error: err.message });
    }
});

/**
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        }

        const hashedToken = hashToken(token);

        const user = await pool.query(
            'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires_at > NOW()',
            [hashedToken]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token.' });
        }

        const userId = user.rows[0].id;
        const newHashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        await pool.query(
            'UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expires_at = NULL WHERE id = $2',
            [newHashedPassword, userId]
        );

        res.json({ message: 'Password reset successfully!' });
    } catch (err: any) {
        console.error('Reset password error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
