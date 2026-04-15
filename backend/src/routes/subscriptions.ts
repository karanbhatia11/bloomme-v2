import express from 'express';
import pool from '../db';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
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
router.post('/subscribe', authenticateToken as any, requireEmailVerification as any, async (req, res) => {
    try {
        const {
            plan_id,
            price,
            delivery_days,
            custom_schedule,
            add_on_ids,
            // New scheduling fields
            frequency = 'daily',
            start_date,
            end_date,
            pause_start_date,
            pause_end_date,
            notes,
            address_id,
            // Addon scheduling config: array of { add_on_id, addon_type, addon_frequency, addon_delivery_days, addon_start_date, addon_end_date, one_off_date }
            addon_configs,
        } = req.body;
        const user_id = (req as any).user.id;

        // Get customer_id from user
        const userResult = await pool.query(
            'SELECT name, email, phone FROM users WHERE id = $1',
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Ensure customer record exists
        const customerResult = await pool.query(
            'SELECT id FROM customers WHERE email = $1 LIMIT 1',
            [userResult.rows[0].email]
        );

        let customerId;
        if (customerResult.rows.length > 0) {
            customerId = customerResult.rows[0].id;
        } else {
            const newCustomer = await pool.query(
                'INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING id',
                [userResult.rows[0].name, userResult.rows[0].phone, userResult.rows[0].email]
            );
            customerId = newCustomer.rows[0].id;
        }

        // Calculate end_date from custom_schedule if provided
        let calculatedEndDate = end_date ?? null;
        if (custom_schedule && Array.isArray(custom_schedule) && custom_schedule.length > 0) {
            calculatedEndDate = custom_schedule[custom_schedule.length - 1];
        }

        const sub = await pool.query(
            `INSERT INTO subscriptions
               (user_id, customer_id, plan_id, address_id, price, delivery_days, custom_schedule,
                start_date, end_date, pause_start_date, pause_end_date, notes, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
             RETURNING id, start_date`,
            [
                user_id,
                customerId,
                plan_id,
                address_id || null,
                price,
                typeof delivery_days === 'object'
                    ? JSON.stringify(delivery_days)
                    : (delivery_days ?? '[]'),
                custom_schedule ? JSON.stringify(custom_schedule) : null,
                start_date ?? (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
                calculatedEndDate,
                pause_start_date ?? null,
                pause_end_date ?? null,
                notes ?? null,
                'active'
            ]
        );

        const subscription_id: number = sub.rows[0].id;

        // Save delivery days - extract from custom_schedule if available, otherwise from delivery_days
        let daysToInsert: string[] = [];

        if (Array.isArray(custom_schedule) && custom_schedule.length > 0) {
            // Extract day of week from each date in custom_schedule
            const uniqueDays = new Set<string>();
            for (const dateStr of custom_schedule) {
                const date = new Date(dateStr + 'T00:00:00');
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                uniqueDays.add(dayOfWeek);
            }
            daysToInsert = Array.from(uniqueDays);
        } else if (Array.isArray(delivery_days) && delivery_days.length > 0) {
            // Fallback to delivery_days if custom_schedule not provided
            daysToInsert = delivery_days;
        }

        if (daysToInsert.length > 0) {
            for (const day of daysToInsert) {
                await pool.query(
                    `INSERT INTO subscription_days (subscription_id, day_of_week) VALUES ($1, $2)`,
                    [subscription_id, day]
                );
            }
        }

        // Save delivery dates from custom_schedule
        if (Array.isArray(custom_schedule) && custom_schedule.length > 0) {
            for (const dateStr of custom_schedule) {
                await pool.query(
                    `INSERT INTO subscription_delivery_dates (subscription_id, delivery_date) VALUES ($1, $2)
                     ON CONFLICT (subscription_id, delivery_date) DO NOTHING`,
                    [subscription_id, dateStr]
                );
            }
        }

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
                ? (() => { const d = sub.rows[0].start_date; return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()
                : String(sub.rows[0].start_date).slice(0, 10))
            : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

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
            `SELECT id, plan_type, status, price, delivery_days, start_date, custom_schedule, created_at
             FROM subscriptions
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [user_id]
        );

        // Helper to format dates — use local date components to avoid UTC timezone shift
        const formatDate = (date: any) => {
            if (!date) return null;
            if (typeof date === 'string') return date.split('T')[0];
            if (date instanceof Date) {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }
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

            // Fetch add-ons with delivery count and all delivery dates
            const addonsResult = await pool.query(
                `SELECT sa.id, a.name, a.price, sa.one_off_date,
                        COUNT(add_dates.delivery_date) AS delivery_count,
                        ARRAY_AGG(TO_CHAR(add_dates.delivery_date, 'YYYY-MM-DD') ORDER BY add_dates.delivery_date) FILTER (WHERE add_dates.delivery_date IS NOT NULL) AS delivery_dates
                 FROM subscription_add_ons sa
                 JOIN add_ons a ON a.id = sa.add_on_id
                 LEFT JOIN addon_delivery_dates add_dates ON add_dates.subscription_addon_id = sa.id
                 WHERE sa.subscription_id = $1
                 GROUP BY sa.id, a.name, a.price, sa.one_off_date`,
                [row.id]
            );

            const addOns = addonsResult.rows.map((addon) => {
                const deliveryCount = parseInt(addon.delivery_count) || 1;
                const deliveryDates: string[] = (addon.delivery_dates || []).filter(Boolean) as string[];
                return {
                    id: addon.id.toString(),
                    name: addon.name,
                    price: parseFloat(addon.price),
                    deliveryCount,
                    deliveryDates,
                    oneOffDate: formatDate(addon.one_off_date)
                };
            });

            const basePrice = parseFloat(row.price);
            const addOnsPrice = addOns.reduce((sum, addon) => sum + (addon.price * addon.deliveryCount), 0);
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
                endDate: null,
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

        const verification = await pool.query(
            'SELECT id, status FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscription_id, user_id]
        );
        if (verification.rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });
        if (verification.rows[0].status === 'paused') return res.status(400).json({ error: 'Already paused' });

        // 5 PM IST cutoff: determine effective pause date
        const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const hourIST = nowIST.getHours();
        const daysToAdd = hourIST >= 17 ? 2 : 1; // after 5 PM → day after tomorrow, before → tomorrow
        const effectiveDate = new Date(nowIST);
        effectiveDate.setDate(effectiveDate.getDate() + daysToAdd);
        const effectiveDateStr = `${effectiveDate.getFullYear()}-${String(effectiveDate.getMonth()+1).padStart(2,'0')}-${String(effectiveDate.getDate()).padStart(2,'0')}`;

        await pool.query(
            "UPDATE subscriptions SET status = 'paused' WHERE id = $1",
            [subscription_id]
        );

        res.json({ message: 'Subscription paused', effectiveFrom: effectiveDateStr });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Resume specific subscription
router.post('/:subscriptionId/resume', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const subscription_id = req.params.subscriptionId;

        const verification = await pool.query(
            'SELECT id, status FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscription_id, user_id]
        );
        if (verification.rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });

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
        const plans: Record<string, number> = { Traditional: 1770, Divine: 2670, Celestial: 5370 };
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
