import pool from './db';

const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                referral_code TEXT UNIQUE,
                referral_points INTEGER DEFAULT 0,
                notifications JSONB DEFAULT '{"email":true,"sms":false,"push":true}',
                email_verified BOOLEAN DEFAULT FALSE,
                email_verification_token TEXT,
                email_verification_expires_at TIMESTAMP,
                password_reset_token TEXT,
                password_reset_expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                address TEXT,
                city TEXT,
                landmark TEXT,
                notes TEXT,
                time_slot TEXT DEFAULT '5:30 to 6:30',
                building_type TEXT DEFAULT 'house',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS plans (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                tagline TEXT,
                description TEXT,
                price DECIMAL NOT NULL,
                image_url TEXT,
                features JSONB DEFAULT '[]',
                is_popular BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS add_ons (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price DECIMAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS addresses (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL REFERENCES customers(id),
                address_line1 TEXT NOT NULL,
                address_line2 TEXT,
                suburb TEXT NOT NULL,
                postcode TEXT NOT NULL,
                delivery_notes TEXT,
                time_slot TEXT DEFAULT '5:30 to 6:30',
                building_type TEXT DEFAULT 'house',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                customer_id INTEGER REFERENCES customers(id),
                plan_id INTEGER REFERENCES plans(id),
                address_id INTEGER REFERENCES addresses(id),
                price DECIMAL NOT NULL,
                status TEXT DEFAULT 'active',
                delivery_days TEXT NOT NULL,
                custom_schedule JSONB,
                start_date DATE DEFAULT CURRENT_DATE,
                end_date DATE,
                pause_start_date DATE,
                pause_end_date DATE,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS subscription_add_ons (
                id SERIAL PRIMARY KEY,
                subscription_id INTEGER REFERENCES subscriptions(id),
                add_on_id INTEGER REFERENCES add_ons(id),
                one_off_date DATE
            );

            CREATE TABLE IF NOT EXISTS subscription_days (
                id SERIAL PRIMARY KEY,
                subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
                day_of_week TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS subscription_delivery_dates (
                id SERIAL PRIMARY KEY,
                subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
                delivery_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(subscription_id, delivery_date)
            );

            CREATE INDEX IF NOT EXISTS idx_subscription_delivery_dates_subscription_id ON subscription_delivery_dates(subscription_id);
            CREATE INDEX IF NOT EXISTS idx_subscription_delivery_dates_date ON subscription_delivery_dates(delivery_date);

            CREATE TABLE IF NOT EXISTS deliveries (
                id SERIAL PRIMARY KEY,
                subscription_id INTEGER REFERENCES subscriptions(id),
                delivery_date DATE NOT NULL,
                status TEXT DEFAULT 'pending',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS delivery_addons (
                id SERIAL PRIMARY KEY,
                delivery_id INTEGER NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
                addon_name TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS addon_delivery_dates (
                id SERIAL PRIMARY KEY,
                subscription_addon_id INTEGER NOT NULL REFERENCES subscription_add_ons(id) ON DELETE CASCADE,
                delivery_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(subscription_addon_id, delivery_date)
            );

            CREATE INDEX IF NOT EXISTS idx_addon_delivery_dates_subscription_addon_id ON addon_delivery_dates(subscription_addon_id);
            CREATE INDEX IF NOT EXISTS idx_addon_delivery_dates_date ON addon_delivery_dates(delivery_date);

            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                welcome_email_sent BOOLEAN DEFAULT FALSE,
                status TEXT DEFAULT 'active'
            );

            CREATE TABLE IF NOT EXISTS app_config (
                id SERIAL PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                value JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                image_url TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS subcategories (
                id SERIAL PRIMARY KEY,
                category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                price DECIMAL NOT NULL,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                customer_id INTEGER NOT NULL REFERENCES customers(id),
                razorpay_order_id TEXT UNIQUE,
                razorpay_payment_id TEXT,
                razorpay_signature TEXT,
                amount INTEGER NOT NULL,
                currency TEXT DEFAULT 'INR',
                status TEXT DEFAULT 'pending',
                order_type TEXT,
                promo_code TEXT,
                promo_discount DECIMAL DEFAULT 0,
                referral_discount DECIMAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                paid_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                item_type TEXT,
                item_id INTEGER,
                quantity INTEGER DEFAULT 1,
                price DECIMAL,
                schedule JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_add_ons (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                add_on_id INTEGER REFERENCES add_ons(id),
                quantity INTEGER DEFAULT 1,
                delivery_dates JSONB,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS referrals (
                id SERIAL PRIMARY KEY,
                referrer_id INTEGER REFERENCES users(id),
                referred_user_id INTEGER REFERENCES users(id),
                status TEXT DEFAULT 'pending',
                earned_amount DECIMAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS referral_withdrawals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                amount DECIMAL,
                method TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS page_content (
                id SERIAL PRIMARY KEY,
                page_name VARCHAR(100) NOT NULL,
                section_name VARCHAR(100) NOT NULL,
                display_order INTEGER DEFAULT 0,
                title TEXT,
                subtitle TEXT,
                description TEXT,
                image_url TEXT,
                cta_text VARCHAR(100),
                cta_link VARCHAR(255),
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(page_name, section_name)
            );

            CREATE INDEX IF NOT EXISTS idx_page_content_page_section ON page_content(page_name, section_name);

            -- Add customer_id to orders for guest checkout tracking
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id);

            -- Add schedule columns to order_items
            ALTER TABLE order_items ADD COLUMN IF NOT EXISTS schedule JSONB;
            ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_schedule_dates DATE[];

            -- Add email verification and password reset columns to users
            ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;

            -- Add columns to orders table for addon-only deliveries
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_slot VARCHAR(50);
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS failed_reason TEXT;

            -- Add columns to deliveries table
            ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

            CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_deliveries_subscription_date ON deliveries(subscription_id, delivery_date);

            -- Track delivery status for add-on items
            CREATE TABLE IF NOT EXISTS addon_delivery_status (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                addon_name TEXT NOT NULL,
                delivery_date DATE NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(order_id, addon_name, delivery_date)
            );

            -- Unique email constraint on customers (needed for upsert on checkout)
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'customers_email_unique'
                ) THEN
                    ALTER TABLE customers ADD CONSTRAINT customers_email_unique UNIQUE (email);
                END IF;
            END $$;

            -- Link customers to registered users
            ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
            CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
            CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

            -- One-time backfill: link existing customers to users by email
            UPDATE customers c
            SET user_id = u.id
            FROM users u
            WHERE LOWER(c.email) = LOWER(u.email)
              AND c.user_id IS NULL;

            -- Unified customer 360 view
            CREATE OR REPLACE VIEW customer_360 AS
            SELECT
                c.id                                                        AS customer_id,
                c.name,
                c.email,
                c.phone,
                c.user_id,
                c.building_type,
                c.time_slot,
                c.created_at                                                AS first_seen,
                CASE WHEN c.user_id IS NOT NULL THEN TRUE ELSE FALSE END    AS is_registered,
                COUNT(DISTINCT o.id)                                        AS total_orders,
                COUNT(DISTINCT CASE WHEN o.status = 'paid' THEN o.id END)   AS paid_orders,
                COALESCE(SUM(CASE WHEN o.status = 'paid' THEN o.amount ELSE 0 END), 0) AS total_spent_paise,
                COUNT(DISTINCT s.id)                                        AS total_subscriptions,
                COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) AS active_subscriptions,
                MAX(o.paid_at)                                              AS last_order_at
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.id
            LEFT JOIN subscriptions s ON s.user_id = c.user_id
            GROUP BY c.id;

            -- Initial App Config
            INSERT INTO app_config (key, value) VALUES ('site_mode', '{"mode": "coming_soon"}') ON CONFLICT (key) DO NOTHING;
        `);

        // Seed Initial Plans
        const plansCount = await pool.query('SELECT COUNT(*) FROM plans');
        if (parseInt(plansCount.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO plans (name, tagline, price, image_url, features, is_popular) VALUES
                ('BASIC', 'Traditional', 1499, '/images/basic.png', '["60–100g Fresh Marigolds", "3 Flower Varieties", "Eco Paper Bag Delivery"]', false),
                ('PREMIUM', 'Divine', 2699, '/images/premium.png', '["150g Premium Variety", "Rose & Jasmine Mix", "Delivered in Bloomme Box"]', true),
                ('ELITE', 'Celestial', 4499, '/images/elite.png', '["200g Exotic Offerings", "Lotus & Seasonal Specials", "Luxury Bloomme Box"]', false);
            `);
            console.log('Subscription plans seeded successfully');
        }

        // Seed Admin User
        const adminEmail = 'admin@gmail.com';
        const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
        if (adminCheck.rows.length === 0) {
            const importBcrypt = await import('bcrypt');
            const hashedPassword = await importBcrypt.default.hash('admin', 10);
            await pool.query(
                "INSERT INTO users (name, phone, email, password, role, referral_code) VALUES ($1, $2, $3, $4, $5, $6)",
                ['Admin', '0000000000', adminEmail, hashedPassword, 'admin', 'ADMIN001']
            );
            console.log('Admin user seeded successfully');
        }

        // Insert initial add_ons if table is empty
        const addOnsCount = await pool.query('SELECT COUNT(*) FROM add_ons');
        if (parseInt(addOnsCount.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO add_ons (name, price) VALUES
                ('Flower Mala', 30),
                ('Lotus', 15),
                ('Extra Flowers', 40),
                ('Agarbatti', 70),
                ('Camphor', 60),
                ('Cotton Batti', 45);
            `);
        }

        console.log('Database initialized successfully');
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database', err);
        await pool.end();
        process.exit(1);
    }
};

initDb();
