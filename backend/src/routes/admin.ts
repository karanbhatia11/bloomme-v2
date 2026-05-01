import express from 'express';
import pool from '../db';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Optional: Middleware to protect all admin routes
// For development/testing, these can be commented out
// Uncomment in production to require authentication
// router.use(authenticateToken);
// router.use(authorizeAdmin);

// --- STATS ---
router.get('/stats', async (req, res) => {
    try {
        const userCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'user\'');
        const subCount = await pool.query('SELECT COUNT(*) FROM subscriptions');
        const activeSubs = await pool.query('SELECT COUNT(*) FROM subscriptions WHERE status = \'active\'');

        const planStats = await pool.query(`
            SELECT plan_type as plan_name, COUNT(*) as count
            FROM subscriptions
            GROUP BY plan_type
            ORDER BY COUNT(*) DESC
        `);

        // Today's deliveries (subscriptions + addon-only orders)
        const todaysDeliveries = await pool.query(`
            SELECT COUNT(*) as count FROM (
                SELECT id FROM subscription_delivery_dates WHERE delivery_date = CURRENT_DATE
                UNION ALL
                SELECT id FROM orders WHERE delivery_date = CURRENT_DATE AND status != 'failed'
            ) AS today_deliveries
        `);

        // Delivered today count
        const deliveredToday = await pool.query(`
            SELECT COUNT(*) as count FROM deliveries
            WHERE delivery_date = CURRENT_DATE AND status = 'delivered'
        `);

        // Today's revenue (orders paid today)
        const revenueToday = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total FROM orders
            WHERE DATE(paid_at) = CURRENT_DATE AND status = 'paid'
        `);

        res.json({
            total_users: parseInt(userCount.rows[0].count),
            total_subscriptions: parseInt(subCount.rows[0].count),
            active_subscriptions: parseInt(activeSubs.rows[0].count),
            plan_breakdown: planStats.rows,
            todays_deliveries: parseInt(todaysDeliveries.rows[0].count),
            delivered_today: parseInt(deliveredToday.rows[0].count),
            revenue_today: parseInt(revenueToday.rows[0].total)
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- USERS ---
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- SUBSCRIPTIONS ---
router.get('/subscriptions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                s.id,
                s.user_id,
                s.plan_type,
                s.status,
                s.price,
                s.start_date,
                s.created_at,
                u.name as user_name,
                u.email as user_email,
                u.phone as user_phone,
                (SELECT suburb FROM addresses a JOIN customers c ON a.customer_id = c.id WHERE c.user_id = s.user_id LIMIT 1) as city,
                (SELECT postcode FROM addresses a JOIN customers c ON a.customer_id = c.id WHERE c.user_id = s.user_id LIMIT 1) as pin_code,
                (SELECT COUNT(*) FROM subscription_delivery_dates WHERE subscription_id = s.id) as delivery_count
            FROM subscriptions s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- SUBSCRIPTION DETAILS (with delivery dates and addons) ---
router.get('/subscriptions/:id/details', async (req, res) => {
    try {
        const { id } = req.params;

        // Subscription main info with user details and full address
        const subResult = await pool.query(`
            SELECT
                s.*,
                u.name as user_name,
                u.email as user_email,
                u.phone as user_phone,
                cust.name as full_name,
                a.address_line1 as house_number,
                NULL::text as street,
                a.address_line2 as area,
                a.suburb as city,
                a.postcode as pin_code,
                a.delivery_notes as instructions,
                p.name as plan_name,
                COALESCE(p.price, s.price) as plan_price,
                cust.time_slot
            FROM subscriptions s
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN plans p ON p.name = s.plan_type
            LEFT JOIN customers cust ON cust.user_id = s.user_id
            LEFT JOIN addresses a ON a.customer_id = cust.id
            WHERE s.id = $1
            LIMIT 1
        `, [id]);

        // Delivery dates
        const deliveryDatesResult = await pool.query(`
            SELECT
                ROW_NUMBER() OVER (ORDER BY delivery_date) as sequence,
                id,
                subscription_id,
                delivery_date,
                'pending' as status
            FROM subscription_delivery_dates
            WHERE subscription_id = $1
            ORDER BY delivery_date
        `, [id]);

        // Add-ons with details
        const addonsResult = await pool.query(`
            SELECT
                sa.id,
                sa.subscription_id,
                ao.name as addon_name,
                ao.price,
                COUNT(add.id) as quantity_per_delivery
            FROM subscription_add_ons sa
            LEFT JOIN add_ons ao ON sa.add_on_id = ao.id
            LEFT JOIN addon_delivery_dates add ON sa.id = add.subscription_addon_id
            WHERE sa.subscription_id = $1
            GROUP BY sa.id, ao.id
        `, [id]);

        // Add-on delivery dates
        const addonDeliveryDatesResult = await pool.query(`
            SELECT
                add.id,
                add.subscription_addon_id,
                sa.subscription_id,
                ao.name as addon_name,
                add.delivery_date,
                COUNT(*) as quantity
            FROM addon_delivery_dates add
            LEFT JOIN subscription_add_ons sa ON add.subscription_addon_id = sa.id
            LEFT JOIN add_ons ao ON sa.add_on_id = ao.id
            WHERE sa.subscription_id = $1
            GROUP BY add.id, add.subscription_addon_id, sa.subscription_id, ao.id, add.delivery_date
            ORDER BY add.delivery_date
        `, [id]);

        // Order and payment info — find the subscription order specifically
        const orderResult = await pool.query(`
            SELECT
                o.id,
                'BLM-' || LPAD(o.id::text, 6, '0') AS bloomme_order_id,
                o.razorpay_order_id,
                o.razorpay_payment_id,
                o.amount,
                o.currency,
                o.status,
                o.order_type,
                o.promo_code,
                o.promo_discount,
                o.referral_discount,
                o.created_at,
                o.paid_at
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id AND oi.item_type = 'subscription'
            WHERE o.user_id = $1 AND o.status = 'paid'
            ORDER BY o.created_at DESC
            LIMIT 1
        `, [subResult.rows[0].user_id]);

        res.json({
            subscription: subResult.rows[0],
            delivery_dates: deliveryDatesResult.rows,
            addons: addonsResult.rows,
            addon_delivery_dates: addonDeliveryDatesResult.rows,
            order: orderResult.rows[0] || null
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- CATEGORIES ---
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const { name, image_url, description } = req.body;
        const result = await pool.query(
            'INSERT INTO categories (name, image_url, description) VALUES ($1, $2, $3) RETURNING *',
            [name, image_url, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- PRODUCTS ---
router.get('/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, s.name as subcategory_name 
            FROM products p 
            LEFT JOIN subcategories s ON p.subcategory_id = s.id 
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/products', async (req, res) => {
    try {
        const { subcategory_id, name, description, price, image_url } = req.body;
        const result = await pool.query(
            'INSERT INTO products (subcategory_id, name, description, price, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [subcategory_id, name, description, price, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- PLANS ---
router.get('/plans', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM plans ORDER BY price ASC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/plans', async (req, res) => {
    try {
        const { name, tagline, price, image_url, features, is_popular, is_active } = req.body;
        const result = await pool.query(
            'INSERT INTO plans (name, tagline, price, image_url, features, is_popular, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, tagline, price, image_url, JSON.stringify(features || []), is_popular || false, is_active !== false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, tagline, price, image_url, features, is_popular, is_active } = req.body;
        const result = await pool.query(
            'UPDATE plans SET name = $1, tagline = $2, price = $3, image_url = $4, features = $5, is_popular = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
            [name, tagline, price, image_url, JSON.stringify(features || []), is_popular || false, is_active !== false, id]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/plans/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM plans WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- CONFIG ---
router.post('/config/site-mode', async (req, res) => {
    try {
        const { mode } = req.body; // none, coming_soon, maintenance
        await pool.query(
            "INSERT INTO app_config (key, value) VALUES ('site_mode', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
            [JSON.stringify({ mode })]
        );
        res.json({ success: true, mode });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- PAGE CONTENT (NEW) ---
// IMPORTANT: More specific routes must come BEFORE general routes
router.get('/page-content/list/pages', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT DISTINCT page_name FROM page_content ORDER BY page_name ASC'
        );
        res.json(result.rows.map((r: any) => r.page_name));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/page-content', async (req, res) => {
    try {
        const page = req.query.page as string || 'home';
        const result = await pool.query(
            'SELECT * FROM page_content WHERE page_name = $1 ORDER BY section_name, display_order ASC',
            [page]
        );
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/page-content', async (req, res) => {
    try {
        const { page_name, section_name, title, subtitle, description, image_url, cta_text, cta_link, display_order } = req.body;
        const result = await pool.query(
            `INSERT INTO page_content (page_name, section_name, title, subtitle, description, image_url, cta_text, cta_link, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (page_name, section_name) DO UPDATE SET
             title = $3, subtitle = $4, description = $5, image_url = $6, cta_text = $7, cta_link = $8, display_order = $9, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [page_name, section_name, title, subtitle, description, image_url, cta_text, cta_link, display_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/page-content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, description, image_url, cta_text, cta_link, display_order, metadata } = req.body;
        const result = await pool.query(
            `UPDATE page_content
             SET title = COALESCE($1, title),
                 subtitle = COALESCE($2, subtitle),
                 description = COALESCE($3, description),
                 image_url = COALESCE($4, image_url),
                 cta_text = COALESCE($5, cta_text),
                 cta_link = COALESCE($6, cta_link),
                 display_order = COALESCE($7, display_order),
                 metadata = COALESCE($8::jsonb, metadata),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9
             RETURNING *`,
            [title, subtitle, description, image_url, cta_text, cta_link, display_order, metadata ? JSON.stringify(metadata) : null, id]
        );
        res.json(result.rows[0] || { error: 'Content not found' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/page-content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM page_content WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- UNIFIED DELIVERY MANIFEST (Subscriptions + Addon-only orders) ---
router.get('/delivery-manifest', async (req, res) => {
    try {
        const { from_date, to_date } = req.query;
        let dateFilterSub = '';
        let dateFilterAddon = '';
        let dateFilterSubAddon = '';
        let params: any[] = [];

        if (from_date && to_date) {
            dateFilterSub = 'AND sdd.delivery_date BETWEEN $1 AND $2';
            dateFilterAddon = 'AND d.delivery_date BETWEEN $1 AND $2';
            dateFilterSubAddon = 'AND addon_day.delivery_date BETWEEN $1 AND $2';
            params = [from_date, to_date];
        }

        const result = await pool.query(`
            WITH addon_counts AS (
                SELECT
                    add.subscription_addon_id,
                    add.delivery_date,
                    COUNT(*) as qty
                FROM addon_delivery_dates add
                GROUP BY add.subscription_addon_id, add.delivery_date
            )
            -- Subscription deliveries (plan-only or plan+addons on same day)
            SELECT
                sdd.id as delivery_id,
                sdd.delivery_date,
                TO_CHAR(sdd.delivery_date, 'Day') as delivery_day,
                'subscription' as order_type,
                CASE WHEN EXISTS (
                    SELECT 1 FROM subscription_add_ons sa2
                    JOIN addon_delivery_dates add2 ON add2.subscription_addon_id = sa2.id
                    WHERE sa2.subscription_id = s.id
                    AND add2.delivery_date = sdd.delivery_date
                    AND (sa2.status IS NULL OR sa2.status = 'active')
                ) THEN 'sub+addons' ELSE 'subscription' END as delivery_type,
                u.name as customer_name,
                u.id as user_id,
                u.phone,
                a.address_line1 as house_number,
                NULL::text as street,
                a.address_line2 as area,
                a.suburb as city,
                a.postcode as pin_code,
                cust.time_slot as delivery_slot,
                s.plan_type as plan_name,
                COALESCE(p.price, s.price) as plan_price,
                s.id as subscription_id,
                (SELECT o.id FROM order_items oi2 JOIN orders o ON o.id = oi2.order_id JOIN plans pl ON pl.id = oi2.item_id WHERE oi2.item_type = 'subscription' AND pl.name = s.plan_type AND o.user_id = u.id ORDER BY o.id DESC LIMIT 1) as order_id,
                'BLM-' || LPAD((SELECT o.id::text FROM order_items oi2 JOIN orders o ON o.id = oi2.order_id JOIN plans pl ON pl.id = oi2.item_id WHERE oi2.item_type = 'subscription' AND pl.name = s.plan_type AND o.user_id = u.id ORDER BY o.id DESC LIMIT 1), 6, '0') AS bloomme_order_id,
                CASE WHEN s.status = 'cancelled' THEN 'cancelled'
                     ELSE COALESCE(d.status, 'scheduled') END as delivery_status,
                NULL::text as payment_status,
                NULL::text as notes,
                (
                    SELECT COALESCE(SUM(ao.price), 0)
                    FROM subscription_add_ons sa2
                    JOIN addon_delivery_dates add2 ON add2.subscription_addon_id = sa2.id
                    LEFT JOIN add_ons ao ON sa2.add_on_id = ao.id
                    WHERE sa2.subscription_id = s.id AND add2.delivery_date = sdd.delivery_date
                ) as addon_total,
                COALESCE(p.price, s.price) + (
                    SELECT COALESCE(SUM(ao.price), 0)
                    FROM subscription_add_ons sa2
                    JOIN addon_delivery_dates add2 ON add2.subscription_addon_id = sa2.id
                    LEFT JOIN add_ons ao ON sa2.add_on_id = ao.id
                    WHERE sa2.subscription_id = s.id AND add2.delivery_date = sdd.delivery_date
                ) as total_amount,
                (
                    SELECT json_agg(json_build_object('name', ao.name, 'qty', COALESCE(ac.qty, 1)))
                    FROM subscription_add_ons sa2
                    JOIN addon_counts ac ON ac.subscription_addon_id = sa2.id AND ac.delivery_date = sdd.delivery_date
                    LEFT JOIN add_ons ao ON sa2.add_on_id = ao.id
                    WHERE sa2.subscription_id = s.id
                ) as addons
            FROM subscription_delivery_dates sdd
            LEFT JOIN subscriptions s ON sdd.subscription_id = s.id
            LEFT JOIN plans p ON p.name = s.plan_type
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN customers cust ON cust.user_id = s.user_id
            LEFT JOIN LATERAL (
                SELECT * FROM addresses WHERE customer_id = cust.id ORDER BY id LIMIT 1
            ) a ON true
            LEFT JOIN deliveries d ON s.id = d.subscription_id AND sdd.delivery_date = d.delivery_date
            WHERE s.status IN ('active', 'cancelled')
            ${dateFilterSub}

            UNION ALL

            -- Addon-only standalone orders (order_type = 'addon', dates from custom_schedule_dates)
            SELECT
                o.id as delivery_id,
                d.delivery_date::date as delivery_date,
                TO_CHAR(d.delivery_date::date, 'Day') as delivery_day,
                'addon_only' as order_type,
                'addon_only' as delivery_type,
                COALESCE(u.name, cust.name) as customer_name,
                u.id as user_id,
                COALESCE(u.phone, cust.phone) as phone,
                a.address_line1 as house_number,
                NULL::text as street,
                a.address_line2 as area,
                a.suburb as city,
                a.postcode as pin_code,
                COALESCE(o.delivery_slot, cust.time_slot) as delivery_slot,
                NULL::text as plan_name,
                NULL::numeric as plan_price,
                NULL::integer as subscription_id,
                o.id as order_id,
                'BLM-' || LPAD(o.id::text, 6, '0') AS bloomme_order_id,
                CASE WHEN o.status = 'cancelled' THEN 'cancelled'
                     WHEN o.delivered_at IS NOT NULL THEN 'delivered'
                     WHEN o.failed_reason IS NOT NULL THEN 'failed'
                     ELSE 'scheduled' END as delivery_status,
                o.status as payment_status,
                NULL::text as notes,
                (SELECT COALESCE(SUM(oi2.price * oi2.quantity) / 100.0, 0) FROM order_items oi2 WHERE oi2.order_id = o.id AND oi2.item_type = 'addon') as addon_total,
                COALESCE(o.amount / 100.0, 0) as total_amount,
                (SELECT json_agg(json_build_object('name', ao.name, 'qty', oi2.quantity))
                 FROM order_items oi2
                 LEFT JOIN add_ons ao ON oi2.item_id = ao.id
                 WHERE oi2.order_id = o.id AND oi2.item_type = 'addon') as addons
            FROM (
                SELECT DISTINCT oi.order_id, unnested.delivery_date
                FROM order_items oi
                CROSS JOIN LATERAL UNNEST(oi.custom_schedule_dates) AS unnested(delivery_date)
                WHERE oi.item_type = 'addon'
            ) d
            JOIN orders o ON o.id = d.order_id
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN customers cust ON cust.user_id = o.user_id
            LEFT JOIN LATERAL (
                SELECT * FROM addresses WHERE customer_id = cust.id ORDER BY id LIMIT 1
            ) a ON true
            WHERE o.order_type = 'addon' AND o.status = 'paid'
            ${dateFilterAddon}

            UNION ALL

            -- Subscription-linked addon deliveries on non-plan days (SUB+AO orders where addon dates differ from plan dates)
            SELECT
                MIN(sa.id) as delivery_id,
                addon_day.delivery_date::date as delivery_date,
                TO_CHAR(addon_day.delivery_date::date, 'Day') as delivery_day,
                'addon_only' as order_type,
                'addon_only' as delivery_type,
                u.name as customer_name,
                u.id as user_id,
                u.phone,
                a.address_line1 as house_number,
                NULL::text as street,
                a.address_line2 as area,
                a.suburb as city,
                a.postcode as pin_code,
                cust.time_slot as delivery_slot,
                NULL::text as plan_name,
                NULL::numeric as plan_price,
                s.id as subscription_id,
                (SELECT o.id FROM order_items oi2 JOIN orders o ON o.id = oi2.order_id JOIN plans pl ON pl.id = oi2.item_id WHERE oi2.item_type = 'subscription' AND pl.name = s.plan_type AND o.user_id = u.id ORDER BY o.id DESC LIMIT 1) as order_id,
                'BLM-' || LPAD((SELECT o.id::text FROM order_items oi2 JOIN orders o ON o.id = oi2.order_id JOIN plans pl ON pl.id = oi2.item_id WHERE oi2.item_type = 'subscription' AND pl.name = s.plan_type AND o.user_id = u.id ORDER BY o.id DESC LIMIT 1), 6, '0') AS bloomme_order_id,
                CASE WHEN s.status = 'cancelled' THEN 'cancelled' ELSE 'scheduled' END as delivery_status,
                NULL::text as payment_status,
                NULL::text as notes,
                (
                    SELECT COALESCE(SUM(ao.price * COALESCE(oi_q.quantity, 1)), 0)
                    FROM subscription_add_ons sa2
                    JOIN addon_delivery_dates add2 ON add2.subscription_addon_id = sa2.id
                    LEFT JOIN add_ons ao ON sa2.add_on_id = ao.id
                    LEFT JOIN LATERAL (
                        SELECT oi.quantity FROM order_items oi
                        JOIN orders ord ON ord.id = oi.order_id
                        WHERE oi.item_type = 'addon' AND oi.item_id = sa2.add_on_id
                        AND ord.user_id = s.user_id
                        ORDER BY ord.id DESC LIMIT 1
                    ) oi_q ON true
                    WHERE sa2.subscription_id = s.id AND add2.delivery_date = addon_day.delivery_date
                ) as addon_total,
                (
                    SELECT COALESCE(SUM(ao.price * COALESCE(oi_q.quantity, 1)), 0)
                    FROM subscription_add_ons sa2
                    JOIN addon_delivery_dates add2 ON add2.subscription_addon_id = sa2.id
                    LEFT JOIN add_ons ao ON sa2.add_on_id = ao.id
                    LEFT JOIN LATERAL (
                        SELECT oi.quantity FROM order_items oi
                        JOIN orders ord ON ord.id = oi.order_id
                        WHERE oi.item_type = 'addon' AND oi.item_id = sa2.add_on_id
                        AND ord.user_id = s.user_id
                        ORDER BY ord.id DESC LIMIT 1
                    ) oi_q ON true
                    WHERE sa2.subscription_id = s.id AND add2.delivery_date = addon_day.delivery_date
                ) as total_amount,
                (
                    SELECT json_agg(json_build_object('name', ao.name, 'qty', COALESCE(oi_q.quantity, 1)))
                    FROM subscription_add_ons sa2
                    JOIN addon_delivery_dates add2 ON add2.subscription_addon_id = sa2.id
                    LEFT JOIN add_ons ao ON sa2.add_on_id = ao.id
                    LEFT JOIN LATERAL (
                        SELECT oi.quantity FROM order_items oi
                        JOIN orders ord ON ord.id = oi.order_id
                        WHERE oi.item_type = 'addon' AND oi.item_id = sa2.add_on_id
                        AND ord.user_id = s.user_id
                        ORDER BY ord.id DESC LIMIT 1
                    ) oi_q ON true
                    WHERE sa2.subscription_id = s.id AND add2.delivery_date = addon_day.delivery_date
                ) as addons
            FROM (
                SELECT DISTINCT sa.subscription_id, add_d.delivery_date
                FROM subscription_add_ons sa
                JOIN addon_delivery_dates add_d ON add_d.subscription_addon_id = sa.id
                WHERE (sa.status IS NULL OR sa.status = 'active')
                AND NOT EXISTS (
                    SELECT 1 FROM subscription_delivery_dates sdd2
                    WHERE sdd2.subscription_id = sa.subscription_id AND sdd2.delivery_date = add_d.delivery_date
                )
            ) addon_day
            JOIN subscription_add_ons sa ON sa.subscription_id = addon_day.subscription_id
            JOIN subscriptions s ON s.id = addon_day.subscription_id
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN customers cust ON cust.user_id = s.user_id
            LEFT JOIN LATERAL (
                SELECT * FROM addresses WHERE customer_id = cust.id ORDER BY id LIMIT 1
            ) a ON true
            WHERE s.status IN ('active', 'cancelled')
            ${dateFilterSubAddon}
            GROUP BY addon_day.delivery_date, s.id, u.name, u.id, u.phone,
                     a.address_line1, a.address_line2, a.suburb, a.postcode,
                     cust.time_slot, s.plan_type, s.status

            ORDER BY delivery_date, customer_name
        `, params);

        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- MARK DELIVERY STATUS ---
router.put('/deliveries/mark-status', async (req, res) => {
    try {
        const { delivery_type, subscription_id, delivery_date, order_id, status, failed_reason } = req.body;

        if (delivery_type === 'subscription') {
            // Subscription delivery: UPSERT into deliveries table
            const result = await pool.query(`
                INSERT INTO deliveries (subscription_id, delivery_date, status)
                VALUES ($1, $2, $3)
                ON CONFLICT (subscription_id, delivery_date) DO UPDATE SET
                    status = $3,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `, [subscription_id, delivery_date, status]);
            res.json({ success: true, delivery: result.rows[0] });
        } else if (delivery_type === 'addon_only') {
            // Addon-only order: UPDATE orders table
            const result = await pool.query(`
                UPDATE orders
                SET delivered_at = CASE WHEN $1 = 'delivered' THEN CURRENT_TIMESTAMP ELSE NULL END,
                    failed_reason = CASE WHEN $1 = 'failed' THEN COALESCE($2, 'marked failed by admin') ELSE NULL END
                WHERE id = $3
                RETURNING *
            `, [status, failed_reason || null, order_id]);
            res.json({ success: true, delivery: result.rows[0] });
        } else {
            res.status(400).json({ error: 'Invalid delivery_type' });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- ORDERS (FOR ADMIN VIEW) ---
router.get('/orders', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                o.*,
                u.name as user_name,
                u.email as user_email,
                u.phone as user_phone,
                a.address_line1 as house_number,
                NULL::text as street,
                a.address_line2 as area,
                a.suburb as city,
                a.postcode as pin_code,
                a.delivery_notes
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN customers cust_addr ON cust_addr.user_id = o.user_id
            LEFT JOIN addresses a ON a.customer_id = cust_addr.id
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADD-ONS ONLY (FOR ADMIN VIEW) ---
router.get('/addons', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT
                oi.id,
                o.id as order_id,
                u.id as user_id,
                u.name as user_name,
                u.email as user_email,
                ao.name as addon_name,
                oi.quantity,
                oi.price,
                o.status,
                o.created_at
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN add_ons ao ON oi.item_id = ao.id
            WHERE oi.item_type = 'addon'
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- HOMEPAGE CONTENT (LEGACY) ---
router.get('/homepage-content', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM homepage_content ORDER BY section ASC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/homepage-content/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const { title, subtitle, description, image_url, cta_text, cta_link } = req.body;
        const result = await pool.query(
            `UPDATE homepage_content
             SET title = COALESCE($1, title),
                 subtitle = COALESCE($2, subtitle),
                 description = COALESCE($3, description),
                 image_url = COALESCE($4, image_url),
                 cta_text = COALESCE($5, cta_text),
                 cta_link = COALESCE($6, cta_link),
                 updated_at = CURRENT_TIMESTAMP
             WHERE section = $7
             RETURNING *`,
            [title, subtitle, description, image_url, cta_text, cta_link, section]
        );
        res.json(result.rows[0] || { error: 'Section not found' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- ORDER DELIVERY SCHEDULE ---

// GET /api/admin/orders/:orderId/schedule
router.get('/orders/:orderId/schedule', async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) return res.status(400).json({ error: 'Invalid order ID' });

    try {
        // Get the order's customer and find linked subscriptions by customer email or user_id
        const orderRow = await pool.query(
            `SELECT o.user_id, o.customer_id, c.email FROM orders o
             LEFT JOIN customers c ON c.id = o.customer_id
             WHERE o.id = $1`, [orderId]
        );
        if (orderRow.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        const { user_id, email } = orderRow.rows[0];

        // Find the single subscription linked to this order — closest in time, matching plan
        let subRows;
        if (user_id) {
            subRows = await pool.query(
                `SELECT s.id AS subscription_id, s.status AS sub_status, s.plan_type, s.custom_schedule
                 FROM subscriptions s
                 JOIN order_items oi ON oi.order_id = $1 AND oi.item_type = 'subscription'
                 JOIN plans p ON p.id = oi.item_id AND LOWER(p.name) = LOWER(s.plan_type)
                 WHERE s.user_id = $2
                 ORDER BY ABS(EXTRACT(EPOCH FROM (s.created_at - (SELECT COALESCE(paid_at, created_at) FROM orders WHERE id = $1)))) ASC
                 LIMIT 1`,
                [orderId, user_id]
            );
        } else {
            subRows = await pool.query(
                `SELECT s.id AS subscription_id, s.status AS sub_status, s.plan_type, s.custom_schedule
                 FROM subscriptions s
                 JOIN users u ON u.id = s.user_id
                 JOIN order_items oi ON oi.order_id = $2 AND oi.item_type = 'subscription'
                 JOIN plans p ON p.id = oi.item_id AND LOWER(p.name) = LOWER(s.plan_type)
                 WHERE LOWER(u.email) = LOWER($1)
                 ORDER BY ABS(EXTRACT(EPOCH FROM (s.created_at - (SELECT COALESCE(paid_at, created_at) FROM orders WHERE id = $2)))) ASC
                 LIMIT 1`,
                [email, orderId]
            );
            if (subRows.rows.length === 0) {
                subRows = await pool.query(
                    `SELECT s.id AS subscription_id, s.status AS sub_status, s.plan_type, s.custom_schedule
                     FROM subscriptions s
                     JOIN order_items oi ON oi.order_id = $1 AND oi.item_type = 'subscription'
                     JOIN plans p ON p.id = oi.item_id AND LOWER(p.name) = LOWER(s.plan_type)
                     WHERE s.user_id IS NULL
                     ORDER BY ABS(EXTRACT(EPOCH FROM (s.created_at - (SELECT paid_at FROM orders WHERE id = $1)))) ASC
                     LIMIT 1`,
                    [orderId]
                );
            }
        }

        const result = [];
        const toDateStr = (d: any): string => {
            if (!d) return '';
            if (d instanceof Date) {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            }
            return String(d).slice(0, 10);
        };

        for (const sub of subRows.rows) {
            const rawSched = typeof sub.custom_schedule === 'string'
                ? JSON.parse(sub.custom_schedule) : (sub.custom_schedule || []);
            const dates: string[] = rawSched.map(toDateStr).filter(Boolean);

            const deliveryRows = await pool.query(
                `SELECT delivery_date::text, status FROM deliveries WHERE subscription_id = $1`,
                [sub.subscription_id]
            );
            const statusMap: Record<string, string> = {};
            for (const row of deliveryRows.rows) {
                statusMap[toDateStr(row.delivery_date)] = row.status;
            }

            result.push({
                subscription_id: sub.subscription_id,
                plan_type: sub.plan_type,
                sub_status: sub.sub_status,
                dates: dates.map((d: string) => ({
                    date: d,
                    status: statusMap[d] || 'pending',
                })),
            });
        }

        // Addon dates from order_items (including cancelled items)
        const addonItems = await pool.query(
            `SELECT a.name, oi.custom_schedule_dates, oi.schedule, oi.status AS item_status
             FROM order_items oi
             JOIN add_ons a ON a.id = oi.item_id
             WHERE oi.order_id = $1 AND oi.item_type = 'addon'`, [orderId]
        );

        // Fetch existing addon delivery statuses for this order
        const addonStatusRows = await pool.query(
            `SELECT addon_name, delivery_date::text, status FROM addon_delivery_status WHERE order_id = $1`,
            [orderId]
        );
        const addonStatusMap: Record<string, Record<string, string>> = {};
        for (const row of addonStatusRows.rows) {
            if (!addonStatusMap[row.addon_name]) addonStatusMap[row.addon_name] = {};
            addonStatusMap[row.addon_name][toDateStr(row.delivery_date)] = row.status;
        }

        const addons = addonItems.rows.map((row: any) => {
            let dates: string[] = [];
            if (row.custom_schedule_dates) {
                dates = row.custom_schedule_dates.map(toDateStr).filter(Boolean);
            } else if (row.schedule) {
                try {
                    const sched = typeof row.schedule === 'string' ? JSON.parse(row.schedule) : row.schedule;
                    if (Array.isArray(sched)) dates = sched.map(toDateStr).filter(Boolean);
                    else if (sched?.customDates) dates = sched.customDates.map(toDateStr).filter(Boolean);
                } catch {}
            }
            const isCancelled = row.item_status === 'cancelled';
            const statusMap = addonStatusMap[row.name] || {};
            return {
                name: row.name,
                cancelled: isCancelled,
                dates: dates.map((d: string) => ({
                    date: d,
                    status: isCancelled ? 'cancelled' : (statusMap[d] || 'pending'),
                })),
            };
        });

        // Fallback: also pull add-on dates from subscription_add_ons → addon_delivery_dates
        // (covers subscription orders where add-ons aren't in order_items)
        // Scoped to only subscriptions linked to this order to avoid showing data from other orders
        if (user_id && result.length > 0) {
            const linkedSubIds = result.map((s: any) => s.subscription_id);
            const subAddonRows = await pool.query(
                `SELECT a.name, TO_CHAR(add_dates.delivery_date, 'YYYY-MM-DD') as delivery_date
                 FROM subscription_add_ons sa
                 JOIN add_ons a ON a.id = sa.add_on_id
                 JOIN addon_delivery_dates add_dates ON add_dates.subscription_addon_id = sa.id
                 WHERE sa.subscription_id = ANY($1::int[])
                 ORDER BY a.name, add_dates.delivery_date`,
                [linkedSubIds]
            );

            // Group by addon name
            const subAddonMap: Record<string, string[]> = {};
            for (const row of subAddonRows.rows) {
                if (!subAddonMap[row.name]) subAddonMap[row.name] = [];
                subAddonMap[row.name].push(row.delivery_date);
            }

            for (const [name, dates] of Object.entries(subAddonMap)) {
                // Only add if not already covered by order_items
                if (!addons.find((a: any) => a.name === name)) {
                    const statusMap = addonStatusMap[name] || {};
                    addons.push({
                        name,
                        cancelled: false,
                        dates: dates.map((d: string) => ({ date: d, status: statusMap[d] || 'pending' })),
                    });
                }
            }
        }

        res.json({ subscriptions: result, addons });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/orders/:orderId/deliveries/mark
router.post('/orders/:orderId/deliveries/mark', async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const { subscriptionId, addonName, date, status } = req.body;
    if (!date || !status) return res.status(400).json({ error: 'date and status required' });
    if (!['delivered', 'not_delivered', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    // 'not_delivered' maps to 'failed' at the DB level (CHECK constraint allows: pending|delivered|skipped|failed)
    const dbStatus = status === 'not_delivered' ? 'failed' : status;

    try {
        if (addonName) {
            // Track add-on delivery status
            await pool.query(`
                INSERT INTO addon_delivery_status (order_id, addon_name, delivery_date, status, updated_at)
                VALUES ($1, $2, $3::date, $4, CURRENT_TIMESTAMP)
                ON CONFLICT (order_id, addon_name, delivery_date)
                DO UPDATE SET status = $4, updated_at = CURRENT_TIMESTAMP
            `, [orderId, addonName, date, dbStatus]);
        } else if (subscriptionId) {
            // Track subscription delivery status
            await pool.query(`
                INSERT INTO deliveries (subscription_id, delivery_date, status, updated_at)
                VALUES ($1, $2::date, $3, CURRENT_TIMESTAMP)
                ON CONFLICT (subscription_id, delivery_date)
                DO UPDATE SET status = $3, updated_at = CURRENT_TIMESTAMP
            `, [subscriptionId, date, dbStatus]);
        } else {
            return res.status(400).json({ error: 'subscriptionId or addonName required' });
        }

        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/orders/:orderId/cancel-addons
// Cancel (delete) all subscription add-ons linked to this order's subscription(s)
router.post('/orders/:orderId/cancel-addons', async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) return res.status(400).json({ error: 'Invalid order ID' });

    try {
        const orderRow = await pool.query(
            `SELECT o.user_id FROM orders o WHERE o.id = $1`, [orderId]
        );
        if (orderRow.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        const { user_id } = orderRow.rows[0];
        if (!user_id) return res.status(400).json({ error: 'Guest order — no linked subscriptions' });

        // Find subscriptions for this order (same logic as schedule endpoint)
        const subRows = await pool.query(
            `SELECT s.id AS subscription_id
             FROM subscriptions s
             JOIN order_items oi ON oi.order_id = $1 AND oi.item_type = 'subscription'
             JOIN plans p ON p.id = oi.item_id AND LOWER(p.name) = LOWER(s.plan_type)
             WHERE s.user_id = $2`,
            [orderId, user_id]
        );

        if (subRows.rows.length === 0) {
            return res.status(404).json({ error: 'No subscription found for this order' });
        }

        const subIds = subRows.rows.map((r: any) => r.subscription_id);

        // Mark subscription add-ons as cancelled (keep rows for history)
        const result = await pool.query(
            `UPDATE subscription_add_ons SET status = 'cancelled'
             WHERE subscription_id = ANY($1::int[]) RETURNING id`,
            [subIds]
        );

        // Mark addon order_items as cancelled (only for standalone addon orders)
        await pool.query(
            `UPDATE order_items oi SET status = 'cancelled'
             FROM orders o
             WHERE oi.order_id = o.id AND o.id = $1
               AND oi.item_type = 'addon' AND o.order_type = 'addon'`,
            [orderId]
        );

        res.json({ success: true, cancelledAddons: result.rowCount, subscriptionIds: subIds });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- ORDER LOOKUP ---

// GET /api/admin/order-lookup?id=BLM-000011
router.get('/order-lookup', async (req, res) => {
    const rawId = (req.query.id as string || '').trim();
    if (!rawId) return res.status(400).json({ error: 'Order ID required' });

    // Accept BLM-000011, BLM000011, or plain 11
    const numeric = rawId.replace(/^BLM-?0*/i, '') || '0';
    const orderId = parseInt(numeric, 10);
    if (isNaN(orderId) || orderId <= 0) return res.status(400).json({ error: 'Invalid order ID format' });

    try {
        const orderRes = await pool.query(`
            SELECT
                o.id,
                'BLM-' || LPAD(o.id::text, 6, '0') AS bloomme_order_id,
                o.status, o.amount, o.currency, o.order_type,
                o.promo_code, o.promo_discount, o.referral_discount,
                o.razorpay_order_id, o.razorpay_payment_id,
                o.created_at, o.paid_at,
                c.name AS customer_name, c.email AS customer_email,
                c.phone AS customer_phone, c.time_slot, c.building_type,
                c.user_id,
                u.name AS registered_name
            FROM orders o
            LEFT JOIN customers c ON c.id = o.customer_id
            LEFT JOIN users u ON u.id = c.user_id
            WHERE o.id = $1
        `, [orderId]);

        if (orderRes.rows.length === 0) return res.status(404).json({ error: `Order ${rawId} not found` });
        const order = orderRes.rows[0];

        // Items
        const itemsRes = await pool.query(`
            SELECT oi.item_type, oi.item_id, oi.quantity, oi.price,
                   oi.schedule, oi.custom_schedule_dates,
                   p.name AS plan_name, a.name AS addon_name
            FROM order_items oi
            LEFT JOIN plans p ON oi.item_type = 'subscription' AND p.id = oi.item_id
            LEFT JOIN add_ons a ON oi.item_type = 'addon' AND a.id = oi.item_id
            WHERE oi.order_id = $1
        `, [orderId]);

        // Address
        const addrRes = order.user_id ? await pool.query(`
            SELECT c.name as full_name, a.address_line1 as house_number, NULL::text as street,
                   a.address_line2 as area, a.suburb as city, a.postcode as pin_code, a.delivery_notes as instructions
            FROM addresses a
            JOIN customers c ON c.id = a.customer_id
            WHERE c.user_id = $1 ORDER BY a.id DESC LIMIT 1
        `, [order.user_id]) : { rows: [] };

        // Credits used
        const creditsRes = await pool.query(`
            SELECT SUM(ABS(amount)) AS credits_used
            FROM bloom_credit_transactions
            WHERE order_id = $1 AND type = 'redeem'
        `, [orderId]);

        res.json({
            order: {
                ...order,
                amount_rupees: order.amount / 100,
                is_guest: !order.user_id,
            },
            items: itemsRes.rows.map((i: any) => ({
                type: i.item_type,
                name: i.plan_name || i.addon_name || `#${i.item_id}`,
                quantity: i.quantity,
                price_rupees: i.price / 100,
                dates: i.custom_schedule_dates || (i.schedule ? (typeof i.schedule === 'string' ? JSON.parse(i.schedule) : i.schedule) : []),
            })),
            address: addrRes.rows[0] || null,
            credits_used: parseInt(creditsRes.rows[0]?.credits_used || 0),
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- CUSTOMER 360 ---

// GET /api/admin/customers — list all customers with summary stats
router.get('/customers', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                customer_id,
                name,
                email,
                phone,
                user_id,
                is_registered,
                total_orders,
                paid_orders,
                ROUND(total_spent_paise / 100.0, 2) AS total_spent,
                total_subscriptions,
                active_subscriptions,
                first_seen,
                last_order_at
            FROM customer_360

            UNION ALL

            SELECT
                u.id        AS customer_id,
                u.name,
                u.email,
                u.phone,
                u.id        AS user_id,
                TRUE        AS is_registered,
                0           AS total_orders,
                0           AS paid_orders,
                0           AS total_spent,
                0           AS total_subscriptions,
                0           AS active_subscriptions,
                u.created_at AS first_seen,
                NULL        AS last_order_at
            FROM users u
            WHERE u.role = 'user'
              AND NOT EXISTS (
                SELECT 1 FROM customers c WHERE LOWER(c.email) = LOWER(u.email)
              )

            ORDER BY last_order_at DESC NULLS LAST, first_seen DESC
        `);
        res.json({ customers: result.rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/customers/:id/profile — full 360° profile for one customer
router.get('/customers/:id/profile', async (req, res) => {
    const customerId = parseInt(req.params.id);
    if (isNaN(customerId)) return res.status(400).json({ error: 'Invalid customer ID' });

    try {
        // Identity
        const identityRes = await pool.query(`
            SELECT
                c.id AS customer_id, c.name, c.email, c.phone,
                c.building_type, c.time_slot, c.created_at AS first_seen,
                c.user_id,
                u.name AS registered_name, u.email AS registered_email,
                u.referral_code, u.created_at AS registered_at
            FROM customers c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = $1
        `, [customerId]);

        if (identityRes.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
        const identity = identityRes.rows[0];

        // Orders + items
        const ordersRes = await pool.query(`
            SELECT
                o.id, o.razorpay_order_id, o.razorpay_payment_id,
                o.amount, o.status, o.order_type,
                o.promo_code, o.promo_discount, o.referral_discount,
                o.created_at, o.paid_at,
                json_agg(json_build_object(
                    'item_type', oi.item_type,
                    'item_id',   oi.item_id,
                    'quantity',  oi.quantity,
                    'price',     oi.price
                ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL) AS items
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE o.customer_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [customerId]);

        // Subscriptions
        const subsRes = identity.user_id ? await pool.query(`
            SELECT
                s.id, s.plan_type, s.status, s.price,
                s.delivery_days, s.custom_schedule,
                s.start_date, s.created_at AS created_at,
                json_agg(json_build_object(
                    'name', a.name,
                    'price', a.price
                ) ORDER BY a.id) FILTER (WHERE a.id IS NOT NULL) AS addons
            FROM subscriptions s
            LEFT JOIN subscription_add_ons sa ON sa.subscription_id = s.id
            LEFT JOIN add_ons a ON a.id = sa.add_on_id
            WHERE s.user_id = $1
            GROUP BY s.id, s.created_at
            ORDER BY s.created_at DESC
        `, [identity.user_id]) : { rows: [] };

        // Addresses
        const addressesRes = identity.user_id ? await pool.query(`
            SELECT a.id, c.name as full_name, c.phone, a.address_line1 as house_number,
                   NULL::text as street, a.address_line2 as area, a.suburb as city,
                   a.postcode as pin_code, a.delivery_notes as instructions
            FROM addresses a
            JOIN customers c ON c.id = a.customer_id
            WHERE c.user_id = $1 ORDER BY a.id DESC
        `, [identity.user_id]) : { rows: [] };

        // Deliveries
        const deliveriesRes = identity.user_id ? await pool.query(`
            SELECT d.id, d.subscription_id, d.delivery_date, d.status, d.updated_at
            FROM deliveries d
            JOIN subscriptions s ON s.id = d.subscription_id
            WHERE s.user_id = $1
            ORDER BY d.delivery_date DESC
            LIMIT 50
        `, [identity.user_id]) : { rows: [] };

        // Bloom Credits
        const creditsRes = identity.user_id ? await pool.query(`
            SELECT
                COALESCE(SUM(amount) FILTER (WHERE expires_at > NOW() OR expires_at IS NULL), 0) AS balance,
                json_agg(json_build_object(
                    'amount', amount,
                    'type', type,
                    'description', description,
                    'created_at', created_at,
                    'expires_at', expires_at
                ) ORDER BY created_at DESC) FILTER (WHERE TRUE) AS transactions
            FROM bloom_credit_transactions
            WHERE user_id = $1
        `, [identity.user_id]) : { rows: [{ balance: 0, transactions: [] }] };

        // Referrals
        const referralsRes = identity.user_id ? await pool.query(`
            SELECT r.id, r.status, r.created_at, r.completed_at,
                u.name AS referred_name, u.email AS referred_email
            FROM referrals r
            LEFT JOIN users u ON u.id = r.referred_user_id
            WHERE r.referrer_id = $1
            ORDER BY r.created_at DESC
        `, [identity.user_id]) : { rows: [] };

        res.json({
            identity: {
                ...identity,
                is_registered: !!identity.user_id,
            },
            orders: ordersRes.rows,
            subscriptions: subsRes.rows,
            addresses: addressesRes.rows,
            deliveries: deliveriesRes.rows,
            credits: {
                balance: parseInt(creditsRes.rows[0]?.balance || 0),
                transactions: creditsRes.rows[0]?.transactions || [],
            },
            referrals: referralsRes.rows,
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
