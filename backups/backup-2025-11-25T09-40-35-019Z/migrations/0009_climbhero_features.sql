-- ClimbHero.info Feature Parity Migration
-- Adds tables for: posting limits, contests, safety guidelines, partners, video submissions

-- Video Submissions Table (URL-based posting with AI validation)
CREATE TABLE IF NOT EXISTS video_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  submitted_url TEXT NOT NULL,
  canonical_url TEXT,
  platform TEXT, -- youtube, vimeo, instagram, tiktok
  video_id_external TEXT, -- Platform's video ID
  title TEXT,
  description TEXT,
  duration INTEGER, -- seconds
  thumbnail_url TEXT,
  channel_name TEXT,
  
  -- AI Classification
  ai_genre TEXT, -- bouldering, lead, alpine, other
  ai_confidence REAL, -- 0.0 - 1.0
  ai_tags TEXT, -- JSON array of tags
  is_authentic INTEGER DEFAULT 1, -- AI authenticity check
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, removed
  moderation_reason TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  approved_at DATETIME,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON video_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON video_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON video_submissions(created_at);

-- Daily Posting Limits Tracking
CREATE TABLE IF NOT EXISTS posting_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  post_count INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 10, -- 10 for free, 30 for premium
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_posting_limits_user_date ON posting_limits(user_id, date);

-- Contests/Events Table
CREATE TABLE IF NOT EXISTS contests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  
  -- Prize Info
  prize_pool TEXT, -- e.g., "総額100万円"
  prize_breakdown TEXT, -- JSON with category prizes
  
  -- Categories
  categories TEXT, -- JSON array: ["pro", "amateur", "grade_based"]
  
  -- Dates
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  submission_deadline DATETIME NOT NULL,
  judging_start DATETIME,
  judging_end DATETIME,
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, active, judging, completed, cancelled
  is_public INTEGER DEFAULT 1,
  
  -- Metadata
  max_entries_per_user INTEGER DEFAULT 3,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_dates ON contests(start_date, end_date);

-- Contest Submissions
CREATE TABLE IF NOT EXISTS contest_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contest_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  video_id INTEGER, -- Link to videos table
  video_submission_id INTEGER, -- Or link to video_submissions
  category TEXT,
  
  -- Judging
  judge_score REAL DEFAULT 0,
  public_votes INTEGER DEFAULT 0,
  final_score REAL DEFAULT 0,
  rank INTEGER,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, disqualified, winner
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contest_id) REFERENCES contests(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (video_id) REFERENCES videos(id),
  UNIQUE(contest_id, user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_contest_submissions_contest ON contest_submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_user ON contest_submissions(user_id);

-- Contest Votes (Public Voting)
CREATE TABLE IF NOT EXISTS contest_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contest_id INTEGER NOT NULL,
  submission_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  score INTEGER DEFAULT 1, -- 1-5 stars
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contest_id) REFERENCES contests(id),
  FOREIGN KEY (submission_id) REFERENCES contest_submissions(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(submission_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_contest_votes_submission ON contest_votes(submission_id);

-- Safety Guidelines
CREATE TABLE IF NOT EXISTS safety_guidelines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  pdf_url TEXT, -- Link to downloadable PDF
  version TEXT, -- e.g., "1.0"
  
  -- Categories
  category TEXT, -- filming, outdoor_safety, gym_etiquette, etc.
  
  -- Status
  is_active INTEGER DEFAULT 1,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_safety_guidelines_active ON safety_guidelines(is_active);

-- Partner Gyms/Locations
CREATE TABLE IF NOT EXISTS partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'gym', -- gym, outdoor_area, sponsor
  
  -- Location
  address TEXT,
  city TEXT,
  prefecture TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Japan',
  latitude REAL,
  longitude REAL,
  
  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Details
  description TEXT,
  logo_url TEXT,
  features TEXT, -- JSON array
  
  -- Partnership
  partner_since DATETIME,
  status TEXT DEFAULT 'pending', -- pending, active, inactive
  allows_filming INTEGER DEFAULT 1,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_prefecture ON partners(prefecture);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);

-- Partner Videos (Track which videos were filmed at partner locations)
CREATE TABLE IF NOT EXISTS partner_videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id INTEGER NOT NULL,
  video_id INTEGER NOT NULL,
  verified INTEGER DEFAULT 0, -- Partner verified this was filmed at their location
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (partner_id) REFERENCES partners(id),
  FOREIGN KEY (video_id) REFERENCES videos(id),
  UNIQUE(partner_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_videos_partner ON partner_videos(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_videos_video ON partner_videos(video_id);

-- Ad Display Tracking (for free users)
CREATE TABLE IF NOT EXISTS ad_impressions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  ad_type TEXT, -- banner, video_pre_roll, sidebar
  ad_content TEXT,
  video_id INTEGER, -- If ad shown on video page
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (video_id) REFERENCES videos(id)
);

CREATE INDEX IF NOT EXISTS idx_ad_impressions_user ON ad_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_created ON ad_impressions(created_at);

-- Update videos table to add uploader tracking and metadata
ALTER TABLE videos ADD COLUMN uploader_id INTEGER;
ALTER TABLE videos ADD COLUMN platform TEXT;
ALTER TABLE videos ADD COLUMN video_id_external TEXT;
ALTER TABLE videos ADD COLUMN posted_date DATETIME;

-- Update users table to add premium membership expiry
ALTER TABLE users ADD COLUMN membership_expires DATETIME;
ALTER TABLE users ADD COLUMN subscription_type TEXT; -- monthly, annual

-- Seed initial safety guideline
INSERT INTO safety_guidelines (title, content, summary, category, version, is_active)
VALUES (
  '安全な撮影のためのガイドライン',
  'クライミング動画の撮影時には以下の点に注意してください：

1. 安全第一
   - 常に安全を最優先にしてください
   - 他のクライマーの邪魔にならないように配慮してください
   - 撮影機材は確実に固定してください

2. 撮影許可
   - ジムでの撮影は必ず事前に許可を取ってください
   - 他の人が映り込む場合は許可を得てください
   - 自然保護地域では規則を確認してください

3. 機材管理
   - 落下防止のため、機材は必ず固定してください
   - 他のクライマーの動線を妨げない場所に設置してください
   - バッテリーや記録メディアの残量を確認してください

4. マナー
   - 大声での指示は避けてください
   - 撮影に夢中になりすぎず、周囲に注意を払ってください
   - ジムの混雑時は撮影を控えめにしてください',
  'クライミング撮影時の安全とマナーに関する基本ガイドライン',
  'filming',
  '1.0',
  1
);
