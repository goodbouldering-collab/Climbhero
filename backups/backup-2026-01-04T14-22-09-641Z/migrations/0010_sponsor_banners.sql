-- Sponsor Banners Table
-- Stores promotional banners that can be displayed at top and bottom of the site

CREATE TABLE IF NOT EXISTS sponsor_banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL CHECK(position IN ('top', 'bottom')),
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  start_date DATETIME,
  end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup of active banners by position
CREATE INDEX IF NOT EXISTS idx_sponsor_banners_active ON sponsor_banners(is_active, position, display_order);

-- Index for date filtering
CREATE INDEX IF NOT EXISTS idx_sponsor_banners_dates ON sponsor_banners(start_date, end_date);

-- Insert sample sponsor banners
INSERT INTO sponsor_banners (title, image_url, link_url, position, is_active, display_order, start_date, end_date) VALUES
('Climbing Gear Sale', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&h=200&fit=crop&q=80', 'https://example.com/gear-sale', 'top', 1, 1, datetime('now'), datetime('now', '+30 days')),
('Outdoor Adventure Festival', 'https://images.unsplash.com/photo-1591020702719-2e5a938b32ff?w=1200&h=200&fit=crop&q=80', 'https://example.com/festival', 'bottom', 1, 1, datetime('now'), datetime('now', '+60 days'));
