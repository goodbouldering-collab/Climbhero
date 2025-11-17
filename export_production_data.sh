#!/bin/bash
echo "-- Export from production database on $(date)"
echo ""

# Export users
echo "-- Users"
npx wrangler d1 execute webapp-production --remote --command="SELECT * FROM users" --json 2>/dev/null | jq -r '.[] | .results[] | "INSERT OR IGNORE INTO users (id, email, username, password_hash, is_admin, membership_type, session_token, created_at) VALUES (\(.id), '\''\(.email)'\'', '\''\(.username)'\'', '\''\(.password_hash)'\'', \(.is_admin), '\''\(.membership_type)'\'', \(.session_token // "NULL"), '\''\(.created_at)'\'');"'

echo ""
echo "-- Videos"
# Export videos
npx wrangler d1 execute webapp-production --remote --command="SELECT * FROM videos LIMIT 30" --json 2>/dev/null | jq -r '.[] | .results[] | "INSERT OR IGNORE INTO videos (id, title, description, url, thumbnail_url, duration, channel_name, category, views, likes, created_at, media_source, title_en, title_zh, title_ko) VALUES (\(.id), '\''\(.title | gsub("'\''"; "'\'''\''"))'\'', '\''\(.description | gsub("'\''"; "'\'''\''"))'\'', '\''\(.url)'\'', '\''\(.thumbnail_url)'\'', '\''\(.duration)'\'', '\''\(.channel_name | gsub("'\''"; "'\'''\''"))'\'', '\''\(.category)'\'', \(.views), \(.likes), '\''\(.created_at)'\'', '\''\(.media_source)'\'', \(.title_en // "NULL" | if . == "NULL" then "NULL" else "'\''"+.+"'\''" end), \(.title_zh // "NULL" | if . == "NULL" then "NULL" else "'\''"+.+"'\''" end), \(.title_ko // "NULL" | if . == "NULL" then "NULL" else "'\''"+.+"'\''" end));"'

echo ""
echo "-- Blog Posts"
# Export blog posts
npx wrangler d1 execute webapp-production --remote --command="SELECT * FROM blog_posts" --json 2>/dev/null | jq -r '.[] | .results[] | "INSERT OR IGNORE INTO blog_posts (id, title, content, image_url, published_date, slug, title_en, content_en, title_zh, content_zh, title_ko, content_ko) VALUES (\(.id), '\''\(.title | gsub("'\''"; "'\'''\''"))'\'', '\''\(.content | gsub("'\''"; "'\'''\''"))'\'', '\''\(.image_url)'\'', '\''\(.published_date)'\'', '\''\(.slug)'\'', '\''\(.title_en | gsub("'\''"; "'\'''\''"))'\'', '\''\(.content_en | gsub("'\''"; "'\'''\''"))'\'', '\''\(.title_zh | gsub("'\''"; "'\'''\''"))'\'', '\''\(.content_zh | gsub("'\''"; "'\'''\''"))'\'', '\''\(.title_ko | gsub("'\''"; "'\'''\''"))'\'', '\''\(.content_ko | gsub("'\''"; "'\'''\''"))'\'');"'

echo ""
echo "-- Announcements"
# Export announcements
npx wrangler d1 execute webapp-production --remote --command="SELECT * FROM announcements" --json 2>/dev/null | jq -r '.[] | .results[] | "INSERT OR IGNORE INTO announcements (id, title, content, priority, is_active, created_at, title_en, content_en, title_zh, content_zh, title_ko, content_ko) VALUES (\(.id), '\''\(.title | gsub("'\''"; "'\'''\''"))'\'', '\''\(.content | gsub("'\''"; "'\'''\''"))'\'', '\''\(.priority)'\'', \(.is_active), '\''\(.created_at)'\'', '\''\(.title_en | gsub("'\''"; "'\'''\''"))'\'', '\''\(.content_en | gsub("'\''"; "'\'''\''"))'\'', '\''\(.title_zh | gsub("'\''"; "'\'''\''"))'\'', '\''\(.content_zh | gsub("'\''"; "'\'''\''"))'\'', '\''\(.title_ko | gsub("'\''"; "'\'''\''"))'\'', '\''\(.content_ko | gsub("'\''"; "'\'''\''"))'\'');"'

