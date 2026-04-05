import express from 'express';
import crypto from 'crypto';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Helper: Create real Razorpay order via API
const createRazorpayOrder = async (amount: number): Promise<string> => {
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay credentials not configured');
    }

    try {
        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Convert to paise
                currency: 'INR',
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.description || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.id;
    } catch (error: any) {
        console.error('Razorpay order creation error:', error.message);
        throw new Error('Failed to create Razorpay order: ' + error.message);
    }
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

        // Create real Razorpay order
        let razorpayOrderId: string;
        try {
            razorpayOrderId = await createRazorpayOrder(total);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }

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
            // Skip subscription creation for guest users - they need to log in first
            if (!user_id) {
                return res.json({
                    success: true,
                    orderId: orderId.toString(),
                    status: 'paid',
                    isGuest: true,
                    message: 'Payment successful. Please create an account to activate your subscription.'
                });
            }

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

// POST /api/payments/webhook
// Razorpay webhook to handle payment completion notifications
router.post('/webhook', async (req, res) => {
    try {
        const { event, payload } = req.body;

        if (event === 'payment.authorized' || event === 'payment.captured') {
            const payment = payload.payment.entity;
            const order_id = payment.order_id;

            // Extract order ID from Razorpay order_id format
            const orderResult = await pool.query(
                'SELECT id FROM orders WHERE razorpay_order_id = $1',
                [order_id]
            );

            if (orderResult.rows.length > 0) {
                const orderId = orderResult.rows[0].id;

                // Update order with payment details
                await pool.query(
                    `UPDATE orders
                     SET status = $1,
                         razorpay_payment_id = $2,
                         razorpay_signature = $3,
                         paid_at = CURRENT_TIMESTAMP
                     WHERE id = $4`,
                    ['paid', payment.id, payment.signature || 'webhook_verified', orderId]
                );
            }
        }

        // Always return 200 to acknowledge webhook receipt
        res.json({ status: 'ok' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/payments/test
// Test Razorpay credentials and connection (dev only)
router.get('/test', async (req, res) => {
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res.status(400).json({
            error: 'Razorpay credentials not configured',
            hasKeyId: !!RAZORPAY_KEY_ID,
            hasKeySecret: !!RAZORPAY_KEY_SECRET
        });
    }

    try {
        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({
                error: 'Razorpay API error',
                status: response.status,
                details: error
            });
        }

        return res.json({
            success: true,
            message: 'Razorpay credentials are valid',
            keyIdPrefix: RAZORPAY_KEY_ID.substring(0, 15) + '...'
        });
    } catch (err: any) {
        return res.status(500).json({
            error: 'Connection test failed',
            message: err.message
        });
    }
});

export default router;
