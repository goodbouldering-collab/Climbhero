-- ============================================
-- Update Video Rankings for Testing
-- Different scores for Daily/Weekly/Monthly/Yearly/Total
-- ============================================

-- Video 1: High daily, moderate weekly/monthly
UPDATE video_rankings SET
  daily_score = 15,
  weekly_score = 45,
  monthly_score = 120,
  yearly_score = 500,
  total_score = 1200,
  last_updated = datetime('now')
WHERE video_id = 1;

-- Video 2: Moderate all periods
UPDATE video_rankings SET
  daily_score = 8,
  weekly_score = 30,
  monthly_score = 85,
  yearly_score = 380,
  total_score = 950,
  last_updated = datetime('now')
WHERE video_id = 2;

-- Video 3: High monthly, low daily
UPDATE video_rankings SET
  daily_score = 3,
  weekly_score = 12,
  monthly_score = 150,
  yearly_score = 600,
  total_score = 1500,
  last_updated = datetime('now')
WHERE video_id = 3;

-- Video 4: High weekly, moderate others
UPDATE video_rankings SET
  daily_score = 6,
  weekly_score = 55,
  monthly_score = 100,
  yearly_score = 420,
  total_score = 1100,
  last_updated = datetime('now')
WHERE video_id = 4;

-- Video 5: Very high daily
UPDATE video_rankings SET
  daily_score = 20,
  weekly_score = 38,
  monthly_score = 95,
  yearly_score = 450,
  total_score = 1050,
  last_updated = datetime('now')
WHERE video_id = 5;

-- Video 6: High yearly, low daily
UPDATE video_rankings SET
  daily_score = 2,
  weekly_score = 8,
  monthly_score = 40,
  yearly_score = 650,
  total_score = 1600,
  last_updated = datetime('now')
WHERE video_id = 6;

-- Video 7: Balanced scores
UPDATE video_rankings SET
  daily_score = 10,
  weekly_score = 35,
  monthly_score = 90,
  yearly_score = 480,
  total_score = 1150,
  last_updated = datetime('now')
WHERE video_id = 7;

-- Video 8: High total, low recent
UPDATE video_rankings SET
  daily_score = 1,
  weekly_score = 5,
  monthly_score = 25,
  yearly_score = 200,
  total_score = 1800,
  last_updated = datetime('now')
WHERE video_id = 8;

-- Video 9: High monthly and yearly
UPDATE video_rankings SET
  daily_score = 7,
  weekly_score = 28,
  monthly_score = 140,
  yearly_score = 580,
  total_score = 1350,
  last_updated = datetime('now')
WHERE video_id = 9;

-- Video 10: Moderate daily, high weekly
UPDATE video_rankings SET
  daily_score = 12,
  weekly_score = 50,
  monthly_score = 110,
  yearly_score = 510,
  total_score = 1250,
  last_updated = datetime('now')
WHERE video_id = 10;

-- Video 11-15: Lower scores for variety
UPDATE video_rankings SET
  daily_score = 5,
  weekly_score = 18,
  monthly_score = 55,
  yearly_score = 300,
  total_score = 800,
  last_updated = datetime('now')
WHERE video_id BETWEEN 11 AND 15;

-- Video 16-20: Even lower scores
UPDATE video_rankings SET
  daily_score = 3,
  weekly_score = 10,
  monthly_score = 35,
  yearly_score = 180,
  total_score = 550,
  last_updated = datetime('now')
WHERE video_id BETWEEN 16 AND 20;

-- Video 21-25: Minimal scores
UPDATE video_rankings SET
  daily_score = 1,
  weekly_score = 4,
  monthly_score = 15,
  yearly_score = 100,
  total_score = 320,
  last_updated = datetime('now')
WHERE video_id BETWEEN 21 AND 25;
