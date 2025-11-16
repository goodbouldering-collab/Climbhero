-- Migration: Add genre to announcements
-- Description: Add genre field for filtering announcements

ALTER TABLE announcements ADD COLUMN genre TEXT DEFAULT 'general';
-- Possible genres: 'feature', 'maintenance', 'event', 'campaign', 'general'

CREATE INDEX IF NOT EXISTS idx_announcements_genre ON announcements(genre);
