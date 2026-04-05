import express from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';
import { generateForSubscription } from '../services/scheduler';

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
        const {
            plan_type,
            price,
            delivery_days,
            custom_schedule,
            add_on_ids,
            // New scheduling fields
            frequency = 'daily',
            start_date,
            end_date,
            skip_dates,
            pause_dates,
            // Addon scheduling config: array of { add_on_id, addon_type, addon_frequency, addon_delivery_days, addon_start_date, addon_end_date, one_off_date }
            addon_configs,
        } = req.body;
        const user_id = (req as any).user.id;

        const sub = await pool.query(
            `INSERT INTO subscriptions
               (user_id, plan_type, price, delivery_days, custom_schedule,
                frequency, start_date, end_date, skip_dates, pause_dates)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id, start_date`,
            [
                user_id,
                plan_type,
                price,
                typeof delivery_days === 'object'
                    ? JSON.stringify(delivery_days)
                    : (delivery_days ?? '[]'),
                custom_schedule ? JSON.stringify(custom_schedule) : null,
                frequency,
                start_date ?? new Date().toISOString().slice(0, 10),
                end_date ?? null,
                JSON.stringify(skip_dates ?? []),
                JSON.stringify(pause_dates ?? []),
            ]
        );

        const subscription_id: number = sub.rows[0].id;

        // Save selected add-ons
        if (Array.isArray(addon_configs) && addon_configs.length > 0) {
            // Use rich addon config objects
            for (const cfg of addon_configs) {
                await pool.query(
                    `INSERT INTO subscription_add_ons
                       (subscription_id, add_on_id, addon_type, addon_frequency,
                        addon_delivery_days, addon_custom_dates, addon_start_date, addon_end_date, one_off_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        subscription_id,
                        cfg.add_on_id,
                        cfg.addon_type ?? 'same_as_subscription',
                        cfg.addon_frequency ?? null,
                        cfg.addon_delivery_days ? JSON.stringify(cfg.addon_delivery_days) : null,
                        cfg.addon_custom_dates ? JSON.stringify(cfg.addon_custom_dates) : null,
                        cfg.addon_start_date ?? null,
                        cfg.addon_end_date ?? null,
                        cfg.one_off_date ?? null,
                    ]
                );
            }
        } else if (Array.isArray(add_on_ids) && add_on_ids.length > 0) {
            // Legacy: plain add_on_ids array — defaults to same_as_subscription
            for (const addonId of add_on_ids) {
                await pool.query(
                    `INSERT INTO subscription_add_ons (subscription_id, add_on_id) VALUES ($1, $2)`,
                    [subscription_id, addonId]
                );
            }
        }

        // Generate delivery schedule for next 30 days (non-blocking)
        const fromDate = sub.rows[0].start_date
            ? (sub.rows[0].start_date instanceof Date
                ? sub.rows[0].start_date.toISOString().slice(0, 10)
                : String(sub.rows[0].start_date).slice(0, 10))
            : new Date().toISOString().slice(0, 10);

        const toDate = new Date(fromDate);
        toDate.setUTCDate(toDate.getUTCDate() + 30);
        const toDateStr = toDate.toISOString().slice(0, 10);

        generateForSubscription(subscription_id, fromDate, toDateStr).catch((err) => {
            console.error(`[scheduler] Failed to generate deliveries for sub ${subscription_id}:`, err);
        });

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
// Get all user subscriptions with add-ons
router.get('/my-subscriptions', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const result = await pool.query(
            `SELECT id, plan_type, status, price, delivery_days, start_date, end_date, custom_schedule, created_at
             FROM subscriptions
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [user_id]
        );

        // Helper to format dates
        const formatDate = (date: any) => {
            if (!date) return null;
            if (typeof date === 'string') return date.split('T')[0];
            if (date instanceof Date) return date.toISOString().split('T')[0];
            return String(date).split('T')[0];
        };

        // Get add-ons for all subscriptions
        const subscriptions = await Promise.all(result.rows.map(async (row) => {
            // Safely parse JSON fields
            let customSchedule = null;
            if (row.custom_schedule) {
                try {
                    customSchedule = typeof row.custom_schedule === 'string'
                        ? JSON.parse(row.custom_schedule)
                        : row.custom_schedule;
                } catch (e) {
                    console.error('Failed to parse custom_schedule:', row.custom_schedule);
                    customSchedule = null;
                }
            }

            // Fetch add-ons for this subscription
            const addonsResult = await pool.query(
                `SELECT sa.id, a.name, a.price, sa.one_off_date
                 FROM subscription_add_ons sa
                 JOIN add_ons a ON a.id = sa.add_on_id
                 WHERE sa.subscription_id = $1`,
                [row.id]
            );

            const addOns = addonsResult.rows.map((addon) => ({
                id: addon.id.toString(),
                name: addon.name,
                price: parseFloat(addon.price),
                oneOffDate: formatDate(addon.one_off_date)
            }));

            const basePrice = parseFloat(row.price);
            const addOnsPrice = addOns.reduce((sum, addon) => sum + addon.price, 0);
            const totalPrice = basePrice + addOnsPrice;

            return {
                id: row.id.toString(),
                planType: row.plan_type,
                status: row.status,
                price: basePrice,
                addOnsPrice: addOnsPrice,
                totalPrice: totalPrice,
                addOns: addOns,
                deliveryDays: row.delivery_days,
                customSchedule: customSchedule,
                startDate: formatDate(row.start_date),
                endDate: formatDate(row.end_date),
                createdAt: formatDate(row.created_at)
            };
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
        const { startDate, endDate } = req.body;

        // Verify subscription belongs to user
        const verification = await pool.query(
            'SELECT pause_dates FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscription_id, user_id]
        );
        if (verification.rows.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Store pause date range
        const pauseInfo = {
            startDate: startDate || new Date().toISOString().split('T')[0],
            endDate: endDate || null,
            createdAt: new Date().toISOString()
        };

        await pool.query(
            "UPDATE subscriptions SET status = 'paused', pause_dates = $1 WHERE id = $2",
            [JSON.stringify(pauseInfo), subscription_id]
        );

        res.json({ message: 'Subscription paused', pauseInfo });
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

// Skip specific dates
router.post('/:subscriptionId/skip', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const subscription_id = req.params.subscriptionId;
        const { dates } = req.body; // Array of ISO date strings

        // Verify subscription belongs to user
        const verification = await pool.query(
            'SELECT skip_dates FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscription_id, user_id]
        );
        if (verification.rows.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Parse existing skip_dates and add new dates
        let skipDates: string[] = [];
        if (verification.rows[0].skip_dates) {
            try {
                skipDates = JSON.parse(verification.rows[0].skip_dates);
            } catch (e) {
                skipDates = [];
            }
        }

        // Merge with new dates (avoid duplicates)
        const mergedDates = Array.from(new Set([...skipDates, ...(dates || [])])).sort();

        await pool.query(
            'UPDATE subscriptions SET skip_dates = $1 WHERE id = $2',
            [JSON.stringify(mergedDates), subscription_id]
        );

        res.json({ message: 'Dates skipped', skippedDates: mergedDates });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Change delivery schedule
router.patch('/:subscriptionId/schedule', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const subscription_id = req.params.subscriptionId;
        const { frequency, deliveryDays } = req.body;

        // Verify subscription belongs to user
        const verification = await pool.query(
            'SELECT id FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscription_id, user_id]
        );
        if (verification.rows.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        await pool.query(
            'UPDATE subscriptions SET frequency = $1, delivery_days = $2 WHERE id = $3',
            [
                frequency || 'weekly',
                Array.isArray(deliveryDays) ? JSON.stringify(deliveryDays) : '[]',
                subscription_id
            ]
        );

        res.json({ message: 'Schedule updated', frequency, deliveryDays });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Change subscription plan
router.patch('/:subscriptionId/plan', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const subscription_id = req.params.subscriptionId;
        const { planType } = req.body;

        // Verify subscription belongs to user and get current info
        const verification = await pool.query(
            'SELECT id, price FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscription_id, user_id]
        );
        if (verification.rows.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Get new plan price
        const plans: Record<string, number> = { BASIC: 1499, PREMIUM: 2699, ELITE: 4499 };
        const newPrice = plans[planType] || plans.BASIC;

        await pool.query(
            'UPDATE subscriptions SET plan_type = $1, price = $2 WHERE id = $3',
            [planType, newPrice, subscription_id]
        );

        res.json({ message: 'Plan updated', planType, price: newPrice });
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
