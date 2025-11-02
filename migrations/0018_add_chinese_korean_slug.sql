-- Add Chinese (zh) and Korean (ko) language support + URL slugs
-- Adding columns for 4-language support: ja, en, zh, ko

-- Blog Posts: Add Chinese, Korean columns and slug (without UNIQUE constraint initially)
ALTER TABLE blog_posts ADD COLUMN title_zh TEXT;
ALTER TABLE blog_posts ADD COLUMN content_zh TEXT;
ALTER TABLE blog_posts ADD COLUMN title_ko TEXT;
ALTER TABLE blog_posts ADD COLUMN content_ko TEXT;
ALTER TABLE blog_posts ADD COLUMN slug TEXT;

-- Announcements: Add Chinese, Korean columns
ALTER TABLE announcements ADD COLUMN title_zh TEXT;
ALTER TABLE announcements ADD COLUMN content_zh TEXT;
ALTER TABLE announcements ADD COLUMN title_ko TEXT;
ALTER TABLE announcements ADD COLUMN content_ko TEXT;

-- Videos: Add multilingual title and description
ALTER TABLE videos ADD COLUMN title_en TEXT;
ALTER TABLE videos ADD COLUMN description_en TEXT;
ALTER TABLE videos ADD COLUMN title_zh TEXT;
ALTER TABLE videos ADD COLUMN description_zh TEXT;
ALTER TABLE videos ADD COLUMN title_ko TEXT;
ALTER TABLE videos ADD COLUMN description_ko TEXT;

-- Add indexes for better query performance (slug can have duplicates initially)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_zh ON blog_posts(title_zh);
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_ko ON blog_posts(title_ko);
CREATE INDEX IF NOT EXISTS idx_announcements_title_zh ON announcements(title_zh);
CREATE INDEX IF NOT EXISTS idx_announcements_title_ko ON announcements(title_ko);
CREATE INDEX IF NOT EXISTS idx_videos_title_en ON videos(title_en);
CREATE INDEX IF NOT EXISTS idx_videos_title_zh ON videos(title_zh);
CREATE INDEX IF NOT EXISTS idx_videos_title_ko ON videos(title_ko);
