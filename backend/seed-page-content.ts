import pool from './src/db';

const seedPageContent = async () => {
    try {
        console.log('Starting page_content seeding...');

        // Check if page_content table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_name = 'page_content'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.error('page_content table does not exist! Run init-db.ts first.');
            await pool.end();
            process.exit(1);
        }

        // Clear existing content (optional - comment out if you want to keep existing data)
        // await pool.query('DELETE FROM page_content');

        // Seed initial content for different pages
        const pages = [
            {
                page_name: 'home',
                section_name: 'hero',
                title: 'Fresh Flowers Every Week',
                subtitle: 'Premium floral subscriptions delivered to your door',
                description: 'Bloomme brings you the freshest flowers every week, carefully curated and sustainably sourced.',
                image_url: '/images/hero-flowers.jpg',
                cta_text: 'Subscribe Now',
                cta_link: '/plans',
                display_order: 1
            },
            {
                page_name: 'home',
                section_name: 'features',
                title: 'Why Choose Bloomme?',
                subtitle: 'Experience the difference',
                description: 'Fresh seasonal flowers, eco-friendly packaging, and reliable weekly deliveries.',
                image_url: '/images/features.jpg',
                cta_text: 'Learn More',
                cta_link: '#features',
                display_order: 2
            },
            {
                page_name: 'home',
                section_name: 'plans',
                title: 'Our Subscription Plans',
                subtitle: 'Choose what works best for you',
                description: 'From basic arrangements to premium exotic flowers, we have a plan for everyone.',
                image_url: '/images/plans.jpg',
                cta_text: 'View Plans',
                cta_link: '/plans',
                display_order: 3
            },
            {
                page_name: 'about',
                section_name: 'story',
                title: 'Our Story',
                subtitle: 'Blooming since 2023',
                description: 'Bloomme was founded with a simple mission: to bring the beauty of fresh flowers into every home, sustainably and affordably.',
                image_url: '/images/about-story.jpg',
                cta_text: 'Read More',
                cta_link: '#story',
                display_order: 1
            },
            {
                page_name: 'about',
                section_name: 'mission',
                title: 'Our Mission',
                subtitle: 'Sustainability & Beauty',
                description: 'We believe in supporting local farmers while delivering premium quality flowers with minimal environmental impact.',
                image_url: '/images/mission.jpg',
                cta_text: 'Our Values',
                cta_link: '#values',
                display_order: 2
            },
            {
                page_name: 'contact',
                section_name: 'intro',
                title: 'Get In Touch',
                subtitle: 'We\'d love to hear from you',
                description: 'Have questions about our flowers or subscriptions? Drop us a message and we\'ll get back to you shortly.',
                image_url: '/images/contact-intro.jpg',
                cta_text: null,
                cta_link: null,
                display_order: 1
            },
            {
                page_name: 'contact',
                section_name: 'form',
                title: 'Contact Form',
                subtitle: 'Send us your message',
                description: 'Fill out the form below and our team will respond within 24 hours.',
                image_url: null,
                cta_text: 'Send Message',
                cta_link: null,
                display_order: 2
            },
            {
                page_name: 'faq',
                section_name: 'intro',
                title: 'Frequently Asked Questions',
                subtitle: 'Find answers to common questions',
                description: 'Learn more about our subscriptions, delivery, and policies.',
                image_url: null,
                cta_text: null,
                cta_link: null,
                display_order: 1
            },
            {
                page_name: 'plans',
                section_name: 'hero',
                title: 'Choose Your Perfect Plan',
                subtitle: 'Flexible subscriptions tailored to you',
                description: 'Select from our three carefully curated subscription plans.',
                image_url: '/images/plans-hero.jpg',
                cta_text: 'Get Started',
                cta_link: '/signup',
                display_order: 1
            }
        ];

        // Insert all pages
        let inserted = 0;
        for (const page of pages) {
            try {
                await pool.query(
                    `INSERT INTO page_content (page_name, section_name, title, subtitle, description, image_url, cta_text, cta_link, display_order)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     ON CONFLICT (page_name, section_name) DO UPDATE SET
                     title = $3, subtitle = $4, description = $5, image_url = $6, cta_text = $7, cta_link = $8, display_order = $9`,
                    [page.page_name, page.section_name, page.title, page.subtitle, page.description, page.image_url, page.cta_text, page.cta_link, page.display_order]
                );
                inserted++;
            } catch (err: any) {
                console.error(`Error inserting ${page.page_name}/${page.section_name}:`, err.message);
            }
        }

        console.log(`✓ Successfully seeded ${inserted} page content entries`);

        // Verify the data
        const result = await pool.query('SELECT DISTINCT page_name FROM page_content ORDER BY page_name');
        console.log(`✓ Pages in database:`, result.rows.map(r => r.page_name).join(', '));

        await pool.end();
        process.exit(0);
    } catch (err: any) {
        console.error('Error seeding page_content:', err.message);
        await pool.end();
        process.exit(1);
    }
};

seedPageContent();
