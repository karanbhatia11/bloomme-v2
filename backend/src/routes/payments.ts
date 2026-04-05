import express from 'express';
import crypto from 'crypto';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Helper: Generate mock Razorpay Order ID (in production, call Razorpay API)
const generateRazorpayOrderId = (): string => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// POST /api/payments/create
// Create a payment order (Razorpay order) - supports both authenticated and guest users
router.post('/create', async (req, res) => {
    try {
        // Get user_id from auth token if authenticated, otherwise null for guest
        const user_id = (req as any).user?.id || null;
        const { planId, deliveryDays, addOns, promoCode, referralCode, customer, subtotal, tax, promoDiscount, referralDiscount, total } = req.body;

        // Validate required fields
        if (!total || total <= 0) {
            return res.status(400).json({ error: 'Invalid order amount' });
        }

        // Generate Razorpay Order ID (mock)
        const razorpayOrderId = generateRazorpayOrderId();

        // Create order record in DB
        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, razorpay_order_id, amount, currency, status, order_type, promo_code, promo_discount, referral_discount, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
             RETURNING id`,
            [
                user_id,
                razorpayOrderId,
                Math.round(total * 100), // Convert to paise for Razorpay
                'INR',
                'pending',
                planId ? 'subscription' : 'addon',
                promoCode || null,
                promoDiscount || 0,
                referralDiscount || 0
            ]
        );

        const orderId = orderResult.rows[0].id;

        // Store order items (addOns)
        if (Array.isArray(addOns) && addOns.length > 0) {
            for (const addon of addOns) {
                await pool.query(
                    `INSERT INTO order_items (order_id, item_type, item_id, quantity, price)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [orderId, 'addon', addon.id, addon.quantity || 1, addon.price || 0]
                );
            }
        }

        // If subscription, store subscription item
        if (planId) {
            await pool.query(
                `INSERT INTO order_items (order_id, item_type, item_id, quantity, price)
                 VALUES ($1, $2, $3, $4, $5)`,
                [orderId, 'subscription', planId, 1, subtotal || 0]
            );
        }

        res.status(201).json({
            orderId: orderId.toString(),
            razorpayOrderId,
            amount: Math.round(total * 100),
            currency: 'INR'
        });
    } catch (err: any) {
        console.error('Payment create error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/payments/verify
// Verify payment and mark order as paid - supports both authenticated and guest users
router.post('/verify', async (req, res) => {
    try {
        // Get user_id from auth token if authenticated, otherwise null for guest
        const user_id = (req as any).user?.id || null;
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        // Validate required fields
        if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ error: 'Missing payment verification fields' });
        }

        // Get order from DB
        const orderQuery = user_id
            ? 'SELECT * FROM orders WHERE id = $1 AND user_id = $2'
            : 'SELECT * FROM orders WHERE id = $1';
        const orderParams = user_id ? [orderId, user_id] : [orderId];

        const orderCheck = await pool.query(orderQuery, orderParams);

        if (orderCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderCheck.rows[0];

        // Verify Razorpay signature with secret key
        const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;
        if (!RAZORPAY_SECRET) {
            return res.status(500).json({ error: 'Razorpay secret key not configured' });
        }

        const message = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_SECRET)
            .update(message)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ error: 'Invalid payment signature - signature verification failed' });
        }
        // Mark order as paid
        await pool.query(
            "UPDATE orders SET status = $1, razorpay_payment_id = $2, razorpay_signature = $3, paid_at = CURRENT_TIMESTAMP WHERE id = $4",
            ['paid', razorpayPaymentId, razorpaySignature, orderId]
        );

        // If subscription, create subscription record
        if (order.order_type === 'subscription') {
            const items = await pool.query(
                'SELECT item_id FROM order_items WHERE order_id = $1 AND item_type = $2',
                [orderId, 'subscription']
            );

            if (items.rows.length > 0) {
                const planId = items.rows[0].item_id;
                // Get plan details to know the price
                const planResult = await pool.query(
                    'SELECT * FROM plans WHERE id = $1',
                    [planId]
                );

                if (planResult.rows.length > 0) {
                    const plan = planResult.rows[0];
                    // Create subscription
                    await pool.query(
                        `INSERT INTO subscriptions (user_id, plan_type, price, delivery_days, status, created_at)
                         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
                        [user_id, plan.name, plan.price, JSON.stringify([]), 'active']
                    );
                }
            }
        }

        res.json({
            success: true,
            orderId: orderId.toString(),
            status: 'paid'
        });
    } catch (err: any) {
        console.error('Payment verify error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
