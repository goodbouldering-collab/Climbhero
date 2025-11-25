#!/usr/bin/env node

/**
 * Sample Data Verification Script
 * Verifies that all required sample data exists in the database
 */

import { spawn } from 'child_process';

const REQUIRED_PLATFORMS = ['youtube', 'youtube_shorts', 'vimeo', 'instagram', 'tiktok', 'x'];
const MIN_VIDEOS_PER_PLATFORM = 1;
const MIN_BLOG_POSTS = 5;
const MIN_NEWS_ARTICLES = 5;
const MIN_ANNOUNCEMENTS = 2;

async function executeD1Query(query, isRemote = false) {
  return new Promise((resolve, reject) => {
    const args = ['d1', 'execute', 'webapp-production'];
    if (isRemote) {
      args.push('--remote');
    } else {
      args.push('--local');
    }
    args.push('--command', query);

    const child = spawn('npx', ['wrangler', ...args], {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Query failed: ${stderr}`));
      } else {
        try {
          // Parse JSON output from wrangler
          const jsonMatch = stdout.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const results = JSON.parse(jsonMatch[0]);
            resolve(results[0]?.results || []);
          } else {
            resolve([]);
          }
        } catch (err) {
          reject(new Error(`Failed to parse results: ${err.message}`));
        }
      }
    });
  });
}

async function verifyVideos(isRemote = false) {
  console.log('\n📹 Verifying video samples...');
  
  const query = 'SELECT platform, COUNT(*) as count FROM videos GROUP BY platform';
  const results = await executeD1Query(query, isRemote);
  
  const platformCounts = {};
  results.forEach(row => {
    platformCounts[row.platform] = row.count;
  });
  
  let allPlatformsPresent = true;
  REQUIRED_PLATFORMS.forEach(platform => {
    const count = platformCounts[platform] || 0;
    const status = count >= MIN_VIDEOS_PER_PLATFORM ? '✅' : '❌';
    console.log(`  ${status} ${platform}: ${count} video(s)`);
    if (count < MIN_VIDEOS_PER_PLATFORM) {
      allPlatformsPresent = false;
    }
  });
  
  return allPlatformsPresent;
}

async function verifyBlogPosts(isRemote = false) {
  console.log('\n📝 Verifying blog posts...');
  
  const query = 'SELECT COUNT(*) as count FROM blog_posts';
  const results = await executeD1Query(query, isRemote);
  
  const count = results[0]?.count || 0;
  const status = count >= MIN_BLOG_POSTS ? '✅' : '❌';
  console.log(`  ${status} Blog posts: ${count} (minimum: ${MIN_BLOG_POSTS})`);
  
  return count >= MIN_BLOG_POSTS;
}

async function verifyNewsArticles(isRemote = false) {
  console.log('\n📰 Verifying news articles...');
  
  const query = 'SELECT COUNT(*) as count FROM news_articles';
  const results = await executeD1Query(query, isRemote);
  
  const count = results[0]?.count || 0;
  const status = count >= MIN_NEWS_ARTICLES ? '✅' : '❌';
  console.log(`  ${status} News articles: ${count} (minimum: ${MIN_NEWS_ARTICLES})`);
  
  return count >= MIN_NEWS_ARTICLES;
}

async function verifyAnnouncements(isRemote = false) {
  console.log('\n📢 Verifying announcements...');
  
  const query = 'SELECT COUNT(*) as count FROM announcements';
  const results = await executeD1Query(query, isRemote);
  
  const count = results[0]?.count || 0;
  const status = count >= MIN_ANNOUNCEMENTS ? '✅' : '❌';
  console.log(`  ${status} Announcements: ${count} (minimum: ${MIN_ANNOUNCEMENTS})`);
  
  return count >= MIN_ANNOUNCEMENTS;
}

async function main() {
  const isRemote = process.argv.includes('--remote');
  const envType = isRemote ? 'PRODUCTION' : 'LOCAL';
  
  console.log(`\n🔍 Verifying sample data in ${envType} database...\n`);
  console.log('=' .repeat(60));
  
  try {
    const [videosOk, blogsOk, newsOk, announcementsOk] = await Promise.all([
      verifyVideos(isRemote),
      verifyBlogPosts(isRemote),
      verifyNewsArticles(isRemote),
      verifyAnnouncements(isRemote)
    ]);
    
    console.log('\n' + '='.repeat(60));
    
    if (videosOk && blogsOk && newsOk && announcementsOk) {
      console.log('\n✅ All sample data verified successfully!\n');
      process.exit(0);
    } else {
      console.log('\n❌ Some sample data is missing. Run the following commands:\n');
      if (!videosOk) {
        console.log('  npm run db:seed:videos' + (isRemote ? ' -- --remote' : ''));
      }
      if (!newsOk) {
        console.log('  npm run db:seed:news' + (isRemote ? ' -- --remote' : ''));
      }
      console.log('');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error verifying sample data:', error.message);
    process.exit(1);
  }
}

main();
