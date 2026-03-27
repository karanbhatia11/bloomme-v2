import express from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/orders/history
// Get user's order history with pagination
router.get('/history', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const type = req.query.type as string; // 'subscription' or 'addon'

        const offset = (page - 1) * limit;

        // Build query based on type filter
        let query = 'SELECT * FROM orders WHERE user_id = $1';
        let countQuery = 'SELECT COUNT(*) FROM orders WHERE user_id = $1';
        const params: any[] = [user_id];

        if (type && (type === 'subscription' || type === 'addon')) {
            query += ' AND order_type = $2';
            countQuery += ' AND order_type = $2';
            params.push(type);
        }

        // Get total count
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated results
        const queryParams = [...params, limit, offset];
        const ordersResult = await pool.query(
            `${query} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            queryParams
        );

        // Enrich orders with items
        const enrichedOrders = await Promise.all(
            ordersResult.rows.map(async (order) => {
                const itemsResult = await pool.query(
                    'SELECT item_type, item_id, quantity, price FROM order_items WHERE order_id = $1',
                    [order.id]
                );

                const items: string[] = [];
                for (const item of itemsResult.rows) {
                    if (item.item_type === 'subscription') {
                        const planResult = await pool.query(
                            'SELECT name FROM plans WHERE id = $1',
                            [item.item_id]
                        );
                        if (planResult.rows.length > 0) {
                            items.push(planResult.rows[0].name);
                        }
                    } else if (item.item_type === 'addon') {
                        const addonResult = await pool.query(
                            'SELECT name FROM add_ons WHERE id = $1',
                            [item.item_id]
                        );
                        if (addonResult.rows.length > 0) {
                            items.push(`${addonResult.rows[0].name} (x${item.quantity})`);
                        }
                    }
                }

                return {
                    id: order.id.toString(),
                    type: order.order_type,
                    title: order.order_type === 'subscription' ? 'Subscription Order' : 'Add-ons Order',
                    items,
                    amount: order.amount / 100, // Convert from paise
                    status: order.status === 'paid' ? 'confirmed' : order.status,
                    orderDate: order.created_at.toISOString().split('T')[0],
                    deliveryDate: order.paid_at ? new Date(order.paid_at).toISOString().split('T')[0] : undefined
                };
            })
        );

        res.json({
            orders: enrichedOrders,
            hasMore: offset + limit < total,
            total
        });
    } catch (err: any) {
        console.error('Order history error:', err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/orders/:id
// Get single order detail
router.get('/:orderId', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const order_id = req.params.orderId;

        // Get order
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [order_id, user_id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query(
            'SELECT item_type, item_id, quantity, price FROM order_items WHERE order_id = $1',
            [order_id]
        );

        const items: any[] = [];
        for (const item of itemsResult.rows) {
            if (item.item_type === 'subscription') {
                const planResult = await pool.query(
                    'SELECT * FROM plans WHERE id = $1',
                    [item.item_id]
                );
                if (planResult.rows.length > 0) {
                    const plan = planResult.rows[0];
                    items.push({
                        type: 'subscription',
                        name: plan.name,
                        price: plan.price,
                        quantity: 1
                    });
                }
            } else if (item.item_type === 'addon') {
                const addonResult = await pool.query(
                    'SELECT * FROM add_ons WHERE id = $1',
                    [item.item_id]
                );
                if (addonResult.rows.length > 0) {
                    const addon = addonResult.rows[0];
                    items.push({
                        type: 'addon',
                        name: addon.name,
                        price: addon.price,
                        quantity: item.quantity
                    });
                }
            }
        }

        res.json({
            id: order.id.toString(),
            type: order.order_type,
            status: order.status,
            amount: order.amount / 100,
            currency: order.currency,
            items,
            promoCode: order.promo_code,
            promoDiscount: order.promo_discount,
            referralDiscount: order.referral_discount,
            razorpayOrderId: order.razorpay_order_id,
            razorpayPaymentId: order.razorpay_payment_id,
            createdAt: order.created_at,
            paidAt: order.paid_at
        });
    } catch (err: any) {
        console.error('Order detail error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
