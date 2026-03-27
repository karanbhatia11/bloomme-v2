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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                full_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                house_number TEXT NOT NULL,
                street TEXT NOT NULL,
                area TEXT NOT NULL,
                city TEXT NOT NULL,
                pin_code TEXT NOT NULL,
                instructions TEXT
            );

            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                plan_type TEXT NOT NULL,
                price DECIMAL NOT NULL,
                status TEXT DEFAULT 'active',
                delivery_days TEXT NOT NULL,
                custom_schedule JSONB,
                start_date DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS add_ons (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price DECIMAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS subscription_add_ons (
                id SERIAL PRIMARY KEY,
                subscription_id INTEGER REFERENCES subscriptions(id),
                add_on_id INTEGER REFERENCES add_ons(id),
                one_off_date DATE
            );

            CREATE TABLE IF NOT EXISTS deliveries (
                id SERIAL PRIMARY KEY,
                subscription_id INTEGER REFERENCES subscriptions(id),
                delivery_date DATE NOT NULL,
                status TEXT DEFAULT 'pending'
            );

            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                welcome_email_sent BOOLEAN DEFAULT FALSE,
                status TEXT DEFAULT 'active'
            );

            CREATE TABLE IF NOT EXISTS plans (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                tagline TEXT,
                price DECIMAL NOT NULL,
                image_url TEXT,
                features JSONB DEFAULT '[]',
                is_popular BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
