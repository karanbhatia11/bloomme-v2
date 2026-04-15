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
                (SELECT city FROM addresses WHERE user_id = s.user_id LIMIT 1) as city,
                (SELECT pin_code FROM addresses WHERE user_id = s.user_id LIMIT 1) as pin_code,
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
                a.full_name,
                a.house_number,
                a.street,
                a.area,
                a.city,
                a.pin_code,
                a.instructions
            FROM subscriptions s
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN addresses a ON a.user_id = s.user_id
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

        // Order and payment info
        const orderResult = await pool.query(`
            SELECT
                id,
                razorpay_order_id,
                razorpay_payment_id,
                amount,
                currency,
                status,
                order_type,
                promo_code,
                promo_discount,
                referral_discount,
                created_at,
                paid_at
            FROM orders
            WHERE user_id = $1
            ORDER BY created_at DESC
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
        let params: any[] = [];

        if (from_date && to_date) {
            dateFilterSub = 'AND sdd.delivery_date BETWEEN $1 AND $2';
            dateFilterAddon = 'AND o.delivery_date BETWEEN $1 AND $2';
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
            -- Subscription deliveries
            SELECT
                sdd.id as delivery_id,
                sdd.delivery_date,
                TO_CHAR(sdd.delivery_date, 'Day') as delivery_day,
                'subscription' as order_type,
                CASE WHEN EXISTS (
                    SELECT 1 FROM subscription_add_ons sa
                    LEFT JOIN addon_delivery_dates add ON sa.id = add.subscription_addon_id
                    WHERE sa.subscription_id = s.id AND add.delivery_date = sdd.delivery_date
                ) THEN 'sub+addons' ELSE 'subscription' END as delivery_type,
                u.name as customer_name,
                u.phone,
                a.house_number,
                a.street,
                a.area,
                a.city,
                a.pin_code,
                NULL::text as delivery_slot,
                s.plan_type as plan_name,
                s.price as plan_price,
                s.id as subscription_id,
                NULL::integer as order_id,
                COALESCE(d.status, 'scheduled') as delivery_status,
                NULL::text as payment_status,
                NULL::text as notes,
                (SELECT COALESCE(SUM(ao.price), 0) FROM subscription_add_ons sa LEFT JOIN add_ons ao ON sa.add_on_id = ao.id WHERE sa.subscription_id = s.id) as addon_total,
                s.price + (SELECT COALESCE(SUM(ao.price), 0) FROM subscription_add_ons sa LEFT JOIN add_ons ao ON sa.add_on_id = ao.id WHERE sa.subscription_id = s.id) as total_amount,
                (
                    SELECT json_agg(json_build_object('name', ao.name, 'qty', 1))
                    FROM subscription_add_ons sa
                    LEFT JOIN add_ons ao ON sa.add_on_id = ao.id
                    WHERE sa.subscription_id = s.id
                ) as addons
            FROM subscription_delivery_dates sdd
            LEFT JOIN subscriptions s ON sdd.subscription_id = s.id
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN addresses a ON a.user_id = s.user_id
            LEFT JOIN deliveries d ON s.id = d.subscription_id AND sdd.delivery_date = d.delivery_date
            WHERE s.status = 'active'
            ${dateFilterSub}

            UNION ALL

            -- Addon-only orders
            SELECT
                o.id as delivery_id,
                o.delivery_date,
                TO_CHAR(o.delivery_date, 'Day') as delivery_day,
                'addon_only' as order_type,
                'addon_only' as delivery_type,
                u.name as customer_name,
                u.phone,
                a.house_number,
                a.street,
                a.area,
                a.city,
                a.pin_code,
                o.delivery_slot,
                NULL::text as plan_name,
                NULL::numeric as plan_price,
                NULL::integer as subscription_id,
                o.id as order_id,
                CASE WHEN o.delivered_at IS NOT NULL THEN 'delivered'
                     WHEN o.failed_reason IS NOT NULL THEN 'failed'
                     ELSE 'scheduled' END as delivery_status,
                o.status as payment_status,
                NULL::text as notes,
                (SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id AND oi.item_type = 'addon') as addon_total,
                COALESCE(o.amount, 0) as total_amount,
                (SELECT json_agg(json_build_object('name', ao.name, 'qty', oi.quantity))
                 FROM order_items oi
                 LEFT JOIN add_ons ao ON oi.item_id = ao.id
                 WHERE oi.order_id = o.id AND oi.item_type = 'addon') as addons
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN addresses a ON a.user_id = o.user_id
            WHERE o.delivery_date IS NOT NULL AND o.order_type = 'addon'
            ${dateFilterAddon}

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
                SET status = $1,
                    delivered_at = CASE WHEN $1 = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END,
                    failed_reason = $2
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
                a.house_number,
                a.street,
                a.area,
                a.city,
                a.pin_code,
                a.instructions as delivery_notes
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN addresses a ON a.user_id = o.user_id
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

export default router;
