-- Add genre column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN genre TEXT DEFAULT 'general';

-- Create index for genre filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_genre ON blog_posts(genre);

-- Update existing posts with genres based on their titles
UPDATE blog_posts SET genre = 'technique' WHERE title LIKE '%テクニック%' OR title LIKE '%技術%' OR title LIKE '%technique%';
UPDATE blog_posts SET genre = 'gear' WHERE title LIKE '%ギア%' OR title LIKE '%装備%' OR title LIKE '%gear%';
UPDATE blog_posts SET genre = 'training' WHERE title LIKE '%トレーニング%' OR title LIKE '%練習%' OR title LIKE '%training%';
UPDATE blog_posts SET genre = 'news' WHERE title LIKE '%ニュース%' OR title LIKE '%お知らせ%' OR title LIKE '%news%';
