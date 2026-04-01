import pool from './src/db';

const seedHomeContent = async () => {
    try {
        console.log('Starting home page content seeding...');

        const pages = [
            // HOME PAGE - HERO SECTION
            {
                page_name: 'home',
                section_name: 'hero',
                title: 'Daily Fresh Puja Flowers & Essentials Delivered at Your Doorsteps.',
                subtitle: 'Fresh puja flowers & essentials delivered before sunrise - every single day.',
                description: '',
                image_url: '/images/Hero Section background.png',
                cta_text: 'YOUR DAILY DEVOTION, STARTING FROM ONLY ₹49/DAY',
                cta_link: '/plans',
                display_order: 1,
                metadata: {
                    type: 'hero',
                    social_proof: 'Join 100 families who start every morning with Bloomme',
                    background_image: '/images/Hero Section background.png'
                }
            },
            // HOME PAGE - HOW IT WORKS (A RITUAL OF FRESHNESS)
            {
                page_name: 'home',
                section_name: 'how-it-works',
                title: 'A Simple Daily Ritual',
                subtitle: 'From our garden to your sanctuary in four mindful steps.',
                description: '',
                image_url: '',
                cta_text: '',
                cta_link: '',
                display_order: 2,
                metadata: {
                    type: 'ritual-cards',
                    cards: [
                        {
                            icon: 'potted_plant',
                            title: 'Curated Sourcing',
                            description: 'Daily hand-picked selections from local artisan florists.'
                        },
                        {
                            icon: 'inventory_2',
                            title: 'Eco-Packaging',
                            description: 'Wrapped in biodegradable banana leaf and paper layers.'
                        },
                        {
                            icon: 'electric_moped',
                            title: 'Dawn Delivery',
                            description: 'Guaranteed doorstep delivery before your morning puja.'
                        },
                        {
                            icon: 'temple_hindu',
                            title: 'Divine Offering',
                            description: 'Transform your home into a fragrant, spiritual haven.'
                        }
                    ]
                }
            },
            // HOME PAGE - FESTIVAL MODE
            {
                page_name: 'home',
                section_name: 'festival-mode',
                title: 'Celestial Celebrations',
                subtitle: 'Festival Mode: Never Miss a Ritual',
                description: '',
                image_url: '',
                cta_text: '',
                cta_link: '',
                display_order: 3,
                metadata: {
                    type: 'festival-carousel',
                    carousel_items: [
                        {
                            name: 'Gudi Padwa / Ugadi',
                            subtitle: 'Hindu New Year',
                            date: '📅 9 April 2026',
                            description: 'Celebrate the beginning of a prosperous new year with fresh malas, vibrant flowers, and auspicious puja essentials. Perfect for welcoming positivity, new beginnings, and festive home decorations.',
                            image: '/images/Festivals/Gudi Padwa celebration offerings and decorations.png',
                            bestFor: ['New year puja setups', 'Home entrance decor', 'Festive subscriptions']
                        },
                        {
                            name: 'Hanuman Jayanti',
                            date: '📅 19 April 2026',
                            description: 'Offer devotion with marigold malas, sindoor, diyas, and sacred puja items dedicated to Lord Hanuman. Ideal for temple offerings, home puja, and strength-focused spiritual rituals.',
                            image: '/images/Festivals/Serene Hanuman Jayanti devotion setup.png',
                            bestFor: ['Marigold malas', 'Sindoor kits', 'Incense', 'Diya sets']
                        },
                        {
                            name: 'Akshaya Tritiya',
                            date: '📅 27 April 2026',
                            description: 'A highly auspicious day symbolizing prosperity, abundance, and new purchases. Perfect for premium puja arrangements, lotus flowers, and complete spiritual setups for wealth and blessings.',
                            image: '/images/Festivals/Akshaya Tritiya celebration with gold offerings.png',
                            bestFor: ['Premium Celestial plan', 'Full puja kits', 'Prosperity rituals']
                        },
                        {
                            name: 'Buddha Purnima',
                            date: '📅 1 May 2026',
                            description: 'A peaceful celebration focused on mindfulness, calmness, and spiritual reflection. Soft lotus flowers, diyas, and incense create a serene environment for meditation and prayer.',
                            image: '/images/Festivals/Buddha Purnima celebration with serene offerings.png',
                            bestFor: ['Lotus flowers', 'Calm puja setups', 'Meditation offerings']
                        }
                    ]
                }
            },
            // HOME PAGE - FEATURES (DESIGNED FOR DEVOTION)
            {
                page_name: 'home',
                section_name: 'features',
                title: 'Designed for Devotion',
                subtitle: '',
                description: '',
                image_url: '',
                cta_text: '',
                cta_link: '',
                display_order: 4,
                metadata: {
                    type: 'features-grid',
                    main_card: {
                        label: 'THE BLOOMME STANDARD',
                        title: 'Delivered Before\nThe First Prayer',
                        description: 'Our specialized logistics team ensures your flowers arrive between 5:30 AM and 7:30 AM, every single day.',
                        images: [
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuAJaEDDG5IdcBC-JTn1Im19MuTahFSHRgcgpcFCt9NUg8-wbo4x-ap1WBcQJUATgMdyIl2OO8j_osLqz226EqrjrC6zkqRJTIr1kDWKViqlMaBqg6k5Frv6vuCVZt7VdbVxQWI8JeYLYRVRr1IQAeZXHbq2q0Hl2X-YBC9SZtcFn_oWmIKjUMNpP62_K3eJfZXlg9_uZVa6yaHmsMxaXzv5vWFp3fL3t39V_ZOU-I4sW5PMOxmCED3C7390S9P4vGznK3VV8AcXtpUm',
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuBcPYWEfoe1WE388z2NE69MMaXWpU1iPKpHrs0Vol8M_abMSoV9Q_cJcKd7qFDMiK5hEGpnMwvbndr_cXwAxizzze1d1opFYpMIVA8ia3s_FH49cg5Hxi3Z5Ot5dHPWDndP9Ui_ICX4x7KMTmyuNDoKjFScvs1M1_39EGpOiw71ghWlGJbaCUJHT2BMX4H3toTZvQaRkfebr4PVOWzMDYrGPMYPxacJiTeCi0BzEErGHXXgbukulXNmDaqcdoyk95A0XAQgelkchBeC',
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuB-8Vvzd2Xx3c8ju93HjA4gPOAFSXVeHSRoAoG2zPfB9Rlh_rp8vAB33fDFUKyI94hvjJQ90aIBzynD6haHC3KDdes_fs-Vjhc7hrXbHMox1VUJNu9nTKJk6_rnKXQUoACkEliuItPVLeDfZVPiorKu2hdvVaFRZKKoAd4z3RJjMSEddo6xzk_AQCTmZ3Wikj8Q7ENW9SNtSe9NV9zCWwtfo9UPj8X30qhqbEwfsdvVFpxPEIn-ajau3SoQ5oSEr3q6l0dxudo3xuXL'
                        ]
                    },
                    feature_cards: [
                        {
                            icon: 'pause_circle',
                            title: 'Pause Anytime',
                            description: 'Going on a vacation? Pause your subscription with a single tap in the app. No questions asked.',
                            background_color: '#6b5b3d',
                            background_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJaEDDG5IdcBC-JTn1Im19MuTahFSHRgcgpcFCt9NUg8-wbo4x-ap1WBcQJUATgMdyIl2OO8j_osLqz226EqrjrC6zkqRJTIr1kDWKViqlMaBqg6k5Frv6vuCVZt7VdbVxQWI8JeYLYRVRr1IQAeZXHbq2q0Hl2X-YBC9SZtcFn_oWmIKjUMNpP62_K3eJfZXlg9_uZVa6yaHmsMxaXzv5vWFp3fL3t39V_ZOU-I4sW5PMOxmCED3C7390S9P4vGznK3VV8AcXtpUm'
                        },
                        {
                            icon: 'settings_suggest',
                            title: 'Full Control',
                            description: 'Manage your calendar, billing, and flower preferences in one place.',
                            background_color: '#2f1500',
                            background_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcPYWEfoe1WE388z2NE69MMaXWpU1iPKpHrs0Vol8M_abMSoV9Q_cJcKd7qFDMiK5hEGpnMwvbndr_cXwAxizzze1d1opFYpMIVA8ia3s_FH49cg5Hxi3Z5Ot5dHPWDndP9Ui_ICX4x7KMTmyuNDoKjFScvs1M1_39EGpOiw71ghWlGJbaCUJHT2BMX4H3toTZvQaRkfebr4PVOWzMDYrGPMYPxacJiTeCi0BzEErGHXXgbukulXNmDaqcdoyk95A0XAQgelkchBeC'
                        },
                        {
                            icon: 'shopping_bag',
                            title: 'Custom Add-ons',
                            description: 'Need extra Ghee or Incense this Tuesday? Add it to your next box effortlessly.',
                            background_color: '#4a3728',
                            background_image: ''
                        },
                        {
                            icon: 'celebration',
                            title: 'Festival Specials',
                            description: 'Auto-upgrades for major festivals.',
                            background_color: '#3d2f1f',
                            background_image: ''
                        }
                    ]
                }
            },
            // ABOUT PAGE - HERO SECTION
            {
                page_name: 'about',
                section_name: 'hero',
                title: 'More than just arrangements.',
                subtitle: 'Crafting Devotion',
                description: 'At Bloomme, we believe flowers are a silent language of the soul. We curate botanical experiences that bridge tradition and modern elegance.',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbPchiGMM45_qQyJbBdhsOj02PEo8KNhZYKiZ5hAF2RrH74Wb3gjoiWpWAmLnfVqNmW5yVBgwRsXU9ZT0EUpFfuA8lF94DPUp8-5FdLAWbvClwE9b5OH2yb8bbF0QBjagIO7vF1iqHA6SrTfNzoFnMZ5vOM9qpRMRTtNPouJ4wS9uM_skkUWjXxvEK7kTx0rUIYv3F-sGl-LUqkegZNy6XQXZLRaiU52btZDSNX0sW_VZQQyqN5jyRVE-cInNKxufmHldvLd-mz-kL',
                cta_text: '',
                cta_link: '',
                display_order: 1,
                metadata: {
                    type: 'about-hero',
                    since: 'Since 2012',
                    secondary_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmuJSsl2nCgozTNhhHsVC5LzpWPUKYE6-N8YueZ6UqZ4o1Tp5aJ_RIrWiFAenOfHSnClcmWl2ng4f8JWBXNdIvSMkEIeERC2wMk0mbCsXR-7CxUQ_6ftXYsIhTe_qMNwmtehPtuyP_447nqz6NgPNf4WWKqXRqOUBegDm7YadNHGRvmj8YQ48xX6J9KjJavx1GnVHA325IXb3umto_of8MIvML_-S9Zc9Ce-p3mG5mpmB2OTykw9flXflvf3vgylPysvZh4TAuDC-M'
                }
            },
            // ABOUT PAGE - OUR STORY SECTION
            {
                page_name: 'about',
                section_name: 'our-story',
                title: 'Our Story',
                subtitle: '',
                description: 'It began in a small backyard in the outskirts, with nothing but a handful of heirloom seeds and a vision to bring meaningful beauty back into the daily ritual of gifting. Today, Bloomme has grown into a premier floral atelier, yet our heart remains in that garden. We hand-pick every stem, ensuring that the devotion we put into our craft is felt in every delivery.',
                image_url: '',
                cta_text: '',
                cta_link: '',
                display_order: 2,
                metadata: {
                    type: 'story',
                    quote: 'We don\'t just sell flowers; we facilitate moments of connection that transcend words.',
                    mission: 'To nurture the bond between nature and human emotion through conscious, artistic floristry.',
                    stats: [
                        { number: '5000+', label: 'Families Served' },
                        { number: '12', label: 'Years of Craft' }
                    ]
                }
            },
            // ABOUT PAGE - VALUES SECTION
            {
                page_name: 'about',
                section_name: 'values',
                title: 'Rooted in Purpose',
                subtitle: 'The pillars that define the Bloomme experience.',
                description: '',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkiE3cSJuD5LxWveSo1NfyQRiY0dRhl6yhANWSj1yUFEBGjUbjUw0zQDyK3FD3pIqg-x5R8AnTg-mW1Ul9-NpQu005_AU59n-wTsRaONTsDdz5p-WKS0JGUXHVe9W1Oxbh-5da2Ms_v-P9cx7T7hz0xBj4XODbJBf3p9bnWSTciSXWMsd5_gYsfb9ptXoht4QvLGtn7FGzpvnqO9UFeD6jmPrRzWXQtjMlMh8IN_sn9uriz382JW5yW8QL4EW0__gQrZR6juxOEurz',
                cta_text: '',
                cta_link: '',
                display_order: 3,
                metadata: {
                    type: 'values-grid',
                    values: [
                        {
                            icon: '🌿',
                            title: 'Purity',
                            description: 'Every bloom is sourced from organic growers, ensuring that what enters your home is as clean as nature intended. No harsh chemicals, just pure botanical life.',
                            span: '2'
                        },
                        {
                            icon: '🛕',
                            title: 'Tradition',
                            description: 'Honoring ceremonial practices with specialized arrangements for sacred rituals.'
                        },
                        {
                            icon: '♻️',
                            title: 'Sustainability',
                            description: '100% plastic-free packaging and zero-waste studio operations.'
                        },
                        {
                            icon: '👥',
                            title: 'Community',
                            description: 'We support local artisanal growers and donate 5% of all proceeds to urban greening projects. We are part of the earth we inhabit.',
                            span: '4'
                        }
                    ]
                }
            },
            // ABOUT PAGE - CTA SECTION
            {
                page_name: 'about',
                section_name: 'cta',
                title: 'Bring the Atelier Home',
                subtitle: 'Join our circle of flower enthusiasts and receive weekly botanical inspiration and exclusive seasonal drops.',
                description: '',
                image_url: '',
                cta_text: 'Start Subscription',
                cta_link: '/plans',
                display_order: 4,
                metadata: {
                    type: 'cta-section',
                    buttons: [
                        { text: 'Start Subscription', link: '/plans', variant: 'primary' },
                        { text: 'Explore Collections', link: '/products', variant: 'secondary' }
                    ]
                }
            },
            // CONTACT PAGE - HERO
            {
                page_name: 'contact',
                section_name: 'hero',
                title: 'Get In Touch',
                subtitle: 'We\'d love to hear from you',
                description: 'Have questions about our flowers or subscriptions? Drop us a message and we\'ll get back to you shortly.',
                image_url: '',
                cta_text: '',
                cta_link: '',
                display_order: 1,
                metadata: {
                    type: 'contact-intro',
                    phone: '9950707995',
                    email: 'info@bloomme.co.in',
                    whatsapp: '919950707995'
                }
            }
        ];

        // Insert all pages
        let inserted = 0;
        for (const page of pages) {
            try {
                await pool.query(
                    `INSERT INTO page_content (page_name, section_name, title, subtitle, description, image_url, cta_text, cta_link, display_order, metadata)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     ON CONFLICT (page_name, section_name) DO UPDATE SET
                     title = $3, subtitle = $4, description = $5, image_url = $6, cta_text = $7, cta_link = $8, display_order = $9, metadata = $10, updated_at = CURRENT_TIMESTAMP`,
                    [
                        page.page_name,
                        page.section_name,
                        page.title,
                        page.subtitle,
                        page.description,
                        page.image_url,
                        page.cta_text,
                        page.cta_link,
                        page.display_order,
                        JSON.stringify(page.metadata)
                    ]
                );
                inserted++;
            } catch (err: any) {
                console.error(`Error inserting ${page.page_name}/${page.section_name}:`, err.message);
            }
        }

        console.log(`✓ Successfully seeded ${inserted} page content entries`);
        await pool.end();
        process.exit(0);
    } catch (err: any) {
        console.error('Error seeding content:', err.message);
        await pool.end();
        process.exit(1);
    }
};

seedHomeContent();
