-- Create homepage_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS homepage_content (
    id SERIAL PRIMARY KEY,
    section VARCHAR(100) UNIQUE NOT NULL,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default sections
INSERT INTO homepage_content (section, title, subtitle, description) VALUES
('hero', 'Daily Fresh Puja Flowers & Essentials', 'Delivered at Your Doorsteps', 'Fresh puja flowers & essentials delivered before sunrise - every single day.'),
('how_it_works', 'How It Works', 'Simple Steps to Fresh Flowers', 'Choose your plan, customize your flowers, and we deliver to your doorstep every morning.'),
('pricing', 'Plans for Everyone', 'Choose What Works For You', 'From daily essential flowers to premium festival collections, we have options for every devotee.'),
('festival_mode', 'Festival Collections', 'Celebrate with Divine Flowers', 'Special flower arrangements for Diwali, Holi, Navratri, and all your spiritual celebrations.'),
('features', 'Why Choose Bloomme', 'Fresh. Reliable. Spiritual.', 'We bring freshness, purity, and devotion to your daily worship with premium flower collections.'),
('social_proof', 'Loved by Devotees', 'Thousands of Happy Customers', 'Join thousands who trust us for their daily spiritual needs with fresh, quality flowers.')
ON CONFLICT (section) DO NOTHING;
