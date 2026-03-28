-- Create page_content table for managing text and images by sections and pages
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_content_page_section ON page_content(page_name, section_name);

-- Insert initial content from homepage_content
INSERT INTO page_content (page_name, section_name, title, subtitle, description, image_url, cta_text, cta_link)
SELECT 'home', section, title, subtitle, description, image_url, cta_text, cta_link
FROM homepage_content
ON CONFLICT (page_name, section_name) DO NOTHING;
