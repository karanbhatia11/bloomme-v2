import express from 'express';
import pool from '../db';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { getBloomCreditsBalance } from './credits';

const router = express.Router();

// GET /api/dashboard/stats
// Get dashboard overview statistics for authenticated user
router.get('/stats', authenticateToken as any, requireEmailVerification as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;

        // Count active subscriptions
        const activeSubs = await pool.query(
            "SELECT COUNT(*) FROM subscriptions WHERE user_id = $1 AND status = 'active'",
            [user_id]
        );

        // Count upcoming deliveries (next 30 days)
        const upcomingDeliveries = await pool.query(
            `SELECT COUNT(*) FROM deliveries
             WHERE subscription_id IN (SELECT id FROM subscriptions WHERE user_id = $1)
             AND delivery_date >= CURRENT_DATE
             AND delivery_date <= CURRENT_DATE + INTERVAL '30 days'
             AND status != 'cancelled'`,
            [user_id]
        );

        // Sum orders from current month where status = 'paid'
        const monthlySpent = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total FROM orders
             WHERE user_id = $1
             AND status = 'paid'
             AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
             AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`,
            [user_id]
        );

        // Get referral balance (legacy) + bloom credits
        const userResult = await pool.query(
            'SELECT referral_points FROM users WHERE id = $1',
            [user_id]
        );
        const referralBalance = userResult.rows.length > 0 ? userResult.rows[0].referral_points : 0;
        const bloomCredits = await getBloomCreditsBalance(user_id);

        res.json({
            activeSubscriptions: parseInt(activeSubs.rows[0].count),
            upcomingDeliveries: parseInt(upcomingDeliveries.rows[0].count),
            totalSpentThisMonth: Math.round(parseInt(monthlySpent.rows[0].total) / 100),
            referralBalance,
            bloomCredits
        });
    } catch (err: any) {
        console.error('Dashboard stats error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
