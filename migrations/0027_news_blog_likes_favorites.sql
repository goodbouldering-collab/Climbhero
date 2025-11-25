-- Migration: Add likes and favorites for news articles and blog posts
-- Enable users to like and favorite news and blog content

-- ============ News Article Likes ============
CREATE TABLE IF NOT EXISTS news_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE,
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_news_likes_user ON news_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_news_likes_article ON news_likes(article_id);

-- ============ News Article Favorites ============
CREATE TABLE IF NOT EXISTS news_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE,
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_news_favorites_user ON news_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_news_favorites_article ON news_favorites(article_id);

-- ============ Blog Post Likes ============
CREATE TABLE IF NOT EXISTS blog_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_likes_user ON blog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post ON blog_likes(post_id);

-- ============ Blog Post Favorites ============
CREATE TABLE IF NOT EXISTS blog_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_favorites_user ON blog_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_favorites_post ON blog_favorites(post_id);

-- Add like count columns to news_articles
ALTER TABLE news_articles ADD COLUMN like_count INTEGER DEFAULT 0;

-- Add like count columns to blog_posts (if not exists)
-- Note: Check if column exists before adding
-- SQLite doesn't have IF NOT EXISTS for ALTER TABLE, so we use a different approach
