-- Rename OpenAI API key columns to Gemini API key
-- This migration changes all OpenAI references to Gemini for AI analysis

-- For SQLite compatibility, we add new columns and copy data

-- Update user_settings table
ALTER TABLE user_settings ADD COLUMN gemini_api_key TEXT;
UPDATE user_settings SET gemini_api_key = openai_api_key WHERE openai_api_key IS NOT NULL;

-- Update news_crawler_settings table  
ALTER TABLE news_crawler_settings ADD COLUMN gemini_api_key TEXT;
UPDATE news_crawler_settings SET gemini_api_key = openai_api_key WHERE openai_api_key IS NOT NULL;
