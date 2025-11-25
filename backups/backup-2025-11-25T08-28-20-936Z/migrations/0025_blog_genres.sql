-- Create blog_genres table for managing blog genres
CREATE TABLE IF NOT EXISTS blog_genres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  name_zh TEXT,
  name_ko TEXT,
  icon TEXT DEFAULT 'fas fa-folder',
  color TEXT DEFAULT 'purple',
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_blog_genres_active ON blog_genres(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_genres_order ON blog_genres(display_order);

-- Insert default genres
INSERT INTO blog_genres (name, name_en, name_zh, name_ko, icon, color, display_order) VALUES
('テクニック', 'Technique', '技术', '기술', 'fas fa-graduation-cap', 'blue', 1),
('ギア', 'Gear', '装备', '장비', 'fas fa-tshirt', 'green', 2),
('トレーニング', 'Training', '训练', '훈련', 'fas fa-dumbbell', 'red', 3),
('ニュース', 'News', '新闻', '뉴스', 'fas fa-newspaper', 'orange', 4),
('一般', 'General', '常规', '일반', 'fas fa-info-circle', 'gray', 5);
