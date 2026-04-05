import express from 'express';
import crypto from 'crypto';
import pool from '../db';
import { optionalAuth } from '../middleware/auth';

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
router.post('/create', optionalAuth as any, async (req, res) => {
    try {
        // Get user_id from auth token if authenticated, otherwise null for guest
        const user_id = (req as any).user?.id || null;
        const { planId, deliveryDays, addOns, promoCode, referralCode, customer, subtotal, tax, promoDiscount, referralDiscount, total, customSchedule } = req.body;

        console.log('Payment create request:', {
            planId,
            addOns,
            total,
            hasAddOns: Array.isArray(addOns) && addOns.length > 0,
            customer,
            customSchedule,
            customScheduleType: typeof customSchedule,
            customScheduleIsArray: Array.isArray(customSchedule),
        });

        // Validate required fields
        if (!total || total <= 0) {
            return res.status(400).json({ error: 'Invalid order amount' });
        }

        if (!customer || !customer.name || !customer.phone || !customer.email) {
            return res.status(400).json({ error: 'Customer details required' });
        }

        // Create real Razorpay order
        let razorpayOrderId: string;
        try {
            razorpayOrderId = await createRazorpayOrder(total);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }

        // Insert customer first
        const customerResult = await pool.query(
            `INSERT INTO customers (name, phone, email, time_slot, building_type)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
                customer.name,
                customer.phone,
                customer.email,
                customer.timeSlot || '5:30 to 6:30',
                customer.buildingType || 'house'
            ]
        );

        const customerId = customerResult.rows[0].id;

        // Insert guest address if provided
        if (customer.addressLine1 && customer.suburb && customer.postcode) {
            await pool.query(
                `INSERT INTO addresses (customer_id, address_line1, address_line2, suburb, postcode, delivery_notes, time_slot, building_type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    customerId,
                    customer.addressLine1,
                    customer.addressLine2 || null,
                    customer.suburb,
                    customer.postcode,
                    customer.deliveryNotes || null,
                    customer.timeSlot || '5:30 to 6:30',
                    customer.buildingType || 'house'
                ]
            );
        }

        // Create order record in DB
        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, customer_id, razorpay_order_id, amount, currency, status, order_type, promo_code, promo_discount, referral_discount, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
             RETURNING id`,
            [
                user_id,
                customerId,
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
                    `INSERT INTO order_items (order_id, item_type, item_id, quantity, price, schedule)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [orderId, 'addon', addon.id, addon.quantity || 1, Math.round((addon.price || 0) * 100), addon.schedule ? JSON.stringify(addon.schedule) : null]
                );
            }
        }

        // If subscription, store subscription item with schedule
        if (planId) {
            await pool.query(
                `INSERT INTO order_items (order_id, item_type, item_id, quantity, price, schedule)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [orderId, 'subscription', planId, 1, subtotal || 0, customSchedule ? JSON.stringify(customSchedule) : null]
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
router.post('/verify', optionalAuth as any, async (req, res) => {
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

        // Verify Razorpay signature with secret key (skip in development)
        if (process.env.NODE_ENV !== 'development') {
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
        }
        // Mark order as paid
        await pool.query(
            "UPDATE orders SET status = $1, razorpay_payment_id = $2, razorpay_signature = $3, paid_at = CURRENT_TIMESTAMP WHERE id = $4",
            ['paid', razorpayPaymentId, razorpaySignature, orderId]
        );

        // If subscription, create subscription record (for both authenticated and guest users)
        if (order.order_type === 'subscription') {
            const items = await pool.query(
                'SELECT item_id, schedule FROM order_items WHERE order_id = $1 AND item_type = $2',
                [orderId, 'subscription']
            );

            if (items.rows.length > 0) {
                const planId = items.rows[0].item_id;
                const schedule = items.rows[0].schedule;

                // Get plan details
                const planResult = await pool.query(
                    'SELECT price FROM plans WHERE id = $1',
                    [planId]
                );

                if (planResult.rows.length > 0) {
                    const plan = planResult.rows[0];
                    // Get customer_id from order
                    const customerResult = await pool.query(
                        'SELECT customer_id FROM orders WHERE id = $1',
                        [orderId]
                    );

                    const customerId = customerResult.rows[0]?.customer_id;

                    // Calculate end_date from schedule (last date in the schedule)
                    let endDate = null;
                    if (schedule) {
                        try {
                            // Handle both string and already-parsed array
                            let scheduleArray = schedule;
                            if (typeof schedule === 'string') {
                                scheduleArray = JSON.parse(schedule);
                            }

                            if (Array.isArray(scheduleArray) && scheduleArray.length > 0) {
                                // Get last date from schedule array
                                const lastDate = scheduleArray[scheduleArray.length - 1];
                                if (lastDate) {
                                    endDate = lastDate;
                                }
                            }
                            console.log('End date calculated:', endDate, 'from schedule length:', Array.isArray(scheduleArray) ? scheduleArray.length : 0);
                        } catch (e) {
                            console.log('Could not parse schedule:', e);
                        }
                    }

                    // Create subscription with new schema (works for both authenticated and guest users)
                    // user_id will be NULL for guests, user_id populated for authenticated users
                    // Ensure schedule is properly stringified for JSONB column
                    const scheduleForDb = schedule ? (typeof schedule === 'string' ? schedule : JSON.stringify(schedule)) : null;

                    const subResult = await pool.query(
                        `INSERT INTO subscriptions (user_id, customer_id, plan_id, price, delivery_days, status, start_date, end_date, custom_schedule, created_at)
                         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, CURRENT_TIMESTAMP)
                         RETURNING id`,
                        [user_id, customerId, planId, plan.price, JSON.stringify([]), 'active', endDate, scheduleForDb]
                    );

                    const subscriptionId = subResult.rows[0].id;

                    // Parse and insert delivery days and dates from schedule
                    if (schedule) {
                        try {
                            const scheduleArray = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
                            if (Array.isArray(scheduleArray) && scheduleArray.length > 0) {
                                const uniqueDays = new Set<string>();

                                // Extract day of week from each date and insert delivery dates
                                for (const dateStr of scheduleArray) {
                                    const date = new Date(dateStr + 'T00:00:00');
                                    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                                    uniqueDays.add(dayOfWeek);

                                    // Insert delivery date
                                    await pool.query(
                                        `INSERT INTO subscription_delivery_dates (subscription_id, delivery_date) VALUES ($1, $2)
                                         ON CONFLICT (subscription_id, delivery_date) DO NOTHING`,
                                        [subscriptionId, dateStr]
                                    );
                                }

                                // Insert unique days of week
                                for (const dayOfWeek of uniqueDays) {
                                    await pool.query(
                                        `INSERT INTO subscription_days (subscription_id, day_of_week) VALUES ($1, $2)`,
                                        [subscriptionId, dayOfWeek]
                                    );
                                }
                            }
                        } catch (e) {
                            console.log('Could not parse schedule for subscription_days:', e);
                        }
                    }

                    // Handle addons
                    const addonItems = await pool.query(
                        'SELECT id, item_id, quantity, price, schedule FROM order_items WHERE order_id = $1 AND item_type = $2',
                        [orderId, 'addon']
                    );

                    if (addonItems.rows.length > 0) {
                        for (const addonItem of addonItems.rows) {
                            // Insert into subscription_add_ons
                            const subAddonResult = await pool.query(
                                `INSERT INTO subscription_add_ons (subscription_id, add_on_id) VALUES ($1, $2) RETURNING id`,
                                [subscriptionId, addonItem.item_id]
                            );

                            const subAddonId = subAddonResult.rows[0].id;

                            // Parse and insert addon delivery dates
                            if (addonItem.schedule) {
                                try {
                                    let addonSchedule = addonItem.schedule;
                                    if (typeof addonSchedule === 'string') {
                                        addonSchedule = JSON.parse(addonSchedule);
                                    }

                                    console.log('Processing addon schedule for addon_id:', addonItem.item_id, 'mode:', addonSchedule.mode);

                                    // Handle different schedule types
                                    let addonDates: string[] = [];

                                    if (addonSchedule.mode === 'different' && addonSchedule.customDates) {
                                        // Custom dates for addon
                                        addonDates = addonSchedule.customDates;
                                        console.log('Different mode - custom dates:', addonDates);
                                    } else if (addonSchedule.mode === 'same') {
                                        // Use subscription dates
                                        let subscriptionDates = schedule;
                                        if (typeof subscriptionDates === 'string') {
                                            subscriptionDates = JSON.parse(subscriptionDates);
                                        }
                                        if (Array.isArray(subscriptionDates)) {
                                            addonDates = subscriptionDates;
                                        }
                                        console.log('Same mode - using subscription dates:', addonDates.length, 'dates');
                                    }

                                    // Insert addon delivery dates
                                    console.log('Inserting', addonDates.length, 'addon delivery dates for addon_id:', addonItem.item_id);
                                    for (const dateStr of addonDates) {
                                        await pool.query(
                                            `INSERT INTO addon_delivery_dates (subscription_addon_id, delivery_date) VALUES ($1, $2)
                                             ON CONFLICT (subscription_addon_id, delivery_date) DO NOTHING`,
                                            [subAddonId, dateStr]
                                        );
                                    }
                                    console.log('Inserted addon dates for addon_id:', addonItem.item_id);
                                } catch (e) {
                                    console.log('Could not parse addon schedule:', e);
                                }
                            }
                        }
                    }

                    // If guest, notify them about creating account
                    if (!user_id) {
                        console.log(`Guest subscription created for customer_id ${customerId}. They can link it by creating an account. End date: ${endDate}`);
                    }
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

// POST /api/payments/test-signature-failure
// Test signature verification failure (dev/local only)
router.post('/test-signature-failure', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ error: 'This endpoint is only available in development' });
    }

    return res.status(400).json({ error: 'Invalid payment signature - signature verification failed' });
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
