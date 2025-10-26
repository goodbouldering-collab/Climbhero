// ============ State Management ============
const state = {
  currentUser: null,
  currentPage: 'home',
  videos: [],
  currentCategory: 'all',
  page: 1,
  loading: false
};

// ============ Initialize App ============
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  router();
  
  // Handle browser back/forward
  window.addEventListener('popstate', router);
  
  // Handle all link clicks
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      navigateTo(href);
    }
  });
});

// ============ Router ============
function router() {
  const path = window.location.pathname;
  const hash = window.location.hash;
  
  if (path === '/' && !hash) {
    renderHomePage();
  } else if (hash === '#rankings') {
    renderRankingsPage();
  } else if (hash === '#mypage') {
    if (!state.currentUser) {
      showAuthModal('login');
      navigateTo('/');
    } else {
      renderMyPage();
    }
  } else if (hash === '#blog') {
    renderBlogPage();
  } else if (hash.startsWith('#blog/')) {
    const blogId = hash.split('/')[1];
    renderBlogDetailPage(blogId);
  } else if (hash === '#upload') {
    if (!state.currentUser) {
      showAuthModal('login');
      navigateTo('/');
    } else {
      document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    renderHomePage();
  }
}

function navigateTo(path) {
  window.history.pushState(null, null, path);
  router();
}

// ============ Authentication ============
async function checkAuth() {
  try {
    const response = await axios.get('/api/auth/me');
    state.currentUser = response.data;
    updateAuthUI();
  } catch (error) {
    state.currentUser = null;
    updateAuthUI();
  }
}

function updateAuthUI() {
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  
  if (state.currentUser) {
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'block';
      userMenu.innerHTML = `
        <span class="text-gray-700 mr-3">${state.currentUser.username}</span>
        <button onclick="showMyPageMenu(event)" class="text-purple-600 hover:text-purple-700">
          <i class="fas fa-user-circle text-2xl"></i>
        </button>
      `;
    }
  } else {
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }
}

function showMyPageMenu(e) {
  e.stopPropagation();
  const menu = document.createElement('div');
  menu.className = 'absolute right-0 top-12 bg-white shadow-lg rounded-lg py-2 z-50 w-48';
  menu.innerHTML = `
    <a href="#mypage" data-link class="block px-4 py-2 hover:bg-gray-100">
      <i class="fas fa-user mr-2"></i>マイページ
    </a>
    <a href="#blog/new" data-link class="block px-4 py-2 hover:bg-gray-100">
      <i class="fas fa-pen mr-2"></i>ブログ投稿
    </a>
    <button onclick="logout()" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
      <i class="fas fa-sign-out-alt mr-2"></i>ログアウト
    </button>
  `;
  
  document.body.appendChild(menu);
  
  setTimeout(() => {
    document.addEventListener('click', function removeMenu() {
      menu.remove();
      document.removeEventListener('click', removeMenu);
    });
  }, 0);
}

async function logout() {
  try {
    await axios.post('/api/auth/logout');
    state.currentUser = null;
    updateAuthUI();
    showNotification('ログアウトしました', 'info');
    navigateTo('/');
  } catch (error) {
    showNotification('エラーが発生しました', 'error');
  }
}

// ============ Auth Modal ============
function showAuthModal(mode = 'login') {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">${mode === 'login' ? 'ログイン' : '新規登録'}</h2>
        <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      
      <form id="auth-form" class="space-y-4">
        ${mode === 'register' ? `
          <div>
            <label class="block text-gray-700 font-bold mb-2">ユーザー名</label>
            <input type="text" name="username" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
          </div>
        ` : ''}
        
        <div>
          <label class="block text-gray-700 font-bold mb-2">メールアドレス</label>
          <input type="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
        </div>
        
        <div>
          <label class="block text-gray-700 font-bold mb-2">パスワード</label>
          <input type="password" name="password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
        </div>
        
        <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
          ${mode === 'login' ? 'ログイン' : '登録'}
        </button>
      </form>
      
      <div class="mt-4 text-center">
        <button onclick="switchAuthMode('${mode === 'login' ? 'register' : 'login'}')" class="text-purple-600 hover:underline">
          ${mode === 'login' ? 'アカウントをお持ちでない方' : 'すでにアカウントをお持ちの方'}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(endpoint, data);
      
      state.currentUser = response.data.user;
      updateAuthUI();
      closeModal();
      showNotification(`${mode === 'login' ? 'ログイン' : '登録'}しました！`, 'success');
      router();
    } catch (error) {
      showNotification(error.response?.data?.error || 'エラーが発生しました', 'error');
    }
  });
}

function switchAuthMode(mode) {
  closeModal();
  setTimeout(() => showAuthModal(mode), 100);
}

function closeModal() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => modal.remove());
}

// ============ Home Page ============
function renderHomePage() {
  state.currentPage = 'home';
  const root = document.getElementById('root');
  
  root.innerHTML = `
    <!-- Header -->
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3 cursor-pointer" onclick="navigateTo('/')">
            <i class="fas fa-mountain text-purple-600 text-3xl"></i>
            <h1 class="text-2xl font-bold text-gray-800">ClimbHero</h1>
          </div>
          
          <nav class="hidden md:flex space-x-6">
            <a href="/" data-link class="text-gray-700 hover:text-purple-600 transition">ホーム</a>
            <a href="#rankings" data-link class="text-gray-700 hover:text-purple-600 transition">ランキング</a>
            <a href="#upload" data-link class="text-gray-700 hover:text-purple-600 transition">動画投稿</a>
            <a href="#blog" data-link class="text-gray-700 hover:text-purple-600 transition">ブログ</a>
          </nav>
          
          <div class="flex items-center space-x-4">
            <div id="auth-buttons" class="hidden md:flex space-x-3">
              <button onclick="showAuthModal('login')" class="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition">
                ログイン
              </button>
              <button onclick="showAuthModal('register')" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                新規登録
              </button>
            </div>
            
            <div id="user-menu" class="hidden md:flex items-center relative">
              <!-- User menu will be inserted here -->
            </div>
            
            <button onclick="toggleMobileMenu()" class="md:hidden text-gray-700">
              <i class="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div id="mobile-menu-overlay" class="mobile-menu-overlay" onclick="toggleMobileMenu()"></div>
    <div id="mobile-menu" class="mobile-menu">
      <div class="mb-6">
        <button onclick="toggleMobileMenu()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      
      <nav class="space-y-4">
        <a href="/" data-link class="block text-gray-700 hover:text-purple-600 transition text-lg">
          <i class="fas fa-home mr-2"></i>ホーム
        </a>
        <a href="#rankings" data-link class="block text-gray-700 hover:text-purple-600 transition text-lg">
          <i class="fas fa-trophy mr-2"></i>ランキング
        </a>
        <a href="#upload" data-link class="block text-gray-700 hover:text-purple-600 transition text-lg">
          <i class="fas fa-upload mr-2"></i>動画投稿
        </a>
        <a href="#blog" data-link class="block text-gray-700 hover:text-purple-600 transition text-lg">
          <i class="fas fa-blog mr-2"></i>ブログ
        </a>
        
        <div id="mobile-auth-buttons" class="pt-4 border-t border-gray-200 space-y-3">
          <button onclick="showAuthModal('login')" class="block w-full px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition">
            ログイン
          </button>
          <button onclick="showAuthModal('register')" class="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            新規登録
          </button>
        </div>
        
        <div id="mobile-user-menu" class="hidden pt-4 border-t border-gray-200 space-y-3">
          <a href="#mypage" data-link class="block text-gray-700 hover:text-purple-600 transition text-lg">
            <i class="fas fa-user mr-2"></i>マイページ
          </a>
          <button onclick="logout()" class="block w-full text-left text-gray-700 hover:text-purple-600 transition text-lg">
            <i class="fas fa-sign-out-alt mr-2"></i>ログアウト
          </button>
        </div>
      </nav>
    </div>

    <!-- Hero Section -->
    <section class="hero-gradient text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">Unleash Your Climbing Spirit.</h2>
        <p class="text-xl md:text-2xl mb-8">クライマーが求める本物の映像を共有しよう！</p>
        <button onclick="showAuthModal('register')" class="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
          今すぐ始める
        </button>
      </div>
    </section>

    <!-- Search Bar -->
    <section class="container mx-auto px-4 py-6">
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <input type="text" id="search-input" placeholder="動画を検索..." class="w-full px-6 py-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600">
          <button onclick="searchVideos()" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-700">
            <i class="fas fa-search text-xl"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Category Filter -->
    <section class="container mx-auto px-4 py-4">
      <div class="flex flex-wrap gap-3 justify-center">
        <button onclick="filterVideos('all')" class="category-btn px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
          すべて
        </button>
        <button onclick="filterVideos('bouldering')" class="category-btn px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">
          ボルダリング
        </button>
        <button onclick="filterVideos('competition')" class="category-btn px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">
          競技
        </button>
        <button onclick="filterVideos('tutorial')" class="category-btn px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">
          チュートリアル
        </button>
        <button onclick="filterVideos('gym_review')" class="category-btn px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">
          ジムレビュー
        </button>
      </div>
    </section>

    <!-- Horizontal Scroll Section -->
    <section class="container mx-auto px-4 py-8">
      <h3 class="text-3xl font-bold text-gray-800 mb-6">人気動画 (横スクロール)</h3>
      <div id="horizontal-videos" class="horizontal-scroll">
        <!-- Horizontal videos will be loaded here -->
      </div>
    </section>

    <!-- Video Grid -->
    <section class="container mx-auto px-4 py-8">
      <h3 class="text-3xl font-bold text-gray-800 mb-6">新着動画</h3>
      <div id="video-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Videos will be loaded here -->
      </div>
      <div class="text-center mt-8">
        <button id="load-more" onclick="loadMoreVideos()" class="px-8 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition">
          もっと見る
        </button>
      </div>
    </section>

    <!-- Upload Section -->
    <section id="upload" class="bg-white py-16">
      <div class="container mx-auto px-4 max-w-2xl">
        <h3 class="text-3xl font-bold text-gray-800 mb-4 text-center">動画URLを投稿</h3>
        <p class="text-gray-600 mb-8 text-center">URLを入力するだけで、AIが自動的にジャンルを判定。</p>
        <div class="bg-gray-50 p-8 rounded-lg shadow-md">
          <form id="upload-form" class="space-y-4">
            <div>
              <label class="block text-gray-700 font-bold mb-2">動画URL *</label>
              <input type="url" id="video-url" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="https://youtube.com/watch?v=...">
            </div>
            <div>
              <label class="block text-gray-700 font-bold mb-2">タイトル *</label>
              <input type="text" id="video-title" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
            </div>
            <div>
              <label class="block text-gray-700 font-bold mb-2">説明</label>
              <textarea id="video-description" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" rows="3"></textarea>
            </div>
            <div>
              <label class="block text-gray-700 font-bold mb-2">カテゴリー</label>
              <select id="video-category" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                <option value="bouldering">ボルダリング</option>
                <option value="competition">競技</option>
                <option value="tutorial">チュートリアル</option>
                <option value="gym_review">ジムレビュー</option>
              </select>
            </div>
            <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
              <i class="fas fa-upload mr-2"></i>投稿する
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h4 class="text-xl font-bold mb-4">ClimbHero</h4>
            <p class="text-gray-400">クライミング動画共有プラットフォーム</p>
          </div>
          <div>
            <h4 class="text-xl font-bold mb-4">リンク</h4>
            <ul class="space-y-2">
              <li><a href="#rankings" data-link class="text-gray-400 hover:text-white">ランキング</a></li>
              <li><a href="#blog" data-link class="text-gray-400 hover:text-white">ブログ</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-xl font-bold mb-4">お問い合わせ</h4>
            <p class="text-gray-400">support@climbhero.com</p>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 ClimbHero. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
  
  updateAuthUI();
  loadVideos();
  loadHorizontalVideos();
  setupUploadForm();
  
  // Update search on Enter key
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchVideos();
    }
  });
}

// ============ Mobile Menu ============
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  
  menu.classList.toggle('active');
  overlay.classList.toggle('active');
}

// ============ Video Functions ============
async function loadVideos(append = false) {
  if (state.loading) return;
  state.loading = true;
  
  try {
    const params = new URLSearchParams({
      page: state.page.toString(),
      limit: '12',
      category: state.currentCategory
    });

    const response = await axios.get(`/api/videos?${params}`);
    const { videos, pagination } = response.data;

    const videoGrid = document.getElementById('video-grid');
    
    if (!append) {
      videoGrid.innerHTML = '';
    }

    for (const video of videos) {
      const videoCard = await createVideoCard(video);
      videoGrid.appendChild(videoCard);
    }

    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      if (state.page >= pagination.totalPages) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error loading videos:', error);
    showNotification('動画の読み込みに失敗しました', 'error');
  } finally {
    state.loading = false;
  }
}

async function loadHorizontalVideos() {
  try {
    const response = await axios.get('/api/videos?limit=10&category=all');
    const videos = response.data.videos;
    
    const container = document.getElementById('horizontal-videos');
    container.innerHTML = '';
    
    for (const video of videos) {
      const card = await createHorizontalVideoCard(video);
      container.appendChild(card);
    }
  } catch (error) {
    console.error('Error loading horizontal videos:', error);
  }
}

async function createVideoCard(video) {
  const card = document.createElement('div');
  card.className = 'video-card bg-white rounded-lg shadow-md overflow-hidden';
  
  // Check if user liked/favorited
  let liked = false;
  let favorited = false;
  
  if (state.currentUser) {
    try {
      const [likeRes, favRes] = await Promise.all([
        axios.get(`/api/videos/${video.id}/liked`),
        axios.get(`/api/videos/${video.id}/favorited`)
      ]);
      liked = likeRes.data.liked;
      favorited = favRes.data.favorited;
    } catch (error) {
      // Ignore errors
    }
  }
  
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
    <div class="video-card-inner">
      <div class="video-card-front">
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
              <button onclick="toggleLike(${video.id}, event)" class="hover:text-red-500 transition ${liked ? 'text-red-500' : ''}">
                <i class="${liked ? 'fas' : 'far'} fa-heart"></i> ${video.likes || 0}
              </button>
              <button onclick="toggleFavorite(${video.id}, event)" class="hover:text-yellow-500 transition ${favorited ? 'text-yellow-500' : ''}">
                <i class="${favorited ? 'fas' : 'far'} fa-star"></i>
              </button>
            </div>
          </div>
          <h4 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">${video.title}</h4>
          <p class="text-sm text-gray-600 mb-2">${video.channel_name || 'Unknown'}</p>
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span><i class="fas fa-eye mr-1"></i>${formatNumber(video.views || 0)}</span>
            <span>${formatDate(video.created_at)}</span>
          </div>
        </div>
      </div>
      
      <div class="video-card-back bg-white">
        <h4 class="font-bold text-gray-800 mb-2">${video.title}</h4>
        <p class="text-sm text-gray-600 mb-4 line-clamp-3">${video.description || '説明なし'}</p>
        <button onclick="openVideo('${video.url}')" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
          動画を見る
        </button>
        <button onclick="showVideoDetail(${video.id})" class="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
          詳細・コメント
        </button>
      </div>
    </div>
  `;

  return card;
}

async function createHorizontalVideoCard(video) {
  const card = document.createElement('div');
  card.className = 'scroll-item bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition';
  
  const categoryColors = {
    bouldering: 'bg-blue-500',
    competition: 'bg-red-500',
    tutorial: 'bg-green-500',
    gym_review: 'bg-yellow-500'
  };

  card.innerHTML = `
    <div class="relative">
      <img src="${video.thumbnail_url || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400'}" 
           alt="${video.title}" 
           class="w-full h-40 object-cover">
      ${video.duration ? `<span class="duration-badge">${video.duration}</span>` : ''}
    </div>
    <div class="p-3">
      <span class="category-badge ${categoryColors[video.category] || 'bg-gray-500'} text-white text-xs">
        ${video.category}
      </span>
      <h4 class="text-sm font-bold text-gray-800 mt-2 line-clamp-2">${video.title}</h4>
      <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span><i class="fas fa-eye mr-1"></i>${formatNumber(video.views || 0)}</span>
        <span><i class="fas fa-heart mr-1"></i>${video.likes || 0}</span>
      </div>
    </div>
  `;
  
  card.addEventListener('click', () => openVideo(video.url));
  
  return card;
}

function openVideo(url) {
  window.open(url, '_blank');
}

async function showVideoDetail(videoId) {
  try {
    const [videoRes, commentsRes] = await Promise.all([
      axios.get(`/api/videos/${videoId}`),
      axios.get(`/api/videos/${videoId}/comments`)
    ]);
    
    const video = videoRes.data;
    const comments = commentsRes.data;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px;">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">${video.title}</h2>
          <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <div class="mb-6">
          <img src="${video.thumbnail_url}" alt="${video.title}" class="w-full rounded-lg">
          <p class="text-gray-600 mt-4">${video.description || '説明なし'}</p>
          <div class="flex items-center justify-between mt-4 text-gray-600">
            <span><i class="fas fa-eye mr-2"></i>${formatNumber(video.views)}</span>
            <span><i class="fas fa-heart mr-2"></i>${video.likes}</span>
            <span>${video.channel_name}</span>
          </div>
          <a href="${video.url}" target="_blank" class="block mt-4 bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700 transition">
            動画を見る
          </a>
        </div>
        
        <div class="border-t pt-6">
          <h3 class="text-xl font-bold mb-4">コメント (${comments.length})</h3>
          
          ${state.currentUser ? `
            <form id="comment-form" class="mb-6">
              <textarea name="content" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" rows="3" placeholder="コメントを入力..."></textarea>
              <button type="submit" class="mt-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                コメントする
              </button>
            </form>
          ` : `
            <p class="text-gray-600 mb-6">コメントするには<button onclick="closeModal(); showAuthModal('login')" class="text-purple-600 hover:underline">ログイン</button>してください。</p>
          `}
          
          <div id="comments-list" class="space-y-4">
            ${comments.map(comment => `
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold text-gray-800">${comment.username}</span>
                  <span class="text-sm text-gray-500">${formatDate(comment.created_at)}</span>
                </div>
                <p class="text-gray-700">${comment.content}</p>
              </div>
            `).join('')}
            ${comments.length === 0 ? '<p class="text-gray-500 text-center">まだコメントがありません</p>' : ''}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    if (state.currentUser) {
      document.getElementById('comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
          await axios.post(`/api/videos/${videoId}/comments`, data);
          closeModal();
          showNotification('コメントを投稿しました', 'success');
          setTimeout(() => showVideoDetail(videoId), 500);
        } catch (error) {
          showNotification(error.response?.data?.error || 'エラーが発生しました', 'error');
        }
      });
    }
  } catch (error) {
    showNotification('動画の読み込みに失敗しました', 'error');
  }
}

function filterVideos(category) {
  state.currentCategory = category;
  state.page = 1;
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('bg-purple-600', 'text-white');
    btn.classList.add('bg-gray-200', 'text-gray-700');
  });
  
  event.target.classList.remove('bg-gray-200', 'text-gray-700');
  event.target.classList.add('bg-purple-600', 'text-white');
  
  loadVideos();
}

function loadMoreVideos() {
  state.page++;
  loadVideos(true);
}

async function searchVideos() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.trim();
  
  if (!query) {
    state.page = 1;
    loadVideos();
    return;
  }
  
  try {
    const response = await axios.get(`/api/videos?search=${encodeURIComponent(query)}&limit=20`);
    const videos = response.data.videos;
    
    const videoGrid = document.getElementById('video-grid');
    videoGrid.innerHTML = '';
    
    if (videos.length === 0) {
      videoGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">検索結果が見つかりませんでした</p>';
    } else {
      for (const video of videos) {
        const videoCard = await createVideoCard(video);
        videoGrid.appendChild(videoCard);
      }
    }
    
    document.getElementById('load-more').style.display = 'none';
  } catch (error) {
    showNotification('検索に失敗しました', 'error');
  }
}

async function toggleLike(videoId, event) {
  event.stopPropagation();
  
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  try {
    const response = await axios.post(`/api/videos/${videoId}/like`);
    showNotification(response.data.message, 'success');
    loadVideos();
    loadHorizontalVideos();
  } catch (error) {
    showNotification(error.response?.data?.error || 'エラーが発生しました', 'error');
  }
}

async function toggleFavorite(videoId, event) {
  event.stopPropagation();
  
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  try {
    const response = await axios.post(`/api/videos/${videoId}/favorite`);
    showNotification(response.data.message, 'success');
    loadVideos();
  } catch (error) {
    showNotification(error.response?.data?.error || 'エラーが発生しました', 'error');
  }
}

function setupUploadForm() {
  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!state.currentUser) {
        showAuthModal('login');
        return;
      }

      const url = document.getElementById('video-url').value;
      const title = document.getElementById('video-title').value;
      const description = document.getElementById('video-description').value;
      const category = document.getElementById('video-category').value;

      try {
        let thumbnailUrl = '';
        let duration = '';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const videoId = extractYouTubeId(url);
          if (videoId) {
            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
        }

        await axios.post('/api/videos', {
          title,
          description,
          url,
          thumbnail_url: thumbnailUrl,
          duration,
          channel_name: state.currentUser.username,
          category
        });

        showNotification('動画を投稿しました！', 'success');
        e.target.reset();
        
        state.page = 1;
        loadVideos();
        loadHorizontalVideos();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (error) {
        showNotification(error.response?.data?.error || '投稿に失敗しました', 'error');
      }
    });
  }
}

// ============ Rankings Page ============
async function renderRankingsPage() {
  state.currentPage = 'rankings';
  const root = document.getElementById('root');
  
  root.innerHTML = `
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3 cursor-pointer" onclick="navigateTo('/')">
            <i class="fas fa-mountain text-purple-600 text-3xl"></i>
            <h1 class="text-2xl font-bold text-gray-800">ClimbHero</h1>
          </div>
          <nav class="hidden md:flex space-x-6">
            <a href="/" data-link class="text-gray-700 hover:text-purple-600 transition">ホーム</a>
            <a href="#rankings" data-link class="text-purple-600 font-bold">ランキング</a>
            <a href="#blog" data-link class="text-gray-700 hover:text-purple-600 transition">ブログ</a>
          </nav>
          <div id="user-menu" class="hidden md:flex items-center relative"></div>
          <button onclick="toggleMobileMenu()" class="md:hidden text-gray-700">
            <i class="fas fa-bars text-2xl"></i>
          </button>
        </div>
      </div>
    </header>

    <div id="mobile-menu-overlay" class="mobile-menu-overlay" onclick="toggleMobileMenu()"></div>
    <div id="mobile-menu" class="mobile-menu"></div>

    <div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">
        <i class="fas fa-trophy text-yellow-500 mr-3"></i>
        動画ランキング
      </h1>
      
      <div class="flex justify-center space-x-4 mb-8">
        <button onclick="loadRankings('weekly')" class="ranking-tab px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          週間ランキング
        </button>
        <button onclick="loadRankings('monthly')" class="ranking-tab px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
          月間ランキング
        </button>
        <button onclick="loadRankings('total')" class="ranking-tab px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
          総合ランキング
        </button>
      </div>
      
      <div id="rankings-list" class="max-w-4xl mx-auto">
        <div class="spinner"></div>
      </div>
    </div>

    <footer class="bg-gray-800 text-white py-12 mt-12">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2025 ClimbHero. All rights reserved.</p>
      </div>
    </footer>
  `;
  
  updateAuthUI();
  loadRankings('weekly');
}

async function loadRankings(type) {
  document.querySelectorAll('.ranking-tab').forEach(btn => {
    btn.classList.remove('bg-purple-600', 'text-white');
    btn.classList.add('bg-gray-200', 'text-gray-700');
  });
  event.target.classList.remove('bg-gray-200', 'text-gray-700');
  event.target.classList.add('bg-purple-600', 'text-white');
  
  const rankingsList = document.getElementById('rankings-list');
  rankingsList.innerHTML = '<div class="spinner"></div>';
  
  try {
    const response = await axios.get(`/api/rankings/${type}`);
    const rankings = response.data;
    
    rankingsList.innerHTML = '';
    
    rankings.forEach((video, index) => {
      const rank = index + 1;
      const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
      
      const item = document.createElement('div');
      item.className = 'bg-white rounded-lg shadow-md p-6 mb-4 flex items-center hover:shadow-lg transition';
      item.innerHTML = `
        <div class="ranking-medal ${rankClass || 'bg-gray-300 text-gray-700'} mr-6">
          ${rank}
        </div>
        <img src="${video.thumbnail_url}" alt="${video.title}" class="w-32 h-20 object-cover rounded-lg mr-6">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-800 mb-2">${video.title}</h3>
          <div class="flex items-center space-x-4 text-sm text-gray-600">
            <span><i class="fas fa-eye mr-1"></i>${formatNumber(video.views)}</span>
            <span><i class="fas fa-heart mr-1"></i>${video.likes}</span>
            <span><i class="fas fa-star text-yellow-500 mr-1"></i>${video.score} pts</span>
          </div>
        </div>
        <button onclick="openVideo('${video.url}')" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          視聴
        </button>
      `;
      
      rankingsList.appendChild(item);
    });
    
    if (rankings.length === 0) {
      rankingsList.innerHTML = '<p class="text-center text-gray-500 py-8">ランキングデータがありません</p>';
    }
  } catch (error) {
    rankingsList.innerHTML = '<p class="text-center text-red-500 py-8">ランキングの読み込みに失敗しました</p>';
  }
}

// ============ My Page ============
async function renderMyPage() {
  if (!state.currentUser) {
    navigateTo('/');
    return;
  }
  
  const root = document.getElementById('root');
  
  root.innerHTML = `
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3 cursor-pointer" onclick="navigateTo('/')">
            <i class="fas fa-mountain text-purple-600 text-3xl"></i>
            <h1 class="text-2xl font-bold text-gray-800">ClimbHero</h1>
          </div>
          <nav class="hidden md:flex space-x-6">
            <a href="/" data-link class="text-gray-700 hover:text-purple-600 transition">ホーム</a>
            <a href="#rankings" data-link class="text-gray-700 hover:text-purple-600 transition">ランキング</a>
            <a href="#mypage" data-link class="text-purple-600 font-bold">マイページ</a>
          </nav>
          <div id="user-menu" class="hidden md:flex items-center relative"></div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-8 mb-8">
          <div class="flex items-center space-x-6">
            <div class="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              ${state.currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-800">${state.currentUser.username}</h2>
              <p class="text-gray-600">${state.currentUser.email}</p>
              <span class="inline-block mt-2 px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                ${state.currentUser.membership_type === 'premium' ? 'プレミアム会員' : '無料会員'}
              </span>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <div class="flex space-x-4 border-b border-gray-200">
            <button onclick="showMyTab('favorites')" class="my-tab px-6 py-3 border-b-2 border-purple-600 text-purple-600 font-bold">
              お気に入り
            </button>
          </div>
        </div>
        
        <div id="my-content">
          <div class="spinner"></div>
        </div>
      </div>
    </div>

    <footer class="bg-gray-800 text-white py-12 mt-12">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2025 ClimbHero. All rights reserved.</p>
      </div>
    </footer>
  `;
  
  updateAuthUI();
  showMyTab('favorites');
}

async function showMyTab(tab) {
  document.querySelectorAll('.my-tab').forEach(btn => {
    btn.classList.remove('border-purple-600', 'text-purple-600');
    btn.classList.add('border-transparent', 'text-gray-600');
  });
  event.target.classList.remove('border-transparent', 'text-gray-600');
  event.target.classList.add('border-purple-600', 'text-purple-600');
  
  const content = document.getElementById('my-content');
  content.innerHTML = '<div class="spinner"></div>';
  
  try {
    let videos = [];
    if (tab === 'favorites') {
      const response = await axios.get(`/api/users/${state.currentUser.id}/favorites`);
      videos = response.data;
    }
    
    content.innerHTML = '';
    
    if (videos.length === 0) {
      content.innerHTML = `<p class="text-center text-gray-500 py-8">まだ${tab === 'favorites' ? 'お気に入り' : '投稿'}がありません</p>`;
    } else {
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      
      for (const video of videos) {
        const card = await createVideoCard(video);
        grid.appendChild(card);
      }
      
      content.appendChild(grid);
    }
  } catch (error) {
    content.innerHTML = '<p class="text-center text-red-500 py-8">データの読み込みに失敗しました</p>';
  }
}

// ============ Blog Page ============
async function renderBlogPage() {
  const root = document.getElementById('root');
  
  root.innerHTML = `
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3 cursor-pointer" onclick="navigateTo('/')">
            <i class="fas fa-mountain text-purple-600 text-3xl"></i>
            <h1 class="text-2xl font-bold text-gray-800">ClimbHero</h1>
          </div>
          <nav class="hidden md:flex space-x-6">
            <a href="/" data-link class="text-gray-700 hover:text-purple-600 transition">ホーム</a>
            <a href="#rankings" data-link class="text-gray-700 hover:text-purple-600 transition">ランキング</a>
            <a href="#blog" data-link class="text-purple-600 font-bold">ブログ</a>
          </nav>
          <div id="user-menu" class="hidden md:flex items-center relative"></div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800">
            <i class="fas fa-blog text-purple-600 mr-3"></i>
            ブログ
          </h1>
          ${state.currentUser ? `
            <button onclick="showBlogEditor()" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              <i class="fas fa-plus mr-2"></i>新規投稿
            </button>
          ` : ''}
        </div>
        
        <div id="blog-list">
          <div class="spinner"></div>
        </div>
      </div>
    </div>

    <footer class="bg-gray-800 text-white py-12 mt-12">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2025 ClimbHero. All rights reserved.</p>
      </div>
    </footer>
  `;
  
  updateAuthUI();
  loadBlogPosts();
}

async function loadBlogPosts() {
  const blogList = document.getElementById('blog-list');
  
  try {
    const response = await axios.get('/api/blog');
    const posts = response.data;
    
    blogList.innerHTML = '';
    
    posts.forEach(post => {
      const postCard = document.createElement('div');
      postCard.className = 'bg-white rounded-lg shadow-md overflow-hidden mb-6 hover:shadow-lg transition cursor-pointer';
      postCard.innerHTML = `
        <img src="${post.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800'}" 
             alt="${post.title}" 
             class="w-full h-64 object-cover">
        <div class="p-6">
          <p class="text-sm text-gray-500 mb-2">${formatDate(post.published_date)}</p>
          <h2 class="text-2xl font-bold text-gray-800 mb-3">${post.title}</h2>
          <p class="text-gray-600 mb-4 line-clamp-3">${post.content}</p>
          <div class="flex justify-between items-center">
            <button onclick="navigateTo('#blog/${post.id}')" class="text-purple-600 font-bold hover:underline">
              続きを読む →
            </button>
            ${state.currentUser ? `
              <div class="space-x-2">
                <button onclick="editBlog(${post.id})" class="text-blue-600 hover:text-blue-700">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteBlog(${post.id})" class="text-red-600 hover:text-red-700">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      
      blogList.appendChild(postCard);
    });
    
    if (posts.length === 0) {
      blogList.innerHTML = '<p class="text-center text-gray-500 py-8">まだブログ記事がありません</p>';
    }
  } catch (error) {
    blogList.innerHTML = '<p class="text-center text-red-500 py-8">ブログの読み込みに失敗しました</p>';
  }
}

function showBlogEditor(postId = null) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">${postId ? 'ブログ編集' : 'ブログ投稿'}</h2>
        <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      
      <form id="blog-form" class="space-y-4">
        <div>
          <label class="block text-gray-700 font-bold mb-2">タイトル</label>
          <input type="text" name="title" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
        </div>
        
        <div>
          <label class="block text-gray-700 font-bold mb-2">画像URL</label>
          <input type="url" name="image_url" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
        </div>
        
        <div>
          <label class="block text-gray-700 font-bold mb-2">本文</label>
          <textarea name="content" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" rows="10"></textarea>
        </div>
        
        <div>
          <label class="block text-gray-700 font-bold mb-2">公開日</label>
          <input type="date" name="published_date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
        </div>
        
        <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
          ${postId ? '更新' : '投稿'}
        </button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  if (postId) {
    axios.get(`/api/blog/${postId}`).then(response => {
      const post = response.data;
      const form = document.getElementById('blog-form');
      form.elements.title.value = post.title;
      form.elements.image_url.value = post.image_url || '';
      form.elements.content.value = post.content;
      form.elements.published_date.value = post.published_date;
    });
  }
  
  document.getElementById('blog-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      if (postId) {
        await axios.put(`/api/blog/${postId}`, data);
        showNotification('ブログを更新しました', 'success');
      } else {
        await axios.post('/api/blog', data);
        showNotification('ブログを投稿しました', 'success');
      }
      
      closeModal();
      loadBlogPosts();
    } catch (error) {
      showNotification(error.response?.data?.error || 'エラーが発生しました', 'error');
    }
  });
}

async function editBlog(postId) {
  event.stopPropagation();
  showBlogEditor(postId);
}

async function deleteBlog(postId) {
  event.stopPropagation();
  
  if (!confirm('本当に削除しますか？')) return;
  
  try {
    await axios.delete(`/api/blog/${postId}`);
    showNotification('ブログを削除しました', 'success');
    loadBlogPosts();
  } catch (error) {
    showNotification('削除に失敗しました', 'error');
  }
}

async function renderBlogDetailPage(blogId) {
  const root = document.getElementById('root');
  
  root.innerHTML = '<div class="spinner"></div>';
  
  try {
    const response = await axios.get(`/api/blog/${blogId}`);
    const post = response.data;
    
    root.innerHTML = `
      <header class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-3 cursor-pointer" onclick="navigateTo('/')">
              <i class="fas fa-mountain text-purple-600 text-3xl"></i>
              <h1 class="text-2xl font-bold text-gray-800">ClimbHero</h1>
            </div>
            <a href="#blog" data-link class="text-purple-600 hover:text-purple-700">
              <i class="fas fa-arrow-left mr-2"></i>ブログ一覧に戻る
            </a>
          </div>
        </div>
      </header>

      <article class="container mx-auto px-4 py-12">
        <div class="max-w-3xl mx-auto">
          <img src="${post.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200'}" 
               alt="${post.title}" 
               class="w-full h-96 object-cover rounded-lg mb-8">
          
          <p class="text-sm text-gray-500 mb-4">${formatDate(post.published_date)}</p>
          <h1 class="text-4xl font-bold text-gray-800 mb-8">${post.title}</h1>
          
          <div class="prose max-w-none text-gray-700 leading-relaxed" style="white-space: pre-wrap;">
            ${post.content}
          </div>
        </div>
      </article>

      <footer class="bg-gray-800 text-white py-12 mt-12">
        <div class="container mx-auto px-4 text-center">
          <p>&copy; 2025 ClimbHero. All rights reserved.</p>
        </div>
      </footer>
    `;
    
    updateAuthUI();
  } catch (error) {
    root.innerHTML = '<p class="text-center text-red-500 py-8">ブログ記事の読み込みに失敗しました</p>';
  }
}

// ============ Utility Functions ============
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

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
  return date.toLocaleDateString('ja-JP');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
