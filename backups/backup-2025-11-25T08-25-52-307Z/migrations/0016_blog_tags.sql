-- Add tags support for blog posts
-- Blog Tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blog Post Tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS blog_post_tags (
  blog_post_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blog_post_id, tag_id),
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_name ON blog_tags(name);

-- Insert some default tags for climbing content
INSERT OR IGNORE INTO blog_tags (name) VALUES 
  ('ボルダリング'),
  ('リードクライミング'),
  ('コンペ'),
  ('トレーニング'),
  ('テクニック'),
  ('ジムレビュー'),
  ('岩場情報'),
  ('ギア'),
  ('初心者向け'),
  ('上級者向け');
