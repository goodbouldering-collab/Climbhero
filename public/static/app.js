// ============ Global State ============
const state = {
  currentUser: null,
  videos: [],
  rankings: { weekly: [], monthly: [], total: [] },
  blogPosts: [],
  currentView: 'home',
  loading: false
};

// ============ Initialize App ============
document.addEventListener('DOMContentLoaded', async () => {
  await init();
});

async function init() {
  await checkAuth();
  await loadInitialData();
  renderApp();
  
  // Handle hash navigation
  window.addEventListener('hashchange', handleNavigation);
  handleNavigation();
}

// ============ Authentication ============
async function checkAuth() {
  try {
    const response = await axios.get('/api/auth/me');
    state.currentUser = response.data;
  } catch (error) {
    state.currentUser = null;
  }
}

// ============ Load Initial Data ============
async function loadInitialData() {
  try {
    const [videosRes, rankingsRes, blogRes] = await Promise.all([
      axios.get('/api/videos?limit=12'),
      axios.get('/api/rankings/weekly?limit=10'),
      axios.get('/api/blog')
    ]);
    
    state.videos = videosRes.data.videos || [];
    state.rankings.weekly = rankingsRes.data || [];
    state.blogPosts = blogRes.data || [];
  } catch (error) {
    console.error('Failed to load initial data:', error);
    showToast('データの読み込みに失敗しました', 'error');
  }
}

// ============ Navigation ============
function handleNavigation() {
  const hash = window.location.hash.slice(1);
  
  if (!hash || hash === 'home') {
    state.currentView = 'home';
  } else if (hash === 'admin') {
    if (state.currentUser?.is_admin) {
      state.currentView = 'admin';
    } else {
      showToast('管理者権限が必要です', 'error');
      window.location.hash = 'home';
      return;
    }
  } else if (hash.startsWith('blog/')) {
    state.currentView = 'blog-detail';
    state.currentBlogId = hash.split('/')[1];
  }
  
  renderApp();
}

// ============ Main Render ============
function renderApp() {
  const root = document.getElementById('root');
  
  if (state.currentView === 'home') {
    root.innerHTML = renderHomePage();
  } else if (state.currentView === 'admin') {
    root.innerHTML = renderAdminPage();
  } else if (state.currentView === 'blog-detail') {
    renderBlogDetail();
  }
  
  attachEventListeners();
}

// ============ Home Page ============
function renderHomePage() {
  return `
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <i class="fas fa-mountain text-purple-600 text-2xl"></i>
            <h1 class="text-xl font-bold text-gray-900">ClimbHero</h1>
          </div>
          
          <div class="flex items-center gap-3">
            ${state.currentUser ? `
              ${state.currentUser.is_admin ? `
                <button onclick="navigateTo('admin')" class="btn btn-sm btn-secondary">
                  <i class="fas fa-cog"></i>
                  <span class="hidden sm:inline">Admin</span>
                </button>
              ` : ''}
              <div class="flex items-center gap-2">
                <div class="avatar">
                  ${state.currentUser.username[0].toUpperCase()}
                </div>
                <span class="hidden sm:inline text-sm font-medium text-gray-700">
                  ${state.currentUser.username}
                </span>
              </div>
              <button onclick="logout()" class="btn btn-sm btn-secondary">
                <i class="fas fa-sign-out-alt"></i>
              </button>
            ` : `
              <button onclick="showAuthModal('login')" class="btn btn-sm btn-primary">
                <i class="fas fa-sign-in-alt"></i>
                ログイン
              </button>
              <button onclick="showAuthModal('register')" class="btn btn-sm btn-secondary">
                登録
              </button>
            `}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      <!-- Hero Section -->
      <section class="hero-gradient rounded-2xl p-8 sm:p-12 text-white relative">
        <div class="relative z-10">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            クライミング動画共有プラットフォーム
          </h2>
          <p class="text-lg opacity-90 mb-6 max-w-2xl">
            最新のクライミング動画、ランキング、テクニック解説を一箇所で。コミュニティと共に上達を目指そう。
          </p>
          ${state.currentUser ? `
            <button onclick="showUploadModal()" class="btn btn-lg bg-white text-purple-600 hover:bg-gray-100">
              <i class="fas fa-upload"></i>
              動画を投稿
            </button>
          ` : `
            <button onclick="showAuthModal('register')" class="btn btn-lg bg-white text-purple-600 hover:bg-gray-100">
              <i class="fas fa-user-plus"></i>
              今すぐ始める
            </button>
          `}
        </div>
      </section>

      <!-- Weekly Rankings -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <i class="fas fa-trophy text-yellow-500 text-xl"></i>
            <h3 class="text-2xl font-bold text-gray-900">週間ランキング</h3>
          </div>
          <button onclick="loadRankings('monthly')" class="btn btn-sm btn-secondary">
            月間を見る
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${state.rankings.weekly.slice(0, 6).map((video, index) => renderRankingCard(video, index + 1)).join('')}
        </div>
      </section>

      <!-- Latest Videos -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <i class="fas fa-video text-red-500 text-xl"></i>
            <h3 class="text-2xl font-bold text-gray-900">最新動画</h3>
          </div>
          
          <!-- Category Filter -->
          <div class="flex gap-2 overflow-x-auto">
            <button onclick="filterVideos('all')" class="btn btn-sm btn-primary">
              全て
            </button>
            <button onclick="filterVideos('bouldering')" class="btn btn-sm btn-secondary">
              ボルダリング
            </button>
            <button onclick="filterVideos('competition')" class="btn btn-sm btn-secondary">
              大会
            </button>
            <button onclick="filterVideos('tutorial')" class="btn btn-sm btn-secondary">
              解説
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${state.videos.map(video => renderVideoCard(video)).join('')}
        </div>
      </section>

      <!-- Blog Posts -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <i class="fas fa-newspaper text-blue-500 text-xl"></i>
            <h3 class="text-2xl font-bold text-gray-900">ブログ</h3>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${state.blogPosts.slice(0, 6).map(post => renderBlogCard(post)).join('')}
        </div>
      </section>

    </main>

    <!-- Modals -->
    <div id="auth-modal" class="modal"></div>
    <div id="upload-modal" class="modal"></div>
    <div id="video-modal" class="modal"></div>
  `;
}

// ============ Ranking Card ============
function renderRankingCard(video, rank) {
  const medal = rank <= 3 ? `<div class="ranking-medal rank-${rank}">${rank}</div>` : `<div class="text-lg font-bold text-gray-400">#${rank}</div>`;
  
  return `
    <div class="card p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-all" onclick="showVideoDetail(${video.id})">
      ${medal}
      <img src="${video.thumbnail_url}" alt="${video.title}" class="w-24 h-16 object-cover rounded flex-shrink-0">
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 line-clamp-1 mb-1">${video.title}</h4>
        <div class="flex items-center gap-3 text-xs text-gray-500">
          <span><i class="fas fa-eye mr-1"></i>${video.views}</span>
          <span><i class="fas fa-heart mr-1"></i>${video.likes}</span>
          <span class="category-badge category-${video.category}">${getCategoryName(video.category)}</span>
        </div>
      </div>
    </div>
  `;
}

// ============ Video Card ============
function renderVideoCard(video) {
  return `
    <div class="card overflow-hidden cursor-pointer hover:shadow-lg transition-all" onclick="showVideoDetail(${video.id})">
      <div class="relative">
        <img src="${video.thumbnail_url}" alt="${video.title}" class="w-full h-48 object-cover">
        <div class="duration-badge">${video.duration}</div>
        <span class="absolute top-2 left-2 category-badge category-${video.category}">
          ${getCategoryName(video.category)}
        </span>
      </div>
      <div class="p-4">
        <h4 class="font-semibold text-gray-900 line-clamp-2 mb-2">${video.title}</h4>
        <p class="text-sm text-gray-600 line-clamp-2 mb-3">${video.description}</p>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span><i class="fas fa-eye mr-1"></i>${video.views}</span>
          <span><i class="fas fa-heart mr-1"></i>${video.likes}</span>
          <span class="text-gray-400">${formatDate(video.created_at)}</span>
        </div>
      </div>
    </div>
  `;
}

// ============ Blog Card ============
function renderBlogCard(post) {
  return `
    <div class="card overflow-hidden cursor-pointer hover:shadow-lg transition-all" onclick="navigateTo('blog/${post.id}')">
      ${post.image_url ? `
        <img src="${post.image_url}" alt="${post.title}" class="w-full h-48 object-cover">
      ` : `
        <div class="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500"></div>
      `}
      <div class="p-5">
        <h4 class="font-semibold text-gray-900 line-clamp-2 mb-2">${post.title}</h4>
        <p class="text-sm text-gray-600 line-clamp-3 mb-3">${post.content.substring(0, 150)}...</p>
        <div class="text-xs text-gray-500">
          <i class="fas fa-calendar mr-1"></i>${formatDate(post.published_date)}
        </div>
      </div>
    </div>
  `;
}

// ============ Admin Page ============
function renderAdminPage() {
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Admin Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <i class="fas fa-cog text-purple-600 text-2xl"></i>
              <h1 class="text-xl font-bold text-gray-900">管理画面</h1>
            </div>
            <button onclick="navigateTo('home')" class="btn btn-sm btn-secondary">
              <i class="fas fa-home"></i>
              ホームに戻る
            </button>
          </div>
        </div>
      </header>

      <!-- Admin Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <!-- Sidebar -->
          <aside class="lg:col-span-1">
            <nav class="card p-4 space-y-2">
              <button onclick="showAdminSection('blog')" class="w-full btn btn-secondary text-left justify-start">
                <i class="fas fa-newspaper"></i>
                ブログ管理
              </button>
              <button onclick="showAdminSection('videos')" class="w-full btn btn-secondary text-left justify-start">
                <i class="fas fa-video"></i>
                動画管理
              </button>
              <button onclick="showAdminSection('users')" class="w-full btn btn-secondary text-left justify-start">
                <i class="fas fa-users"></i>
                ユーザー管理
              </button>
              <button onclick="showAdminSection('settings')" class="w-full btn btn-secondary text-left justify-start">
                <i class="fas fa-sliders-h"></i>
                設定
              </button>
            </nav>
          </aside>

          <!-- Main Admin Area -->
          <div class="lg:col-span-3">
            <div id="admin-content">
              ${renderBlogAdminSection()}
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

// ============ Blog Admin Section ============
function renderBlogAdminSection() {
  return `
    <div class="card p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">ブログ管理</h2>
        <button onclick="showBlogEditor()" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          新規投稿
        </button>
      </div>

      <div class="space-y-3">
        ${state.blogPosts.map(post => `
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">${post.title}</h4>
              <p class="text-sm text-gray-600 mt-1">${formatDate(post.published_date)}</p>
            </div>
            <div class="flex gap-2">
              <button onclick="editBlogPost(${post.id})" class="btn btn-sm btn-secondary">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteBlogPost(${post.id})" class="btn btn-sm btn-secondary text-red-600">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============ Helper Functions ============
function getCategoryName(category) {
  const categories = {
    bouldering: 'ボルダリング',
    competition: '大会',
    tutorial: '解説',
    gym_review: 'ジム紹介'
  };
  return categories[category] || category;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今日';
  if (days === 1) return '昨日';
  if (days < 7) return `${days}日前`;
  if (days < 30) return `${Math.floor(days / 7)}週間前`;
  if (days < 365) return `${Math.floor(days / 30)}ヶ月前`;
  return `${Math.floor(days / 365)}年前`;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
    ${message}
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function navigateTo(view) {
  window.location.hash = view;
}

// ============ Auth Modal ============
function showAuthModal(type) {
  const modal = document.getElementById('auth-modal');
  modal.innerHTML = `
    <div class="modal-content">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold">${type === 'login' ? 'ログイン' : '新規登録'}</h3>
        <button onclick="closeModal('auth-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form onsubmit="handleAuth(event, '${type}')" class="space-y-4">
        ${type === 'register' ? `
          <div>
            <label>ユーザー名</label>
            <input type="text" name="username" required class="w-full">
          </div>
        ` : ''}
        
        <div>
          <label>メールアドレス</label>
          <input type="email" name="email" required class="w-full">
        </div>
        
        <div>
          <label>パスワード</label>
          <input type="password" name="password" required class="w-full">
        </div>
        
        <button type="submit" class="btn btn-primary w-full">
          ${type === 'login' ? 'ログイン' : '登録'}
        </button>
      </form>
      
      <p class="text-sm text-center text-gray-600 mt-4">
        ${type === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
        <a href="#" onclick="showAuthModal('${type === 'login' ? 'register' : 'login'}')" class="text-purple-600 font-medium">
          ${type === 'login' ? '新規登録' : 'ログイン'}
        </a>
      </p>
    </div>
  `;
  modal.classList.add('active');
}

async function handleAuth(event, type) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  
  try {
    const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
    await axios.post(endpoint, data);
    
    await checkAuth();
    closeModal('auth-modal');
    renderApp();
    showToast(`${type === 'login' ? 'ログイン' : '登録'}に成功しました`, 'success');
  } catch (error) {
    showToast(error.response?.data?.error || '認証に失敗しました', 'error');
  }
}

async function logout() {
  try {
    await axios.post('/api/auth/logout');
    state.currentUser = null;
    renderApp();
    showToast('ログアウトしました', 'success');
  } catch (error) {
    showToast('ログアウトに失敗しました', 'error');
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ============ Video Actions ============
async function showVideoDetail(videoId) {
  try {
    const response = await axios.get(`/api/videos/${videoId}`);
    const video = response.data;
    
    const modal = document.getElementById('video-modal');
    modal.innerHTML = `
      <div class="modal-content max-w-4xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-bold">${video.title}</h3>
          <button onclick="closeModal('video-modal')" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="aspect-video bg-gray-900 rounded-lg mb-4">
          <iframe src="${video.url.replace('watch?v=', 'embed/')}" 
                  class="w-full h-full rounded-lg" 
                  allowfullscreen></iframe>
        </div>
        
        <div class="flex items-center justify-between mb-4">
          <div class="flex gap-4 text-sm text-gray-600">
            <span><i class="fas fa-eye mr-1"></i>${video.views} 回視聴</span>
            <span><i class="fas fa-heart mr-1"></i>${video.likes}</span>
          </div>
          
          ${state.currentUser ? `
            <div class="flex gap-2">
              <button onclick="likeVideo(${video.id})" class="btn btn-sm btn-secondary">
                <i class="fas fa-heart"></i>
                いいね
              </button>
              <button onclick="favoriteVideo(${video.id})" class="btn btn-sm btn-secondary">
                <i class="fas fa-star"></i>
                お気に入り
              </button>
            </div>
          ` : ''}
        </div>
        
        <p class="text-gray-700 mb-4">${video.description}</p>
        
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="category-badge category-${video.category}">${getCategoryName(video.category)}</span>
          <span>${video.channel_name}</span>
          <span>${formatDate(video.created_at)}</span>
        </div>
      </div>
    `;
    modal.classList.add('active');
  } catch (error) {
    showToast('動画の読み込みに失敗しました', 'error');
  }
}

async function likeVideo(videoId) {
  try {
    await axios.post(`/api/videos/${videoId}/like`);
    showToast('いいねしました', 'success');
    await loadInitialData();
  } catch (error) {
    showToast('いいねに失敗しました', 'error');
  }
}

async function favoriteVideo(videoId) {
  try {
    await axios.post(`/api/videos/${videoId}/favorite`);
    showToast('お気に入りに追加しました', 'success');
  } catch (error) {
    showToast('お気に入りの追加に失敗しました', 'error');
  }
}

// ============ Upload Modal ============
function showUploadModal() {
  const modal = document.getElementById('upload-modal');
  modal.innerHTML = `
    <div class="modal-content">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold">動画を投稿</h3>
        <button onclick="closeModal('upload-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form onsubmit="handleUpload(event)" class="space-y-4">
        <div>
          <label>タイトル</label>
          <input type="text" name="title" required class="w-full">
        </div>
        
        <div>
          <label>説明</label>
          <textarea name="description" rows="3" class="w-full"></textarea>
        </div>
        
        <div>
          <label>動画URL (YouTube)</label>
          <input type="url" name="url" required class="w-full" placeholder="https://youtube.com/watch?v=...">
        </div>
        
        <div>
          <label>サムネイルURL</label>
          <input type="url" name="thumbnail_url" class="w-full">
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>長さ</label>
            <input type="text" name="duration" placeholder="10:30" class="w-full">
          </div>
          
          <div>
            <label>カテゴリ</label>
            <select name="category" required class="w-full">
              <option value="bouldering">ボルダリング</option>
              <option value="competition">大会</option>
              <option value="tutorial">解説</option>
              <option value="gym_review">ジム紹介</option>
            </select>
          </div>
        </div>
        
        <div>
          <label>チャンネル名</label>
          <input type="text" name="channel_name" class="w-full">
        </div>
        
        <button type="submit" class="btn btn-primary w-full">
          <i class="fas fa-upload"></i>
          投稿する
        </button>
      </form>
    </div>
  `;
  modal.classList.add('active');
}

async function handleUpload(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  
  try {
    await axios.post('/api/videos', data);
    closeModal('upload-modal');
    await loadInitialData();
    renderApp();
    showToast('動画を投稿しました', 'success');
  } catch (error) {
    showToast('投稿に失敗しました', 'error');
  }
}

// ============ Filter Videos ============
async function filterVideos(category) {
  try {
    const url = category === 'all' ? '/api/videos?limit=12' : `/api/videos?category=${category}&limit=12`;
    const response = await axios.get(url);
    state.videos = response.data.videos || [];
    renderApp();
  } catch (error) {
    showToast('動画の読み込みに失敗しました', 'error');
  }
}

// ============ Load Rankings ============
async function loadRankings(type) {
  try {
    const response = await axios.get(`/api/rankings/${type}?limit=10`);
    state.rankings[type] = response.data || [];
    renderApp();
    showToast(`${type === 'monthly' ? '月間' : '週間'}ランキングを表示中`, 'info');
  } catch (error) {
    showToast('ランキングの読み込みに失敗しました', 'error');
  }
}

// ============ Blog Detail ============
async function renderBlogDetail() {
  try {
    const response = await axios.get(`/api/blog/${state.currentBlogId}`);
    const post = response.data;
    
    const root = document.getElementById('root');
    root.innerHTML = `
      <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center h-16">
            <button onclick="navigateTo('home')" class="btn btn-sm btn-secondary mr-4">
              <i class="fas fa-arrow-left"></i>
              戻る
            </button>
            <h1 class="text-xl font-bold text-gray-900">ClimbHero Blog</h1>
          </div>
        </div>
      </header>

      <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        ${post.image_url ? `
          <img src="${post.image_url}" alt="${post.title}" class="w-full h-96 object-cover rounded-2xl mb-8">
        ` : ''}
        
        <h1 class="text-4xl font-bold text-gray-900 mb-4">${post.title}</h1>
        
        <div class="flex items-center gap-4 text-sm text-gray-600 mb-8">
          <span><i class="fas fa-calendar mr-2"></i>${formatDate(post.published_date)}</span>
        </div>
        
        <div class="prose prose-lg max-w-none">
          ${post.content.replace(/\n/g, '<br>')}
        </div>
        
        <div class="mt-12 pt-8 border-t border-gray-200">
          <button onclick="navigateTo('home')" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i>
            ホームに戻る
          </button>
        </div>
      </article>
    `;
  } catch (error) {
    showToast('ブログの読み込みに失敗しました', 'error');
    navigateTo('home');
  }
}

// ============ Admin Functions ============
function showAdminSection(section) {
  const content = document.getElementById('admin-content');
  
  if (section === 'blog') {
    content.innerHTML = renderBlogAdminSection();
  } else if (section === 'videos') {
    content.innerHTML = '<div class="card p-6"><h2 class="text-2xl font-bold">動画管理（開発中）</h2></div>';
  } else if (section === 'users') {
    content.innerHTML = '<div class="card p-6"><h2 class="text-2xl font-bold">ユーザー管理（開発中）</h2></div>';
  } else if (section === 'settings') {
    content.innerHTML = '<div class="card p-6"><h2 class="text-2xl font-bold">設定（開発中）</h2></div>';
  }
}

function showBlogEditor(postId = null) {
  const isEdit = postId !== null;
  const post = isEdit ? state.blogPosts.find(p => p.id === postId) : null;
  
  const modal = document.getElementById('auth-modal');
  modal.innerHTML = `
    <div class="modal-content max-w-2xl">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold">${isEdit ? 'ブログ編集' : '新規ブログ投稿'}</h3>
        <button onclick="closeModal('auth-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form onsubmit="handleBlogSubmit(event, ${postId})" class="space-y-4">
        <div>
          <label>タイトル</label>
          <input type="text" name="title" value="${post?.title || ''}" required class="w-full">
        </div>
        
        <div>
          <label>内容</label>
          <textarea name="content" rows="10" required class="w-full">${post?.content || ''}</textarea>
        </div>
        
        <div>
          <label>画像URL</label>
          <input type="url" name="image_url" value="${post?.image_url || ''}" class="w-full">
        </div>
        
        <div>
          <label>公開日</label>
          <input type="date" name="published_date" value="${post?.published_date || ''}" class="w-full">
        </div>
        
        <button type="submit" class="btn btn-primary w-full">
          ${isEdit ? '更新' : '投稿'}する
        </button>
      </form>
    </div>
  `;
  modal.classList.add('active');
}

async function handleBlogSubmit(event, postId) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  
  try {
    if (postId) {
      await axios.put(`/api/blog/${postId}`, data);
      showToast('ブログを更新しました', 'success');
    } else {
      await axios.post('/api/blog', data);
      showToast('ブログを投稿しました', 'success');
    }
    
    closeModal('auth-modal');
    await loadInitialData();
    renderApp();
  } catch (error) {
    showToast('投稿に失敗しました', 'error');
  }
}

function editBlogPost(postId) {
  showBlogEditor(postId);
}

async function deleteBlogPost(postId) {
  if (!confirm('本当に削除しますか？')) return;
  
  try {
    await axios.delete(`/api/blog/${postId}`);
    await loadInitialData();
    renderApp();
    showToast('ブログを削除しました', 'success');
  } catch (error) {
    showToast('削除に失敗しました', 'error');
  }
}

// ============ Event Listeners ============
function attachEventListeners() {
  // Close modals on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}
