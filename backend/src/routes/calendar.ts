import express from 'express';
import pool from '../db';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';

const router = express.Router();

// GET /api/calendar/my-deliveries
// Get user's deliveries for a specific month
router.get('/my-deliveries', authenticateToken as any, requireEmailVerification as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        const monthNum = parseInt(month as string);
        const yearNum = parseInt(year as string);

        if (monthNum < 1 || monthNum > 12 || yearNum < 2000) {
            return res.status(400).json({ error: 'Invalid month or year' });
        }

        // Get deliveries for the month
        const result = await pool.query(
            `SELECT d.id, d.delivery_date, d.status, s.plan_type, s.price
             FROM deliveries d
             JOIN subscriptions s ON d.subscription_id = s.id
             WHERE s.user_id = $1
             AND EXTRACT(MONTH FROM d.delivery_date) = $2
             AND EXTRACT(YEAR FROM d.delivery_date) = $3
             ORDER BY d.delivery_date ASC`,
            [user_id, monthNum, yearNum]
        );

        // Group deliveries by date
        const deliveriesByDate: { [key: string]: any } = {};
        result.rows.forEach((row) => {
            const _d = row.delivery_date instanceof Date ? row.delivery_date : new Date(row.delivery_date);
            const dateStr = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`;
            if (!deliveriesByDate[dateStr]) {
                deliveriesByDate[dateStr] = {
                    date: dateStr,
                    items: [],
                    status: 'pending'
                };
            }
            deliveriesByDate[dateStr].items.push({
                id: row.id,
                plan: row.plan_type,
                price: parseFloat(row.price)
            });
            // Update status to delivered if any item is delivered
            if (row.status === 'delivered') {
                deliveriesByDate[dateStr].status = 'delivered';
            }
        });

        // Convert to array
        const deliveries = Object.values(deliveriesByDate);

        res.json({
            deliveries,
            month: monthNum,
            year: yearNum,
            total: deliveries.length
        });
    } catch (err: any) {
        console.error('Get deliveries error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
