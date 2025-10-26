// State
let currentPage = 1;
let currentCategory = 'all';
let currentUserId = 1; // Demo user ID

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadVideos();
  loadBlogPosts();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Upload form
  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleUpload);
  }

  // Load more button
  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      loadVideos(true);
    });
  }
}

// Filter videos by category
function filterVideos(category) {
  currentCategory = category;
  currentPage = 1;
  
  // Update button styles
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('bg-purple-600', 'text-white');
    btn.classList.add('bg-gray-200', 'text-gray-700');
  });
  event.target.classList.remove('bg-gray-200', 'text-gray-700');
  event.target.classList.add('bg-purple-600', 'text-white');
  
  loadVideos();
}

// Load videos
async function loadVideos(append = false) {
  try {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12',
      category: currentCategory
    });

    const response = await axios.get(`/api/videos?${params}`);
    const { videos, pagination } = response.data;

    const videoGrid = document.getElementById('video-grid');
    
    if (!append) {
      videoGrid.innerHTML = '';
    }

    videos.forEach(video => {
      const videoCard = createVideoCard(video);
      videoGrid.appendChild(videoCard);
    });

    // Hide load more button if no more pages
    const loadMoreBtn = document.getElementById('load-more');
    if (currentPage >= pagination.totalPages) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }

  } catch (error) {
    console.error('Error loading videos:', error);
    showNotification('動画の読み込みに失敗しました', 'error');
  }
}

// Create video card element
function createVideoCard(video) {
  const card = document.createElement('div');
  card.className = 'video-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer';
  
  const categoryColors = {
    bouldering: 'bg-blue-500',
    competition: 'bg-red-500',
    tutorial: 'bg-green-500',
    gym_review: 'bg-yellow-500'
  };

  const categoryNames = {
    bouldering: 'ボルダリング',
    competition: '競技',
    tutorial: 'チュートリアル',
    gym_review: 'ジムレビュー'
  };

  card.innerHTML = `
    <div class="relative">
      <img src="${video.thumbnail_url || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400'}" 
           alt="${video.title}" 
           class="w-full h-48 object-cover">
      ${video.duration ? `<span class="duration-badge">${video.duration}</span>` : ''}
    </div>
    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="category-badge ${categoryColors[video.category] || 'bg-gray-500'} text-white">
          ${categoryNames[video.category] || video.category}
        </span>
        <div class="flex items-center space-x-3 text-gray-600">
          <button onclick="toggleLike(${video.id}, event)" class="hover:text-red-500 transition">
            <i class="far fa-heart"></i> ${video.likes || 0}
          </button>
          <button onclick="toggleFavorite(${video.id}, event)" class="hover:text-yellow-500 transition">
            <i class="far fa-star"></i>
          </button>
        </div>
      </div>
      <h4 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">${video.title}</h4>
      <p class="text-sm text-gray-600 mb-2">${video.channel_name || 'Unknown Channel'}</p>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span><i class="fas fa-eye mr-1"></i>${formatNumber(video.views || 0)}</span>
        <span>${formatDate(video.created_at)}</span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    window.open(video.url, '_blank');
  });

  return card;
}

// Toggle like
async function toggleLike(videoId, event) {
  event.stopPropagation();
  try {
    const response = await axios.post(`/api/videos/${videoId}/like`, {
      user_id: currentUserId
    });

    const button = event.currentTarget;
    const icon = button.querySelector('i');
    
    if (response.data.liked) {
      icon.classList.remove('far');
      icon.classList.add('fas', 'text-red-500');
      showNotification('いいねしました！', 'success');
    } else {
      icon.classList.remove('fas', 'text-red-500');
      icon.classList.add('far');
      showNotification('いいねを取り消しました', 'info');
    }

    // Reload to update count
    loadVideos();
  } catch (error) {
    console.error('Error toggling like:', error);
    showNotification('エラーが発生しました', 'error');
  }
}

// Toggle favorite
async function toggleFavorite(videoId, event) {
  event.stopPropagation();
  try {
    const response = await axios.post(`/api/videos/${videoId}/favorite`, {
      user_id: currentUserId
    });

    const button = event.currentTarget;
    const icon = button.querySelector('i');
    
    if (response.data.favorited) {
      icon.classList.remove('far');
      icon.classList.add('fas', 'text-yellow-500');
      showNotification('お気に入りに追加しました！', 'success');
    } else {
      icon.classList.remove('fas', 'text-yellow-500');
      icon.classList.add('far');
      showNotification('お気に入りから削除しました', 'info');
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    showNotification('エラーが発生しました', 'error');
  }
}

// Handle upload
async function handleUpload(event) {
  event.preventDefault();

  const url = document.getElementById('video-url').value;
  const title = document.getElementById('video-title').value;
  const description = document.getElementById('video-description').value;
  const category = document.getElementById('video-category').value;

  try {
    // Extract video ID from URL (YouTube example)
    let thumbnailUrl = '';
    let duration = '';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        duration = '00:00'; // Would need YouTube API for actual duration
      }
    }

    const response = await axios.post('/api/videos', {
      title,
      description,
      url,
      thumbnail_url: thumbnailUrl,
      duration,
      channel_name: 'User Upload',
      category
    });

    showNotification('動画を投稿しました！', 'success');
    event.target.reset();
    
    // Reload videos
    currentPage = 1;
    loadVideos();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    console.error('Error uploading video:', error);
    showNotification('投稿に失敗しました。もう一度お試しください。', 'error');
  }
}

// Load blog posts
async function loadBlogPosts() {
  try {
    const response = await axios.get('/api/blog');
    const posts = response.data;

    const blogGrid = document.getElementById('blog-grid');
    blogGrid.innerHTML = '';

    posts.slice(0, 3).forEach(post => {
      const postCard = createBlogCard(post);
      blogGrid.appendChild(postCard);
    });

  } catch (error) {
    console.error('Error loading blog posts:', error);
  }
}

// Create blog card element
function createBlogCard(post) {
  const card = document.createElement('div');
  card.className = 'bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition';
  
  card.innerHTML = `
    <img src="${post.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'}" 
         alt="${post.title}" 
         class="w-full h-48 object-cover">
    <div class="p-6">
      <p class="text-sm text-gray-500 mb-2">${formatDate(post.published_date)}</p>
      <h4 class="text-xl font-bold text-gray-800 mb-3">${post.title}</h4>
      <p class="text-gray-600 mb-4 line-clamp-3">${post.content}</p>
      <a href="#" class="text-purple-600 font-bold hover:underline">続きを読む →</a>
    </div>
  `;

  return card;
}

// Utility functions
function extractYouTubeId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今日';
  } else if (diffDays === 1) {
    return '昨日';
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}週間前`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  } else {
    return date.toLocaleDateString('ja-JP');
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
