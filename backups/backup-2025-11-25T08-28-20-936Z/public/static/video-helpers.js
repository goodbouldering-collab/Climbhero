// ============ Video Platform Helper Functions ============

/**
 * Get proper thumbnail URL for different video platforms
 */
function getVideoThumbnail(video) {
  // Auto-detect media source from URL if not provided
  const mediaSource = video.media_source || detectMediaSource(video.url);
  
  // If video already has a thumbnail_url, use it
  if (video.thumbnail_url && video.thumbnail_url.startsWith('http')) {
    return video.thumbnail_url;
  }
  
  // Generate thumbnail based on platform
  switch (mediaSource) {
    case 'youtube':
    case 'youtube_shorts':
      const youtubeId = extractYouTubeId(video.url);
      if (youtubeId) {
        // Use hqdefault (always available) instead of maxresdefault (sometimes missing)
        return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
      }
      break;
      
    case 'vimeo':
      // Vimeo requires API call for thumbnail, use placeholder or stored URL
      if (video.thumbnail_url) return video.thumbnail_url;
      return 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop&q=80';
      
    case 'tiktok':
      // TikTok doesn't provide direct thumbnail access, use placeholder
      return 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop&q=80';
      
    case 'instagram':
      // Instagram doesn't provide direct thumbnail access, use placeholder
      return 'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=600&h=400&fit=crop&q=80';
      
    default:
      return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop&q=80';
  }
  
  return video.thumbnail_url || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop&q=80';
}

/**
 * Auto-detect media source from URL
 */
function detectMediaSource(url) {
  if (!url) return 'youtube';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    if (url.includes('/shorts/')) {
      return 'youtube_shorts';
    }
    return 'youtube';
  } else if (url.includes('vimeo.com')) {
    return 'vimeo';
  } else if (url.includes('tiktok.com')) {
    return 'tiktok';
  } else if (url.includes('instagram.com')) {
    return 'instagram';
  }
  
  return 'youtube'; // Default
}

/**
 * Get app deep link URL for mobile platforms
 */
function getAppDeepLink(video) {
  const mediaSource = video.media_source || detectMediaSource(video.url);
  
  switch (mediaSource) {
    case 'tiktok':
      // TikTok deep link format: tiktok://video/{video_id}
      const tiktokId = video.url.match(/\/video\/(\d+)/)?.[1];
      if (tiktokId) {
        // Return custom protocol that will attempt app first, fallback to web
        return `tiktok://video/${tiktokId}`;
      }
      break;
      
    case 'instagram':
      // Instagram deep link format: instagram://media?id={media_id}
      // For Reels: extract the shortcode
      if (video.url.includes('/reel/')) {
        const reelMatch = video.url.match(/\/reel\/([^\/\?]+)/);
        if (reelMatch && reelMatch[1]) {
          return `instagram://reel?id=${reelMatch[1]}`;
        }
      }
      // For posts
      if (video.url.includes('/p/')) {
        const postMatch = video.url.match(/\/p\/([^\/\?]+)/);
        if (postMatch && postMatch[1]) {
          return `instagram://media?id=${postMatch[1]}`;
        }
      }
      break;
  }
  
  return null;
}

/**
 * Get proper embed URL for video modal
 */
function getVideoEmbedUrl(video) {
  // Auto-detect media source if not provided
  const mediaSource = video.media_source || detectMediaSource(video.url);
  
  switch (mediaSource) {
    case 'youtube':
    case 'youtube_shorts':
      const youtubeId = extractYouTubeId(video.url);
      if (youtubeId) {
        return `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`;
      }
      break;
      
    case 'vimeo':
      const vimeoId = video.url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (vimeoId) {
        return `https://player.vimeo.com/video/${vimeoId}?autoplay=0`;
      }
      break;
      
    case 'tiktok':
      const tiktokId = video.url.match(/\/video\/(\d+)/)?.[1];
      if (tiktokId) {
        return `https://www.tiktok.com/embed/v2/${tiktokId}`;
      }
      break;
      
    case 'instagram':
      // Instagram Reels embed
      if (video.url.includes('/reel/')) {
        // Remove trailing slash if exists
        const cleanUrl = video.url.replace(/\/$/, '');
        return `${cleanUrl}/embed`;
      }
      // Instagram post embed
      if (video.url.includes('/p/')) {
        const cleanUrl = video.url.replace(/\/$/, '');
        return `${cleanUrl}/embed`;
      }
      break;
  }
  
  return null;
}

/**
 * Check if video can be embedded in iframe
 */
function canEmbedVideo(video) {
  const mediaSource = video.media_source || 'youtube';
  
  // YouTube and Vimeo can always be embedded
  if (mediaSource === 'youtube' || mediaSource === 'youtube_shorts' || mediaSource === 'vimeo') {
    return true;
  }
  
  // TikTok embed works but may have restrictions
  if (mediaSource === 'tiktok') {
    return true;
  }
  
  // Instagram Reels can be embedded
  if (mediaSource === 'instagram' && video.url.includes('/reel/')) {
    return true;
  }
  
  return false;
}

/**
 * Get media platform icon
 */
function getMediaIcon(mediaSource) {
  const icons = {
    'youtube': 'fab fa-youtube',
    'youtube_shorts': 'fab fa-youtube',
    'vimeo': 'fab fa-vimeo',
    'tiktok': 'fab fa-tiktok',
    'instagram': 'fab fa-instagram'
  };
  return icons[mediaSource] || 'fas fa-video';
}

/**
 * Get media platform name
 */
function getMediaName(mediaSource) {
  const names = {
    'youtube': 'YouTube',
    'youtube_shorts': 'YouTube Shorts',
    'vimeo': 'Vimeo',
    'tiktok': 'TikTok',
    'instagram': 'Instagram'
  };
  return names[mediaSource] || 'Video';
}

/**
 * Get media platform color for badges
 */
function getMediaColor(mediaSource) {
  const colors = {
    'youtube': '#FF0000',
    'youtube_shorts': '#FF0000',
    'vimeo': '#1AB7EA',
    'tiktok': '#000000',
    'instagram': '#E1306C'
  };
  return colors[mediaSource] || '#667eea';
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/v\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Render video embed with enhanced support for all platforms
 */
function renderEnhancedVideoEmbed(video) {
  // Auto-detect media source from URL if not provided
  const mediaSource = video.media_source || detectMediaSource(video.url);
  
  // TikTok and Instagram: Show thumbnail with play button (external link with deep link support)
  if (mediaSource === 'tiktok' || mediaSource === 'instagram') {
    const thumbnailUrl = getVideoThumbnail(video);
    const deepLink = getAppDeepLink(video);
    const linkUrl = deepLink || video.url; // Fallback to web URL if deep link not available
    
    // Mobile app opening strategy:
    // - On mobile devices with app installed: Deep link opens app directly
    // - On mobile without app: Browser prompts to install or opens web version
    // - On desktop: Opens web version in new tab
    const openVideoLink = deepLink 
      ? `onclick="openInApp('${deepLink}', '${video.url}'); return false;"` 
      : '';
    
    return `
      <div class="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
        <img src="${thumbnailUrl}" 
             alt="${video.title}" 
             class="absolute inset-0 w-full h-full object-cover"
             onerror="this.src='https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&q=80'">
        <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center space-y-4 z-10">
          <div class="w-20 h-20 rounded-full bg-white bg-opacity-90 flex items-center justify-center mb-4 hover:bg-opacity-100 transition-all transform hover:scale-110">
            <i class="fas fa-play text-4xl text-gray-800 ml-1"></i>
          </div>
          <p class="text-white text-lg font-semibold">${getMediaName(mediaSource)}で視聴</p>
          <a href="${linkUrl}" target="_blank" rel="noopener noreferrer" 
             ${openVideoLink}
             class="btn btn-primary px-8 py-3 text-base hover:scale-105 transform transition-all shadow-lg">
            <i class="${getMediaIcon(mediaSource)} mr-2"></i>
            ${deepLink ? `${getMediaName(mediaSource)}アプリで開く` : `${getMediaName(mediaSource)}で開く`}
          </a>
          <p class="text-sm text-gray-300">※ ${deepLink ? 'アプリがインストールされている場合は直接開きます' : '外部サイトで再生されます'}</p>
        </div>
      </div>
    `;
  }
  
  // YouTube and Vimeo: iframe embed
  const embedUrl = getVideoEmbedUrl(video);
  
  if (!embedUrl) {
    // Fallback if embed URL cannot be generated
    return `
      <div class="flex flex-col items-center justify-center h-full text-white space-y-4">
        <i class="${getMediaIcon(mediaSource)} text-6xl mb-4" style="color: ${getMediaColor(mediaSource)}"></i>
        <p class="text-lg font-semibold">${getMediaName(mediaSource)}で視聴</p>
        <a href="${video.url}" target="_blank" rel="noopener noreferrer" 
           class="btn btn-primary px-8 py-3 text-lg">
          <i class="fas fa-external-link-alt mr-2"></i>
          ${getMediaName(mediaSource)}で開く
        </a>
        <p class="text-sm text-gray-400">※ この動画は外部サイトで再生されます</p>
      </div>
    `;
  }
  
  // Common iframe attributes for YouTube and Vimeo
  let iframeAttrs = `
    class="w-full h-full rounded-lg"
    frameborder="0"
    allowfullscreen
  `;
  
  // Platform-specific iframe configuration
  if (mediaSource === 'youtube' || mediaSource === 'youtube_shorts') {
    // YouTube: Standard embed with 16:9 aspect ratio
    iframeAttrs += `
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
    `;
  } else if (mediaSource === 'vimeo') {
    // Vimeo: Standard embed
    iframeAttrs += `
      allow="autoplay; fullscreen; picture-in-picture"
    `;
  }
  
  return `<iframe src="${embedUrl}" ${iframeAttrs}></iframe>`;
}

/**
 * Get platform badge HTML
 */
function getPlatformBadge(mediaSource) {
  const color = getMediaColor(mediaSource);
  const icon = getMediaIcon(mediaSource);
  const name = getMediaName(mediaSource);
  
  return `
    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium" 
          style="background-color: ${color}20; color: ${color};">
      <i class="${icon} mr-1"></i>
      ${name}
    </span>
  `;
}
