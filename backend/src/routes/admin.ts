import express from 'express';
import pool from '../db';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Middleware to protect all admin routes
router.use(authenticateToken);
router.use(authorizeAdmin);

// --- STATS ---
router.get('/stats', async (req, res) => {
    try {
        const userCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'user\'');
        const subCount = await pool.query('SELECT COUNT(*) FROM subscriptions');
        const activeSubs = await pool.query('SELECT COUNT(*) FROM subscriptions WHERE status = \'active\'');

        const planStats = await pool.query('SELECT plan_type, COUNT(*) FROM subscriptions GROUP BY plan_type');

        res.json({
            total_users: parseInt(userCount.rows[0].count),
            total_subscriptions: parseInt(subCount.rows[0].count),
            active_subscriptions: parseInt(activeSubs.rows[0].count),
            plan_breakdown: planStats.rows
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- USERS ---
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- SUBSCRIPTIONS ---
router.get('/subscriptions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, u.name as user_name, u.email as user_email 
            FROM subscriptions s 
            JOIN users u ON s.user_id = u.id 
            ORDER BY s.created_at DESC
        `);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- CATEGORIES ---
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const { name, image_url, description } = req.body;
        const result = await pool.query(
            'INSERT INTO categories (name, image_url, description) VALUES ($1, $2, $3) RETURNING *',
            [name, image_url, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- PRODUCTS ---
router.get('/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, s.name as subcategory_name 
            FROM products p 
            LEFT JOIN subcategories s ON p.subcategory_id = s.id 
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/products', async (req, res) => {
    try {
        const { subcategory_id, name, description, price, image_url } = req.body;
        const result = await pool.query(
            'INSERT INTO products (subcategory_id, name, description, price, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [subcategory_id, name, description, price, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- PLANS ---
router.get('/plans', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM plans ORDER BY price ASC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/plans', async (req, res) => {
    try {
        const { name, tagline, price, image_url, features, is_popular, is_active } = req.body;
        const result = await pool.query(
            'INSERT INTO plans (name, tagline, price, image_url, features, is_popular, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, tagline, price, image_url, JSON.stringify(features || []), is_popular || false, is_active !== false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, tagline, price, image_url, features, is_popular, is_active } = req.body;
        const result = await pool.query(
            'UPDATE plans SET name = $1, tagline = $2, price = $3, image_url = $4, features = $5, is_popular = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
            [name, tagline, price, image_url, JSON.stringify(features || []), is_popular || false, is_active !== false, id]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/plans/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM plans WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- CONFIG ---
router.post('/config/site-mode', async (req, res) => {
    try {
        const { mode } = req.body; // none, coming_soon, maintenance
        await pool.query(
            "INSERT INTO app_config (key, value) VALUES ('site_mode', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
            [JSON.stringify({ mode })]
        );
        res.json({ success: true, mode });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
