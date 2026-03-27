import express from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get available plans
router.get('/plans', (req, res) => {
    res.json([
        { id: 'BASIC', name: 'BASIC', price: 1499, description: '60-100g fresh flowers, 3 varieties, delivery in eco paper bag' },
        { id: 'PREMIUM', name: 'PREMIUM', price: 2699, description: '150g flowers, premium varieties, delivered in Bloomme box' },
        { id: 'ELITE', name: 'ELITE', price: 4499, description: '200g premium flowers, exotic seasonal flowers, luxury Bloomme box' }
    ]);
});

// Update or create subscription
router.post('/subscribe', authenticateToken as any, async (req, res) => {
    try {
        const { plan_type, price, delivery_days, custom_schedule, add_on_ids } = req.body;
        const user_id = (req as any).user.id;

        const sub = await pool.query(
            'INSERT INTO subscriptions (user_id, plan_type, price, delivery_days, custom_schedule) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [user_id, plan_type, price, delivery_days, custom_schedule]
        );

        const subscription_id = sub.rows[0].id;

        // Save selected add-ons if provided
        if (Array.isArray(add_on_ids) && add_on_ids.length > 0) {
            const addonValues = add_on_ids.map((_: number, i: number) =>
                `($1, $${i + 2})`
            ).join(', ');
            await pool.query(
                `INSERT INTO subscription_add_ons (subscription_id, add_on_id) VALUES ${addonValues}`,
                [subscription_id, ...add_on_ids]
            );
        }

        res.status(201).json({ subscription_id });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Get user subscription info
router.get('/my-subscription', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const sub = await pool.query('SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user_id]);
        if (sub.rows.length === 0) return res.status(404).json({ message: 'No subscription found' });
        res.json(sub.rows[0]);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/subs/my-subscriptions
// Get all user subscriptions
router.get('/my-subscriptions', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const result = await pool.query(
            `SELECT id, plan_type, status, price, delivery_days, start_date, custom_schedule, created_at
             FROM subscriptions
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [user_id]
        );

        const subscriptions = result.rows.map((row) => ({
            id: row.id.toString(),
            planType: row.plan_type,
            status: row.status,
            price: parseFloat(row.price),
            deliveryDays: row.delivery_days,
            customSchedule: row.custom_schedule ? JSON.parse(row.custom_schedule) : null,
            startDate: row.start_date ? row.start_date.toISOString().split('T')[0] : null,
            createdAt: row.created_at.toISOString()
        }));

        res.json({
            subscriptions,
            total: subscriptions.length
        });
    } catch (err: any) {
        console.error('Get subscriptions error:', err);
        res.status(400).json({ error: err.message });
    }
});

// Pause specific subscription
router.post('/:subscriptionId/pause', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const subscription_id = req.params.subscriptionId;

        // Verify subscription belongs to user
        const verification = await pool.query(
            'SELECT id FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscription_id, user_id]
        );
        if (verification.rows.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        await pool.query(
            "UPDATE subscriptions SET status = 'paused' WHERE id = $1",
            [subscription_id]
        );
        res.json({ message: 'Subscription paused' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Resume specific subscription
router.post('/:subscriptionId/resume', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const subscription_id = req.params.subscriptionId;

        // Verify subscription belongs to user
        const verification = await pool.query(
            'SELECT id FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscription_id, user_id]
        );
        if (verification.rows.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        await pool.query(
            "UPDATE subscriptions SET status = 'active' WHERE id = $1",
            [subscription_id]
        );
        res.json({ message: 'Subscription resumed' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Cancel specific subscription
router.post('/:subscriptionId/cancel', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const subscription_id = req.params.subscriptionId;

        // Verify subscription belongs to user
        const verification = await pool.query(
            'SELECT id FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscription_id, user_id]
        );
        if (verification.rows.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        await pool.query(
            "UPDATE subscriptions SET status = 'cancelled' WHERE id = $1",
            [subscription_id]
        );
        res.json({ message: 'Subscription cancelled' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
