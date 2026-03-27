import express from 'express';
import pool from '../db';

const router = express.Router();

router.get('/site-mode', async (req, res) => {
    try {
        const result = await pool.query("SELECT value FROM app_config WHERE key = 'site_mode'");
        if (result.rows.length > 0) {
            res.json(result.rows[0].value);
        } else {
            res.json({ mode: 'none' });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/plans', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM plans WHERE is_active = true ORDER BY price ASC");
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
