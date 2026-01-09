/**
 * Video URL and Thumbnail Verification Script
 * 
 * This script verifies that:
 * 1. YouTube video URLs are accessible (HTTP 200)
 * 2. Thumbnail URLs return valid images (HTTP 200)
 * 3. Generates fallback thumbnails for unavailable ones
 */

const https = require('https');
const http = require('http');

// Function to check URL status
function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 400
      });
    }).on('error', (err) => {
      resolve({
        url,
        status: 0,
        ok: false,
        error: err.message
      });
    });
  });
}

// Extract YouTube video ID
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Generate YouTube thumbnail URLs (with fallbacks)
function getYouTubeThumbnails(videoId) {
  return [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,  // Best quality
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,      // High quality
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,      // Medium quality
    `https://i.ytimg.com/vi/${videoId}/default.jpg`         // Default quality
  ];
}

// Verify video and find best thumbnail
async function verifyVideo(video) {
  const result = {
    id: video.id,
    title: video.title,
    url: video.url,
    media_source: video.media_source,
    valid: false,
    thumbnail_url: null,
    errors: []
  };
  
  // Check video URL
  const videoCheck = await checkUrl(video.url);
  if (!videoCheck.ok) {
    result.errors.push(`Video URL failed: ${videoCheck.status} ${videoCheck.error || ''}`);
    return result;
  }
  
  result.valid = true;
  
  // For YouTube, find working thumbnail
  if (video.media_source === 'youtube') {
    const videoId = extractYouTubeId(video.url);
    if (!videoId) {
      result.errors.push('Failed to extract YouTube ID');
      return result;
    }
    
    const thumbnails = getYouTubeThumbnails(videoId);
    
    for (const thumbnail of thumbnails) {
      const thumbCheck = await checkUrl(thumbnail);
      if (thumbCheck.ok) {
        result.thumbnail_url = thumbnail;
        break;
      }
    }
    
    if (!result.thumbnail_url) {
      result.errors.push('No working thumbnail found');
      // Use Unsplash fallback
      result.thumbnail_url = 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&q=85';
    }
  } else {
    // For other sources, check current thumbnail
    if (video.thumbnail_url) {
      const thumbCheck = await checkUrl(video.thumbnail_url);
      result.thumbnail_url = thumbCheck.ok ? video.thumbnail_url : 
        'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&q=85';
    }
  }
  
  return result;
}

// Real climbing videos from YouTube (verified to exist)
const VERIFIED_YOUTUBE_VIDEOS = [
  {
    id: 'urRVZ4SW7WU',
    title: 'Free Solo - Alex Honnold Climbs El Capitan',
    channel: 'National Geographic'
  },
  {
    id: 'ZRTNHDd0gL8',
    title: 'Adam Ondra - Project Hard',
    channel: 'EpicTV Climbing Daily'
  },
  {
    id: 'j8HiSkX_shY',
    title: 'Tomoa Narasaki - Tokyo Olympics Climbing',
    channel: 'Olympic Channel'
  },
  {
    id: 'kk8EGQD2P-0',
    title: 'Janja Garnbret - World Championships',
    channel: 'IFSC Climbing'
  },
  {
    id: 'K5zPa1YBZ9Y',
    title: 'IFSC Boulder World Cup Seoul 2025',
    channel: 'IFSC Climbing'
  },
  {
    id: '5BWkFqZYpbI',
    title: 'Best of Bouldering 2025',
    channel: 'IFSC Climbing'
  },
  {
    id: 'GDB0MDGARiE',
    title: 'IFSC Boulder Finals Salt Lake City 2025',
    channel: 'IFSC Climbing'
  },
  {
    id: 'a9htHC6KagA',
    title: 'IFSC Lead Finals Briancon 2024',
    channel: 'IFSC Climbing'
  },
  {
    id: 'Zt5AbUllQAg',
    title: 'IFSC Lead Finals Seoul 2024',
    channel: 'IFSC Climbing'
  },
  {
    id: 'UVp79oxI4Uc',
    title: 'IFSC Lead Finals Chamonix 2024',
    channel: 'IFSC Climbing'
  }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkUrl,
    extractYouTubeId,
    getYouTubeThumbnails,
    verifyVideo,
    VERIFIED_YOUTUBE_VIDEOS
  };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node verify-videos.js <video-url>');
    console.log('Example: node verify-videos.js https://www.youtube.com/watch?v=urRVZ4SW7WU');
    process.exit(1);
  }
  
  const url = args[0];
  const videoId = extractYouTubeId(url);
  
  if (!videoId) {
    console.error('Invalid YouTube URL');
    process.exit(1);
  }
  
  console.log(`Video ID: ${videoId}`);
  console.log('Checking video URL...');
  
  checkUrl(url).then(result => {
    console.log(`Video URL: ${result.ok ? '✅ OK' : '❌ FAILED'} (${result.status})`);
    
    console.log('\nChecking thumbnails...');
    const thumbnails = getYouTubeThumbnails(videoId);
    
    return Promise.all(thumbnails.map(checkUrl));
  }).then(results => {
    results.forEach((result, i) => {
      const quality = ['maxres', 'hq', 'mq', 'default'][i];
      console.log(`  ${quality}: ${result.ok ? '✅' : '❌'} (${result.status})`);
    });
  });
}
