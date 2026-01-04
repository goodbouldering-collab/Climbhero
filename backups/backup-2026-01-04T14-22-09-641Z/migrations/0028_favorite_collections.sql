-- Favorite Collections Feature
-- Allows users to organize favorites into custom collections

-- Collections table
CREATE TABLE IF NOT EXISTS favorite_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT 'blue',
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Collection items (many-to-many relationship)
CREATE TABLE IF NOT EXISTS collection_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK(content_type IN ('video', 'blog', 'news')),
  content_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (collection_id) REFERENCES favorite_collections(id) ON DELETE CASCADE,
  UNIQUE(collection_id, content_type, content_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_user ON favorite_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_content ON collection_items(content_type, content_id);

-- Add tags column to favorites for better search
ALTER TABLE favorites ADD COLUMN tags TEXT;
ALTER TABLE blog_favorites ADD COLUMN tags TEXT;
ALTER TABLE news_favorites ADD COLUMN tags TEXT;

-- Add sort_order for custom ordering
ALTER TABLE favorites ADD COLUMN sort_order INTEGER DEFAULT 0;
ALTER TABLE blog_favorites ADD COLUMN sort_order INTEGER DEFAULT 0;
ALTER TABLE news_favorites ADD COLUMN sort_order INTEGER DEFAULT 0;
