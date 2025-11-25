-- Add multilingual support for blog posts and announcements
-- Adding English columns for title and content

-- Blog Posts: Add English columns
ALTER TABLE blog_posts ADD COLUMN title_en TEXT;
ALTER TABLE blog_posts ADD COLUMN content_en TEXT;

-- Announcements: Add English columns
ALTER TABLE announcements ADD COLUMN title_en TEXT;
ALTER TABLE announcements ADD COLUMN content_en TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_en ON blog_posts(title_en);
CREATE INDEX IF NOT EXISTS idx_announcements_title_en ON announcements(title_en);
