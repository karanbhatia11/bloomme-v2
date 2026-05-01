import express from 'express';
import crypto from 'crypto';
import pool from '../db';
import { optionalAuth } from '../middleware/auth';
import { awardCredits } from './credits';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail, OrderConfirmationData } from '../utils/email';

const router = express.Router();

const formatOrderId = (id: number): string => `BLM-${String(id).padStart(6, '0')}`;

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

        // Create Razorpay order (skip if keys not configured)
        let razorpayOrderId: string;
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            razorpayOrderId = `rzp_dev_${Date.now()}`;
        } else {
            try {
                razorpayOrderId = await createRazorpayOrder(total);
            } catch (err: any) {
                return res.status(400).json({ error: err.message });
            }
        }

        // Upsert customer: if a customer with this email already exists, update and reuse;
        // otherwise insert new. Always stamp user_id if authenticated.
        const customerResult = await pool.query(
            `INSERT INTO customers (name, phone, email, time_slot, building_type, user_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (email) DO UPDATE
               SET name        = EXCLUDED.name,
                   phone       = EXCLUDED.phone,
                   time_slot   = EXCLUDED.time_slot,
                   building_type = EXCLUDED.building_type,
                   user_id     = COALESCE(customers.user_id, EXCLUDED.user_id)
             RETURNING id, user_id`,
            [
                customer.name,
                customer.phone,
                customer.email,
                customer.timeSlot || '5:30 to 6:30',
                customer.buildingType || 'house',
                user_id || null,
            ]
        );

        const customerId = customerResult.rows[0].id;
        // If the customer record already had a user_id (existing user checking out as guest), use it
        const effectiveUserId = customerResult.rows[0].user_id || user_id;

        // Insert address linked to customer record and capture its ID
        let addressId: number | null = null;
        if (customer.addressLine1 && customer.suburb && customer.postcode) {
            const addrResult = await pool.query(
                `INSERT INTO addresses (customer_id, address_line1, address_line2, suburb, postcode, delivery_notes, time_slot, building_type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING id`,
                [
                    customerId,
                    customer.addressLine1,
                    customer.addressLine2 || null,
                    customer.suburb,
                    customer.postcode,
                    customer.deliveryNotes || null,
                    customer.timeSlot || '5:30 to 6:30',
                    customer.buildingType || 'house',
                ]
            );
            addressId = addrResult.rows[0].id;
        }

        // Create order record in DB
        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, customer_id, address_id, razorpay_order_id, amount, currency, status, order_type, promo_code, promo_discount, referral_discount, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
             RETURNING id`,
            [
                effectiveUserId,
                customerId,
                addressId,
                razorpayOrderId,
                Math.round(total * 100),
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
                // Extract dates for custom_schedule_dates
                let addonDates: string[] = [];
                if (addon.schedule) {
                    if (addon.schedule.mode === 'different' && Array.isArray(addon.schedule.customDates)) {
                        addonDates = addon.schedule.customDates;
                    } else if (addon.schedule.mode === 'same' && Array.isArray(customSchedule)) {
                        addonDates = customSchedule;
                    }
                }

                const addonCustomDates = addonDates.length > 0
                    ? `ARRAY[${addonDates.map(d => `'${d}'::DATE`).join(', ')}]`
                    : 'NULL';

                await pool.query(
                    `INSERT INTO order_items (order_id, item_type, item_id, quantity, price, schedule, custom_schedule_dates)
                     VALUES ($1, $2, $3, $4, $5, $6, ${addonCustomDates})`,
                    [orderId, 'addon', addon.id, addon.quantity || 1, Math.round((addon.price || 0) * 100), addon.schedule ? JSON.stringify(addon.schedule) : null]
                );
            }
        }

        // If subscription, store subscription item with schedule
        if (planId) {
            const subCustomDates = Array.isArray(customSchedule) && customSchedule.length > 0
                ? `ARRAY[${customSchedule.map(d => `'${d}'::DATE`).join(', ')}]`
                : 'NULL';

            // Store subscription price in paise
            // subtotal = plan price only (addons are separate)
            const subscriptionPricePaise = Math.round((subtotal || 0) * 100);

            await pool.query(
                `INSERT INTO order_items (order_id, item_type, item_id, quantity, price, schedule, custom_schedule_dates)
                 VALUES ($1, $2, $3, $4, $5, $6, ${subCustomDates})`,
                [orderId, 'subscription', planId, 1, subscriptionPricePaise, customSchedule ? JSON.stringify(customSchedule) : null]
            );
        }

        res.status(201).json({
            orderId: orderId.toString(),
            bloommeOrderId: formatOrderId(orderId),
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

        // Verify Razorpay signature with secret key
        if (process.env.RAZORPAY_KEY_SECRET) {
            const message = razorpayOrderId + '|' + razorpayPaymentId;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
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

        // Award Bloom Credits: 1 credit per ₹2 spent (5%), only for logged-in users
        if (user_id) {
            const amountRupees = order.amount / 100;
            const creditsEarned = Math.ceil(amountRupees / 10);
            if (creditsEarned > 0) {
                await awardCredits(
                    user_id,
                    creditsEarned,
                    'earn_purchase',
                    `Earned ${creditsEarned} credits on ₹${amountRupees} order`,
                    parseInt(orderId)
                );
                console.log(`Awarded ${creditsEarned} Bloom Credits to user ${user_id} for order ${orderId}`);
            }

            // Award referral credits if this is user's first order
            const previousOrders = await pool.query(
                `SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status = 'paid' AND id != $2`,
                [user_id, orderId]
            );
            if (parseInt(previousOrders.rows[0].count) === 0) {
                // This is first order — check if user was referred
                const referral = await pool.query(
                    `SELECT r.id, r.referrer_id FROM referrals r
                     WHERE r.referred_user_id = $1 AND r.status = 'pending'`,
                    [user_id]
                );
                if (referral.rows.length > 0) {
                    const { id: referralId, referrer_id } = referral.rows[0];
                    // Award 500 credits to referrer
                    await awardCredits(referrer_id, 500, 'earn_referral_given',
                        'Referral reward: your friend placed their first order', parseInt(orderId));
                    // Award 300 credits to the referred user (this user)
                    await awardCredits(user_id, 300, 'earn_referral_received',
                        'Welcome reward: 300 Bloom Credits for joining via referral', parseInt(orderId));
                    // Mark referral as completed
                    await pool.query(
                        `UPDATE referrals SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`,
                        [referralId]
                    );
                    console.log(`Referral credits awarded: 500 to user ${referrer_id}, 300 to user ${user_id}`);
                }
            }
        }

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
                    'SELECT name, price FROM plans WHERE id = $1',
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

                    // Auto-link: Check if customer email belongs to an existing registered user
                    let resolvedUserId = user_id; // Start with authenticated user_id (may be null for guests)
                    if (!resolvedUserId && customerId) {
                        // Guest checkout: look up customer email and check if user exists
                        const customerEmailResult = await pool.query(
                            'SELECT email FROM customers WHERE id = $1',
                            [customerId]
                        );
                        if (customerEmailResult.rows.length > 0) {
                            const customerEmail = customerEmailResult.rows[0].email;
                            const existingUserResult = await pool.query(
                                'SELECT id FROM users WHERE email = $1',
                                [customerEmail]
                            );
                            if (existingUserResult.rows.length > 0) {
                                resolvedUserId = existingUserResult.rows[0].id;
                                // Also update the order record so it shows up in their dashboard
                                await pool.query('UPDATE orders SET user_id = $1 WHERE id = $2', [resolvedUserId, orderId]);
                                console.log(`Auto-linked guest order + subscription to user ${resolvedUserId} (email: ${customerEmail})`);
                            }
                        }
                    }

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
                        `INSERT INTO subscriptions (user_id, plan_type, price, delivery_days, status, start_date, custom_schedule, address_id, created_at)
                         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, CURRENT_TIMESTAMP)
                         RETURNING id`,
                        [resolvedUserId, plan.name, plan.price, JSON.stringify([]), 'active', scheduleForDb, addressId]
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
                                `INSERT INTO subscription_add_ons (subscription_id, add_on_id, quantity) VALUES ($1, $2, $3) RETURNING id`,
                                [subscriptionId, addonItem.item_id, addonItem.quantity || 1]
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

        // Send order confirmation email (non-blocking)
        try {
            const customerResult = await pool.query(
                'SELECT name, email, phone, time_slot FROM customers WHERE id = $1',
                [order.customer_id]
            );
            const customer = customerResult.rows[0];

            if (customer?.email) {
                const addrResult = await pool.query(
                    `SELECT a.address_line1, a.address_line2, a.suburb, a.postcode
                     FROM addresses a
                     JOIN customers c ON c.id = a.customer_id
                     WHERE c.id = $1 ORDER BY a.id DESC LIMIT 1`,
                    [order.customer_id || -1]
                );
                const addr = addrResult.rows[0];
                const addressStr = addr
                    ? [addr.address_line1, addr.address_line2, addr.suburb, addr.postcode].filter(Boolean).join(', ')
                    : undefined;

                // Fetch order items for email
                const itemsResult = await pool.query(
                    `SELECT oi.item_type, oi.item_id, oi.quantity, oi.price, oi.schedule,
                            p.name as plan_name, a.name as addon_name
                     FROM order_items oi
                     LEFT JOIN plans p ON oi.item_type = 'subscription' AND p.id = oi.item_id
                     LEFT JOIN add_ons a ON oi.item_type = 'addon' AND a.id = oi.item_id
                     WHERE oi.order_id = $1`,
                    [orderId]
                );

                const planItem = itemsResult.rows.find((r: any) => r.item_type === 'subscription');
                const addonItems = itemsResult.rows.filter((r: any) => r.item_type === 'addon');
                const amountRupees = order.amount / 100;
                const creditsEarned = Math.ceil(amountRupees / 10);

                let planSchedule: string[] = [];
                if (planItem?.schedule) {
                    try {
                        planSchedule = typeof planItem.schedule === 'string'
                            ? JSON.parse(planItem.schedule) : planItem.schedule;
                    } catch {}
                }

                const emailData: OrderConfirmationData = {
                    bloommeOrderId: formatOrderId(parseInt(orderId)),
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                    customerAddress: addressStr,
                    timeSlot: customer.time_slot || '5:30 AM – 7:30 AM',
                    razorpayPaymentId: razorpayPaymentId,
                    planName: planItem?.plan_name,
                    planDeliveries: planSchedule.length || undefined,
                    planPrice: planItem ? Math.round(planItem.price / 100) : undefined,
                    planStartDate: planSchedule[0] || undefined,
                    planEndDate: planSchedule[planSchedule.length - 1] || undefined,
                    addons: addonItems.map((a: any) => {
                        let sched: any = {};
                        try { sched = typeof a.schedule === 'string' ? JSON.parse(a.schedule) : (a.schedule || {}); } catch {}
                        const dates = sched.mode === 'different' ? (sched.customDates || []) : planSchedule;
                        return {
                            name: a.addon_name,
                            deliveries: dates.length || a.quantity,
                            price: Math.round(a.price / 100),
                            customDates: sched.mode === 'different' ? dates : [],
                        };
                    }),
                    total: amountRupees,
                    creditsEarned,
                };

                sendOrderConfirmationEmail(emailData); // fire and forget

                // Admin notification
                const addonSchedules = addonItems.map((a: any) => {
                    let sched: any = {};
                    try { sched = typeof a.schedule === 'string' ? JSON.parse(a.schedule) : (a.schedule || {}); } catch {}
                    const dates = sched.mode === 'different' ? (sched.customDates || []) : planSchedule;
                    return { name: a.addon_name, dates };
                });
                let isNewUser = false;
                if (user_id) {
                    const firstOrderCheck = await pool.query(
                        `SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status = 'paid' AND id != $2`,
                        [user_id, orderId]
                    );
                    isNewUser = parseInt(firstOrderCheck.rows[0].count) === 0;
                }
                sendAdminNewOrderEmail({
                    ...emailData,
                    orderId: parseInt(orderId),
                    paidAt: new Date().toISOString(),
                    isNewUser,
                    planScheduleDates: planSchedule,
                    addonSchedules,
                }); // fire and forget
            }
        } catch (emailErr) {
            console.error('Failed to send confirmation email:', emailErr);
        }

        res.json({
            success: true,
            orderId: orderId.toString(),
            bloommeOrderId: formatOrderId(parseInt(orderId)),
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

export default router;
