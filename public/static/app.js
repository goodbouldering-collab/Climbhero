// ============ Global State ============
const state = {
  currentUser: null,
  videos: [],
  rankings: { daily: [], weekly: [], monthly: [], yearly: [] },
  blogPosts: [],
  currentView: 'home',
  currentRankingType: 'weekly',
  loading: false,
  currentLanguage: 'ja'
};

// ============ Language Support ============
window.addEventListener('languageChanged', (e) => {
  state.currentLanguage = e.detail.language;
  renderApp();
});

// ============ Initialize App ============
document.addEventListener('DOMContentLoaded', async () => {
  await init();
});

async function init() {
  await checkAuth();
  await loadInitialData();
  renderApp();
  
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
      axios.get('/api/videos?limit=20'),
      axios.get('/api/rankings/weekly?limit=20'),
      axios.get('/api/blog')
    ]);
    
    state.videos = videosRes.data.videos || [];
    state.rankings.weekly = rankingsRes.data || [];
    state.blogPosts = blogRes.data || [];
    
    // Load user like status for all videos
    if (state.currentUser) {
      await loadUserLikeStatus();
    }
  } catch (error) {
    console.error('Failed to load initial data:', error);
    showToast(i18n.t('toast.data_load_error'), 'error');
  }
}

// Load user like status for all videos
async function loadUserLikeStatus() {
  if (!state.currentUser) return;
  
  try {
    const allVideos = [
      ...state.videos,
      ...state.rankings.daily,
      ...state.rankings.weekly,
      ...state.rankings.monthly,
      ...state.rankings.yearly
    ];
    
    const uniqueVideoIds = [...new Set(allVideos.map(v => v.id))];
    
    for (const videoId of uniqueVideoIds) {
      try {
        const res = await axios.get(`/api/videos/${videoId}/liked`);
        const video = allVideos.find(v => v.id === videoId);
        if (video) {
          video.user_liked = res.data.liked;
        }
      } catch (err) {
        // Ignore individual errors
      }
    }
  } catch (error) {
    console.error('Failed to load like status:', error);
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
    initializeCarousels();
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
            <!-- Language Switcher -->
            <div class="language-switcher">
              ${i18n.getAvailableLanguages().map(lang => `
                <button 
                  onclick="switchLanguage('${lang.code}')" 
                  class="language-btn ${i18n.getCurrentLanguage() === lang.code ? 'active' : ''}"
                  title="${lang.name}">
                  ${lang.flag}
                </button>
              `).join('')}
            </div>
            
            ${state.currentUser ? `
              ${state.currentUser.is_admin ? `
                <button onclick="navigateTo('admin')" class="btn btn-sm btn-secondary">
                  <i class="fas fa-cog"></i>
                  <span class="hidden sm:inline">${i18n.t('nav.admin')}</span>
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
                ${i18n.t('nav.login')}
              </button>
              <button onclick="showAuthModal('register')" class="btn btn-sm btn-secondary">
                ${i18n.t('nav.signup')}
              </button>
            `}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="bg-gray-50">
      
      <!-- Hero Section with Background Image -->
      <section class="hero-section relative overflow-hidden">
        <div class="hero-background"></div>
        <div class="hero-overlay"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div class="text-center">
            <h2 class="text-4xl sm:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              ${i18n.t('hero.title')}
            </h2>
            <p class="text-lg text-white mb-8 max-w-2xl mx-auto drop-shadow-md">
              ${i18n.t('hero.subtitle')}
            </p>
            <div class="flex gap-3 justify-center items-center flex-wrap mb-6">
              <button onclick="handleUploadClick()" class="btn btn-lg bg-white text-purple-600 hover:bg-gray-100 shadow-xl">
                <i class="fas fa-upload"></i>
                ${i18n.t('hero.upload')}
                ${!state.currentUser || state.currentUser.membership_type !== 'premium' ? `<span class="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded">${i18n.t('hero.premium_badge')}</span>` : ''}
              </button>
              ${!state.currentUser ? `
                <button onclick="showPricingModal()" class="btn btn-lg bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 shadow-xl">
                  <i class="fas fa-star"></i>
                  ${i18n.t('pricing.trial')}
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </section>

      <!-- Rankings Section -->
      <section class="py-6 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-3">
            <div class="section-title">
              <i class="fas fa-trophy"></i>
              <span>${i18n.t('section.rankings')}</span>
            </div>
          </div>
          
          <!-- Ranking Period Tabs -->
          <div class="tab-buttons mb-3">
            <button onclick="switchRankingPeriod('daily')" class="tab-btn ${state.currentRankingType === 'daily' ? 'active' : ''}">
              <i class="fas fa-clock"></i> ${i18n.t('ranking.daily')}
            </button>
            <button onclick="switchRankingPeriod('weekly')" class="tab-btn ${state.currentRankingType === 'weekly' ? 'active' : ''}">
              <i class="fas fa-calendar-week"></i> ${i18n.t('ranking.weekly')}
            </button>
            <button onclick="switchRankingPeriod('monthly')" class="tab-btn ${state.currentRankingType === 'monthly' ? 'active' : ''}">
              <i class="fas fa-calendar-alt"></i> ${i18n.t('ranking.monthly')}
            </button>
            <button onclick="switchRankingPeriod('yearly')" class="tab-btn ${state.currentRankingType === 'yearly' ? 'active' : ''}">
              <i class="fas fa-calendar"></i> ${i18n.t('ranking.yearly')}
            </button>
          </div>
          
          <!-- Horizontal Carousel -->
          <div class="carousel-container" id="ranking-carousel">
            <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('ranking-carousel', -1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="horizontal-scroll" id="ranking-scroll">
              ${state.rankings[state.currentRankingType].map((video, index) => renderRankingCard(video, index + 1)).join('')}
            </div>
            <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('ranking-carousel', 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- Latest Videos Section -->
      <section class="py-6 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-3">
            <div class="section-title">
              <i class="fas fa-video"></i>
              <span>${i18n.t('section.latest')}</span>
            </div>
          </div>
          
          <div class="tab-buttons mb-3">
            <button onclick="filterVideos('all')" class="tab-btn active" data-category="all">
              <i class="fas fa-th"></i> ${i18n.getCurrentLanguage() === 'ja' ? '全て' : 'All'}
            </button>
            <button onclick="filterVideos('bouldering')" class="tab-btn" data-category="bouldering">
              <i class="fas fa-mountain"></i> ${i18n.t('section.bouldering')}
            </button>
            <button onclick="filterVideos('competition')" class="tab-btn" data-category="competition">
              <i class="fas fa-trophy"></i> ${i18n.t('section.competition')}
            </button>
            <button onclick="filterVideos('tutorial')" class="tab-btn" data-category="tutorial">
              <i class="fas fa-graduation-cap"></i> ${i18n.t('section.tutorial')}
            </button>
            <button onclick="filterVideos('gym_review')" class="tab-btn" data-category="gym_review">
              <i class="fas fa-dumbbell"></i> ${i18n.getCurrentLanguage() === 'ja' ? 'ジム紹介' : 'Gym Reviews'}
            </button>
          </div>
          
          <!-- Horizontal Carousel -->
          <div class="carousel-container" id="videos-carousel">
            <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('videos-carousel', -1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="horizontal-scroll" id="videos-scroll">
              ${state.videos.map(video => renderVideoCard(video)).join('')}
            </div>
            <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('videos-carousel', 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- Blog Posts Section -->
      <section class="py-6 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-3">
            <div class="section-title">
              <i class="fas fa-newspaper"></i>
              <span>ブログ & ニュース</span>
            </div>
            <div class="section-action" onclick="window.location.hash='blog'">
              すべて見る <i class="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <!-- Horizontal Carousel -->
          <div class="carousel-container" id="blog-carousel">
            <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('blog-carousel', -1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="horizontal-scroll" id="blog-scroll">
              ${state.blogPosts.map(post => renderBlogCard(post)).join('')}
            </div>
            <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('blog-carousel', 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="py-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">${i18n.t('pricing.title')}</h3>
            <p class="text-sm text-gray-600">✨ ${i18n.t('pricing.trial')}</p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <!-- Free Plan -->
            <div class="card p-6 bg-white">
              <h4 class="text-lg font-bold mb-2">${i18n.t('pricing.free.title')}</h4>
              <div class="text-2xl font-bold text-gray-900 mb-3">${i18n.t('pricing.free.price')}<span class="text-sm font-normal text-gray-600">${i18n.t('pricing.free.month')}</span></div>
              <ul class="space-y-2 mb-4 text-sm">
                <li class="flex items-center gap-2 text-gray-400"><i class="fas fa-times text-xs"></i> <span class="line-through">${i18n.t('pricing.free.upload')}</span> <span class="text-xs">${i18n.t('pricing.free.upload_status')}</span></li>
                <li class="flex items-center gap-2 text-gray-400"><i class="fas fa-times text-xs"></i> <span class="line-through">${i18n.t('pricing.free.likes')}</span> <span class="text-xs">${i18n.t('pricing.free.likes_status')}</span></li>
              </ul>
              ${!state.currentUser ? `
                <button onclick="showAuthModal('register')" class="btn btn-sm btn-secondary w-full">
                  ${i18n.getCurrentLanguage() === 'ja' ? '無料で始める' : 'Start Free'}
                </button>
              ` : ''}
            </div>
            
            <!-- Premium Plan -->
            <div class="card p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white relative overflow-hidden">
              <h4 class="text-lg font-bold mb-2">${i18n.t('pricing.premium.title')}</h4>
              <div class="text-2xl font-bold mb-3">${i18n.t('pricing.premium.price')}<span class="text-sm font-normal opacity-90">${i18n.t('pricing.premium.month')}</span></div>
              <ul class="space-y-2 mb-4 text-sm">
                <li class="flex items-center gap-2"><i class="fas fa-heart text-red-300 text-xs"></i> <strong>${i18n.t('pricing.premium.feature1')}</strong></li>
                <li class="flex items-center gap-2"><i class="fas fa-heart text-red-300 text-xs"></i> <strong>${i18n.t('pricing.premium.feature2')}</strong></li>
                <li class="flex items-center gap-2"><i class="fas fa-heart text-red-300 text-xs"></i> <strong>${i18n.t('pricing.premium.feature3')}</strong></li>
              </ul>
              <button onclick="showPricingModal()" class="btn btn-sm w-full bg-white text-purple-600 hover:bg-gray-100 font-bold">
                <i class="fas fa-rocket"></i>
                ${i18n.t('pricing.cta')}
              </button>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- Footer -->
    ${renderFooter()}

    <!-- Modals -->
    <div id="auth-modal" class="modal"></div>
    <div id="upload-modal" class="modal"></div>
    <div id="video-modal" class="modal"></div>
    <div id="pricing-modal" class="modal"></div>
  `;
}

// ============ Footer ============
function renderFooter() {
  return `
    <footer class="bg-gray-900 text-gray-300 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <!-- Company Info -->
          <div>
            <h5 class="text-white font-bold mb-4 flex items-center gap-2">
              <i class="fas fa-mountain text-purple-500"></i>
              ClimbHero
            </h5>
            <p class="text-sm mb-4">
              クライミングコミュニティのための動画共有プラットフォーム
            </p>
            <div class="flex gap-3">
              <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-twitter"></i></a>
              <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-facebook"></i></a>
              <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-instagram"></i></a>
              <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div>
            <h5 class="text-white font-bold mb-4">クイックリンク</h5>
            <ul class="space-y-2 text-sm">
              <li><a href="#home" class="hover:text-white">ホーム</a></li>
              <li><a href="#" onclick="showPricingModal(); return false;" class="hover:text-white">料金プラン</a></li>
              <li><a href="#" class="hover:text-white">使い方ガイド</a></li>
              <li><a href="#" class="hover:text-white">よくある質問</a></li>
            </ul>
          </div>
          
          <!-- Legal -->
          <div>
            <h5 class="text-white font-bold mb-4">法的情報</h5>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white">利用規約</a></li>
              <li><a href="#" class="hover:text-white">プライバシーポリシー</a></li>
              <li><a href="#" class="hover:text-white">特定商取引法</a></li>
              <li><a href="#" class="hover:text-white">お問い合わせ</a></li>
            </ul>
          </div>
          
          <!-- Contact -->
          <div>
            <h5 class="text-white font-bold mb-4">運営会社</h5>
            <p class="text-sm mb-2"><strong>グッぼる</strong></p>
            <p class="text-sm mb-2">
              ボルダリングCafe & Shop<br>
              滋賀県彦根市
            </p>
            <p class="text-sm">
              <i class="fas fa-clock mr-2"></i>営業時間: 10:00-22:00<br>
              <i class="fas fa-envelope mr-2"></i>info@climbhero.info
            </p>
          </div>
        </div>
        
        <div class="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 ClimbHero by グッぼる. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

// ============ Ranking Card ============
function renderRankingCard(video, rank) {
  const score = video.total_score || video.likes;  // Now based on internal likes only
  const mediaSource = video.media_source || 'youtube';
  const mediaIcon = getMediaIcon(mediaSource);
  const mediaName = getMediaName(mediaSource);
  const isLiked = video.user_liked || false;
  
  // Rank badge position
  let rankBadge = '';
  if (rank <= 3) {
    rankBadge = `<div class="ranking-medal rank-${rank}">${rank}</div>`;
  } else {
    rankBadge = `<div class="ranking-badge-number">${rank}</div>`;
  }
  
  return `
    <div class="scroll-item">
      <div class="video-card-compact video-card-ranking">
        <div class="video-thumbnail" onclick="showVideoDetail(${video.id})">
          <img src="${video.thumbnail_url}" alt="${video.title}">
          <div class="duration-badge">${video.duration}</div>
          <span class="absolute top-2 right-2 media-source-badge">
            <i class="${mediaIcon}"></i> ${mediaName}
          </span>
          ${rankBadge}
          <div class="ranking-overlay">
            <div class="ranking-score-large">
              <i class="fas fa-heart"></i>
              <span>${score.toLocaleString()} いいね</span>
            </div>
          </div>
        </div>
        <div class="video-info-compact">
          <div class="video-title-compact line-clamp-2" onclick="showVideoDetail(${video.id})">${video.title}</div>
          <div class="video-meta-compact">
            <span><i class="fas fa-eye"></i> ${video.views.toLocaleString()}</span>
            <span class="like-count"><i class="fas fa-heart"></i> <span id="like-count-${video.id}">${video.likes}</span></span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs font-bold text-purple-600">
              ${getRankChange(rank)}
            </span>
            <button 
              class="like-btn ${isLiked ? 'liked' : ''}" 
              data-video-id="${video.id}"
              onclick="handleLike(event, ${video.id})"
              title="いいね">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ランキング変動を返す（デモ用）
function getRankChange(rank) {
  if (rank === 1) return '👑 1位';
  if (rank <= 3) return '🔥 急上昇';
  if (rank <= 10) return '📈 +' + Math.floor(Math.random() * 5 + 1);
  return '⭐ NEW';
}

// ============ Video Card ============
function renderVideoCard(video) {
  const mediaSource = video.media_source || 'youtube';
  const mediaIcon = getMediaIcon(mediaSource);
  const mediaName = getMediaName(mediaSource);
  const isLiked = video.user_liked || false;
  
  return `
    <div class="scroll-item">
      <div class="video-card-compact">
        <div class="video-thumbnail" onclick="showVideoDetail(${video.id})">
          <img src="${video.thumbnail_url}" alt="${video.title}">
          <div class="duration-badge">${video.duration}</div>
          <span class="absolute top-2 left-2 media-source-badge">
            <i class="${mediaIcon}"></i> ${mediaName}
          </span>
        </div>
        <div class="video-info-compact">
          <div class="video-title-compact line-clamp-2" onclick="showVideoDetail(${video.id})">${video.title}</div>
          <div class="video-meta-compact">
            <span><i class="fas fa-eye"></i> ${video.views.toLocaleString()}</span>
            <span class="like-count"><i class="fas fa-heart"></i> <span id="like-count-${video.id}">${video.likes}</span></span>
            <span><i class="fas fa-play-circle"></i> ${video.duration}</span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-gray-500">
              <i class="fas fa-user-circle"></i> ${video.channel_name}
            </span>
            <button 
              class="like-btn ${isLiked ? 'liked' : ''}" 
              data-video-id="${video.id}"
              onclick="handleLike(event, ${video.id})"
              title="いいね">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Get media icon
function getMediaIcon(source) {
  const icons = {
    'youtube': 'fab fa-youtube',
    'youtube_shorts': 'fab fa-youtube',
    'vimeo': 'fab fa-vimeo-v',
    'instagram': 'fab fa-instagram',
    'tiktok': 'fab fa-tiktok'
  };
  return icons[source] || 'fas fa-video';
}

// Get media display name
function getMediaName(source) {
  const names = {
    'youtube': 'YouTube',
    'youtube_shorts': 'Shorts',
    'vimeo': 'Vimeo',
    'instagram': 'Instagram',
    'tiktok': 'TikTok'
  };
  return names[source] || 'Video';
}

// ============ Blog Card ============
function renderBlogCard(post) {
  return `
    <div class="scroll-item">
      <div class="video-card-compact" onclick="navigateTo('blog/${post.id}')">
        ${post.image_url ? `
          <div class="video-thumbnail">
            <img src="${post.image_url}" alt="${post.title}">
          </div>
        ` : `
          <div class="video-thumbnail" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"></div>
        `}
        <div class="video-info-compact">
          <div class="video-title-compact line-clamp-2">${post.title}</div>
          <p class="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">${post.content.substring(0, 80)}...</p>
          <div class="video-meta-compact">
            <span><i class="fas fa-calendar"></i> ${formatDate(post.published_date)}</span>
            <span><i class="fas fa-newspaper"></i> ニュース</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ Carousel Functions ============
function initializeCarousels() {
  // Add smooth scrolling to all carousels
  document.querySelectorAll('.horizontal-scroll').forEach(carousel => {
    carousel.style.scrollBehavior = 'smooth';
    
    // Add scroll progress indicator
    const container = carousel.closest('.carousel-container');
    if (container && !container.querySelector('.scroll-progress')) {
      const progress = document.createElement('div');
      progress.className = 'scroll-progress';
      progress.style.width = '0%';
      container.appendChild(progress);
      
      // Update progress on scroll
      carousel.addEventListener('scroll', () => {
        const scrollWidth = carousel.scrollWidth - carousel.clientWidth;
        const scrolled = carousel.scrollLeft;
        const percent = (scrolled / scrollWidth) * 100;
        progress.style.width = percent + '%';
      });
    }
  });
  
  // Add entrance animation to cards
  document.querySelectorAll('.scroll-item').forEach((card, index) => {
    card.style.animationDelay = (index * 0.05) + 's';
    card.classList.add('animate-bounce-in');
  });
  
  // Add tooltips to stats badges
  document.querySelectorAll('.stats-badge').forEach(badge => {
    if (badge.textContent.includes('👁') || badge.textContent.includes('eye')) {
      badge.setAttribute('data-tooltip', '視聴回数');
      badge.classList.add('tooltip');
    } else if (badge.textContent.includes('❤') || badge.textContent.includes('heart')) {
      badge.setAttribute('data-tooltip', 'いいね数');
      badge.classList.add('tooltip');
    }
  });
}

function scrollCarousel(carouselId, direction) {
  const container = document.querySelector(`#${carouselId} .horizontal-scroll`);
  const scrollAmount = 300;
  container.scrollLeft += scrollAmount * direction;
}

// ============ Switch Ranking Period ============
async function switchRankingPeriod(period) {
  state.currentRankingType = period;
  
  // Show loading skeleton
  const rankingScroll = document.getElementById('ranking-scroll');
  if (rankingScroll) {
    rankingScroll.style.opacity = '0.5';
  }
  
  if (state.rankings[period].length === 0) {
    try {
      const response = await axios.get(`/api/rankings/${period}?limit=20`);
      state.rankings[period] = response.data || [];
    } catch (error) {
      showToast('ランキングの読み込みに失敗しました', 'error');
      if (rankingScroll) {
        rankingScroll.style.opacity = '1';
      }
      return;
    }
  }
  
  // Update tab active state
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Re-render ranking section with animation
  if (rankingScroll) {
    setTimeout(() => {
      rankingScroll.innerHTML = state.rankings[period].map((video, index) => renderRankingCard(video, index + 1)).join('');
      rankingScroll.style.opacity = '1';
      
      // Re-initialize carousel features
      document.querySelectorAll('#ranking-scroll .scroll-item').forEach((card, index) => {
        card.style.animationDelay = (index * 0.05) + 's';
        card.classList.add('animate-bounce-in');
      });
    }, 150);
  }
}

// ============ Helper Functions ============

// Language switcher
function switchLanguage(lang) {
  i18n.setLanguage(lang);
  state.currentLanguage = lang;
  // renderApp() will be called automatically by languageChanged event
}

function getCategoryName(category) {
  const categoryMap = {
    bouldering: 'section.bouldering',
    sport: 'section.sport',
    trad: 'section.trad',
    competition: 'section.competition',
    tutorial: 'section.tutorial',
    gear: 'section.gear',
    gym_review: i18n.getCurrentLanguage() === 'ja' ? 'ジム紹介' : 'Gym Reviews'
  };
  return categoryMap[category] ? i18n.t(categoryMap[category]) : category;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  const lang = i18n.getCurrentLanguage();
  
  if (lang === 'ja') {
    if (days === 0) return '今日';
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;
    if (days < 30) return `${Math.floor(days / 7)}週間前`;
    if (days < 365) return `${Math.floor(days / 30)}ヶ月前`;
    return `${Math.floor(days / 365)}年前`;
  } else {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }
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

// ============ Pricing Modal ============
function showPricingModal() {
  const modal = document.getElementById('pricing-modal');
  modal.innerHTML = `
    <div class="modal-content max-w-md">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold">プレミアムプラン</h3>
        <button onclick="closeModal('pricing-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg mb-6">
        <div class="text-center mb-4">
          <div class="text-4xl font-bold text-purple-600 mb-2">$20<span class="text-lg font-normal">/月</span></div>
          <p class="text-sm text-gray-600">15日間無料トライアル</p>
        </div>
        
        <ul class="space-y-2 text-sm">
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> 動画投稿無制限</li>
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> いいね・お気に入り機能</li>
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> 広告非表示</li>
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> AIグレード判定機能</li>
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> 優先サポート</li>
        </ul>
      </div>
      
      <form onsubmit="handlePremiumSubscribe(event)" class="space-y-4">
        ${!state.currentUser ? `
          <div>
            <label>ユーザー名</label>
            <input type="text" name="username" required>
          </div>
          <div>
            <label>メールアドレス</label>
            <input type="email" name="email" required>
          </div>
          <div>
            <label>パスワード</label>
            <input type="password" name="password" required>
          </div>
        ` : ''}
        
        <div>
          <label>クレジットカード番号</label>
          <input type="text" placeholder="1234 5678 9012 3456" required>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>有効期限</label>
            <input type="text" placeholder="MM/YY" required>
          </div>
          <div>
            <label>CVV</label>
            <input type="text" placeholder="123" required>
          </div>
        </div>
        
        <p class="text-xs text-gray-600">
          15日間の無料トライアル後、自動的に月額$20が請求されます。<br>
          いつでもキャンセル可能です。
        </p>
        
        <button type="submit" class="btn btn-primary btn-lg w-full">
          <i class="fas fa-crown"></i>
          15日間無料で始める
        </button>
      </form>
      
      <p class="text-xs text-center text-gray-500 mt-4">
        お支払い情報は安全に暗号化されて処理されます
      </p>
    </div>
  `;
  modal.classList.add('active');
}

async function handlePremiumSubscribe(event) {
  event.preventDefault();
  showToast('プレミアムプランへの登録処理を開始します...', 'info');
  
  // Simulate payment processing
  setTimeout(() => {
    closeModal('pricing-modal');
    showToast('プレミアムプランに登録しました！15日間無料でお試しいただけます', 'success');
  }, 1500);
}

// ============ Auth Modal (Continuing from previous implementation) ============
function showAuthModal(type) {
  const modal = document.getElementById('auth-modal');
  modal.innerHTML = `
    <div class="modal-content">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold">${type === 'login' ? i18n.t('auth.login.title') : i18n.t('auth.signup.title')}</h3>
        <button onclick="closeModal('auth-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form onsubmit="handleAuth(event, '${type}')" class="space-y-4">
        ${type === 'register' ? `
          <div>
            <label>${i18n.t('auth.name')}</label>
            <input type="text" name="username" required class="w-full">
          </div>
        ` : ''}
        
        <div>
          <label>${i18n.t('auth.email')}</label>
          <input type="email" name="email" required class="w-full">
        </div>
        
        <div>
          <label>${i18n.t('auth.password')}</label>
          <input type="password" name="password" required class="w-full">
        </div>
        
        <button type="submit" class="btn btn-primary w-full">
          ${type === 'login' ? i18n.t('auth.login_btn') : i18n.t('auth.signup_btn')}
        </button>
      </form>
      
      <p class="text-sm text-center text-gray-600 mt-4">
        ${type === 'login' ? i18n.t('auth.switch_to_signup') : i18n.t('auth.switch_to_login')}
        <a href="#" onclick="showAuthModal('${type === 'login' ? 'register' : 'login'}')" class="text-purple-600 font-medium">
          ${type === 'login' ? i18n.t('auth.signup.title') : i18n.t('auth.login.title')}
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
    showToast(i18n.t('toast.auth_success'), 'success');
  } catch (error) {
    showToast(error.response?.data?.error || i18n.t('toast.auth_error'), 'error');
  }
}

async function logout() {
  try {
    await axios.post('/api/auth/logout');
    state.currentUser = null;
    renderApp();
    showToast(i18n.t('toast.logout_success'), 'success');
  } catch (error) {
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'ログアウトに失敗しました' : 'Logout failed', 'error');
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
            <span><i class="fas fa-eye mr-1"></i>${video.views.toLocaleString()} 回視聴</span>
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

// ============ Like Handling with Free Plan Limit ============
async function handleLike(event, videoId) {
  event.stopPropagation(); // カードのクリックイベントを防ぐ
  
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  const btn = event.currentTarget;
  btn.disabled = true;
  
  try {
    const response = await axios.post(`/api/videos/${videoId}/like`);
    const data = response.data;
    
    // Update UI
    btn.classList.add('liked');
    const likeCountEl = document.getElementById(`like-count-${videoId}`);
    if (likeCountEl) {
      likeCountEl.textContent = data.likes;
    }
    
    // Show success message
    if (data.remaining_likes === 0) {
      showToast(`${i18n.t('toast.like_success')} ${i18n.t('toast.like_limit')}`, 'success');
      setTimeout(() => showPremiumLimitModal(data.user_like_count), 1500);
    } else if (data.remaining_likes !== 'unlimited') {
      showToast(`${i18n.t('toast.like_success')} ${i18n.t('toast.like_remaining', { count: data.remaining_likes })}`, 'success');
    } else {
      showToast(i18n.t('toast.like_success'), 'success');
    }
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      showToast(i18n.t('toast.already_liked'), 'info');
    } else if (error.response && error.response.status === 403) {
      // Free plan limit reached
      showPremiumLimitModal(error.response.data.current_count);
    } else if (error.response && error.response.status === 401) {
      showAuthModal('login');
    } else {
      showToast(i18n.getCurrentLanguage() === 'ja' ? 'いいねに失敗しました' : 'Like failed', 'error');
    }
  } finally {
    btn.disabled = false;
  }
}

async function likeVideo(videoId) {
  try {
    await axios.post(`/api/videos/${videoId}/like`);
    showToast('いいねしました', 'success');
    await loadInitialData();
  } catch (error) {
    if (error.response && error.response.status === 403) {
      showPremiumLimitModal(3);
    } else {
      showToast('いいねに失敗しました', 'error');
    }
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

// ============ Premium Limit Modal ============
function showPremiumLimitModal(currentLikes) {
  const modal = document.getElementById('premium-limit-modal') || createModal('premium-limit-modal');
  modal.innerHTML = `
    <div class="modal-content max-w-md">
      <div class="text-center mb-5">
        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
          <i class="fas fa-heart text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">${i18n.t('premium_limit.title')}</h3>
        <p class="text-sm text-gray-600">${i18n.t('premium_limit.subtitle', { count: currentLikes })}</p>
      </div>
      
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 mb-5">
        <h4 class="font-bold text-base mb-3 text-center text-purple-700">${i18n.t('premium_limit.features_title')}</h4>
        <ul class="space-y-2 text-sm">
          <li class="flex items-center gap-2">
            <i class="fas fa-heart text-red-500 text-xs"></i>
            <span class="text-gray-700">${i18n.t('premium_limit.feature1')}</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-upload text-purple-600 text-xs"></i>
            <span class="text-gray-700">${i18n.t('premium_limit.feature2')}</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-trophy text-yellow-500 text-xs"></i>
            <span class="text-gray-700">${i18n.t('premium_limit.feature3')}</span>
          </li>
        </ul>
        
        <div class="text-center mt-4 pt-3 border-t border-purple-200">
          <div class="text-2xl font-bold text-purple-600">${i18n.t('premium_limit.price')}<span class="text-base font-normal">${i18n.t('premium_limit.month')}</span></div>
          <div class="text-xs text-gray-600 mt-1">✨ ${i18n.t('premium_limit.trial')}</div>
        </div>
      </div>
      
      <div class="flex gap-3">
        <button onclick="closeModal('premium-limit-modal')" class="btn btn-sm btn-secondary flex-1">
          ${i18n.getCurrentLanguage() === 'ja' ? '後で' : 'Later'}
        </button>
        <button onclick="closeModal('premium-limit-modal'); showPricingModal();" class="btn btn-sm btn-primary flex-1">
          <i class="fas fa-crown"></i>
          ${i18n.t('premium_limit.cta')}
        </button>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

function createModal(id) {
  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'modal';
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  };
  document.body.appendChild(modal);
  return modal;
}

// ============ Upload Modal ============
function handleUploadClick() {
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  if (state.currentUser.membership_type !== 'premium') {
    showPremiumUploadModal();
    return;
  }
  
  showUploadModal();
}

function showPremiumUploadModal() {
  const modal = document.getElementById('premium-upload-modal') || createModal('premium-upload-modal');
  modal.innerHTML = `
    <div class="modal-content max-w-md">
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <i class="fas fa-upload text-white text-3xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">動画投稿はプレミアム限定</h3>
        <p class="text-gray-600">プレミアムプランで無制限に動画を投稿できます</p>
      </div>
      
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
        <h4 class="font-bold text-lg mb-3 text-center">プレミアムプランの特典</h4>
        <ul class="space-y-2">
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600"></i>
            <span class="text-gray-700"><strong>無制限</strong>の動画投稿</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600"></i>
            <span class="text-gray-700"><strong>無制限</strong>のいいね機能</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600"></i>
            <span class="text-gray-700">広告非表示</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600"></i>
            <span class="text-gray-700">AIグレード判定機能</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600"></i>
            <span class="text-gray-700">優先サポート</span>
          </li>
        </ul>
        
        <div class="text-center mt-4">
          <div class="text-3xl font-bold text-purple-600">$20<span class="text-lg font-normal">/月</span></div>
          <div class="text-sm text-gray-600 mt-1">✨ 15日間無料トライアル</div>
        </div>
      </div>
      
      <div class="flex gap-3">
        <button onclick="closeModal('premium-upload-modal')" class="btn btn-secondary flex-1">
          後で
        </button>
        <button onclick="closeModal('premium-upload-modal'); showPricingModal();" class="btn btn-primary flex-1">
          <i class="fas fa-crown"></i>
          今すぐアップグレード
        </button>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

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
    const url = category === 'all' ? '/api/videos?limit=20' : `/api/videos?category=${category}&limit=20`;
    const response = await axios.get(url);
    state.videos = response.data.videos || [];
    
    // Update tab active state
    document.querySelectorAll('[data-category]').forEach(btn => {
      if (btn.getAttribute('data-category') === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Re-render video section
    const videosScroll = document.getElementById('videos-scroll');
    if (videosScroll) {
      videosScroll.innerHTML = state.videos.map(video => renderVideoCard(video)).join('');
    }
  } catch (error) {
    showToast('動画の読み込みに失敗しました', 'error');
  }
}

// ============ Blog Detail (Simplified) ============
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
      
      ${renderFooter()}
    `;
  } catch (error) {
    showToast('ブログの読み込みに失敗しました', 'error');
    navigateTo('home');
  }
}

// ============ Admin Page (Simplified) ============
function renderAdminPage() {
  return `
    <div class="min-h-screen bg-gray-50">
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

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="card p-6">
          <h2 class="text-2xl font-bold mb-6">ブログ管理</h2>
          <div class="space-y-3">
            ${state.blogPosts.map(post => `
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">${post.title}</h4>
                  <p class="text-sm text-gray-600 mt-1">${formatDate(post.published_date)}</p>
                </div>
                <div class="flex gap-2">
                  <button class="btn btn-sm btn-secondary">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-secondary text-red-600">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </main>
    </div>
  `;
}

// ============ Event Listeners ============
function attachEventListeners() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}
