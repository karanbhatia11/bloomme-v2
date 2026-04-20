import express from 'express';
import pool from '../db';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';

const router = express.Router();

// GET /api/addons/active
// Get user's active add-ons from subscriptions and standalone addon orders
router.get('/active', authenticateToken as any, requireEmailVerification as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        console.log('[Addons Active] Fetching for user:', user_id);

        // Get add-ons from subscriptions
        const subResult = await pool.query(
            `SELECT DISTINCT sao.add_on_id, ao.name, ao.price
             FROM subscription_add_ons sao
             JOIN add_ons ao ON sao.add_on_id = ao.id
             WHERE sao.subscription_id IN (
               SELECT id FROM subscriptions WHERE user_id = $1 AND status = 'active'
             )`,
            [user_id]
        );
        console.log('[Addons Active] From subscriptions:', subResult.rows);

        // Debug: Check all addon orders for this user
        const debugOrders = await pool.query(
            `SELECT id, order_type, status FROM orders WHERE user_id = $1 AND order_type = 'addon'`,
            [user_id]
        );
        console.log('[Addons Active] Debug - All addon orders:', debugOrders.rows);

        // Get add-ons from standalone addon orders (any status)
        const addonResult = await pool.query(
            `SELECT DISTINCT oi.item_id as add_on_id, ao.name, ao.price, o.status as order_status
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN add_ons ao ON oi.item_id = ao.id
             WHERE o.user_id = $1
             AND o.order_type = 'addon'
             AND oi.item_type = 'addon'`,
            [user_id]
        );
        console.log('[Addons Active] From addon orders (all statuses):', addonResult.rows);

        // Fetch latest delivery status per addon_name for this user's orders
        const statusResult = await pool.query(
            `SELECT DISTINCT ON (ads.addon_name) ads.addon_name, ads.status, ads.delivery_date
             FROM addon_delivery_status ads
             JOIN orders o ON ads.order_id = o.id
             WHERE o.user_id = $1
             ORDER BY ads.addon_name, ads.delivery_date DESC`,
            [user_id]
        );
        const statusMap = new Map(statusResult.rows.map((r: any) => [r.addon_name, { status: r.status, date: r.delivery_date }]));

        // Combine results, removing duplicates
        const addOnMap = new Map();

        [...subResult.rows, ...addonResult.rows].forEach((row) => {
            const key = row.add_on_id.toString();
            if (!addOnMap.has(key)) {
                const latestDelivery = statusMap.get(row.name) || null;
                addOnMap.set(key, {
                    id: key,
                    name: row.name,
                    price: parseFloat(row.price),
                    latestDeliveryStatus: latestDelivery?.status || null,
                    latestDeliveryDate: latestDelivery?.date || null,
                });
            }
        });

        const activeAddOns = Array.from(addOnMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        console.log('[Addons Active] Final result:', activeAddOns);

        res.json({ activeAddOns });
    } catch (err: any) {
        console.error('Get active add-ons error:', err);
        res.status(400).json({ error: err.message, activeAddOns: [] });
    }
});

// GET /api/addons/my-addons
// Get user's active add-ons
router.get('/my-addons', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;

        const result = await pool.query(
            `SELECT ua.id, ua.add_on_id, ua.quantity, ua.delivery_dates, ao.name, ao.price
             FROM user_add_ons ua
             JOIN add_ons ao ON ua.add_on_id = ao.id
             WHERE ua.user_id = $1 AND ua.status = 'active'
             ORDER BY ua.created_at DESC`,
            [user_id]
        );

        const addOns = result.rows.map((row) => ({
            id: row.add_on_id.toString(),
            name: row.name,
            quantity: row.quantity,
            price: parseFloat(row.price),
            totalPrice: parseFloat(row.price) * row.quantity,
            deliveryDates: row.delivery_dates ? JSON.parse(row.delivery_dates) : []
        }));

        res.json({ addOns });
    } catch (err: any) {
        console.error('Get add-ons error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/addons/create
// Create/order add-ons
router.post('/create', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const { addOns, dates, subtotal, tax, promoCode, promoDiscount, referralDiscount, total } = req.body;

        if (!Array.isArray(addOns) || addOns.length === 0) {
            return res.status(400).json({ error: 'No add-ons provided' });
        }

        // Create order record for add-ons
        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, amount, currency, status, order_type, promo_code, promo_discount, referral_discount, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
             RETURNING id`,
            [
                user_id,
                Math.round(total * 100),
                'INR',
                'pending',
                'addon',
                promoCode || null,
                promoDiscount || 0,
                referralDiscount || 0
            ]
        );

        const orderId = orderResult.rows[0].id;

        // Store order items
        for (const addon of addOns) {
            await pool.query(
                `INSERT INTO order_items (order_id, item_type, item_id, quantity, price)
                 VALUES ($1, $2, $3, $4, $5)`,
                [orderId, 'addon', addon.id, addon.quantity || 1, addon.price || 0]
            );
        }

        res.status(201).json({
            orderId: orderId.toString(),
            amount: Math.round(total * 100),
            currency: 'INR'
        });
    } catch (err: any) {
        console.error('Create add-ons order error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/addons/:addOnId/quantity
// Update add-on quantity
router.post('/:addOnId/quantity', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const add_on_id = req.params.addOnId;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        // Check if add-on exists and belongs to user
        const check = await pool.query(
            'SELECT id FROM user_add_ons WHERE user_id = $1 AND add_on_id = $2 AND status = $3',
            [user_id, add_on_id, 'active']
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Add-on not found' });
        }

        await pool.query(
            'UPDATE user_add_ons SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND add_on_id = $3',
            [quantity, user_id, add_on_id]
        );

        res.json({ success: true });
    } catch (err: any) {
        console.error('Update quantity error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/addons/:addOnId/delivery-dates
// Set delivery dates for add-on
router.post('/:addOnId/delivery-dates', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const add_on_id = req.params.addOnId;
        const { deliveryDates } = req.body;

        if (!Array.isArray(deliveryDates)) {
            return res.status(400).json({ error: 'Invalid delivery dates' });
        }

        // Check if add-on exists and belongs to user
        const check = await pool.query(
            'SELECT id FROM user_add_ons WHERE user_id = $1 AND add_on_id = $2 AND status = $3',
            [user_id, add_on_id, 'active']
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Add-on not found' });
        }

        await pool.query(
            'UPDATE user_add_ons SET delivery_dates = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND add_on_id = $3',
            [JSON.stringify(deliveryDates), user_id, add_on_id]
        );

        res.json({ success: true });
    } catch (err: any) {
        console.error('Update delivery dates error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/addons/:addOnId/remove
// Remove add-on
router.post('/:addOnId/remove', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const add_on_id = req.params.addOnId;

        // Check if add-on exists and belongs to user
        const check = await pool.query(
            'SELECT id FROM user_add_ons WHERE user_id = $1 AND add_on_id = $2 AND status = $3',
            [user_id, add_on_id, 'active']
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Add-on not found' });
        }

        await pool.query(
            "UPDATE user_add_ons SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND add_on_id = $3",
            ['removed', user_id, add_on_id]
        );

        res.json({ success: true });
    } catch (err: any) {
        console.error('Remove add-on error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
