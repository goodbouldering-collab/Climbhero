// ============ Global State ============
const state = {
  currentUser: null,
  videos: [],
  favorites: [],
  trendingVideos: [],
  rankings: { daily: [], weekly: [], monthly: [], yearly: [] },
  blogPosts: [],
  blogTags: [],
  announcements: [],
  currentView: 'home',
  currentRankingType: 'weekly',
  loading: false,
  currentLanguage: 'ja',
  heroSlideIndex: 0,
  heroSlides: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop&q=90', // Majestic mountain rock face
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&h=600&fit=crop&q=90', // Natural rock formation
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=600&fit=crop&q=90', // Mountain peak panoramic
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=600&fit=crop&q=90', // Granite rock wall
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&h=600&fit=crop&q=90'  // Rocky mountain vista
  ]
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
  
  // 管理者がログイン済みで、かつURLに特定のハッシュがない場合は管理画面にリダイレクト
  if (state.currentUser && state.currentUser.is_admin && !window.location.hash) {
    window.location.hash = 'admin';
  }
  
  renderApp();
  
  // Initialize hero slideshow
  initHeroSlideshow();
  
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

// ============ Hero Slideshow ============
function initHeroSlideshow() {
  setInterval(() => {
    state.heroSlideIndex = (state.heroSlideIndex + 1) % state.heroSlides.length;
    updateHeroSlide();
  }, 5000); // Change slide every 5 seconds
}

function updateHeroSlide() {
  const slides = document.querySelectorAll('.hero-slide');
  slides.forEach((slide, index) => {
    if (index === state.heroSlideIndex) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });
}

// ============ Load Initial Data ============
async function loadInitialData() {
  try {
    const [videosRes, rankingsRes, blogRes, announcementsRes, trendingRes] = await Promise.all([
      axios.get('/api/videos?limit=20'),
      axios.get('/api/rankings/weekly?limit=20'),
      axios.get('/api/blog'),
      axios.get('/api/announcements'),
      axios.get('/api/videos/trending?limit=10')
    ]);
    
    state.videos = videosRes.data.videos || [];
    state.rankings.weekly = rankingsRes.data || [];
    state.blogPosts = blogRes.data || [];
    state.announcements = announcementsRes.data || [];
    state.trendingVideos = trendingRes.data.videos || [];
    
    // Load user like status and favorites for all videos
    if (state.currentUser) {
      await loadUserLikeStatus();
      await loadUserFavorites();
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

// Load user favorites
async function loadUserFavorites() {
  if (!state.currentUser) return;
  
  try {
    const res = await axios.get(`/api/users/${state.currentUser.id}/favorites`);
    state.favorites = res.data || [];
  } catch (error) {
    console.error('Failed to load favorites:', error);
    state.favorites = [];
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
  } else if (hash === 'api') {
    state.currentView = 'api';
  } else if (hash.startsWith('reset-password')) {
    state.currentView = 'home';
    // Show password reset form after a short delay
    setTimeout(() => {
      showPasswordResetForm();
    }, 300);
  } else if (hash === 'terms') {
    state.currentView = 'terms';
  } else if (hash === 'privacy') {
    state.currentView = 'privacy';
  } else if (hash === 'about') {
    state.currentView = 'about';
  } else if (hash === 'contact') {
    state.currentView = 'contact';
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
    loadAdminData();
  } else if (state.currentView === 'api') {
    root.innerHTML = renderApiPage();
  } else if (state.currentView === 'blog-detail') {
    renderBlogDetail();
  } else if (state.currentView === 'terms') {
    renderStaticPage('terms');
  } else if (state.currentView === 'privacy') {
    renderStaticPage('privacy');
  } else if (state.currentView === 'about') {
    renderStaticPage('about');
  } else if (state.currentView === 'contact') {
    renderContactPage();
  }
  
  attachEventListeners();
}

// ============ Home Page ============
function renderHomePage() {
  return `
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Logo Section -->
          <div class="flex items-center flex-shrink-0">
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <i class="fas fa-mountain text-base bg-gradient-to-br from-purple-600 to-pink-600" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
              <h1 class="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 whitespace-nowrap" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ClimbHero</h1>
            </div>
          </div>
          
          <!-- Right Section -->
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div class="language-switcher-medium flex">
              ${i18n.getAvailableLanguages().map(lang => `
                <button 
                  onclick="switchLanguage('${lang.code}')" 
                  class="language-btn-medium ${i18n.getCurrentLanguage() === lang.code ? 'active' : ''}"
                  title="${lang.name}">
                  ${lang.flag}
                </button>
              `).join('')}
            </div>
            
            ${state.currentUser ? `
              <!-- Notifications -->
              <div class="relative">
                <button onclick="toggleNotifications()" class="btn btn-sm btn-secondary relative">
                  <i class="fas fa-bell"></i>
                  <span id="notification-badge" class="hidden absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">0</span>
                </button>
              </div>
              
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
                <span class="hidden lg:inline text-sm font-medium text-gray-700">
                  ${state.currentUser.username}
                </span>
              </div>
              <button onclick="showChangePasswordModal()" class="btn btn-sm btn-secondary" title="パスワード変更">
                <i class="fas fa-key"></i>
              </button>
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
      
      <!-- Hero Section with Slideshow -->
      <section class="hero-section relative overflow-hidden">
        <div class="hero-slideshow">
          ${state.heroSlides.map((slide, index) => `
            <div class="hero-slide ${index === state.heroSlideIndex ? 'active' : ''}" style="background-image: url('${slide}')"></div>
          `).join('')}
        </div>
        <div class="hero-content">
          <h1 class="hero-title">
            ${i18n.t('hero.title')}
          </h1>
          <p class="hero-subtitle">
            ${i18n.t('hero.subtitle')}
          </p>
          <div class="hero-cta-buttons">
            <button onclick="handleUploadClick()" class="hero-cta-btn hero-cta-primary">
              <i class="fas fa-upload"></i>
              ${i18n.t('hero.upload')}
              ${!state.currentUser || state.currentUser.membership_type !== 'premium' ? `<span class="ml-2 text-xs bg-black/30 px-3 py-1 rounded-full">${i18n.t('hero.premium_badge')}</span>` : ''}
            </button>
            ${!state.currentUser ? `
              <button onclick="showPricingModal()" class="hero-cta-btn hero-cta-secondary">
                <i class="fas fa-star"></i>
                ${i18n.t('pricing.trial')}
              </button>
            ` : ''}
          </div>
        </div>
      </section>
      
      <!-- Announcement Text (Above Banner) -->
      ${state.announcements && state.announcements.length > 0 ? `
      <div class="bg-gray-50 border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-start gap-3">
            <i class="fas fa-info-circle text-purple-600 text-lg mt-1 flex-shrink-0"></i>
            <div class="flex-1">
              <h3 class="font-bold text-gray-900 mb-2 text-sm">${i18n.t('announcement.latest')}</h3>
              ${state.announcements.slice(0, 3).map(a => `
                <div class="mb-2 text-sm text-gray-700">
                  <span class="font-medium text-purple-600">● ${a.title}:</span> ${a.content}
                </div>
              `).join('')}
              ${state.announcements.length > 3 ? `
                <a href="#" onclick="showAnnouncementsModal(); return false;" class="text-xs text-purple-600 hover:text-purple-800 font-medium">
                  ${i18n.t('announcement.view_all')} <i class="fas fa-chevron-right"></i>
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
      ` : ''}
      
      ${state.announcements && state.announcements.length > 0 ? `
      <!-- Scrolling Announcement Banner -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div class="flex items-center gap-3">
            <i class="fas fa-bullhorn text-yellow-300 text-sm flex-shrink-0"></i>
            <div class="flex-1 min-w-0">
              <marquee behavior="scroll" direction="left" scrollamount="3" class="text-xs md:text-sm">
                ${state.announcements.map(a => `【${a.title}】${a.content}`).join(' ▪ ')}
              </marquee>
            </div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <!-- How to Use ClimbHero Section (Collapsible) -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onclick="toggleFeatureSection()" 
            class="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded transition">
            <h2 class="text-lg font-bold text-gray-900">
              <i class="fas fa-info-circle text-purple-600 mr-2"></i>
              ${i18n.t('feature.title')}
            </h2>
            <i id="feature-toggle-icon" class="fas fa-chevron-down text-gray-400 transition-transform"></i>
          </button>
          
          <div id="feature-content" class="hidden mt-4">
            <!-- Mission Statement -->
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-600 rounded-lg p-4 mb-6">
              <p class="text-sm text-gray-700 leading-relaxed">
                ${i18n.t('feature.mission')}
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <!-- Step 1: Discover -->
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-video text-3xl text-purple-600"></i>
              </div>
              <h3 class="font-bold text-gray-900 mb-2">${i18n.t('feature.step1.title')}</h3>
              <p class="text-sm text-gray-600">${i18n.t('feature.step1.desc')}</p>
            </div>
            
            <!-- Step 2: Share -->
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-share-alt text-3xl text-blue-600"></i>
              </div>
              <h3 class="font-bold text-gray-900 mb-2">${i18n.t('feature.step2.title')}</h3>
              <p class="text-sm text-gray-600">${i18n.t('feature.step2.desc')}</p>
            </div>
            
            <!-- Step 3: Data Growth -->
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-chart-line text-3xl text-green-600"></i>
              </div>
              <h3 class="font-bold text-gray-900 mb-2">${i18n.t('feature.step3.title')}</h3>
              <p class="text-sm text-gray-600">${i18n.t('feature.step3.desc')}</p>
            </div>
            
            <!-- Step 4: Authentic Value -->
            <div class="text-center">
              <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-mountain text-3xl text-yellow-600"></i>
              </div>
              <h3 class="font-bold text-gray-900 mb-2">${i18n.t('feature.step4.title')}</h3>
              <p class="text-sm text-gray-600">${i18n.t('feature.step4.desc')}</p>
            </div>
            </div>
            
            <div class="text-center">
              <p class="text-sm text-green-600 font-medium mb-3">
                <i class="fas fa-gift mr-2"></i>${i18n.t('feature.free_trial')}
              </p>
              <button onclick="showPricingModal()" class="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:from-purple-700 hover:to-purple-900 transition shadow-lg">
                <i class="fas fa-crown mr-2"></i>
                ${i18n.t('feature.upgrade')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Search Section (Below How to Use) -->
      <section class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="max-w-3xl mx-auto">
            <div class="relative w-full">
              <input 
                type="text" 
                placeholder="${i18n.t('search.placeholder')}"
                class="w-full pl-14 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base shadow-sm"
                onkeyup="handleSearch(event)"
                id="search-input">
              <i class="fas fa-search absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Rankings Section - 1番目 -->
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
      
      <!-- Trending Videos Section (いいね急増中) - 2番目 -->
      ${state.trendingVideos && state.trendingVideos.length > 0 ? `
      <section class="py-6 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-3">
            <div class="section-title">
              <i class="fas fa-fire text-orange-500"></i>
              <h2 class="text-xl font-bold">いいね急増中</h2>
            </div>
          </div>
          
          <div class="carousel-container" id="trending-carousel">
            <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('trending-carousel', -1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="horizontal-scroll" id="trending-scroll">
              ${state.trendingVideos.map(video => renderVideoCardWide(video)).join('')}
            </div>
            <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('trending-carousel', 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>
      ` : ''}
      
      <!-- Recommended Videos Section -->
      <section class="py-6 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-3">
            <div class="section-title">
              <i class="fas fa-star"></i>
              <span>${i18n.t('section.recommended')}</span>
            </div>
          </div>
          
          <div class="carousel-container" id="recommended-carousel">
            <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('recommended-carousel', -1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="horizontal-scroll" id="recommended-scroll">
              ${state.videos.slice(0, 8).map(video => renderVideoCardWide(video)).join('')}
            </div>
            <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('recommended-carousel', 1)">
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
              <i class="fas fa-grip-lines"></i> ${i18n.t('section.bouldering')}
            </button>
            <button onclick="filterVideos('lead')" class="tab-btn" data-category="lead">
              <i class="fas fa-link"></i> ${i18n.t('section.lead')}
            </button>
            <button onclick="filterVideos('alpine')" class="tab-btn" data-category="alpine">
              <i class="fas fa-mountain"></i> ${i18n.t('section.alpine')}
            </button>
            <button onclick="filterVideos('other')" class="tab-btn" data-category="other">
              <i class="fas fa-ellipsis-h"></i> ${i18n.t('section.other')}
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

      <!-- Favorites Section (Only for logged-in users) -->
      ${state.currentUser && state.favorites && state.favorites.length > 0 ? `
      <section class="py-6 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-3">
            <div class="section-title">
              <i class="fas fa-heart"></i>
              <span>${i18n.getCurrentLanguage() === 'ja' ? 'お気に入り' : 'Favorites'}</span>
            </div>
          </div>
          
          <!-- Horizontal Carousel -->
          <div class="carousel-container" id="favorites-carousel">
            <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('favorites-carousel', -1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="horizontal-scroll" id="favorites-scroll">
              ${state.favorites.map(video => renderVideoCard(video)).join('')}
            </div>
            <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('favorites-carousel', 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Blog Posts Section -->
      <section class="py-6 bg-gray-50">
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
              <a href="https://twitter.com/climbhero" target="_blank" class="text-gray-400 hover:text-white" title="Twitter">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="https://facebook.com/climbhero" target="_blank" class="text-gray-400 hover:text-white" title="Facebook">
                <i class="fab fa-facebook"></i>
              </a>
              <a href="https://instagram.com/climbhero" target="_blank" class="text-gray-400 hover:text-white" title="Instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="https://youtube.com/@climbhero" target="_blank" class="text-gray-400 hover:text-white" title="YouTube">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div>
            <h5 class="text-white font-bold mb-4">クイックリンク</h5>
            <ul class="space-y-2 text-sm">
              <li><a href="#home" class="hover:text-white">ホーム</a></li>
              <li><a href="#about" class="hover:text-white">ClimbHeroについて</a></li>
              <li><a href="#api" class="hover:text-white"><i class="fas fa-code mr-1"></i>API</a></li>
              <li><a href="#" onclick="showPricingModal(); return false;" class="hover:text-white">料金プラン</a></li>
              <li><a href="#contact" class="hover:text-white">お問い合わせ</a></li>
            </ul>
          </div>
          
          <!-- Legal -->
          <div>
            <h5 class="text-white font-bold mb-4">法的情報</h5>
            <ul class="space-y-2 text-sm">
              <li><a href="#terms" class="hover:text-white">利用規約</a></li>
              <li><a href="#privacy" class="hover:text-white">プライバシーポリシー</a></li>
              <li><a href="#about" class="hover:text-white">運営会社</a></li>
              <li><a href="#contact" class="hover:text-white">お問い合わせ</a></li>
            </ul>
          </div>
          
          <!-- Contact & Support -->
          <div>
            <h5 class="text-white font-bold mb-4">サポート</h5>
            <p class="text-sm mb-3">
              <i class="fas fa-clock mr-2 text-purple-400"></i>
              <strong>平日 10:00-18:00</strong>
            </p>
            <p class="text-sm mb-3">
              <i class="fas fa-map-marker-alt mr-2 text-purple-400"></i>
              〒100-0001<br>
              <span class="ml-6">東京都千代田区1-1-1</span>
            </p>
            <p class="text-sm">
              <i class="fas fa-envelope mr-2 text-purple-400"></i>
              <a href="#contact" class="hover:text-white">お問い合わせフォーム</a>
            </p>
          </div>
        </div>
        
        <div class="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 ClimbHero. All rights reserved.</p>
          <p class="mt-2 text-xs text-gray-500">
            Powered by AI-driven video classification | Built with ❤️ for climbers
          </p>
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
  const isFavorited = video.user_favorited || false;
  
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
            <span class="text-xs text-gray-500 truncate flex-1">
              <i class="fas fa-user-circle"></i> ${video.channel_name}
            </span>
            <div class="flex gap-1">
              <button 
                class="like-btn ${isLiked ? 'liked' : ''}" 
                data-video-id="${video.id}"
                onclick="handleLike(event, ${video.id})"
                title="${i18n.t('video.like_btn')}">
                <i class="fas fa-heart"></i>
              </button>
              ${state.currentUser ? `
              <button 
                class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                data-video-id="${video.id}"
                onclick="handleFavorite(event, ${video.id})"
                title="${i18n.getCurrentLanguage() === 'ja' ? 'お気に入り' : 'Favorite'}">
                <i class="fas fa-star"></i>
              </button>
              ` : ''}
              <button 
                class="share-btn" 
                onclick="event.stopPropagation(); showShareModal(${video.id})"
                title="${i18n.t('common.share')}">
                <i class="fas fa-share-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render video card with 80% width for recommended section
function renderVideoCardWide(video) {
  const mediaSource = video.media_source || 'youtube';
  const mediaIcon = getMediaIcon(mediaSource);
  const mediaName = getMediaName(mediaSource);
  const isLiked = video.user_liked || false;
  const isFavorited = video.user_favorited || false;
  
  return `
    <div class="scroll-item-wide">
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
            <span class="text-xs text-gray-500 truncate flex-1">
              <i class="fas fa-user-circle"></i> ${video.channel_name}
            </span>
            <div class="flex gap-1">
              <button 
                class="like-btn ${isLiked ? 'liked' : ''}" 
                data-video-id="${video.id}"
                onclick="handleLike(event, ${video.id})"
                title="${i18n.t('video.like_btn')}">
                <i class="fas fa-heart"></i>
              </button>
              ${state.currentUser ? `
              <button 
                class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                data-video-id="${video.id}"
                onclick="handleFavorite(event, ${video.id})"
                title="${i18n.getCurrentLanguage() === 'ja' ? 'お気に入り' : 'Favorite'}">
                <i class="fas fa-star"></i>
              </button>
              ` : ''}
              <button 
                class="share-btn" 
                onclick="event.stopPropagation(); showShareModal(${video.id})"
                title="${i18n.t('common.share')}">
                <i class="fas fa-share-alt"></i>
              </button>
            </div>
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

// Render video embed based on media source
function renderVideoEmbed(video) {
  const mediaSource = video.media_source || 'youtube';
  let embedUrl = '';
  
  if (mediaSource === 'youtube' || mediaSource === 'youtube_shorts') {
    // Extract YouTube video ID from various URL formats
    const videoId = extractYouTubeId(video.url);
    if (videoId) {
      // Add parameters to enable autoplay and improve compatibility
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    } else {
      return '<div class="flex items-center justify-center h-full text-white">動画を読み込めません</div>';
    }
  } else if (mediaSource === 'vimeo') {
    // Extract Vimeo video ID
    const vimeoId = video.url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (vimeoId) {
      embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
    }
  } else if (mediaSource === 'instagram') {
    // Instagram embed
    const postId = video.url.match(/\/reel\/([^\/]+)/)?.[1] || video.url.match(/\/p\/([^\/]+)/)?.[1];
    if (postId) {
      embedUrl = `${video.url}embed`;
    }
  } else if (mediaSource === 'tiktok') {
    // TikTok embed
    const videoId = video.url.match(/\/video\/(\d+)/)?.[1];
    if (videoId) {
      embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
    }
  }
  
  if (!embedUrl) {
    return '<div class="flex items-center justify-center h-full text-white">動画を読み込めません</div>';
  }
  
  return `<iframe src="${embedUrl}" 
                  class="w-full h-full rounded-lg" 
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen></iframe>`;
}

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/v\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
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
    lead: 'section.lead',
    alpine: 'section.alpine',
    other: 'section.other',
    competition: 'section.competition',
    tutorial: 'section.tutorial',
    gear: 'section.gear'
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

// ============ Feature Section Toggle ============
function toggleFeatureSection() {
  const content = document.getElementById('feature-content');
  const icon = document.getElementById('feature-toggle-icon');
  
  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    icon.classList.add('rotate-180');
  } else {
    content.classList.add('hidden');
    icon.classList.remove('rotate-180');
  }
}

// ============ Pricing Modal ============
function showPricingModal() {
  const modal = document.getElementById('pricing-modal');
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 380px; width: 90%;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">プレミアムプラン</h3>
        <button onclick="closeModal('pricing-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg mb-4">
        <div class="text-center mb-3">
          <div class="text-2xl font-bold text-purple-600 mb-1">$20<span class="text-sm font-normal">/月</span></div>
          <p class="text-xs text-gray-600">15日間無料トライアル</p>
        </div>
        
        <ul class="space-y-1 text-xs">
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600 text-xs"></i> 動画投稿無制限</li>
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600 text-xs"></i> いいね・お気に入り機能</li>
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600 text-xs"></i> 広告非表示</li>
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600 text-xs"></i> AIグレード判定機能</li>
          <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600 text-xs"></i> 優先サポート</li>
        </ul>
      </div>
      
      <form onsubmit="handlePremiumSubscribe(event)" class="space-y-3">
        ${!state.currentUser ? `
          <div>
            <label class="text-sm">ユーザー名</label>
            <input type="text" name="username" required class="text-sm">
          </div>
          <div>
            <label class="text-sm">メールアドレス</label>
            <input type="email" name="email" required class="text-sm">
          </div>
          <div>
            <label class="text-sm">パスワード</label>
            <input type="password" name="password" required class="text-sm">
          </div>
        ` : ''}
        
        <div>
          <label class="text-sm">クレジットカード番号</label>
          <input type="text" placeholder="1234 5678 9012 3456" required class="text-sm">
        </div>
        
        <div>
          <label class="text-sm">有効期限</label>
          <input type="text" placeholder="MM/YY" required class="text-sm">
        </div>
        
        <div>
          <label class="text-sm">CVV</label>
          <input type="text" placeholder="123" required class="text-sm">
        </div>
        
        <p class="text-xs text-gray-600">
          15日間の無料トライアル後、自動的に月額$20が請求されます。いつでもキャンセル可能です。
        </p>
        
        <button type="submit" class="btn btn-primary w-full text-sm py-2">
          <i class="fas fa-crown"></i>
          15日間無料で始める
        </button>
      </form>
      
      <p class="text-xs text-center text-gray-500 mt-3">
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
    <div class="modal-content" style="max-width: 380px; width: 90%;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">${type === 'login' ? i18n.t('auth.login.title') : i18n.t('auth.signup.title')}</h3>
        <button onclick="closeModal('auth-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form onsubmit="handleAuth(event, '${type}')" class="space-y-3">
        ${type === 'register' ? `
          <div>
            <label class="text-sm">${i18n.t('auth.name')}</label>
            <input type="text" name="username" required class="w-full text-sm">
          </div>
        ` : ''}
        
        <div>
          <label class="text-sm">${i18n.t('auth.email')}</label>
          <input type="email" name="email" required class="w-full text-sm">
        </div>
        
        <div>
          <label class="text-sm">${i18n.t('auth.password')}</label>
          <input type="password" name="password" required class="w-full text-sm">
        </div>
        
        <button type="submit" class="btn btn-primary w-full text-sm py-2">
          ${type === 'login' ? i18n.t('auth.login_btn') : i18n.t('auth.signup_btn')}
        </button>
      </form>
      
      ${type === 'login' ? `
        <div class="text-center mt-3">
          <a href="#" onclick="showPasswordResetModal(); return false;" class="text-xs text-purple-600 hover:text-purple-800">
            ${i18n.t('auth.forgot_password')}
          </a>
        </div>
      ` : ''}
      
      <p class="text-xs text-center text-gray-600 mt-3">
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
    
    // ログイン時に管理者であれば管理画面にリダイレクト
    if (type === 'login' && state.currentUser && state.currentUser.is_admin) {
      navigateTo('admin');
      showToast('管理者としてログインしました', 'success');
    } else {
      renderApp();
      showToast(i18n.t('toast.auth_success'), 'success');
    }
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

// ============ Password Reset ============
function showPasswordResetModal() {
  const modal = document.getElementById('auth-modal');
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 420px; width: 90%;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">${i18n.t('auth.reset_password.title')}</h3>
        <button onclick="closeModal('auth-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <p class="text-sm text-gray-600 mb-4">${i18n.t('auth.reset_password.desc')}</p>
      
      <form onsubmit="handlePasswordResetRequest(event)" class="space-y-3">
        <div>
          <label class="text-sm">${i18n.t('auth.email')}</label>
          <input type="email" name="email" required class="w-full text-sm" placeholder="your@email.com">
        </div>
        
        <button type="submit" class="btn btn-primary w-full text-sm py-2">
          ${i18n.t('auth.reset_password.send_btn')}
        </button>
      </form>
      
      <div class="text-center mt-3">
        <a href="#" onclick="showAuthModal('login'); return false;" class="text-xs text-purple-600 hover:text-purple-800">
          ${i18n.t('auth.reset_password.back_to_login')}
        </a>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

async function handlePasswordResetRequest(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get('email');
  
  try {
    await axios.post('/api/auth/password-reset/request', { email });
    showToast(i18n.t('auth.reset_password.success'), 'success');
    closeModal('auth-modal');
    
    // Show info modal with reset instructions
    setTimeout(() => {
      showPasswordResetInfoModal(email);
    }, 500);
  } catch (error) {
    showToast(error.response?.data?.error || i18n.t('auth.reset_password.error'), 'error');
  }
}

function showPasswordResetInfoModal(email) {
  const modal = document.getElementById('auth-modal');
  const resetUrl = `${window.location.origin}#reset-password`;
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 480px; width: 90%;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold"><i class="fas fa-envelope text-purple-600"></i> ${i18n.t('auth.reset_password.success')}</h3>
        <button onclick="closeModal('auth-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <p class="text-sm text-gray-700 mb-3">
          ${i18n.getCurrentLanguage() === 'ja' 
            ? `<strong>${email}</strong> にパスワードリセット用のリンクを送信しました。` 
            : `Password reset link has been sent to <strong>${email}</strong>.`}
        </p>
        <p class="text-xs text-gray-600">
          ${i18n.getCurrentLanguage() === 'ja' 
            ? 'メールが届かない場合は、迷惑メールフォルダをご確認ください。' 
            : 'If you don\'t see the email, please check your spam folder.'}
        </p>
      </div>
      
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p class="text-xs text-gray-700 mb-2">
          <i class="fas fa-info-circle text-yellow-600"></i>
          ${i18n.getCurrentLanguage() === 'ja' 
            ? '<strong>開発環境のため</strong>、以下のリンクから直接パスワードをリセットできます：' 
            : '<strong>In development mode</strong>, you can reset your password directly using the link below:'}
        </p>
        <div class="bg-white rounded p-2 border border-yellow-300 font-mono text-xs break-all">
          ${resetUrl}?email=${encodeURIComponent(email)}
        </div>
        <button onclick="navigator.clipboard.writeText('${resetUrl}?email=${encodeURIComponent(email)}'); showToast('コピーしました', 'success')" 
                class="mt-2 text-xs text-purple-600 hover:text-purple-800">
          <i class="fas fa-copy"></i> URLをコピー
        </button>
      </div>
      
      <button onclick="closeModal('auth-modal')" class="btn btn-primary w-full text-sm py-2">
        ${i18n.t('common.close')}
      </button>
    </div>
  `;
  modal.classList.add('active');
}

function showPasswordResetForm(email = '') {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const emailFromUrl = urlParams.get('email') || email;
  
  const modal = document.getElementById('auth-modal');
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 420px; width: 90%;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">${i18n.t('auth.reset_password.title')}</h3>
        <button onclick="closeModal('auth-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form onsubmit="handlePasswordReset(event)" class="space-y-3">
        <input type="hidden" name="email" value="${emailFromUrl}">
        
        <div>
          <label class="text-sm">${i18n.t('auth.email')}</label>
          <input type="email" value="${emailFromUrl}" disabled class="w-full text-sm bg-gray-100">
        </div>
        
        <div>
          <label class="text-sm">${i18n.t('auth.reset_password.new_password')}</label>
          <input type="password" name="password" required minlength="6" class="w-full text-sm">
        </div>
        
        <div>
          <label class="text-sm">${i18n.t('auth.reset_password.confirm_password')}</label>
          <input type="password" name="confirmPassword" required minlength="6" class="w-full text-sm">
        </div>
        
        <button type="submit" class="btn btn-primary w-full text-sm py-2">
          ${i18n.t('auth.reset_password.submit_btn')}
        </button>
      </form>
      
      <div class="text-center mt-3">
        <a href="#" onclick="showAuthModal('login'); return false;" class="text-xs text-purple-600 hover:text-purple-800">
          ${i18n.t('auth.reset_password.back_to_login')}
        </a>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

async function handlePasswordReset(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  if (password !== confirmPassword) {
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'パスワードが一致しません' : 'Passwords do not match', 'error');
    return;
  }
  
  try {
    await axios.post('/api/auth/password-reset/confirm', { email, password });
    showToast(i18n.t('auth.reset_password.token_success'), 'success');
    closeModal('auth-modal');
    
    // Auto login after password reset
    setTimeout(() => {
      showAuthModal('login');
    }, 1000);
  } catch (error) {
    showToast(error.response?.data?.error || i18n.t('auth.reset_password.token_invalid'), 'error');
  }
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
          ${renderVideoEmbed(video)}
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

// Handle favorite toggle
async function handleFavorite(event, videoId) {
  event.stopPropagation(); // Prevent card click event
  
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  const btn = event.currentTarget;
  btn.disabled = true;
  
  try {
    const response = await axios.post(`/api/videos/${videoId}/favorite`);
    const data = response.data;
    
    // Update button state
    if (data.favorited) {
      btn.classList.add('favorited');
      showToast(i18n.getCurrentLanguage() === 'ja' ? 'お気に入りに追加しました' : 'Added to favorites', 'success');
    } else {
      btn.classList.remove('favorited');
      showToast(i18n.getCurrentLanguage() === 'ja' ? 'お気に入りから削除しました' : 'Removed from favorites', 'info');
    }
    
    // Reload favorites list
    await loadUserFavorites();
    renderApp();
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      showAuthModal('login');
    } else {
      showToast(i18n.getCurrentLanguage() === 'ja' ? 'お気に入り処理に失敗しました' : 'Favorite action failed', 'error');
    }
  } finally {
    btn.disabled = false;
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
    <div class="modal-content" style="max-width: 360px; width: 90%;">
      <div class="text-center mb-4">
        <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center">
          <i class="fas fa-heart text-white text-lg"></i>
        </div>
        <h3 class="text-base font-bold text-gray-900 mb-1">${i18n.t('premium_limit.title')}</h3>
        <p class="text-xs text-gray-600">${i18n.t('premium_limit.subtitle', { count: currentLikes })}</p>
      </div>
      
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 mb-4">
        <h4 class="font-bold text-sm mb-2 text-center text-purple-700">${i18n.t('premium_limit.features_title')}</h4>
        <ul class="space-y-1 text-xs">
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
        
        <div class="text-center mt-3 pt-2 border-t border-purple-200">
          <div class="text-xl font-bold text-purple-600">${i18n.t('premium_limit.price')}<span class="text-sm font-normal">${i18n.t('premium_limit.month')}</span></div>
          <div class="text-xs text-gray-600 mt-1">✨ ${i18n.t('premium_limit.trial')}</div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button onclick="closeModal('premium-limit-modal')" class="btn btn-sm btn-secondary flex-1 text-xs">
          ${i18n.getCurrentLanguage() === 'ja' ? '後で' : 'Later'}
        </button>
        <button onclick="closeModal('premium-limit-modal'); showPricingModal();" class="btn btn-sm btn-primary flex-1 text-xs">
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
    <div class="modal-content" style="max-width: 360px; width: 90%;">
      <div class="text-center mb-4">
        <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
          <i class="fas fa-upload text-white text-xl"></i>
        </div>
        <h3 class="text-base font-bold text-gray-900 mb-1">動画投稿はプレミアム限定</h3>
        <p class="text-xs text-gray-600">プレミアムプランで無制限に動画を投稿できます</p>
      </div>
      
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 mb-4">
        <h4 class="font-bold text-sm mb-2 text-center">プレミアムプランの特典</h4>
        <ul class="space-y-1 text-xs">
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600 text-xs"></i>
            <span class="text-gray-700"><strong>無制限</strong>の動画投稿</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600 text-xs"></i>
            <span class="text-gray-700"><strong>無制限</strong>のいいね機能</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600 text-xs"></i>
            <span class="text-gray-700">広告非表示</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600 text-xs"></i>
            <span class="text-gray-700">AIグレード判定機能</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check-circle text-purple-600 text-xs"></i>
            <span class="text-gray-700">優先サポート</span>
          </li>
        </ul>
        
        <div class="text-center mt-3">
          <div class="text-xl font-bold text-purple-600">$20<span class="text-sm font-normal">/月</span></div>
          <div class="text-xs text-gray-600 mt-1">✨ 15日間無料トライアル</div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button onclick="closeModal('premium-upload-modal')" class="btn btn-secondary flex-1 text-xs">
          後で
        </button>
        <button onclick="closeModal('premium-upload-modal'); showPricingModal();" class="btn btn-primary flex-1 text-xs">
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
            <label>${i18n.t('upload.category')}</label>
            <select name="category" required class="w-full">
              <option value="bouldering">${i18n.t('section.bouldering')}</option>
              <option value="lead">${i18n.t('section.lead')}</option>
              <option value="alpine">${i18n.t('section.alpine')}</option>
              <option value="other">${i18n.t('section.other')}</option>
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
    
    // スクロール位置を初期化（ページトップへ）
    window.scrollTo(0, 0);
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
        <!-- User Management Section -->
        <div class="admin-section">
          <div class="admin-section-header">
            <div>
              <i class="fas fa-users mr-2"></i>
              会員管理
            </div>
            <div style="display: flex; gap: 8px;">
              <button onclick="exportUsersCSV()" class="btn btn-sm btn-secondary">
                <i class="fas fa-download mr-1"></i>
                ${i18n.t('admin.csv_export')}
              </button>
              <button onclick="showImportCSVModal()" class="btn btn-sm btn-primary">
                <i class="fas fa-upload mr-1"></i>
                ${i18n.t('admin.csv_import')}
              </button>
            </div>
          </div>
          <div class="horizontal-scroll" id="admin-users-scroll" style="gap: 16px; padding: 8px 0;">
            ${renderLoadingSkeleton(3)}
          </div>
        </div>
        
        <!-- Video Management Section -->
        <div class="admin-section">
          <div class="admin-section-header">
            <div>
              <i class="fas fa-video mr-2"></i>
              ${i18n.t('admin.videos')}
            </div>
          </div>
          <div class="horizontal-scroll" id="admin-videos-scroll" style="gap: 16px; padding: 8px 0;">
            ${renderLoadingSkeleton(3)}
          </div>
        </div>
        
        <!-- Stripe Settings Section -->
        <div class="admin-section">
          <div class="admin-section-header">
            <div>
              <i class="fab fa-stripe mr-2"></i>
              ${i18n.t('admin.stripe')}
            </div>
          </div>
          <div class="admin-form">
            <div class="admin-form-group">
              <label>${i18n.t('stripe.public_key')}</label>
              <input type="text" id="stripe-publishable-key" placeholder="pk_test_..." />
            </div>
            <div class="admin-form-group">
              <label>${i18n.t('stripe.secret_key')}</label>
              <input type="password" id="stripe-secret-key" placeholder="sk_test_..." />
            </div>
            <div class="admin-form-group">
              <label>${i18n.t('stripe.webhook_secret')}</label>
              <input type="password" id="stripe-webhook-secret" placeholder="whsec_..." />
            </div>
            <button onclick="saveStripeSettings()" class="btn btn-primary">
              <i class="fas fa-save mr-2"></i>
              ${i18n.t('stripe.save')}
            </button>
          </div>
        </div>
        
        <!-- Email Campaign Section -->
        <div class="admin-section">
          <div class="admin-section-header">
            <div>
              <i class="fas fa-envelope mr-2"></i>
              ${i18n.t('admin.email')}
            </div>
            <button onclick="createEmailCampaign()" class="btn btn-primary btn-sm">
              <i class="fas fa-plus mr-2"></i>
              ${i18n.t('email.new_campaign')}
            </button>
          </div>
          <div class="horizontal-scroll" id="admin-email-campaigns-scroll" style="gap: 16px; padding: 8px 0;">
            <div style="text-align: center; padding: 40px; color: #666;">
              ${i18n.t('common.loading')}
            </div>
          </div>
        </div>
        
        <!-- Announcements Management Section -->
        <div class="admin-section">
          <div class="admin-section-header">
            <div>
              <i class="fas fa-bullhorn mr-2"></i>
              ${i18n.t('admin.announcements')}
            </div>
            <button onclick="showAnnouncementModal()" class="btn btn-primary btn-sm">
              <i class="fas fa-plus mr-2"></i>
              ${i18n.t('admin.announcement_new')}
            </button>
          </div>
          <div class="horizontal-scroll" id="admin-announcements-scroll" style="gap: 16px; padding: 8px 0;">
            ${renderLoadingSkeleton(3)}
          </div>
        </div>
        
        <!-- Blog Management Section -->
        <div class="admin-section">
          <div class="admin-section-header">
            <div>
              <i class="fas fa-blog mr-2"></i>
              ${i18n.t('admin.blog')}
            </div>
            <div style="display: flex; gap: 8px;">
              <button onclick="showTagManagementModal()" class="btn btn-sm btn-secondary">
                <i class="fas fa-tags mr-1"></i>
                ${i18n.t('admin.tag_manage')}
              </button>
              <button onclick="showBlogModal()" class="btn btn-sm btn-primary">
                <i class="fas fa-plus mr-1"></i>
                ${i18n.t('admin.blog_new')}
              </button>
            </div>
          </div>
          <div id="admin-blog-list" style="background: white; border-radius: 8px; padding: 16px; margin-top: 12px;">
            <div style="text-align: center; padding: 40px; color: #666;">
              ${i18n.t('common.loading')}
            </div>
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

// ============ Community Features ============

// Search functionality
let searchTimeout;
function handleSearch(event) {
  clearTimeout(searchTimeout);
  const query = event.target.value.trim();
  
  if (query.length < 2) {
    hideSearchResults();
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
      showSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, 300);
}

function showSearchResults(results) {
  const existingResults = document.getElementById('search-results');
  if (existingResults) existingResults.remove();
  
  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'search-results';
  resultsDiv.className = 'absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50';
  
  resultsDiv.innerHTML = `
    <div class="p-4">
      ${results.videos && results.videos.length > 0 ? `
        <div class="mb-4">
          <h4 class="font-semibold text-sm text-gray-700 mb-2">${i18n.t('search.videos')}</h4>
          ${results.videos.map(video => `
            <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer" onclick="showVideoDetail(${video.id})">
              <img src="${video.thumbnail_url}" class="w-16 h-12 object-cover rounded" alt="${video.title}">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-gray-900 truncate">${video.title}</p>
                <p class="text-xs text-gray-500">${video.channel_name}</p>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${results.users && results.users.length > 0 ? `
        <div>
          <h4 class="font-semibold text-sm text-gray-700 mb-2">${i18n.t('search.users')}</h4>
          ${results.users.map(user => `
            <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer" onclick="showUserProfile(${user.id})">
              <div class="avatar w-10 h-10">${user.username[0].toUpperCase()}</div>
              <div class="flex-1">
                <p class="font-medium text-sm text-gray-900">${user.username}</p>
                ${user.bio ? `<p class="text-xs text-gray-500 truncate">${user.bio}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${(!results.videos || results.videos.length === 0) && (!results.users || results.users.length === 0) ? `
        <p class="text-sm text-gray-500 text-center py-4">${i18n.t('search.no_results')}</p>
      ` : ''}
    </div>
  `;
  
  const searchContainer = document.getElementById('search-input').parentElement;
  searchContainer.appendChild(resultsDiv);
  
  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeResults(e) {
      if (!searchContainer.contains(e.target)) {
        hideSearchResults();
        document.removeEventListener('click', closeResults);
      }
    });
  }, 100);
}

function hideSearchResults() {
  const results = document.getElementById('search-results');
  if (results) results.remove();
}

// Mobile search toggle
function toggleMobileSearch() {
  const searchBar = document.getElementById('mobile-search');
  if (searchBar) {
    searchBar.remove();
  } else {
    const header = document.querySelector('header > div');
    const mobileSearch = document.createElement('div');
    mobileSearch.id = 'mobile-search';
    mobileSearch.className = 'md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 z-40';
    mobileSearch.innerHTML = `
      <div class="relative">
        <input 
          type="text" 
          placeholder="${i18n.t('search.placeholder')}"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          onkeyup="handleSearch(event)"
          id="mobile-search-input">
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
    `;
    header.parentElement.appendChild(mobileSearch);
  }
}

// Notifications
async function toggleNotifications() {
  const existingPanel = document.getElementById('notifications-panel');
  if (existingPanel) {
    existingPanel.remove();
    return;
  }
  
  try {
    const response = await axios.get('/api/notifications');
    const notifications = response.data;
    
    const panel = document.createElement('div');
    panel.id = 'notifications-panel';
    panel.className = 'absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50';
    
    panel.innerHTML = `
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="font-bold text-gray-900">${i18n.t('notifications.title')}</h3>
        ${notifications.length > 0 ? `
          <button onclick="markAllNotificationsRead()" class="text-xs text-purple-600 hover:text-purple-700">
            ${i18n.t('notifications.mark_all_read')}
          </button>
        ` : ''}
      </div>
      <div class="divide-y divide-gray-100">
        ${notifications.length > 0 ? notifications.map(notif => `
          <div class="p-4 hover:bg-gray-50 cursor-pointer ${notif.is_read ? 'opacity-60' : 'bg-purple-50'}" onclick="markNotificationRead(${notif.id}, '${notif.link}')">
            <p class="text-sm font-medium text-gray-900">${notif.title}</p>
            <p class="text-xs text-gray-600 mt-1">${notif.message}</p>
            <p class="text-xs text-gray-400 mt-1">${formatDate(notif.created_at)}</p>
          </div>
        `).join('') : `
          <div class="p-8 text-center">
            <i class="fas fa-bell-slash text-gray-300 text-3xl mb-2"></i>
            <p class="text-sm text-gray-500">${i18n.t('notifications.no_notifications')}</p>
          </div>
        `}
      </div>
    `;
    
    const notifButton = event.target.closest('button').parentElement;
    notifButton.appendChild(panel);
    
    // Close on click outside
    setTimeout(() => {
      document.addEventListener('click', function closeNotifications(e) {
        if (!notifButton.contains(e.target)) {
          panel.remove();
          document.removeEventListener('click', closeNotifications);
        }
      });
    }, 100);
    
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
}

async function markNotificationRead(id, link) {
  try {
    await axios.post(`/api/notifications/${id}/read`);
    if (link) {
      window.location.href = link;
    }
    document.getElementById('notifications-panel').remove();
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

async function markAllNotificationsRead() {
  try {
    await axios.post('/api/notifications/read-all');
    document.getElementById('notifications-panel').remove();
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'すべて既読にしました' : 'All marked as read', 'success');
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  }
}

// Share functionality
function showShareModal(videoId) {
  const modal = document.getElementById('share-modal') || createModal('share-modal');
  const video = state.videos.find(v => v.id === videoId);
  if (!video) return;
  
  const shareUrl = `${window.location.origin}/#video/${videoId}`;
  
  modal.innerHTML = `
    <div class="modal-content max-w-md">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold">${i18n.t('share.title')}</h3>
        <button onclick="closeModal('share-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="space-y-3">
        <button onclick="copyToClipboard('${shareUrl}')" class="btn btn-secondary w-full justify-start">
          <i class="fas fa-link"></i>
          ${i18n.t('share.copy_link')}
        </button>
        
        <button onclick="shareToTwitter('${encodeURIComponent(video.title)}', '${shareUrl}', ${videoId})" class="btn btn-secondary w-full justify-start">
          <i class="fab fa-twitter text-blue-400"></i>
          ${i18n.t('share.twitter')}
        </button>
        
        <button onclick="shareToFacebook('${shareUrl}', ${videoId})" class="btn btn-secondary w-full justify-start">
          <i class="fab fa-facebook text-blue-600"></i>
          ${i18n.t('share.facebook')}
        </button>
        
        <button onclick="shareToLine('${encodeURIComponent(video.title)}', '${shareUrl}', ${videoId})" class="btn btn-secondary w-full justify-start">
          <i class="fab fa-line text-green-500"></i>
          ${i18n.t('share.line')}
        </button>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(i18n.t('share.copied'), 'success');
    closeModal('share-modal');
  });
}

function shareToTwitter(text, url, videoId) {
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  trackShare('twitter', videoId);
}

function shareToFacebook(url, videoId) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  trackShare('facebook', videoId);
}

function shareToLine(text, url, videoId) {
  window.open(`https://line.me/R/msg/text/?${text}%20${url}`, '_blank');
  trackShare('line', videoId);
}

async function trackShare(platform, videoId) {
  try {
    await axios.post('/api/shares', { platform, video_id: videoId });
  } catch (error) {
    console.error('Failed to track share:', error);
  }
}

// User profile
function showUserProfile(userId) {
  // TODO: Implement user profile view
  showToast(i18n.getCurrentLanguage() === 'ja' ? 'ユーザープロフィール機能は準備中です' : 'User profile feature coming soon', 'info');
}

// Follow/Unfollow
async function toggleFollow(userId) {
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  try {
    const response = await axios.post(`/api/users/${userId}/follow`);
    showToast(response.data.following ? i18n.t('common.following') : i18n.t('common.follow'), 'success');
    renderApp();
  } catch (error) {
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'フォロー処理に失敗しました' : 'Follow action failed', 'error');
  }
}


// ============ Admin Functions ============

// Load admin videos
async function loadAdminVideos() {
  try {
    const response = await axios.get('/api/admin/videos');
    const videos = response.data;
    
    const tbody = document.getElementById('admin-videos-table');
    if (!tbody) return;
    
    if (videos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px;">
            ${i18n.t('common.loading')}
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = videos.map(video => `
      <tr>
        <td>${video.id}</td>
        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${video.title}</td>
        <td>${getCategoryName(video.category)}</td>
        <td>${video.likes}</td>
        <td>${video.views}</td>
        <td>
          <div class="admin-actions">
            <button onclick="editVideo(${video.id})" class="btn-edit">
              <i class="fas fa-edit"></i> ${i18n.t('common.edit')}
            </button>
            <button onclick="deleteVideo(${video.id})" class="btn-delete">
              <i class="fas fa-trash"></i> ${i18n.t('common.delete')}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load admin videos:', error);
  }
}

// Edit video
async function editVideo(videoId) {
  try {
    const response = await axios.get(`/api/videos/${videoId}`);
    const video = response.data;
    
    const title = prompt(i18n.t('admin.video_title'), video.title);
    if (!title) return;
    
    const category = prompt(i18n.t('admin.video_category') + ' (bouldering/lead/alpine/other)', video.category);
    if (!category) return;
    
    const likes = parseInt(prompt(i18n.t('admin.video_likes'), video.likes) || '0');
    const views = parseInt(prompt(i18n.t('admin.video_views'), video.views) || '0');
    
    await axios.put(`/api/admin/videos/${videoId}`, {
      title,
      description: video.description,
      category,
      likes,
      views
    });
    
    showToast(i18n.getCurrentLanguage() === 'ja' ? '動画を更新しました' : 'Video updated', 'success');
    loadAdminVideos();
    await loadInitialData();
  } catch (error) {
    console.error('Failed to edit video:', error);
    showToast(i18n.getCurrentLanguage() === 'ja' ? '動画の更新に失敗しました' : 'Failed to update video', 'error');
  }
}

// Delete video
async function deleteVideo(videoId) {
  if (!confirm(i18n.t('admin.video_confirm_delete'))) return;
  
  try {
    await axios.delete(`/api/admin/videos/${videoId}`);
    showToast(i18n.getCurrentLanguage() === 'ja' ? '動画を削除しました' : 'Video deleted', 'success');
    loadAdminVideos();
    await loadInitialData();
  } catch (error) {
    console.error('Failed to delete video:', error);
    showToast(i18n.getCurrentLanguage() === 'ja' ? '動画の削除に失敗しました' : 'Failed to delete video', 'error');
  }
}

// Load admin announcements
async function loadAdminAnnouncements() {
  try {
    const response = await axios.get('/api/admin/announcements');
    const announcements = response.data;
    
    const tbody = document.getElementById('admin-announcements-table');
    if (!tbody) return;
    
    if (announcements.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px;">
            ${i18n.t('announcement.no_announcements')}
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = announcements.map(announcement => `
      <tr>
        <td>${announcement.id}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${announcement.title}</td>
        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${announcement.content}</td>
        <td>
          <span class="badge ${announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
            ${announcement.is_active ? i18n.t('admin.announcement_active') : i18n.t('admin.announcement_inactive')}
          </span>
        </td>
        <td>
          <div class="admin-actions">
            <button onclick="editAnnouncement(${announcement.id})" class="btn-edit">
              <i class="fas fa-edit"></i> ${i18n.t('common.edit')}
            </button>
            <button onclick="deleteAnnouncement(${announcement.id})" class="btn-delete">
              <i class="fas fa-trash"></i> ${i18n.t('common.delete')}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load admin announcements:', error);
  }
}

// Show announcement modal
function showAnnouncementModal(announcementId = null) {
  // Simple prompt-based implementation
  const title = prompt(i18n.t('admin.announcement_title'), '');
  if (!title) return;
  
  const content = prompt(i18n.t('admin.announcement_content'), '');
  if (!content) return;
  
  const priority = parseInt(prompt(i18n.t('admin.announcement_priority') + ' (0-10)', '0') || '0');
  const is_active = confirm(i18n.getCurrentLanguage() === 'ja' ? '公開しますか？' : 'Make it active?') ? 1 : 0;
  
  if (announcementId) {
    updateAnnouncement(announcementId, { title, content, priority, is_active });
  } else {
    createAnnouncement({ title, content, priority, is_active });
  }
}

// Create announcement
async function createAnnouncement(data) {
  try {
    await axios.post('/api/admin/announcements', data);
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'お知らせを作成しました' : 'Announcement created', 'success');
    loadAdminAnnouncements();
    await loadInitialData();
  } catch (error) {
    console.error('Failed to create announcement:', error);
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'お知らせの作成に失敗しました' : 'Failed to create announcement', 'error');
  }
}

// Edit announcement
async function editAnnouncement(announcementId) {
  try {
    const response = await axios.get('/api/admin/announcements');
    const announcements = response.data;
    const announcement = announcements.find(a => a.id === announcementId);
    
    if (!announcement) return;
    
    const title = prompt(i18n.t('admin.announcement_title'), announcement.title);
    if (!title) return;
    
    const content = prompt(i18n.t('admin.announcement_content'), announcement.content);
    if (!content) return;
    
    const priority = parseInt(prompt(i18n.t('admin.announcement_priority') + ' (0-10)', announcement.priority) || '0');
    const is_active = confirm(i18n.getCurrentLanguage() === 'ja' ? '公開しますか？' : 'Make it active?') ? 1 : 0;
    
    await updateAnnouncement(announcementId, { title, content, priority, is_active });
  } catch (error) {
    console.error('Failed to edit announcement:', error);
  }
}

// Update announcement
async function updateAnnouncement(announcementId, data) {
  try {
    await axios.put(`/api/admin/announcements/${announcementId}`, data);
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'お知らせを更新しました' : 'Announcement updated', 'success');
    loadAdminAnnouncements();
    await loadInitialData();
  } catch (error) {
    console.error('Failed to update announcement:', error);
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'お知らせの更新に失敗しました' : 'Failed to update announcement', 'error');
  }
}

// Delete announcement
async function deleteAnnouncement(announcementId) {
  if (!confirm(i18n.t('admin.announcement_confirm_delete'))) return;
  
  try {
    await axios.delete(`/api/admin/announcements/${announcementId}`);
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'お知らせを削除しました' : 'Announcement deleted', 'success');
    loadAdminAnnouncements();
    await loadInitialData();
  } catch (error) {
    console.error('Failed to delete announcement:', error);
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'お知らせの削除に失敗しました' : 'Failed to delete announcement', 'error');
  }
}

// Call load functions when admin page is rendered
if (window.location.hash === '#admin') {
  setTimeout(() => {
    loadAdminVideos();
    loadAdminAnnouncements();
  }, 100);
}


// ============ Stripe Settings Functions ============

// Load Stripe settings
async function loadStripeSettings() {
  try {
    const response = await axios.get('/api/admin/stripe-settings');
    const settings = response.data;
    
    document.getElementById('stripe-publishable-key').value = settings.publishable_key || '';
    document.getElementById('stripe-secret-key').value = settings.secret_key || '';
    document.getElementById('stripe-webhook-secret').value = settings.webhook_secret || '';
  } catch (error) {
    console.error('Failed to load Stripe settings:', error);
  }
}

// Save Stripe settings
async function saveStripeSettings() {
  const publishable_key = document.getElementById('stripe-publishable-key').value.trim();
  const secret_key = document.getElementById('stripe-secret-key').value.trim();
  const webhook_secret = document.getElementById('stripe-webhook-secret').value.trim();
  
  if (!publishable_key || !secret_key) {
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'Publishable KeyとSecret Keyは必須です' : 'Publishable Key and Secret Key are required', 'error');
    return;
  }
  
  try {
    await axios.post('/api/admin/stripe-settings', {
      publishable_key,
      secret_key,
      webhook_secret
    });
    
    showToast(i18n.t('stripe.saved'), 'success');
  } catch (error) {
    console.error('Failed to save Stripe settings:', error);
    showToast(i18n.t('stripe.error'), 'error');
  }
}

// ============ Email Campaign Functions ============

// Load email campaigns
async function loadEmailCampaigns() {
  try {
    const response = await axios.get('/api/admin/email-campaigns');
    const campaigns = response.data;
    
    const tbody = document.getElementById('admin-email-campaigns-table');
    if (!tbody) return;
    
    if (campaigns.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px;">
            ${i18n.getCurrentLanguage() === 'ja' ? '配信履歴はありません' : 'No campaigns'}
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = campaigns.map(campaign => `
      <tr>
        <td>${campaign.id}</td>
        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${campaign.subject}</td>
        <td>${campaign.recipient_count}</td>
        <td>
          <span class="badge ${
            campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
            campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }">
            ${i18n.t('email.status_' + campaign.status)}
          </span>
        </td>
        <td>${campaign.sent_at ? new Date(campaign.sent_at).toLocaleString(state.currentLanguage === 'ja' ? 'ja-JP' : 'en-US') : '-'}</td>
        <td>
          <div class="admin-actions">
            ${campaign.status === 'draft' ? `
              <button onclick="sendEmailCampaign(${campaign.id})" class="btn-edit">
                <i class="fas fa-paper-plane"></i> ${i18n.t('email.send')}
              </button>
            ` : ''}
            <button onclick="deleteEmailCampaign(${campaign.id})" class="btn-delete">
              <i class="fas fa-trash"></i> ${i18n.t('common.delete')}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load email campaigns:', error);
  }
}

// Create email campaign
async function createEmailCampaign() {
  const subject = prompt(i18n.t('email.subject'), '');
  if (!subject) return;
  
  const content = prompt(i18n.t('email.content'), '');
  if (!content) return;
  
  try {
    await axios.post('/api/admin/email-campaigns', { subject, content });
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'メールキャンペーンを作成しました' : 'Campaign created', 'success');
    loadEmailCampaigns();
  } catch (error) {
    console.error('Failed to create email campaign:', error);
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'キャンペーンの作成に失敗しました' : 'Failed to create campaign', 'error');
  }
}

// Send email campaign
async function sendEmailCampaign(campaignId) {
  if (!confirm(i18n.t('email.confirm_send'))) return;
  
  try {
    const response = await axios.post(`/api/admin/email-campaigns/${campaignId}/send`);
    showToast(i18n.t('email.sent_success') + ` (${response.data.sent_count}${i18n.getCurrentLanguage() === 'ja' ? '件' : ' emails'})`, 'success');
    loadEmailCampaigns();
  } catch (error) {
    console.error('Failed to send email campaign:', error);
    showToast(i18n.t('email.sent_error'), 'error');
  }
}

// Delete email campaign
async function deleteEmailCampaign(campaignId) {
  if (!confirm(i18n.getCurrentLanguage() === 'ja' ? 'このキャンペーンを削除してもよろしいですか？' : 'Delete this campaign?')) return;
  
  try {
    await axios.delete(`/api/admin/email-campaigns/${campaignId}`);
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'キャンペーンを削除しました' : 'Campaign deleted', 'success');
    loadEmailCampaigns();
  } catch (error) {
    console.error('Failed to delete email campaign:', error);
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'キャンペーンの削除に失敗しました' : 'Failed to delete campaign', 'error');
  }
}

// Call load functions when admin page is rendered
if (window.location.hash === '#admin') {
  setTimeout(() => {
    loadAdminVideos();
    loadAdminAnnouncements();
    loadStripeSettings();
    loadEmailCampaigns();
  }, 100);
}

// ============ Static Pages ============

async function renderStaticPage(pageType) {
  const root = document.getElementById('root');
  
  // Show loading
  root.innerHTML = `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
        <p class="text-gray-600">${i18n.t('common.loading')}</p>
      </div>
    </div>
  `;
  
  try {
    const response = await axios.get(`/api/pages/${pageType}`);
    const page = response.data;
    
    root.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <div class="flex items-center gap-3">
                <a href="#home" class="flex items-center gap-3 hover:opacity-80 transition">
                  <i class="fas fa-mountain text-purple-600 text-2xl"></i>
                  <h1 class="text-xl font-bold text-gray-900">ClimbHero</h1>
                </a>
              </div>
              <a href="#home" class="text-gray-600 hover:text-gray-900">
                <i class="fas fa-times text-xl"></i>
              </a>
            </div>
          </div>
        </header>
        
        <!-- Content -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">${page.title}</h1>
            <p class="text-sm text-gray-500 mb-8">
              <i class="fas fa-calendar mr-2"></i>最終更新: ${page.last_updated}
            </p>
            
            <div class="prose prose-lg max-w-none static-page-content">
              ${marked.parse(page.content)}
            </div>
          </div>
          
          <div class="mt-8 text-center">
            <a href="#home" class="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
              <i class="fas fa-arrow-left"></i>
              ホームに戻る
            </a>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load page:', error);
    root.innerHTML = `
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p class="text-gray-600 mb-4">ページの読み込みに失敗しました</p>
          <a href="#home" class="text-purple-600 hover:text-purple-700">ホームに戻る</a>
        </div>
      </div>
    `;
  }
}

// ============ Contact Page ============

function renderContactPage() {
  const root = document.getElementById('root');
  
  root.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <a href="#home" class="flex items-center gap-3 hover:opacity-80 transition">
                <i class="fas fa-mountain text-purple-600 text-2xl"></i>
                <h1 class="text-xl font-bold text-gray-900">ClimbHero</h1>
              </a>
            </div>
            <a href="#home" class="text-gray-600 hover:text-gray-900">
              <i class="fas fa-times text-xl"></i>
            </a>
          </div>
        </div>
      </header>
      
      <!-- Content -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            <i class="fas fa-envelope mr-3 text-purple-600"></i>
            お問い合わせ
          </h1>
          <p class="text-gray-600 mb-8">
            ご質問、ご意見、パートナーシップに関するお問い合わせは、下記フォームよりご連絡ください。
          </p>
          
          <!-- Contact Form -->
          <form id="contactForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                お名前 <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="contact_name" 
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="山田 太郎"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span class="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                id="contact_email" 
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="email@example.com"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                件名
              </label>
              <input 
                type="text" 
                id="contact_subject" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="お問い合わせの件名"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                お問い合わせ内容 <span class="text-red-500">*</span>
              </label>
              <textarea 
                id="contact_message" 
                required
                rows="8"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="お問い合わせ内容をご記入ください"
              ></textarea>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">
                <i class="fas fa-info-circle mr-2 text-purple-600"></i>
                ご入力いただいた個人情報は、お問い合わせ対応のみに使用し、
                <a href="#privacy" class="text-purple-600 hover:underline">プライバシーポリシー</a>
                に基づき適切に管理いたします。
              </p>
            </div>
            
            <div class="flex gap-4">
              <button 
                type="submit" 
                class="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium"
              >
                <i class="fas fa-paper-plane mr-2"></i>
                送信する
              </button>
              <a 
                href="#home" 
                class="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium text-center"
              >
                キャンセル
              </a>
            </div>
          </form>
        </div>
        
        <!-- Contact Information -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-bold text-gray-900 mb-4">
              <i class="fas fa-clock mr-2 text-purple-600"></i>
              サポート時間
            </h3>
            <p class="text-gray-600">平日 10:00-18:00</p>
            <p class="text-sm text-gray-500 mt-2">
              ※土日祝日は休業日となります
            </p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-bold text-gray-900 mb-4">
              <i class="fas fa-map-marker-alt mr-2 text-purple-600"></i>
              所在地
            </h3>
            <p class="text-gray-600">
              〒100-0001<br>
              東京都千代田区1-1-1
            </p>
          </div>
        </div>
        
        <div class="mt-8 text-center">
          <a href="#home" class="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
            <i class="fas fa-arrow-left"></i>
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  `;
  
  // Attach form submit handler
  setTimeout(() => {
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', handleContactSubmit);
    }
  }, 100);
}

// ============ API Documentation Page ============
function renderApiPage() {
  const baseUrl = window.location.origin;
  
  const apiEndpoints = [
    {
      endpoint: '/api/videos',
      method: 'GET',
      description: i18n.getCurrentLanguage() === 'ja' ? '動画一覧を取得' : 'Get list of videos',
      params: 'page, limit, category, search',
      example: `${baseUrl}/api/videos?limit=10&category=bouldering`
    },
    {
      endpoint: '/api/videos/trending',
      method: 'GET',
      description: i18n.getCurrentLanguage() === 'ja' ? 'トレンド動画を取得' : 'Get trending videos',
      params: 'limit',
      example: `${baseUrl}/api/videos/trending?limit=10`
    },
    {
      endpoint: '/api/rankings/{period}',
      method: 'GET',
      description: i18n.getCurrentLanguage() === 'ja' ? 'ランキングを取得 (daily/weekly/monthly/yearly)' : 'Get rankings (daily/weekly/monthly/yearly)',
      params: 'limit',
      example: `${baseUrl}/api/rankings/weekly?limit=20`
    },
    {
      endpoint: '/api/videos/{id}',
      method: 'GET',
      description: i18n.getCurrentLanguage() === 'ja' ? '動画詳細を取得' : 'Get video details',
      params: 'id',
      example: `${baseUrl}/api/videos/1`
    },
    {
      endpoint: '/api/blog',
      method: 'GET',
      description: i18n.getCurrentLanguage() === 'ja' ? 'ブログ記事一覧を取得' : 'Get blog posts',
      params: '',
      example: `${baseUrl}/api/blog`
    },
    {
      endpoint: '/api/announcements',
      method: 'GET',
      description: i18n.getCurrentLanguage() === 'ja' ? 'お知らせ一覧を取得' : 'Get announcements',
      params: '',
      example: `${baseUrl}/api/announcements`
    }
  ];
  
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <a href="#home" class="flex items-center gap-3 hover:opacity-80 transition">
                <i class="fas fa-mountain text-purple-600 text-2xl"></i>
                <h1 class="text-xl font-bold text-gray-900">ClimbHero</h1>
              </a>
            </div>
            <a href="#home" class="text-gray-600 hover:text-gray-900">
              <i class="fas fa-times text-xl"></i>
            </a>
          </div>
        </div>
      </header>
      
      <!-- Content -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Title -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            <i class="fas fa-code mr-3 text-purple-600"></i>
            ${i18n.t('api.title')}
          </h1>
          <p class="text-xl text-gray-600 mb-2">${i18n.t('api.subtitle')}</p>
          <p class="text-gray-600">${i18n.t('api.intro')}</p>
        </div>
        
        <!-- Base URL -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            <i class="fas fa-globe mr-2 text-purple-600"></i>
            ${i18n.t('api.base_url')}
          </h2>
          <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            ${baseUrl}
          </div>
        </div>
        
        <!-- Authentication -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            <i class="fas fa-lock mr-2 text-purple-600"></i>
            ${i18n.t('api.authentication')}
          </h2>
          <p class="text-gray-600">${i18n.t('api.auth_desc')}</p>
        </div>
        
        <!-- Endpoints -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            <i class="fas fa-list mr-2 text-purple-600"></i>
            ${i18n.t('api.endpoints')}
          </h2>
          
          <div class="space-y-6">
            ${apiEndpoints.map((api, index) => `
              <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                        ${api.method}
                      </span>
                      <code class="text-lg font-mono text-gray-900">${api.endpoint}</code>
                    </div>
                    <p class="text-gray-600">${api.description}</p>
                    ${api.params ? `
                      <p class="text-sm text-gray-500 mt-2">
                        <i class="fas fa-cog mr-1"></i>
                        ${i18n.t('api.parameters')}: <code>${api.params}</code>
                      </p>
                    ` : ''}
                  </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4 mb-3">
                  <p class="text-xs text-gray-600 mb-2">${i18n.t('api.request')}:</p>
                  <code class="text-sm text-gray-900 break-all">${api.example}</code>
                </div>
                
                <button 
                  onclick="testApi('${api.example}')" 
                  class="btn btn-sm btn-secondary">
                  <i class="fas fa-play mr-2"></i>
                  ${i18n.t('api.try_it')}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Data Schema -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            <i class="fas fa-database mr-2 text-purple-600"></i>
            ${i18n.t('api.schema.title')}
          </h2>
          
          <!-- Video Object -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3">${i18n.t('api.schema.video')}</h3>
            <div class="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
<pre>{
  "id": 1,
  "title": "Alex Honnold Free Solo El Capitan",
  "description": "Watch the incredible story...",
  "url": "https://www.youtube.com/watch?v=...",
  "thumbnail_url": "https://i.ytimg.com/vi/.../maxresdefault.jpg",
  "duration": "8:52",
  "channel_name": "National Geographic",
  "category": "outdoor",
  "views": 15420000,
  "likes": 245000,
  "media_source": "youtube",
  "created_at": "2024-01-15T10:30:00Z"
}</pre>
            </div>
          </div>
          
          <!-- User Object -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3">${i18n.t('api.schema.user')}</h3>
            <div class="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
<pre>{
  "id": 1,
  "email": "climber@example.com",
  "username": "ProClimber",
  "membership_type": "premium",
  "is_admin": 0,
  "created_at": "2024-01-01T00:00:00Z"
}</pre>
            </div>
          </div>
          
          <!-- Ranking Object -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">${i18n.t('api.schema.ranking')}</h3>
            <div class="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
<pre>{
  "rank": 1,
  "video_id": 5,
  "title": "V17 Boulder Problem",
  "likes": 1250,
  "views": 45000,
  "change": "+3"
}</pre>
            </div>
          </div>
        </div>
        
        <!-- Rate Limit -->
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
          <h3 class="text-lg font-bold text-gray-900 mb-2">
            <i class="fas fa-exclamation-triangle mr-2 text-yellow-600"></i>
            ${i18n.t('api.rate_limit')}
          </h3>
          <p class="text-gray-700">${i18n.t('api.rate_limit_desc')}</p>
        </div>
        
        <!-- Support -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            <i class="fas fa-question-circle mr-2 text-purple-600"></i>
            ${i18n.t('api.support')}
          </h2>
          <p class="text-gray-600 mb-4">${i18n.t('api.support_desc')}</p>
          <a href="#contact" class="btn btn-primary">
            <i class="fas fa-envelope mr-2"></i>
            ${i18n.getCurrentLanguage() === 'ja' ? 'お問い合わせ' : 'Contact Us'}
          </a>
        </div>
        
        <div class="text-center">
          <a href="#home" class="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
            <i class="fas fa-arrow-left"></i>
            ${i18n.getCurrentLanguage() === 'ja' ? 'ホームに戻る' : 'Back to Home'}
          </a>
        </div>
      </div>
      
      <!-- API Test Result Modal -->
      <div id="api-test-modal" class="modal">
        <div class="modal-content" style="max-width: 800px;">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold">${i18n.t('api.response_data')}</h3>
            <button onclick="closeModal('api-test-modal')" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div id="api-test-result" class="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
          </div>
        </div>
      </div>
    </div>
  `;
}

async function testApi(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const modal = document.getElementById('api-test-modal');
    const resultDiv = document.getElementById('api-test-result');
    resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    modal.classList.add('active');
  } catch (error) {
    showToast(i18n.getCurrentLanguage() === 'ja' ? 'APIテストに失敗しました' : 'API test failed', 'error');
  }
}

async function handleContactSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('contact_name').value;
  const email = document.getElementById('contact_email').value;
  const subject = document.getElementById('contact_subject').value;
  const message = document.getElementById('contact_message').value;
  
  try {
    const response = await axios.post('/api/contact', {
      name,
      email,
      subject,
      message
    });
    
    showToast(response.data.message || 'お問い合わせを受け付けました', 'success');
    
    // Clear form
    document.getElementById('contactForm').reset();
    
    // Redirect to home after 2 seconds
    setTimeout(() => {
      window.location.hash = 'home';
    }, 2000);
  } catch (error) {
    console.error('Failed to submit contact form:', error);
    showToast('送信に失敗しました。もう一度お試しください。', 'error');
  }
}

// ============ Announcements Modal ============
function showAnnouncementsModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
        <h2 class="text-xl font-bold">
          <i class="fas fa-bullhorn text-purple-600 mr-2"></i>
          ${i18n.t('announcement.latest')}
        </h2>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      <div class="p-6 space-y-4">
        ${state.announcements.map(a => `
          <div class="border-b pb-4 last:border-b-0">
            <h3 class="font-bold text-lg mb-2 text-gray-900">${a.title}</h3>
            <p class="text-gray-600 text-sm mb-2">${a.content}</p>
            <span class="text-xs text-gray-400">
              <i class="fas fa-calendar mr-1"></i>
              ${new Date(a.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// ============ Admin User Management ============

async function loadAdminData() {
  if (!state.currentUser || !state.currentUser.is_admin) return;
  
  try {
    // Load users
    const usersRes = await axios.get('/api/admin/users');
    renderUsersTable(usersRes.data);
    
    // Load videos (existing)
    const videosRes = await axios.get('/api/admin/videos');
    renderVideosCarousel(videosRes.data);
    
    // Load announcements (existing)
    const announcementsRes = await axios.get('/api/admin/announcements');
    renderAnnouncementsCarousel(announcementsRes.data);
    
    // Load blog posts with tags
    const blogsRes = await axios.get('/api/admin/blog/posts');
    renderBlogList(blogsRes.data);
    
    // Load tags
    const tagsRes = await axios.get('/api/blog/tags');
    state.blogTags = tagsRes.data;
  } catch (error) {
    console.error('Failed to load admin data:', error);
  }
}

// Loading Skeleton Component
function renderLoadingSkeleton(count = 3) {
  return Array(count).fill(0).map(() => `
    <div class="admin-card-skeleton" style="min-width: 320px; max-width: 320px;">
      <div class="skeleton-line" style="width: 60%; margin-bottom: 12px;"></div>
      <div class="skeleton-line" style="width: 80%; margin-bottom: 8px;"></div>
      <div class="skeleton-line" style="width: 90%; margin-bottom: 8px;"></div>
      <div class="skeleton-line" style="width: 70%;"></div>
    </div>
  `).join('');
}

function renderUsersTable(users) {
  const container = document.getElementById('admin-users-scroll');
  if (!container) return;
  
  if (users.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">ユーザーがいません</div>';
    return;
  }
  
  container.innerHTML = users.map(user => `
    <div class="admin-card" style="min-width: 320px; max-width: 320px; animation: fadeInUp 0.4s ease-out;">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs text-gray-500">#${user.id}</span>
            ${user.is_admin ? '<span class="px-2 py-0.5 text-xs font-bold rounded" style="background: #fbbf24; color: #78350f;"><i class="fas fa-shield-alt mr-1"></i>管理者</span>' : ''}
          </div>
          <h4 class="font-bold text-gray-900 text-sm mb-1">${user.username}</h4>
          <p class="text-xs text-gray-600 break-all">${user.email}</p>
        </div>
      </div>
      
      <div class="space-y-2 mb-3">
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">プラン:</span>
          <span class="category-badge ${user.membership_type === 'premium' ? 'category-competition' : 'category-bouldering'}">
            ${user.membership_type === 'premium' ? 'プレミアム' : '無料'}
          </span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">登録日:</span>
          <span class="text-gray-700">${formatDate(user.created_at)}</span>
        </div>
        ${user.notes ? `
        <div class="text-xs">
          <span class="text-gray-500 block mb-1">備考:</span>
          <p class="text-gray-700 line-clamp-2" title="${user.notes}">${user.notes}</p>
        </div>
        ` : ''}
      </div>
      
      <div class="flex gap-2">
        <button onclick="editUser(${user.id})" class="btn btn-sm btn-secondary flex-1" title="編集">
          <i class="fas fa-edit mr-1"></i>編集
        </button>
        <button onclick="deleteUser(${user.id}, '${user.email}')" class="btn btn-sm flex-1" style="background: #ef4444; color: white;" title="削除">
          <i class="fas fa-trash mr-1"></i>削除
        </button>
      </div>
    </div>
  `).join('');
}

function renderVideosCarousel(videos) {
  const container = document.getElementById('admin-videos-scroll');
  if (!container) return;
  
  if (videos.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">動画がありません</div>';
    return;
  }
  
  container.innerHTML = videos.map((video, index) => `
    <div class="admin-card" style="min-width: 280px; max-width: 280px; animation: fadeInUp 0.4s ease-out ${index * 0.05}s;">
      <div class="relative mb-3">
        <img src="${video.thumbnail_url}" alt="${video.title}" class="w-full h-40 object-cover rounded-lg" />
        <span class="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded" style="background: rgba(0,0,0,0.7); color: white;">
          ${video.duration || 'N/A'}
        </span>
      </div>
      
      <div class="mb-3">
        <h4 class="font-bold text-sm text-gray-900 mb-2 line-clamp-2" title="${video.title}">${video.title}</h4>
        <div class="flex items-center gap-2 mb-2">
          <span class="category-badge category-${video.category}">${video.category}</span>
          <span class="text-xs text-gray-500">#${video.id}</span>
        </div>
      </div>
      
      <div class="space-y-1 mb-3 text-xs">
        <div class="flex items-center justify-between">
          <span class="text-gray-500"><i class="fas fa-eye mr-1"></i>視聴</span>
          <span class="text-gray-700">${video.views.toLocaleString()}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-500"><i class="fas fa-heart mr-1"></i>いいね</span>
          <span class="text-gray-700">${video.likes}</span>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button onclick="editVideo(${video.id})" class="btn btn-sm btn-secondary flex-1">
          <i class="fas fa-edit mr-1"></i>編集
        </button>
        <button onclick="deleteVideo(${video.id})" class="btn btn-sm flex-1" style="background: #ef4444; color: white;">
          <i class="fas fa-trash mr-1"></i>削除
        </button>
      </div>
    </div>
  `).join('');
}

function renderAnnouncementsCarousel(announcements) {
  const container = document.getElementById('admin-announcements-scroll');
  if (!container) return;
  
  if (announcements.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">お知らせがありません</div>';
    return;
  }
  
  container.innerHTML = announcements.map((ann, index) => `
    <div class="admin-card" style="min-width: 320px; max-width: 320px; animation: fadeInUp 0.4s ease-out ${index * 0.05}s;">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs text-gray-500">#${ann.id}</span>
            <span class="px-2 py-0.5 text-xs font-bold rounded ${
              ann.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
              ann.type === 'success' ? 'bg-green-100 text-green-800' : 
              'bg-blue-100 text-blue-800'
            }">
              ${ann.type}
            </span>
          </div>
          <h4 class="font-bold text-sm text-gray-900 mb-2">${ann.title}</h4>
          <p class="text-xs text-gray-600 line-clamp-3">${ann.content}</p>
        </div>
      </div>
      
      <div class="text-xs text-gray-500 mb-3">
        ${formatDate(ann.created_at)}
      </div>
      
      <div class="flex gap-2">
        <button onclick="editAnnouncement(${ann.id})" class="btn btn-sm btn-secondary flex-1">
          <i class="fas fa-edit mr-1"></i>編集
        </button>
        <button onclick="deleteAnnouncement(${ann.id})" class="btn btn-sm flex-1" style="background: #ef4444; color: white;">
          <i class="fas fa-trash mr-1"></i>削除
        </button>
      </div>
    </div>
  `).join('');
}

async function editUser(userId) {
  try {
    const response = await axios.get('/api/admin/users');
    const user = response.data.find(u => u.id === userId);
    if (!user) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content max-w-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-bold">会員編集</h3>
          <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
            <input type="email" id="edit-user-email" value="${user.email}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ユーザー名</label>
            <input type="text" id="edit-user-username" value="${user.username}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">プラン</label>
            <select id="edit-user-membership" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="free" ${user.membership_type === 'free' ? 'selected' : ''}>無料</option>
              <option value="premium" ${user.membership_type === 'premium' ? 'selected' : ''}>プレミアム</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">備考</label>
            <textarea id="edit-user-notes" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg">${user.notes || ''}</textarea>
          </div>
          
          <div class="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input type="checkbox" id="edit-user-is-admin" ${user.is_admin ? 'checked' : ''} class="w-5 h-5 text-purple-600 rounded" />
            <label for="edit-user-is-admin" class="text-sm font-medium text-gray-700">
              <i class="fas fa-shield-alt text-yellow-600 mr-2"></i>
              管理者権限を付与する
            </label>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              新しいパスワード（変更する場合のみ）
            </label>
            <input type="password" id="edit-user-password" placeholder="空欄の場合は変更しません" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          
          <div class="flex gap-3 pt-4">
            <button onclick="saveUser(${userId})" class="btn btn-primary flex-1">
              <i class="fas fa-save mr-2"></i>
              保存
            </button>
            <button onclick="this.closest('.modal').remove()" class="btn btn-secondary flex-1">
              キャンセル
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    showToast('ユーザー情報の取得に失敗しました', 'error');
  }
}

async function saveUser(userId) {
  const email = document.getElementById('edit-user-email').value;
  const username = document.getElementById('edit-user-username').value;
  const membership_type = document.getElementById('edit-user-membership').value;
  const notes = document.getElementById('edit-user-notes').value;
  const password = document.getElementById('edit-user-password').value;
  const is_admin = document.getElementById('edit-user-is-admin').checked ? 1 : 0;
  
  if (!email || !username) {
    showToast('メールアドレスとユーザー名は必須です', 'error');
    return;
  }
  
  try {
    const data = { email, username, membership_type, notes, is_admin };
    if (password) {
      data.password = password;
    }
    
    await axios.put(`/api/admin/users/${userId}`, data);
    showToast('ユーザー情報を更新しました', 'success');
    
    document.querySelector('.modal').remove();
    loadAdminData();
  } catch (error) {
    showToast('ユーザー情報の更新に失敗しました', 'error');
  }
}

async function deleteUser(userId, email) {
  if (!confirm(`本当に ${email} を削除しますか？\nこの操作は取り消せません。`)) {
    return;
  }
  
  try {
    await axios.delete(`/api/admin/users/${userId}`);
    showToast('ユーザーを削除しました', 'success');
    loadAdminData();
  } catch (error) {
    showToast(error.response?.data?.error || 'ユーザーの削除に失敗しました', 'error');
  }
}

// ============ User Password Change ============

function showChangePasswordModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content max-w-lg">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-bold">パスワード変更</h3>
        <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">現在のパスワード</label>
          <input type="password" id="current-password" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">新しいパスワード（6文字以上）</label>
          <input type="password" id="new-password" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">新しいパスワード（確認）</label>
          <input type="password" id="confirm-password" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        
        <div class="flex gap-3 pt-4">
          <button onclick="changePassword()" class="btn btn-primary flex-1">
            <i class="fas fa-key mr-2"></i>
            変更
          </button>
          <button onclick="this.closest('.modal').remove()" class="btn btn-secondary flex-1">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

async function changePassword() {
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast('すべてのフィールドを入力してください', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showToast('新しいパスワードは6文字以上である必要があります', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showToast('新しいパスワードが一致しません', 'error');
    return;
  }
  
  try {
    await axios.post('/api/user/change-password', {
      currentPassword,
      newPassword
    });
    
    showToast('パスワードを変更しました', 'success');
    document.querySelector('.modal').remove();
  } catch (error) {
    showToast(error.response?.data?.error || 'パスワードの変更に失敗しました', 'error');
  }
}

// ============ CSV Export/Import Functions ============

async function exportUsersCSV() {
  try {
    window.location.href = '/api/admin/users/export';
    showToast('CSVファイルをダウンロード中...', 'success');
  } catch (error) {
    showToast('CSVエクスポートに失敗しました', 'error');
  }
}

function showImportCSVModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 700px;" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">
          <i class="fas fa-upload mr-2"></i>
          ${i18n.t('admin.csv_import')}
        </h3>
        <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <p class="text-sm text-gray-600 mb-4">${i18n.t('admin.csv_import_help')}</p>
      
      <textarea id="csv-import-data" rows="15" class="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-xs" placeholder="ID,Email,Username,Membership,Is Admin,Notes,Created At,Last Login
1,user@example.com,User Name,free,No,,2024-01-01,"></textarea>
      
      <div class="flex justify-end gap-3 mt-4">
        <button onclick="this.closest('.modal').remove()" class="btn btn-secondary">
          ${i18n.t('common.cancel')}
        </button>
        <button onclick="handleCSVImport()" class="btn btn-primary">
          <i class="fas fa-upload mr-2"></i>
          ${i18n.t('admin.csv_import')}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

async function handleCSVImport() {
  const csvData = document.getElementById('csv-import-data').value.trim();
  
  if (!csvData) {
    showToast('CSVデータを入力してください', 'error');
    return;
  }
  
  try {
    const response = await axios.post('/api/admin/users/import', { csvData });
    
    if (response.data.success) {
      showToast(i18n.t('admin.csv_import_success').replace('{count}', response.data.imported), 'success');
      document.querySelector('.modal').remove();
      await loadAdminData();
      
      if (response.data.errors.length > 0) {
        console.warn('Import errors:', response.data.details.errors);
      }
    }
  } catch (error) {
    showToast(error.response?.data?.error || i18n.t('admin.csv_import_error'), 'error');
  }
}

// ============ Blog Management Functions ============

function renderBlogList(blogs) {
  const container = document.getElementById('admin-blog-list');
  if (!container) return;
  
  if (blogs.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">ブログ記事がありません</div>';
    return;
  }
  
  container.innerHTML = `
    <table class="w-full">
      <thead>
        <tr style="border-bottom: 2px solid #e5e7eb;">
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">ID</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">タイトル</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">タグ</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">公開日</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">操作</th>
        </tr>
      </thead>
      <tbody>
        ${blogs.map(blog => `
          <tr style="border-bottom: 1px solid #e5e7eb;" class="hover:bg-gray-50">
            <td style="padding: 12px; font-size: 13px;">#${blog.id}</td>
            <td style="padding: 12px; font-size: 13px; max-width: 300px;">
              <div class="line-clamp-2">${blog.title}</div>
            </td>
            <td style="padding: 12px; font-size: 11px;">
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${blog.tags.length > 0 ? blog.tags.map(tag => `
                  <span class="category-badge category-bouldering" style="font-size: 10px;">${tag}</span>
                `).join('') : '<span style="color: #9ca3af;">タグなし</span>'}
              </div>
            </td>
            <td style="padding: 12px; font-size: 13px; color: #6b7280;">${formatDate(blog.published_date)}</td>
            <td style="padding: 12px;">
              <div style="display: flex; gap: 8px;">
                <button onclick="editBlog(${blog.id})" class="btn btn-sm btn-secondary">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteBlog(${blog.id})" class="btn btn-sm" style="background: #ef4444; color: white;">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function showTagManagementModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">
          <i class="fas fa-tags mr-2"></i>
          ${i18n.t('admin.tag_manage')}
        </h3>
        <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="mb-4 p-4 bg-gray-50 rounded-lg">
        <label class="block text-sm font-medium mb-2">${i18n.t('admin.tag_new')}</label>
        <div class="flex gap-2">
          <input type="text" id="new-tag-name" class="flex-1 px-3 py-2 border rounded-lg" placeholder="${i18n.t('admin.tag_name')}" />
          <button onclick="createTag()" class="btn btn-primary">
            <i class="fas fa-plus mr-1"></i>
            追加
          </button>
        </div>
      </div>
      
      <div id="tags-list" style="max-height: 400px; overflow-y: auto;">
        ${state.blogTags.map(tag => `
          <div class="flex items-center justify-between p-3 border-b hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <i class="fas fa-tag text-gray-400"></i>
              <span class="font-medium">${tag.name}</span>
              <span class="text-xs text-gray-500">(${tag.post_count || 0}記事)</span>
            </div>
            <button onclick="deleteTag(${tag.id})" class="btn btn-sm" style="background: #ef4444; color: white;">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

async function createTag() {
  const name = document.getElementById('new-tag-name').value.trim();
  
  if (!name) {
    showToast('タグ名を入力してください', 'error');
    return;
  }
  
  try {
    await axios.post('/api/admin/blog/tags', { name });
    showToast('タグを作成しました', 'success');
    
    // Reload tags
    const tagsRes = await axios.get('/api/blog/tags');
    state.blogTags = tagsRes.data;
    
    document.querySelector('.modal').remove();
  } catch (error) {
    showToast(error.response?.data?.error || 'タグの作成に失敗しました', 'error');
  }
}

async function deleteTag(tagId) {
  if (!confirm('このタグを削除してもよろしいですか？')) return;
  
  try {
    await axios.delete(`/api/admin/blog/tags/${tagId}`);
    showToast('タグを削除しました', 'success');
    
    // Reload tags
    const tagsRes = await axios.get('/api/blog/tags');
    state.blogTags = tagsRes.data;
    
    document.querySelector('.modal').remove();
    await loadAdminData();
  } catch (error) {
    showToast(error.response?.data?.error || 'タグの削除に失敗しました', 'error');
  }
}

function showBlogModal(blogId = null) {
  const isEdit = blogId !== null;
  const blog = isEdit ? state.blogPosts.find(b => b.id === blogId) : null;
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">
          <i class="fas fa-blog mr-2"></i>
          ${isEdit ? i18n.t('admin.blog_edit') : i18n.t('admin.blog_new')}
        </h3>
        <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form onsubmit="handleBlogSubmit(event, ${blogId})" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_title')}</label>
          <input type="text" name="title" value="${blog?.title || ''}" required class="w-full px-4 py-2 border rounded-lg" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_content')}</label>
          <textarea name="content" rows="10" required class="w-full px-4 py-2 border rounded-lg">${blog?.content || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_image')}</label>
          <input type="url" name="image_url" value="${blog?.image_url || ''}" class="w-full px-4 py-2 border rounded-lg" placeholder="https://..." />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_date')}</label>
          <input type="date" name="published_date" value="${blog?.published_date || new Date().toISOString().split('T')[0]}" required class="w-full px-4 py-2 border rounded-lg" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_tags')}</label>
          <div style="display: flex; flex-wrap: gap: 8px; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; background: #f9fafb;">
            ${state.blogTags.map(tag => {
              const isSelected = blog?.tags?.includes(tag.name) || false;
              return `
                <label class="inline-flex items-center gap-2 px-3 py-1 border rounded-full cursor-pointer transition ${isSelected ? 'bg-purple-100 border-purple-300' : 'bg-white border-gray-300 hover:border-purple-300'}">
                  <input type="checkbox" name="tags" value="${tag.id}" ${isSelected ? 'checked' : ''} class="hidden" onchange="this.parentElement.classList.toggle('bg-purple-100'); this.parentElement.classList.toggle('border-purple-300');" />
                  <span class="text-sm">${tag.name}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" onclick="this.closest('.modal').remove()" class="btn btn-secondary">
            ${i18n.t('common.cancel')}
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save mr-2"></i>
            ${i18n.t('common.save')}
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

async function handleBlogSubmit(event, blogId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const data = {
    title: formData.get('title'),
    content: formData.get('content'),
    image_url: formData.get('image_url') || null,
    published_date: formData.get('published_date'),
    tagIds: formData.getAll('tags').map(id => parseInt(id))
  };
  
  try {
    if (blogId) {
      await axios.put(`/api/admin/blog/posts/${blogId}`, data);
      showToast('ブログを更新しました', 'success');
    } else {
      await axios.post('/api/admin/blog/posts', data);
      showToast('ブログを作成しました', 'success');
    }
    
    document.querySelector('.modal').remove();
    await loadAdminData();
  } catch (error) {
    showToast(error.response?.data?.error || 'ブログの保存に失敗しました', 'error');
  }
}

async function editBlog(blogId) {
  // Load blog data with tags
  try {
    const response = await axios.get('/api/admin/blog/posts');
    state.blogPosts = response.data;
    showBlogModal(blogId);
  } catch (error) {
    showToast('ブログデータの読み込みに失敗しました', 'error');
  }
}

async function deleteBlog(blogId) {
  if (!confirm(i18n.t('admin.blog_confirm_delete'))) return;
  
  try {
    await axios.delete(`/api/admin/blog/${blogId}`);
    showToast('ブログを削除しました', 'success');
    await loadAdminData();
  } catch (error) {
    showToast(error.response?.data?.error || 'ブログの削除に失敗しました', 'error');
  }
}

