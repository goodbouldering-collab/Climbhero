// ============ Global State ============
const state = {
  currentUser: null,
  videos: [],
  favorites: [],
  allFavorites: [],
  favoriteCounts: { total: 0, videos: 0, blogs: 0, news: 0 },
  trendingVideos: [],
  topLikedVideos: [],
  rankings: { daily: [], weekly: [], monthly: [], yearly: [] },
  currentRankingPeriod: 'all', // 'daily', 'weekly', 'monthly', '6months', '1year', 'all'
  blogPosts: [],
  blogTags: [],
  blogGenres: [],
  currentBlogGenre: '', // Genre filter for blog posts
  newsArticles: [],
  newsCategories: [],
  newsGenres: [],
  currentNewsCategory: '', // Category filter for news
  currentNewsGenre: '', // Genre filter for news
  announcements: [],
  announcementGenre: '', // 'feature', 'maintenance', 'event', 'campaign', 'general', ''
  testimonials: [],
  adBanners: { hero_bottom: [], blog_top: [] },
  currentView: 'home',
  currentRankingType: 'daily',
  currentVideoCategory: 'all',
  loading: false,
  currentLanguage: 'ja',
  heroSlideIndex: 0,
  heroSlides: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop&q=90', // Majestic mountain rock face
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&h=600&fit=crop&q=90', // Natural rock formation
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=600&fit=crop&q=90', // Mountain peak panoramic
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=600&fit=crop&q=90', // Granite rock wall
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&h=600&fit=crop&q=90'  // Rocky mountain vista
  ],
  // New video platform features
  allVideos: [],
  userSettings: null,
  uploadProgress: null,
  videoFilter: {
    platform: '',
    category: '',
    search: ''
  }
};

// ============ Language Support ============
window.addEventListener('languageChanged', async (e) => {
  state.currentLanguage = e.detail.language;
  // Reload blog posts, announcements, and videos with new language
  try {
    const lang = state.currentLanguage || 'ja'
    const [blogRes, announcementsRes, videosRes, trendingRes, topLikedRes] = await Promise.all([
      axios.get(`/api/blog?lang=${lang}`),
      axios.get(`/api/announcements?lang=${lang}`),
      axios.get(`/api/videos?limit=20&lang=${lang}`),
      axios.get(`/api/videos/trending?limit=10&lang=${lang}`),
      axios.get(`/api/videos/top-liked?limit=20&period=${state.currentRankingPeriod || 'all'}&lang=${lang}`)
    ]);
    state.blogPosts = blogRes.data || [];
    state.announcements = announcementsRes.data || [];
    state.videos = videosRes.data.videos || [];
    state.trendingVideos = trendingRes.data.videos || [];
    state.topLikedVideos = topLikedRes.data.videos || [];
  } catch (error) {
    console.error('Error reloading data for language change:', error);
  }
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
  
  // Initialize hero slideshow
  initHeroSlideshow();
  
  // Handle subscription callback from Stripe
  handleSubscriptionCallback();
  
  window.addEventListener('hashchange', handleNavigation);
  handleNavigation();
}

// Handle subscription callback from Stripe Checkout
function handleSubscriptionCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const subscriptionStatus = urlParams.get('subscription');
  const planType = urlParams.get('plan');
  
  if (subscriptionStatus === 'success') {
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    
    // Show success message
    setTimeout(() => {
      const planName = planType === 'annual' ? 'プレミアム年間プラン' : 'プレミアム月額プラン';
      showToast(`🎉 ${planName}への登録が完了しました！`, 'success');
      
      // Refresh auth to get updated membership
      checkAuth().then(() => {
        if (state.currentView === 'mypage') {
          loadSubscriptionManagement();
        }
        renderApp();
      });
    }, 500);
  } else if (subscriptionStatus === 'canceled') {
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    
    setTimeout(() => {
      showToast('決済がキャンセルされました', 'info');
    }, 500);
  }
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

// ============ Video Platform Deep Link Helper ============
/**
 * Open video in native app with fallback to web browser
 * @param {string} deepLink - App-specific deep link URL (e.g., tiktok://video/123)
 * @param {string} webUrl - Fallback web URL
 */
function openInApp(deepLink, webUrl) {
  if (!deepLink) {
    // No deep link available, open web URL directly
    window.open(webUrl, '_blank');
    return;
  }
  
  // Detect if user is on mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (!isMobile) {
    // On desktop, always open web URL
    window.open(webUrl, '_blank');
    return;
  }
  
  // Mobile strategy: Try to open app, fallback to web after timeout
  let appOpened = false;
  
  // Listen for visibility change (app opening hides the page)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      appOpened = true;
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Attempt to open in app
  window.location.href = deepLink;
  
  // Fallback to web after 2 seconds if app didn't open
  setTimeout(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    
    if (!appOpened && !document.hidden) {
      // App didn't open, fallback to web browser
      window.open(webUrl, '_blank');
    }
  }, 2000);
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
    const lang = state.currentLanguage || 'ja'
    const [videosRes, rankingsRes, blogRes, announcementsRes, trendingRes, testimonialsRes, topLikedRes, adBannersHeroRes, adBannersBlogRes, blogGenresRes, newsRes, newsCategoriesRes] = await Promise.all([
      axios.get(`/api/videos?limit=20&lang=${lang}`),
      axios.get('/api/rankings/weekly?limit=20'),
      axios.get(`/api/blog?lang=${lang}`),
      axios.get(`/api/announcements?lang=${lang}`),
      axios.get(`/api/videos/trending?limit=10&lang=${lang}`),
      axios.get('/api/testimonials'),
      axios.get(`/api/videos/top-liked?limit=20&period=all&lang=${lang}`),
      axios.get('/api/ad-banners?position=hero_bottom'),
      axios.get('/api/ad-banners?position=blog_top'),
      axios.get('/api/blog/genres'),
      axios.get(`/api/news?limit=10&lang=${lang}`),
      axios.get('/api/news/meta/categories')
    ]);
    
    state.videos = videosRes.data.videos || [];
    state.rankings.weekly = rankingsRes.data || [];
    state.blogPosts = blogRes.data || [];
    state.announcements = announcementsRes.data || [];
    state.trendingVideos = trendingRes.data.videos || [];
    state.testimonials = testimonialsRes.data.testimonials || [];
    state.topLikedVideos = topLikedRes.data.videos || [];
    state.currentRankingPeriod = 'all';
    state.adBanners.hero_bottom = adBannersHeroRes.data || [];
    state.adBanners.blog_top = adBannersBlogRes.data || [];
    state.blogGenres = blogGenresRes.data || [];
    state.newsArticles = newsRes.data.articles || [];
    state.newsCategories = newsCategoriesRes.data.categories || [];
    state.newsGenres = newsCategoriesRes.data.genres || [];
    
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

// Load user favorites (unified: videos, blogs, news)
async function loadUserFavorites() {
  if (!state.currentUser) return;
  
  try {
    const lang = state.currentLanguage || 'ja';
    const res = await axios.get(`/api/favorites?lang=${lang}`);
    state.allFavorites = res.data.favorites || [];
    state.favoriteCounts = res.data.counts || { total: 0, videos: 0, blogs: 0, news: 0 };
  } catch (error) {
    console.error('Failed to load favorites:', error);
    state.allFavorites = [];
    state.favoriteCounts = { total: 0, videos: 0, blogs: 0, news: 0 };
  }
}

// ============ Navigation ============
function handleNavigation() {
  const hash = window.location.hash.slice(1);
  
  if (!hash || hash === 'home') {
    state.currentView = 'home';
  } else if (hash === 'videos') {
    state.currentView = 'videos';
    loadVideos();
  } else if (hash === 'upload') {
    if (state.currentUser) {
      state.currentView = 'upload';
    } else {
      showToast('ログインが必要です', 'error');
      showAuthModal('login');
      window.location.hash = 'home';
      return;
    }
  } else if (hash === 'settings') {
    if (state.currentUser) {
      state.currentView = 'settings';
      loadUserSettings();
    } else {
      showToast('ログインが必要です', 'error');
      showAuthModal('login');
      window.location.hash = 'home';
      return;
    }
  } else if (hash === 'mypage') {
    if (state.currentUser) {
      state.currentView = 'mypage';
    } else {
      showToast('ログインが必要です', 'error');
      showAuthModal('login');
      window.location.hash = 'home';
      return;
    }
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
  } else if (state.currentView === 'videos') {
    root.innerHTML = renderVideosPage();
  } else if (state.currentView === 'favorites') {
    renderFavoritesPage();
  } else if (state.currentView === 'upload') {
    root.innerHTML = renderUploadPage();
  } else if (state.currentView === 'settings') {
    root.innerHTML = renderSettingsPage();
  } else if (state.currentView === 'admin') {
    root.innerHTML = renderAdminPage();
    loadAdminData();
  } else if (state.currentView === 'mypage') {
    root.innerHTML = renderMyPage();
    // Load subscription management after page renders
    setTimeout(() => loadSubscriptionManagement(), 100);
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
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <!-- Logo Section (Clickable for Home) -->
          <div class="flex items-center flex-shrink-0 min-w-0">
            <button onclick="navigateTo('home')" class="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors cursor-pointer">
              <i class="fas fa-mountain text-sm sm:text-base bg-gradient-to-br from-purple-600 to-pink-600" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
              <h1 class="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 whitespace-nowrap" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ClimbHero</h1>
            </button>
          </div>
          
          <!-- Right Section -->
          <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div class="flex gap-0.5 sm:gap-1">
              ${i18n.getAvailableLanguages().map(lang => `
                <button 
                  onclick="switchLanguage('${lang.code}')" 
                  class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded transition-all text-sm sm:text-base ${
                    i18n.getCurrentLanguage() === lang.code 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 scale-110' 
                      : 'hover:bg-gray-100'
                  }"
                  title="${lang.name}">
                  ${lang.flag}
                </button>
              `).join('')}
            </div>
            
            ${state.currentUser ? `
              <!-- Favorites Button -->
              <button onclick="navigateTo('favorites')" class="btn btn-sm btn-secondary px-3 text-base flex items-center gap-1">
                <i class="fas fa-star text-yellow-500"></i>
                <span class="hidden sm:inline">お気に入り</span>
              </button>
              
              <!-- My Page Button -->
              <button onclick="navigateToMyPage()" class="btn btn-sm btn-secondary px-3 text-base">
                マイページ
              </button>
              
              <!-- Logout Button -->
              <button onclick="logout()" class="btn btn-sm btn-primary px-3 text-base">
                ログアウト
              </button>
            ` : `
              <button onclick="showAuthModal('login')" class="btn btn-sm btn-primary px-3 text-base">
                ${i18n.t('nav.login')}
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
          
          <!-- Announcements inside Hero -->
          ${state.announcements && state.announcements.length > 0 ? `
            <div class="mt-6 space-y-2">
              ${state.announcements.slice(0, 2).map(a => `
                <div class="text-white text-sm bg-black/20 backdrop-blur-sm px-4 py-2 rounded">
                  <span class="font-bold">● ${a.title}:</span> ${a.content}
                </div>
              `).join('')}
              ${state.announcements.length > 2 ? `
                <div class="text-center mt-4">
                  <a href="javascript:void(0)" onclick="showAnnouncementsModal()" class="text-white text-sm font-semibold hover:text-gray-200 hover:underline transition-all">
                    ${i18n.t('announcement.view_all_count').replace('{count}', state.announcements.length)}
                  </a>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </section>
      
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
      
      <!-- Climber Testimonials Section (Collapsible) -->
      ${state.testimonials && state.testimonials.length > 0 ? `
      <section class="bg-white border-b border-gray-200">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onclick="toggleTestimonialsSection()" 
            class="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded transition">
            <h2 class="text-lg font-bold text-gray-900">
              <i class="fas fa-mountain text-purple-600 mr-2"></i>
              ${i18n.t('testimonials.title')}
            </h2>
            <i id="testimonials-toggle-icon" class="fas fa-chevron-down text-gray-400 transition-transform"></i>
          </button>
          
          <div id="testimonials-content" class="hidden mt-6">
            <div class="text-center mb-8">
              <p class="text-gray-600 text-base">
                ${i18n.t('testimonials.subtitle')}
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${state.testimonials.map(testimonial => {
              const lang = i18n.getCurrentLanguage()
              const climberName = testimonial[`climber_name_${lang}`] || testimonial.climber_name_en
              const title = testimonial[`title_${lang}`] || testimonial.title_en
              const comment = testimonial[`comment_${lang}`] || testimonial.comment_en
              
              return `
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                  <div class="p-6">
                    <div class="flex items-center mb-4">
                      <img 
                        src="${testimonial.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'}" 
                        alt="${climberName}"
                        class="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                      />
                      <div class="ml-4 flex-1">
                        <h3 class="font-bold text-lg text-gray-900">${climberName}</h3>
                        <p class="text-sm text-purple-600 font-medium">${title}</p>
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <p class="text-gray-700 text-sm leading-relaxed italic">
                        "${comment}"
                      </p>
                    </div>
                    
                    ${testimonial.instagram_url || testimonial.youtube_url || testimonial.website_url ? `
                      <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                        ${testimonial.instagram_url ? `
                          <a href="${testimonial.instagram_url}" target="_blank" rel="noopener noreferrer" 
                             class="text-gray-400 hover:text-pink-600 transition-colors">
                            <i class="fab fa-instagram text-lg"></i>
                          </a>
                        ` : ''}
                        ${testimonial.youtube_url ? `
                          <a href="${testimonial.youtube_url}" target="_blank" rel="noopener noreferrer"
                             class="text-gray-400 hover:text-red-600 transition-colors">
                            <i class="fab fa-youtube text-lg"></i>
                          </a>
                        ` : ''}
                        ${testimonial.website_url ? `
                          <a href="${testimonial.website_url}" target="_blank" rel="noopener noreferrer"
                             class="text-gray-400 hover:text-purple-600 transition-colors">
                            <i class="fas fa-globe text-lg"></i>
                          </a>
                        ` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>
              `
            }).join('')}
            </div>
          </div>
        </div>
      </section>
      ` : ''}
      
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
      
      <!-- Unified Favorites Section - Videos, Blogs, News (Mixed) -->
      ${state.currentUser && state.allFavorites && state.allFavorites.length > 0 ? `
      <section class="py-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title">
              <i class="fas fa-star text-yellow-500"></i>
              <span>${i18n.t('section.favorites')} - すべて</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <span class="px-3 py-1 bg-white rounded-full border border-purple-200">
                <i class="fas fa-video text-red-500 mr-1"></i>
                ${state.favoriteCounts.videos || 0}
              </span>
              <span class="px-3 py-1 bg-white rounded-full border border-purple-200">
                <i class="fas fa-blog text-indigo-500 mr-1"></i>
                ${state.favoriteCounts.blogs || 0}
              </span>
              <span class="px-3 py-1 bg-white rounded-full border border-purple-200">
                <i class="fas fa-newspaper text-blue-500 mr-1"></i>
                ${state.favoriteCounts.news || 0}
              </span>
              <button onclick="navigateTo('favorites')" class="px-4 py-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                <i class="fas fa-arrow-right mr-1"></i>
                すべて見る
              </button>
            </div>
          </div>
          
          <div class="carousel-container" id="favorites-carousel">
            <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('favorites-carousel', -1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="horizontal-scroll" id="favorites-scroll">
              ${state.allFavorites.slice(0, 20).map(item => renderUnifiedFavoriteCard(item)).join('')}
            </div>
            <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('favorites-carousel', 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>
      ` : ''}
      
      <!-- Rankings Section - いいね数ランキング -->
      ${state.topLikedVideos && state.topLikedVideos.length > 0 ? `
      <section class="py-6 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-4">
            <div class="section-title">
              <i class="fas fa-trophy text-yellow-500"></i>
              <span>いいね数ランキング</span>
            </div>
          </div>
          
          <div id="ranking-section-content">
            <!-- Period Filter Tabs -->
            ${renderFilterButtons('switchRankingPeriod', state.currentRankingPeriod, [
              { value: 'daily', label: '日次', icon: 'fas fa-calendar-day' },
              { value: 'weekly', label: '週次', icon: 'fas fa-calendar-week' },
              { value: 'monthly', label: '月次', icon: 'fas fa-calendar-alt' },
              { value: '6months', label: '6ヶ月', icon: 'fas fa-calendar' },
              { value: '1year', label: '1年', icon: 'fas fa-calendar' },
              { value: 'all', label: '全期間', icon: 'fas fa-infinity' }
            ])}
            
            <!-- Horizontal Carousel -->
            <div class="carousel-container" id="ranking-carousel">
              <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('ranking-carousel', -1)">
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="horizontal-scroll" id="ranking-scroll">
                ${state.topLikedVideos.map((video, index) => renderRankingCard(video, index + 1)).join('')}
              </div>
              <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('ranking-carousel', 1)">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
      ` : ''}
      
      <!-- Trending Videos Section (いいね急増中) - 2番目 -->
      ${state.trendingVideos && state.trendingVideos.length > 0 ? `
      <section class="py-6 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-4">
            <div class="section-title">
              <i class="fas fa-fire text-orange-500"></i>
              <span>いいね急増中</span>
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
          <div class="section-header mb-4">
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
          <div class="section-header mb-4">
            <div class="section-title">
              <i class="fas fa-video"></i>
              <span>${i18n.t('section.latest')}</span>
            </div>
          </div>
          
          <div id="videos-section-content">
            ${renderFilterButtons('filterVideosByCategory', state.currentVideoCategory, [
              { value: 'all', label: i18n.getCurrentLanguage() === 'ja' ? '全て' : 'All', icon: 'fas fa-th' },
              { value: 'bouldering', label: i18n.t('section.bouldering'), icon: 'fas fa-grip-lines' },
              { value: 'lead', label: i18n.t('section.lead'), icon: 'fas fa-link' },
              { value: 'alpine', label: i18n.t('section.alpine'), icon: 'fas fa-mountain' },
              { value: 'other', label: i18n.t('section.other'), icon: 'fas fa-ellipsis-h' }
            ])}
            
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
        </div>
      </section>

      <!-- Favorites Section (Only for logged-in users) -->
      ${state.currentUser && state.favorites && state.favorites.length > 0 ? `
      <section class="py-6 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-4">
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

      <!-- Climbing News Section -->
      ${state.newsArticles && state.newsArticles.length > 0 ? `
      <section class="py-6 bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-4">
            <div class="section-title">
              <i class="fas fa-globe text-blue-600"></i>
              <span>${i18n.t('news.title')}</span>
            </div>
            <div class="section-action" onclick="window.location.hash='news'">
              ${i18n.t('common.view_all')} <i class="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 mb-4">${i18n.t('news.subtitle')}</p>
          
          <div id="news-section-content">
            <!-- Category Filters -->
            ${state.newsCategories && state.newsCategories.length > 0 ? renderFilterButtons('filterNewsByCategory', state.currentNewsCategory, [
              { value: '', label: i18n.t('news.category.all'), icon: 'fas fa-th' },
              ...state.newsCategories.map(c => ({
                value: c.category,
                label: i18n.t(`news.category.${c.category}`),
                icon: getCategoryIcon(c.category)
              }))
            ]) : ''}
            
            <!-- Horizontal Carousel -->
            <div class="carousel-container" id="news-carousel">
              <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('news-carousel', -1)">
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="horizontal-scroll" id="news-scroll">
                ${state.newsArticles.map(article => renderNewsCard(article)).join('')}
              </div>
              <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('news-carousel', 1)">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Blog Posts Section -->
      <section class="py-6 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="section-header mb-4">
            <div class="section-title">
              <i class="fas fa-newspaper"></i>
              <span>ブログ</span>
            </div>
            <div class="section-action" onclick="window.location.hash='blog'">
              すべて見る <i class="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div id="blog-section-content">
            <!-- Genre Filters -->
            ${state.blogGenres && state.blogGenres.length > 0 ? renderFilterButtons('filterBlogsByGenre', state.currentBlogGenre, [
              { value: '', label: 'すべて', icon: 'fas fa-th' },
              ...state.blogGenres.map(g => ({ value: g.name, label: g.name, icon: g.icon }))
            ]) : ''}
            
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
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="py-12 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-8">
            <h3 class="text-3xl font-bold text-gray-900 mb-2">料金プラン</h3>
            <p class="text-gray-600">あなたに合ったプランを選択してください</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <!-- Free Plan -->
            <div class="card p-6 bg-white border-2 border-gray-200 relative">
              <h4 class="text-xl font-bold mb-2 text-gray-800">フリー</h4>
              <div class="text-3xl font-bold text-gray-900 mb-1">¥0</div>
              <p class="text-sm text-gray-500 mb-4">永久無料</p>
              <ul class="space-y-3 mb-6 text-sm">
                <li class="flex items-center gap-2 text-gray-700">
                  <i class="fas fa-check text-green-500"></i> 動画閲覧無制限
                </li>
                <li class="flex items-center gap-2 text-gray-700">
                  <i class="fas fa-check text-green-500"></i> 1日1いいね
                </li>
                <li class="flex items-center gap-2 text-gray-400">
                  <i class="fas fa-times"></i> <span class="line-through">動画投稿</span>
                </li>
                <li class="flex items-center gap-2 text-gray-400">
                  <i class="fas fa-times"></i> <span class="line-through">お気に入り管理</span>
                </li>
              </ul>
              <button class="btn w-full bg-gray-100 text-gray-600 font-bold cursor-default">
                現在のプラン
              </button>
            </div>
            
            <!-- Monthly Plan -->
            <div class="card p-6 bg-white border-2 border-purple-300 relative">
              <h4 class="text-xl font-bold mb-2 text-purple-700">プレミアム月額</h4>
              <div class="text-3xl font-bold text-gray-900 mb-1">¥980</div>
              <p class="text-sm text-gray-500 mb-4">/月</p>
              <ul class="space-y-3 mb-6 text-sm">
                <li class="flex items-center gap-2 text-gray-700">
                  <i class="fas fa-check text-purple-500"></i> <strong>無制限いいね</strong>
                </li>
                <li class="flex items-center gap-2 text-gray-700">
                  <i class="fas fa-check text-purple-500"></i> <strong>動画投稿OK</strong>
                </li>
                <li class="flex items-center gap-2 text-gray-700">
                  <i class="fas fa-check text-purple-500"></i> お気に入り管理
                </li>
                <li class="flex items-center gap-2 text-gray-700">
                  <i class="fas fa-check text-purple-500"></i> 広告非表示
                </li>
              </ul>
              <button onclick="startCheckout('monthly')" class="btn w-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
                <i class="fas fa-credit-card mr-2"></i>月額プランを始める
              </button>
            </div>
            
            <!-- Annual Plan (BEST VALUE) -->
            <div class="card p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white relative overflow-hidden border-2 border-yellow-400">
              <div class="absolute top-0 right-0 bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                🔥 50% OFF
              </div>
              <h4 class="text-xl font-bold mb-2">プレミアム年間</h4>
              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-3xl font-bold">¥5,880</span>
                <span class="text-sm line-through opacity-70">¥11,760</span>
              </div>
              <p class="text-sm opacity-90 mb-4">/年（月額換算 ¥490）</p>
              <ul class="space-y-3 mb-6 text-sm">
                <li class="flex items-center gap-2">
                  <i class="fas fa-star text-yellow-300"></i> <strong>月額の半額でお得！</strong>
                </li>
                <li class="flex items-center gap-2">
                  <i class="fas fa-check text-green-300"></i> 無制限いいね
                </li>
                <li class="flex items-center gap-2">
                  <i class="fas fa-check text-green-300"></i> 動画投稿OK
                </li>
                <li class="flex items-center gap-2">
                  <i class="fas fa-check text-green-300"></i> お気に入り管理
                </li>
                <li class="flex items-center gap-2">
                  <i class="fas fa-check text-green-300"></i> 広告非表示
                </li>
              </ul>
              <button onclick="startCheckout('annual')" class="btn w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold shadow-lg">
                <i class="fas fa-crown mr-2"></i>年間プランを始める
              </button>
              <p class="text-xs text-center mt-2 opacity-80">
                <i class="fas fa-shield-alt mr-1"></i>いつでも解約可能
              </p>
            </div>
          </div>
          
          <p class="text-center text-xs text-gray-500 mt-6">
            <i class="fas fa-lock mr-1"></i>安全なStripe決済 | 自動更新（解約可能）
          </p>
        </div>
      </section>

    </main>

    <!-- Ad Banners Section -->
    <section class="py-8 bg-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="space-y-4">
          ${renderAdBanner('hero_bottom')}
          ${renderAdBanner('blog_top')}
        </div>
      </div>
    </section>

    <!-- Footer -->
    ${renderFooter()}

    <!-- Modals -->
    <div id="auth-modal" class="modal"></div>
    <div id="upload-modal" class="modal"></div>
    <div id="video-modal" class="modal"></div>
    <div id="pricing-modal" class="modal"></div>
    
    <!-- News Modal -->
    <div id="news-modal" class="modal">
      <div id="news-modal-content" class="modal-content modal-video-content" style="max-width: 600px; padding: 0; overflow: hidden; border-radius: 16px;">
        <!-- Content will be injected by showNewsModal() -->
      </div>
    </div>
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
              ${i18n.t('footer.description')}
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
            <h5 class="text-white font-bold mb-4">${i18n.t('footer.quick_links')}</h5>
            <ul class="space-y-2 text-sm">
              <li><a href="#home" class="hover:text-white">${i18n.t('footer.home')}</a></li>
              <li><a href="#about" class="hover:text-white">${i18n.t('footer.about')}</a></li>
              <li><a href="#api" class="hover:text-white"><i class="fas fa-code mr-1"></i>${i18n.t('footer.api')}</a></li>
              <li><a href="#" onclick="showPricingModal(); return false;" class="hover:text-white">${i18n.t('footer.pricing')}</a></li>
              <li><a href="#contact" class="hover:text-white">${i18n.t('footer.contact')}</a></li>
            </ul>
          </div>
          
          <!-- Legal -->
          <div>
            <h5 class="text-white font-bold mb-4">${i18n.t('footer.legal')}</h5>
            <ul class="space-y-2 text-sm">
              <li><a href="#terms" class="hover:text-white">${i18n.t('footer.terms')}</a></li>
              <li><a href="#privacy" class="hover:text-white">${i18n.t('footer.privacy')}</a></li>
              <li><a href="#about" class="hover:text-white">${i18n.t('footer.company')}</a></li>
              <li><a href="#contact" class="hover:text-white">${i18n.t('footer.contact')}</a></li>
            </ul>
          </div>
          
          <!-- Contact & Support -->
          <div>
            <h5 class="text-white font-bold mb-4">${i18n.t('footer.support')}</h5>
            <p class="text-sm mb-3">
              <i class="fas fa-clock mr-2 text-purple-400"></i>
              <strong>${i18n.t('footer.support_hours')}</strong>
            </p>
            <p class="text-sm mb-3">
              <i class="fas fa-user-tie mr-2 text-purple-400"></i>
              <strong>${i18n.t('footer.supervisor')}</strong><br>
              <span class="ml-6">${i18n.t('footer.supervisor_name')}</span><br>
              <span class="ml-6 text-xs">${i18n.t('footer.supervisor_address')}</span>
            </p>
            <p class="text-sm mb-3">
              <i class="fas fa-coffee mr-2 text-purple-400"></i>
              <strong>${i18n.t('footer.producer')}</strong><br>
              <span class="ml-6">${i18n.t('footer.producer_name')}</span><br>
              <span class="ml-6 text-xs">${i18n.t('footer.producer_address')}</span>
            </p>
            <p class="text-sm">
              <i class="fas fa-envelope mr-2 text-purple-400"></i>
              <a href="#contact" class="hover:text-white">${i18n.t('footer.contact_form')}</a>
            </p>
          </div>
        </div>
        
        <div class="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 ClimbHero. All rights reserved.</p>
          <p class="mt-2 text-xs text-gray-500">
            ${i18n.t('footer.powered_by')}
          </p>
        </div>
      </div>
    </footer>
  `;
}

// ============ Ranking Card ============
function renderRankingCard(video, rank) {
  const score = video.likes || 0;  // Based on likes count
  const mediaSource = video.platform || video.media_source || 'youtube';
  const mediaIcon = getMediaIcon(mediaSource);
  const mediaName = getMediaName(mediaSource);
  const isLiked = video.user_liked || false;
  const thumbnailUrl = getVideoThumbnail(video);
  
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
          <img src="${thumbnailUrl}" alt="${video.title}" 
               onerror="this.onerror=null; if(this.src.includes('youtube.com')) { this.src=this.src.replace('hqdefault', 'sddefault'); } else { this.src='https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop&q=80'; }">
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
  const thumbnailUrl = getVideoThumbnail(video);
  
  return `
    <div class="scroll-item">
      <div class="video-card-compact">
        <div class="video-thumbnail" onclick="showVideoDetail(${video.id})">
          <img src="${thumbnailUrl}" alt="${video.title}" 
               onerror="this.onerror=null; if(this.src.includes('youtube.com')) { this.src=this.src.replace('hqdefault', 'sddefault'); } else { this.src='https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop&q=80'; }">
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
  const thumbnailUrl = getVideoThumbnail(video);
  
  return `
    <div class="scroll-item-wide">
      <div class="video-card-compact">
        <div class="video-thumbnail" onclick="showVideoDetail(${video.id})">
          <img src="${thumbnailUrl}" alt="${video.title}" 
               onerror="this.onerror=null; if(this.src.includes('youtube.com')) { this.src=this.src.replace('hqdefault', 'sddefault'); } else { this.src='https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop&q=80'; }">
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
  const isLiked = post.is_liked || false
  const isFavorited = post.is_favorited || false
  const likeCount = post.like_count || 0
  
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
            <span><i class="fas fa-newspaper"></i> ブログ</span>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <button 
              onclick="event.stopPropagation(); toggleBlogLike(${post.id})" 
              class="text-xs px-2 py-1 rounded-full transition-colors ${isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'}"
              title="${isLiked ? 'いいね済み' : 'いいね'}">
              <i class="fas fa-heart"></i> <span id="blog-like-count-${post.id}">${likeCount}</span>
            </button>
            <button 
              onclick="event.stopPropagation(); toggleBlogFavorite(${post.id})" 
              class="text-xs px-2 py-1 rounded-full transition-colors ${isFavorited ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'}"
              title="${isFavorited ? 'お気に入り済み' : 'お気に入り'}">
              <i class="fas fa-star"></i>
            </button>
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
  state.currentRankingPeriod = period;
  
  // Load data for the selected period
  try {
    const lang = state.currentLanguage || 'ja';
    const response = await axios.get(`/api/videos/top-liked?limit=20&period=${period}&lang=${lang}`);
    state.topLikedVideos = response.data.videos || [];
    
    // Re-render only the ranking section
    renderRankingSection();
    
  } catch (error) {
    console.error('Failed to load ranking:', error);
    showToast('ランキングの読み込みに失敗しました', 'error');
    const rankingScroll = document.getElementById('ranking-scroll');
    if (rankingScroll) {
      rankingScroll.innerHTML = '<div class="text-center py-8 text-gray-500">データの読み込みに失敗しました</div>';
    }
  }
}

function renderRankingSection() {
  const container = document.getElementById('ranking-section-content');
  if (!container) return;
  
  container.innerHTML = `
    <!-- Filter Buttons -->
    ${renderFilterButtons('switchRankingPeriod', state.currentRankingPeriod, [
      { value: 'daily', label: '日次', icon: 'fas fa-calendar-day' },
      { value: 'weekly', label: '週次', icon: 'fas fa-calendar-week' },
      { value: 'monthly', label: '月次', icon: 'fas fa-calendar-alt' },
      { value: '6months', label: '6ヶ月', icon: 'fas fa-calendar' },
      { value: '1year', label: '1年', icon: 'fas fa-calendar' },
      { value: 'all', label: '全期間', icon: 'fas fa-infinity' }
    ])}
    
    <!-- Horizontal Carousel -->
    <div class="carousel-container" id="ranking-carousel">
      <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('ranking-carousel', -1)">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="horizontal-scroll" id="ranking-scroll">
        ${state.topLikedVideos && state.topLikedVideos.length > 0 ? state.topLikedVideos.map((video, index) => renderRankingCard(video, index + 1)).join('') : '<div class="text-center py-8 text-gray-500">データがありません</div>'}
      </div>
      <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('ranking-carousel', 1)">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
}

// ============ Ad Banner Functions ============

// Render ad banner
function renderAdBanner(position) {
  const banners = state.adBanners[position] || [];
  if (banners.length === 0) return '';
  
  // Show first active banner for this position
  const banner = banners[0];
  if (!banner) return '';
  
  // Track impression
  trackAdImpression(banner.id);
  
  // Determine gradient based on banner ID or position
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple to deep purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink to red
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue to cyan
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green to teal
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'  // Pink to yellow
  ];
  
  const gradient = gradients[banner.id % gradients.length];
  
  return `
    <div class="w-full my-4 px-4">
      <a 
        href="${banner.link_url || '#'}" 
        target="${banner.link_url?.startsWith('http') ? '_blank' : '_self'}"
        onclick="trackAdClick(${banner.id})"
        class="block w-full overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all relative group"
        style="height: 80px; background: ${gradient};">
        <!-- Text centered -->
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-white font-bold text-lg md:text-xl px-6 py-2 bg-black/20 backdrop-blur-sm rounded-lg group-hover:bg-black/30 transition-all">
            ${banner.title}
          </span>
        </div>
      </a>
    </div>
  `;
}

// Track ad impression
function trackAdImpression(bannerId) {
  axios.post(`/api/ad-banners/${bannerId}/impression`).catch(err => {
    console.error('Failed to track impression:', err);
  });
}

// Track ad click
function trackAdClick(bannerId) {
  axios.post(`/api/ad-banners/${bannerId}/click`).catch(err => {
    console.error('Failed to track click:', err);
  });
}

// Filter announcements by genre
async function filterAnnouncements(genre) {
  state.announcementGenre = genre;
  
  try {
    const lang = state.currentLanguage || 'ja';
    const response = await axios.get(`/api/announcements?lang=${lang}&genre=${genre}`);
    state.announcements = response.data || [];
    
    // Re-render modal
    const modal = document.getElementById('announcements-modal');
    if (modal) {
      modal.remove();
      showAnnouncementsModal();
    }
  } catch (error) {
    console.error('Failed to filter announcements:', error);
    showToast('お知らせの読み込みに失敗しました', 'error');
  }
}

// Filter blogs by genre
async function filterBlogsByGenre(genre) {
  state.currentBlogGenre = genre;
  
  try {
    const lang = state.currentLanguage || 'ja';
    const url = genre ? `/api/blog?lang=${lang}&genre=${genre}` : `/api/blog?lang=${lang}`;
    const response = await axios.get(url);
    state.blogPosts = response.data || [];
    
    // Re-render only the blog section
    renderBlogSection();
  } catch (error) {
    console.error('Failed to filter blogs:', error);
    showToast('ブログの読み込みに失敗しました', 'error');
  }
}

function renderBlogSection() {
  const container = document.getElementById('blog-section-content');
  if (!container) return;
  
  container.innerHTML = `
    <!-- Genre Filter Buttons -->
    ${state.blogGenres && state.blogGenres.length > 0 ? renderFilterButtons('filterBlogsByGenre', state.currentBlogGenre, [
      { value: '', label: 'すべて', icon: 'fas fa-th' },
      ...state.blogGenres.map(g => ({ value: g.name, label: g.name, icon: g.icon }))
    ]) : ''}
    
    <!-- Horizontal Carousel -->
    <div class="carousel-container" id="blog-carousel">
      <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('blog-carousel', -1)">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="horizontal-scroll" id="blog-scroll">
        ${state.blogPosts && state.blogPosts.length > 0 ? state.blogPosts.map(post => renderBlogCard(post)).join('') : '<div class="text-center py-8 text-gray-500">ブログ記事がありません</div>'}
      </div>
      <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('blog-carousel', 1)">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
}

// ============ Unified Filter Buttons Component ============

// Render unified filter buttons (tab-buttons style)
function renderFilterButtons(filterType, currentValue, options) {
  return `
    <div class="tab-buttons mb-1">
      ${options.map(option => `
        <button 
          onclick="${filterType}('${option.value}')" 
          class="tab-btn ${currentValue === option.value ? 'active' : ''}">
          ${option.icon ? `<i class="${option.icon}"></i>` : ''} ${option.label}
        </button>
      `).join('')}
    </div>
  `;
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

// Navigate to My Page (Admin or User)
function navigateToMyPage() {
  navigateTo('mypage');
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

// ============ Testimonials Section Toggle ============
function toggleTestimonialsSection() {
  const content = document.getElementById('testimonials-content');
  const icon = document.getElementById('testimonials-toggle-icon');
  
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
  const currentPlan = state.currentUser?.membership_type || 'free';
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 720px; width: 95%;">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-900">
          <i class="fas fa-crown text-yellow-500 mr-2"></i>
          料金プラン
        </h3>
        <button onclick="closeModal('pricing-modal')" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <!-- Plan Cards -->
      <div class="grid md:grid-cols-3 gap-4">
        <!-- Free Plan -->
        <div class="border-2 ${currentPlan === 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200'} rounded-xl p-5 relative">
          ${currentPlan === 'free' ? '<div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">現在のプラン</div>' : ''}
          <div class="text-center mb-4">
            <h4 class="text-lg font-bold text-gray-800">🆓 フリー</h4>
            <div class="text-3xl font-bold text-gray-800 mt-2">¥0</div>
            <p class="text-sm text-gray-500">永久無料</p>
          </div>
          <ul class="space-y-2 text-sm mb-6">
            <li class="flex items-center gap-2"><i class="fas fa-check text-green-500"></i> 動画閲覧</li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-green-500"></i> 1日1いいね</li>
            <li class="flex items-center gap-2 text-gray-400"><i class="fas fa-times"></i> お気に入り管理</li>
            <li class="flex items-center gap-2 text-gray-400"><i class="fas fa-times"></i> 動画投稿</li>
            <li class="flex items-center gap-2 text-gray-400"><i class="fas fa-times"></i> 広告非表示</li>
          </ul>
          <button disabled class="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
            ${currentPlan === 'free' ? '現在のプラン' : '基本プラン'}
          </button>
        </div>
        
        <!-- Monthly Plan -->
        <div class="border-2 ${currentPlan === 'premium' && state.currentUser?.subscription_type === 'monthly' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'} rounded-xl p-5 relative">
          ${currentPlan === 'premium' && state.currentUser?.subscription_type === 'monthly' ? '<div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">現在のプラン</div>' : ''}
          <div class="text-center mb-4">
            <h4 class="text-lg font-bold text-purple-700">👑 プレミアム月額</h4>
            <div class="text-3xl font-bold text-purple-600 mt-2">¥980</div>
            <p class="text-sm text-gray-500">/月</p>
          </div>
          <ul class="space-y-2 text-sm mb-6">
            <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> 動画閲覧</li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> <strong>無制限いいね</strong></li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> お気に入り管理</li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> 動画投稿</li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-purple-600"></i> 広告非表示</li>
          </ul>
          <button onclick="startCheckout('monthly')" class="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition ${currentPlan === 'premium' ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPlan === 'premium' ? 'disabled' : ''}>
            <i class="fas fa-credit-card mr-2"></i>
            ${currentPlan === 'premium' && state.currentUser?.subscription_type === 'monthly' ? '契約中' : '月額プランを始める'}
          </button>
        </div>
        
        <!-- Annual Plan (50% OFF) -->
        <div class="border-2 ${currentPlan === 'premium' && state.currentUser?.subscription_type === 'annual' ? 'border-yellow-500 bg-yellow-50' : 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'} rounded-xl p-5 relative shadow-lg">
          <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            ${currentPlan === 'premium' && state.currentUser?.subscription_type === 'annual' ? '現在のプラン' : '🎉 50%OFF 一番人気！'}
          </div>
          <div class="text-center mb-4">
            <h4 class="text-lg font-bold text-orange-700">🏆 プレミアム年間</h4>
            <div class="text-3xl font-bold text-orange-600 mt-2">¥5,880</div>
            <p class="text-sm text-gray-500">/年（月額換算 ¥490）</p>
            <div class="mt-2 text-xs">
              <span class="line-through text-gray-400">¥11,760/年</span>
              <span class="ml-2 text-red-500 font-bold">5,880円お得！</span>
            </div>
          </div>
          <ul class="space-y-2 text-sm mb-6">
            <li class="flex items-center gap-2"><i class="fas fa-check text-orange-600"></i> 動画閲覧</li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-orange-600"></i> <strong>無制限いいね</strong></li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-orange-600"></i> お気に入り管理</li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-orange-600"></i> 動画投稿</li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-orange-600"></i> 広告非表示</li>
            <li class="flex items-center gap-2"><i class="fas fa-star text-yellow-500"></i> <strong class="text-orange-600">月額の半額でお得！</strong></li>
          </ul>
          <button onclick="startCheckout('annual')" class="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg transition shadow-md ${currentPlan === 'premium' && state.currentUser?.subscription_type === 'annual' ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPlan === 'premium' && state.currentUser?.subscription_type === 'annual' ? 'disabled' : ''}>
            <i class="fas fa-crown mr-2"></i>
            ${currentPlan === 'premium' && state.currentUser?.subscription_type === 'annual' ? '契約中' : '年間プランを始める'}
          </button>
        </div>
      </div>
      
      ${!state.currentUser ? `
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p class="text-sm text-blue-700">
            <i class="fas fa-info-circle mr-1"></i>
            プランを選択するには、まず<button onclick="closeModal('pricing-modal'); showAuthModal('login');" class="font-bold underline hover:text-blue-900">ログイン</button>してください。
          </p>
        </div>
      ` : ''}
      
      <div class="mt-6 text-center text-xs text-gray-500">
        <p>🔒 お支払いは <a href="https://stripe.com" target="_blank" class="text-purple-600 hover:underline">Stripe</a> による安全な決済システムで処理されます</p>
        <p class="mt-1">いつでもキャンセル可能・自動更新あり</p>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

// Start Stripe Checkout
async function startCheckout(planType) {
  if (!state.currentUser) {
    closeModal('pricing-modal');
    showAuthModal('login');
    showToast('プランを選択するにはログインが必要です', 'info');
    return;
  }
  
  try {
    showToast('決済画面を準備中...', 'info');
    
    const response = await axios.post('/api/subscription/checkout', {
      plan_type: planType
    });
    
    if (response.data.checkout_url) {
      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url;
    } else {
      showToast('決済画面の準備に失敗しました', 'error');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error.response?.data?.error || '決済処理に失敗しました';
    showToast(message, 'error');
  }
}

async function handlePremiumSubscribe(event) {
  event.preventDefault();
  showToast('プレミアムプランへの登録処理を開始します...', 'info');
  
  // Redirect to checkout
  startCheckout('monthly');
}

// ============ Auth Modal (Continuing from previous implementation) ============
function showAuthModal(type) {
  const modal = document.getElementById('auth-modal');
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 440px; width: 90%;">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 -mx-6 -mt-6 px-6 py-4 rounded-t-xl mb-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-white flex items-center">
            <i class="fas fa-sign-in-alt mr-2"></i>
            ${type === 'login' ? 'ログイン' : '新規登録'}
          </h3>
          <button onclick="closeModal('auth-modal')" class="text-white hover:text-gray-200 transition">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>
      
      <!-- Google Login Button -->
      <button onclick="handleGoogleLogin()" class="w-full flex items-center justify-center gap-3 border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-3 rounded-lg transition shadow-sm hover:shadow-md">
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Googleでログイン</span>
      </button>
      
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-3 bg-white text-gray-500 font-medium">または</span>
        </div>
      </div>
      
      <form onsubmit="handleAuth(event, '${type}')" class="space-y-4">
        ${type === 'register' ? `
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-user text-purple-600 mr-1"></i>
              ユーザー名
            </label>
            <input 
              type="text" 
              name="username" 
              required 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              placeholder="山田太郎"
            />
          </div>
        ` : ''}
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-envelope text-purple-600 mr-1"></i>
            メールアドレス
          </label>
          <input 
            type="email" 
            name="email" 
            required 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
            id="auth-email"
            placeholder="example@email.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-lock text-purple-600 mr-1"></i>
            パスワード
          </label>
          <div class="relative">
            <input 
              type="password" 
              name="password" 
              required 
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              id="auth-password"
              placeholder="••••••••"
              minlength="6"
            />
            <button 
              type="button" 
              onclick="togglePasswordVisibility('auth-password', 'password-toggle-icon')"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <i id="password-toggle-icon" class="fas fa-eye"></i>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            <i class="fas fa-info-circle mr-1"></i>
            6文字以上で入力してください
          </p>
        </div>
        
        ${type === 'login' ? `
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input type="checkbox" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span class="ml-2 text-sm text-gray-600">ログイン状態を保持</span>
            </label>
            <a href="#" onclick="showPasswordResetModal(); return false;" class="text-sm text-purple-600 hover:text-purple-800 font-medium">
              パスワードを忘れた
            </a>
          </div>
        ` : ''}
        
        <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition shadow-md hover:shadow-lg">
          <i class="fas ${type === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'} mr-2"></i>
          ${type === 'login' ? 'ログイン' : '新規登録'}
        </button>
      </form>
      
      ${type === 'login' ? `
        <div class="mt-4">
          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-3 bg-white text-gray-500 font-medium">管理者用</span>
            </div>
          </div>
          
          <button 
            type="button"
            onclick="quickAdminLogin()" 
            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i class="fas fa-crown text-yellow-300 mr-2"></i>
            👑 管理者としてログイン
          </button>
          
          <p class="text-xs text-center text-gray-500 mt-2">
            <i class="fas fa-info-circle mr-1"></i>
            開発・テスト用の管理者アカウントで即座にログインします
          </p>
        </div>
      ` : ''}
      
      ${type === 'register' ? `
        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-xs text-blue-800">
            <i class="fas fa-info-circle mr-1"></i>
            登録することで、<a href="#" class="text-blue-600 underline">利用規約</a>と<a href="#" class="text-blue-600 underline">プライバシーポリシー</a>に同意したものとみなされます。
          </p>
        </div>
      ` : ''}
      
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          ${type === 'login' ? 'アカウントをお持ちでない方' : 'すでにアカウントをお持ちの方'}
          <a href="#" onclick="showAuthModal('${type === 'login' ? 'register' : 'login'}'); return false;" class="text-purple-600 hover:text-purple-800 font-bold ml-1">
            ${type === 'login' ? '新規登録' : 'ログイン'}
          </a>
        </p>
      </div>
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
    
    // ログイン後にお気に入りをロード
    if (state.currentUser) {
      await loadUserLikeStatus();
      await loadUserFavorites();
    }
    
    closeModal('auth-modal');
    
    // ログイン後は全員トップページへ
    renderApp();
    if (state.currentUser && state.currentUser.is_admin) {
      showToast('管理者としてログインしました - マイページから管理画面へアクセスできます', 'success');
    } else {
      showToast(i18n.t('toast.auth_success'), 'success');
    }
  } catch (error) {
    showToast(error.response?.data?.error || i18n.t('toast.auth_error'), 'error');
  }
}

// Quick Admin Login (Development/Testing Only)
async function quickAdminLogin() {
  try {
    // Admin credentials
    const adminData = {
      email: 'admin@climbhero.com',
      password: 'admin123'
    };
    
    await axios.post('/api/auth/login', adminData);
    await checkAuth();
    
    // ログイン後にお気に入りをロード
    if (state.currentUser) {
      await loadUserLikeStatus();
      await loadUserFavorites();
    }
    
    // Close auth modal
    closeModal('auth-modal');
    
    // Redirect to app
    renderApp();
    showToast('👑 管理者としてログインしました - マイページから管理画面へアクセスできます', 'success');
    
    // Navigate to mypage after short delay
    setTimeout(() => {
      navigateTo('mypage');
    }, 1000);
  } catch (error) {
    showToast('管理者ログインに失敗しました', 'error');
    console.error('Quick admin login error:', error);
  }
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

async function handleGoogleLogin() {
  try {
    // Google OAuth2の認証URL生成
    const clientId = ''; // Google Cloud ConsoleでクライアントIDを取得して設定
    const redirectUri = window.location.origin + '/auth/google/callback';
    const scope = 'email profile';
    const state = Math.random().toString(36).substring(7);
    
    // セッションストレージにstateを保存（CSRF対策）
    sessionStorage.setItem('google_oauth_state', state);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    // 実装ノート: 本番環境ではGoogle Cloud Consoleでクライアント IDを取得し設定が必要
    // 現在はデモ用にアラートを表示
    showToast('Googleログインは開発中です。通常のログインをご利用ください。', 'info');
    
    // 本番では以下のコードを使用:
    // window.location.href = authUrl;
  } catch (error) {
    console.error('Google login error:', error);
    showToast('Googleログインに失敗しました', 'error');
  }
}

async function logout() {
  // Show confirmation dialog
  if (!confirm(i18n.t('toast.logout_confirm'))) {
    return;
  }
  
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
    const lang = state.currentLanguage || 'ja';
    const response = await axios.get(`/api/videos/${videoId}?lang=${lang}`);
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
          ${renderEnhancedVideoEmbed(video)}
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
    const response = await axios.post(`/api/videos/${videoId}/like`);
    const { liked } = response.data;
    
    if (liked) {
      showToast('いいねしました', 'success');
    } else {
      showToast('いいねを取り消しました', 'info');
    }
    
    await loadInitialData();
    await loadUserLikeStatus();
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
    const response = await axios.post(`/api/videos/${videoId}/favorite`);
    const { favorited } = response.data;
    
    if (favorited) {
      showToast('お気に入りに追加しました', 'success');
    } else {
      showToast('お気に入りから削除しました', 'info');
    }
    
    await loadUserFavorites();
    renderApp();
  } catch (error) {
    showToast('お気に入りの処理に失敗しました', 'error');
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
async function filterVideosByCategory(category) {
  state.currentVideoCategory = category;
  
  try {
    const lang = state.currentLanguage || 'ja';
    const url = category === 'all' ? `/api/videos?limit=20&lang=${lang}` : `/api/videos?category=${category}&limit=20&lang=${lang}`;
    const response = await axios.get(url);
    state.videos = response.data.videos || [];
    
    // Re-render only the videos section
    renderVideosSection();
  } catch (error) {
    showToast('動画の読み込みに失敗しました', 'error');
  }
}

function renderVideosSection() {
  const container = document.getElementById('videos-section-content');
  if (!container) return;
  
  container.innerHTML = `
    <!-- Filter Buttons -->
    ${renderFilterButtons('filterVideosByCategory', state.currentVideoCategory, [
      { value: 'all', label: i18n.getCurrentLanguage() === 'ja' ? '全て' : 'All', icon: 'fas fa-th' },
      { value: 'bouldering', label: i18n.t('section.bouldering'), icon: 'fas fa-grip-lines' },
      { value: 'lead', label: i18n.t('section.lead'), icon: 'fas fa-link' },
      { value: 'alpine', label: i18n.t('section.alpine'), icon: 'fas fa-mountain' },
      { value: 'other', label: i18n.t('section.other'), icon: 'fas fa-ellipsis-h' }
    ])}
    
    <!-- Horizontal Carousel -->
    <div class="carousel-container" id="videos-carousel">
      <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('videos-carousel', -1)">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="horizontal-scroll" id="videos-scroll">
        ${state.videos && state.videos.length > 0 ? state.videos.map(video => renderVideoCard(video)).join('') : '<div class="text-center py-8 text-gray-500">データがありません</div>'}
      </div>
      <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('videos-carousel', 1)">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
}

// ============ Blog Detail (Simplified) ============
async function renderBlogDetail() {
  try {
    const lang = state.currentLanguage || 'ja';
    const response = await axios.get(`/api/blog/${state.currentBlogId}?lang=${lang}`);
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

// ============ My Page (User Profile) ============
function renderMyPage() {
  if (!state.currentUser) {
    navigateTo('home');
    return '';
  }

  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div class="flex items-center justify-between h-14 sm:h-16">
            <!-- Logo Section (Clickable for Home) -->
            <div class="flex items-center flex-shrink-0 min-w-0">
              <button onclick="navigateTo('home')" class="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors cursor-pointer">
                <i class="fas fa-mountain text-sm sm:text-base bg-gradient-to-br from-purple-600 to-pink-600" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                <h1 class="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 whitespace-nowrap" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ClimbHero</h1>
              </button>
            </div>
            
            <!-- Right Section -->
            <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div class="flex gap-0.5 sm:gap-1">
                ${i18n.getAvailableLanguages().map(lang => `
                  <button 
                    onclick="switchLanguage('${lang.code}')" 
                    class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded transition-all text-sm sm:text-base ${
                      i18n.getCurrentLanguage() === lang.code 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 scale-110' 
                        : 'hover:bg-gray-100'
                    }"
                    title="${lang.name}">
                    ${lang.flag}
                  </button>
                `).join('')}
              </div>
              
              <button onclick="logout()" class="btn btn-sm btn-primary px-3 text-base">
                ${i18n.t('nav.logout')}
              </button>
              
              <button onclick="navigateTo('mypage')" class="btn btn-sm btn-secondary px-3 text-base">
                ${i18n.t('mypage.title')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Admin Page Button (Top - Admin Only) -->
        ${state.currentUser.is_admin ? `
          <div class="mb-6">
            <button onclick="navigateTo('admin')" class="w-full sm:w-auto px-8 py-4 text-left shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl" style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: white;">
              <i class="fas fa-crown mr-3 text-yellow-300 text-xl"></i>
              <span class="font-bold text-lg">👑 管理ページ</span>
            </button>
          </div>
        ` : ''}
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left Column: Profile Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- User Profile Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <h2 class="text-xl font-bold text-white flex items-center">
                  <i class="fas fa-user-circle mr-3"></i>
                  ${i18n.t('mypage.profile')}
                </h2>
              </div>
              
              <div class="p-6">
                <form onsubmit="updateMyProfile(event)" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-user text-purple-600 mr-1"></i>
                        ${i18n.t('mypage.username')}
                      </label>
                      <input 
                        type="text" 
                        id="profile-username" 
                        value="${state.currentUser.username}" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-envelope text-purple-600 mr-1"></i>
                        ${i18n.t('mypage.email')}
                      </label>
                      <input 
                        type="email" 
                        id="profile-email" 
                        value="${state.currentUser.email}" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>
                  
                  <div class="pt-4">
                    <button type="submit" class="w-full btn btn-primary py-3 text-base">
                      <i class="fas fa-save mr-2"></i>
                      ${i18n.t('mypage.update_profile')}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Password Change Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                <h3 class="text-xl font-bold text-white flex items-center">
                  <i class="fas fa-key mr-3"></i>
                  ${i18n.t('mypage.password_change')}
                </h3>
              </div>
              
              <div class="p-6">
                <form onsubmit="updateMyPassword(event)" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      <i class="fas fa-lock text-blue-600 mr-1"></i>
                      ${i18n.t('mypage.current_password')}
                    </label>
                    <input 
                      type="password" 
                      id="current-password" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      <i class="fas fa-lock text-blue-600 mr-1"></i>
                      ${i18n.t('mypage.new_password')}
                    </label>
                    <input 
                      type="password" 
                      id="new-password" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      required
                      minlength="6"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      <i class="fas fa-check-circle text-blue-600 mr-1"></i>
                      新しいパスワード（確認）
                    </label>
                    <input 
                      type="password" 
                      id="confirm-password" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      required
                      minlength="6"
                    />
                  </div>
                  <button type="submit" class="w-full btn btn-primary py-3 text-base">
                    <i class="fas fa-key mr-2"></i>
                    パスワードを更新
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <!-- Right Column: Account Info & Actions -->
          <div class="space-y-6">
            <!-- Account Status Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h3 class="text-lg font-bold text-white flex items-center">
                  <i class="fas fa-id-card mr-2"></i>
                  アカウント情報
                </h3>
              </div>
              <div class="p-6 space-y-4">
                ${state.currentUser.is_admin ? `
                  <div class="p-4 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg shadow-lg">
                    <p class="text-xs text-purple-100 mb-1">アカウント権限</p>
                    <p class="text-xl font-bold text-white flex items-center">
                      <i class="fas fa-crown text-yellow-300 mr-2"></i>
                      👑 管理者アカウント
                    </p>
                    <p class="text-xs text-purple-100 mt-1">すべての管理機能にアクセスできます</p>
                  </div>
                ` : ''}
                
                <div class="flex items-center justify-between p-4 bg-gradient-to-r ${state.currentUser.membership_type === 'premium' ? 'from-purple-50 to-pink-50 border-purple-200' : 'from-gray-50 to-gray-100 border-gray-200'} border rounded-lg">
                  <div>
                    <p class="text-xs text-gray-600 mb-1">会員タイプ</p>
                    <p class="text-lg font-bold ${state.currentUser.membership_type === 'premium' ? 'text-purple-600' : 'text-gray-700'}">
                      ${state.currentUser.membership_type === 'premium' ? '👑 プレミアム' : '🆓 無料会員'}
                    </p>
                  </div>
                  ${state.currentUser.membership_type !== 'premium' ? `
                    <button onclick="showPricingModal()" class="btn btn-sm" style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: white; white-space: nowrap;">
                      <i class="fas fa-arrow-up mr-1"></i>
                      アップグレード
                    </button>
                  ` : ''}
                </div>
                
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p class="text-xs text-gray-600 mb-1">登録日</p>
                  <p class="text-base font-semibold text-gray-900">
                    <i class="fas fa-calendar-alt text-blue-600 mr-2"></i>
                    ${state.currentUser.created_at ? new Date(state.currentUser.created_at).toLocaleDateString('ja-JP') : new Date().toLocaleDateString('ja-JP')}
                  </p>
                </div>
                
                <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p class="text-xs text-gray-600 mb-1">ユーザーID</p>
                  <p class="text-base font-mono font-semibold text-gray-900">
                    #${state.currentUser.id}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Subscription Management Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                <h3 class="text-lg font-bold text-white flex items-center">
                  <i class="fas fa-crown mr-2"></i>
                  購読プラン管理
                </h3>
              </div>
              <div class="p-6" id="subscription-management">
                <div class="text-center py-4">
                  <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                  <p class="text-sm text-gray-500 mt-2">読み込み中...</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  `;
}

// Load subscription data for My Page
async function loadSubscriptionManagement() {
  const container = document.getElementById('subscription-management');
  if (!container) return;
  
  try {
    const response = await axios.get('/api/subscription/current');
    const { subscription, user, is_expired } = response.data;
    
    let content = '';
    
    if (user.membership_type === 'premium' && subscription && !is_expired) {
      // Active subscription
      const periodEnd = new Date(subscription.current_period_end);
      const planName = subscription.plan_type === 'annual' ? '年間プラン' : '月額プラン';
      const price = subscription.plan_type === 'annual' ? '¥5,880/年' : '¥980/月';
      
      content = `
        <div class="space-y-4">
          <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">現在のプラン</span>
              <span class="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">アクティブ</span>
            </div>
            <p class="text-xl font-bold text-purple-700">
              <i class="fas fa-crown text-yellow-500 mr-1"></i>
              プレミアム${planName}
            </p>
            <p class="text-sm text-gray-600 mt-1">${price}</p>
          </div>
          
          <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">次回更新日</p>
            <p class="text-lg font-semibold text-gray-900">
              <i class="fas fa-calendar text-gray-600 mr-2"></i>
              ${periodEnd.toLocaleDateString('ja-JP')}
            </p>
            ${subscription.cancel_at_period_end ? `
              <p class="text-xs text-red-600 mt-1">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                この日にフリープランに戻ります
              </p>
            ` : ''}
          </div>
          
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">自動更新</p>
                <p class="text-xs text-gray-500">${subscription.auto_renew ? 'プランは自動更新されます' : '期限終了後フリープランに戻ります'}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" ${subscription.auto_renew ? 'checked' : ''} onchange="toggleAutoRenew(this.checked)">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button onclick="showPricingModal()" class="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
              <i class="fas fa-exchange-alt mr-1"></i>
              プラン変更
            </button>
            <button onclick="showCancelSubscriptionModal()" class="flex-1 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm">
              <i class="fas fa-times-circle mr-1"></i>
              解約
            </button>
          </div>
        </div>
      `;
    } else {
      // Free plan or expired
      content = `
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p class="text-3xl mb-2">🆓</p>
            <p class="text-lg font-bold text-gray-700">フリープラン</p>
            <p class="text-sm text-gray-500 mt-1">基本機能のみ利用可能</p>
          </div>
          
          ${is_expired ? `
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-700">
                <i class="fas fa-exclamation-circle mr-1"></i>
                以前の購読が期限切れになりました
              </p>
            </div>
          ` : ''}
          
          <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <h4 class="font-bold text-purple-700 mb-2">
              <i class="fas fa-crown text-yellow-500 mr-1"></i>
              プレミアムにアップグレード
            </h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><i class="fas fa-check text-green-500 mr-1"></i> 無制限いいね</li>
              <li><i class="fas fa-check text-green-500 mr-1"></i> 動画投稿</li>
              <li><i class="fas fa-check text-green-500 mr-1"></i> お気に入り管理</li>
              <li><i class="fas fa-check text-green-500 mr-1"></i> 広告非表示</li>
            </ul>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <button onclick="startCheckout('monthly')" class="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                月額 ¥980
              </button>
              <button onclick="startCheckout('annual')" class="py-2 px-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium">
                年間 ¥5,880
                <span class="block text-xs opacity-80">50%OFF</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }
    
    container.innerHTML = content;
  } catch (error) {
    console.error('Failed to load subscription:', error);
    container.innerHTML = `
      <div class="text-center py-4 text-red-500">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p class="text-sm">購読情報の読み込みに失敗しました</p>
        <button onclick="loadSubscriptionManagement()" class="mt-2 text-purple-600 hover:underline text-sm">
          再読み込み
        </button>
      </div>
    `;
  }
}

// Toggle auto-renewal
async function toggleAutoRenew(autoRenew) {
  try {
    showToast('設定を更新中...', 'info');
    
    const response = await axios.post('/api/subscription/toggle-auto-renew', {
      auto_renew: autoRenew
    });
    
    showToast(response.data.message, 'success');
    loadSubscriptionManagement();
  } catch (error) {
    console.error('Failed to toggle auto-renew:', error);
    showToast(error.response?.data?.error || '設定の更新に失敗しました', 'error');
    loadSubscriptionManagement();
  }
}

// Show cancel subscription modal
function showCancelSubscriptionModal() {
  const modal = document.getElementById('pricing-modal');
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900">購読を解約しますか？</h3>
        <p class="text-sm text-gray-600 mt-2">解約すると以下の機能が使えなくなります：</p>
      </div>
      
      <ul class="text-sm text-gray-600 space-y-2 mb-6 bg-gray-50 p-4 rounded-lg">
        <li><i class="fas fa-times text-red-500 mr-2"></i>無制限いいね</li>
        <li><i class="fas fa-times text-red-500 mr-2"></i>動画投稿</li>
        <li><i class="fas fa-times text-red-500 mr-2"></i>お気に入り管理</li>
        <li><i class="fas fa-times text-red-500 mr-2"></i>広告非表示</li>
      </ul>
      
      <div class="space-y-3">
        <button onclick="cancelSubscription(false)" class="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg">
          <i class="fas fa-clock mr-2"></i>
          期限終了時に解約
        </button>
        <button onclick="cancelSubscription(true)" class="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg">
          <i class="fas fa-times-circle mr-2"></i>
          今すぐ解約
        </button>
        <button onclick="closeModal('pricing-modal')" class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg">
          キャンセル
        </button>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

// Cancel subscription
async function cancelSubscription(immediate) {
  try {
    showToast('解約処理中...', 'info');
    
    const response = await axios.post('/api/subscription/cancel', {
      immediate: immediate
    });
    
    closeModal('pricing-modal');
    showToast(response.data.message, 'success');
    
    // Refresh user data
    await checkAuth();
    loadSubscriptionManagement();
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    showToast(error.response?.data?.error || '解約処理に失敗しました', 'error');
  }
}

// ============ Admin Page (Simplified) ============
function renderAdminPage() {
  if (!state.currentUser || !state.currentUser.is_admin) {
    navigateTo('home');
    return '';
  }

  return `
    <div class="min-h-screen bg-gray-100">
      <!-- Admin Header with Sidebar Toggle -->
      <header class="sticky top-0 z-50 bg-white border-b border-gray-300 shadow">
        <div class="max-w-full mx-auto px-4 lg:px-6">
          <div class="flex items-center justify-between h-16">
            <!-- Logo Section -->
            <div class="flex items-center gap-4">
              <button onclick="navigateTo('home')" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <i class="fas fa-mountain text-lg text-gray-700"></i>
                <span class="text-lg font-bold text-gray-800">ClimbHero</span>
                <span class="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-semibold">ADMIN</span>
              </button>
            </div>
            
            <!-- Right Section -->
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                ${i18n.getAvailableLanguages().map(lang => `
                  <button 
                    onclick="switchLanguage('${lang.code}')" 
                    class="w-8 h-8 flex items-center justify-center rounded transition-all ${
                      i18n.getCurrentLanguage() === lang.code 
                        ? 'bg-gray-200 scale-110' 
                        : 'hover:bg-gray-100'
                    }"
                    title="${lang.name}">
                    ${lang.flag}
                  </button>
                `).join('')}
              </div>
              
              <button onclick="navigateTo('mypage')" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm font-medium">
                <i class="fas fa-user mr-2"></i>マイページ
              </button>
              
              <button onclick="logout()" class="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors text-sm font-medium">
                <i class="fas fa-sign-out-alt mr-2"></i>ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-full mx-auto px-4 lg:px-6 py-6">
        <!-- Page Title -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800 mb-1">管理ページ</h1>
          <p class="text-sm text-gray-600">ClimbHeroの運営管理システム</p>
        </div>

        <!-- Quick Stats -->
        <div class="flex flex-wrap gap-8 mb-6 justify-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-blue-600"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">総会員数</p>
              <p class="text-2xl font-bold text-gray-800" id="stat-users">-</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-video text-green-600"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">動画数</p>
              <p class="text-2xl font-bold text-gray-800" id="stat-videos">-</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-blog text-orange-600"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">ブログ記事</p>
              <p class="text-2xl font-bold text-gray-800" id="stat-blogs">-</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-bullhorn text-red-600"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">お知らせ</p>
              <p class="text-2xl font-bold text-gray-800" id="stat-announcements">-</p>
            </div>
          </div>
        </div>
        
        <!-- Management Sections Grid -->
        <div class="grid grid-cols-1 gap-4">
          
          <!-- Video Management Section -->
          <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 class="text-base font-bold text-gray-800 flex items-center">
                <i class="fas fa-video mr-2 text-green-600"></i>
                動画管理
              </h2>
              <button onclick="loadAdminVideos()" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm">
                <i class="fas fa-sync-alt mr-1"></i>再読み込み
              </button>
            </div>
            <div class="p-4">
              <div id="admin-videos-list" class="overflow-x-auto">
                <div class="text-center py-8 text-gray-500">
                  ${i18n.t('common.loading')}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Blog Management Section -->
          <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 class="text-base font-bold text-gray-800 flex items-center">
                <i class="fas fa-blog mr-2 text-orange-600"></i>
                ブログ管理
              </h2>
              <div class="flex gap-2">
                <button onclick="loadAdminBlogs()" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm">
                  <i class="fas fa-sync-alt mr-1"></i>再読み込み
                </button>
                <button onclick="showBlogModal()" class="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded transition-colors text-sm">
                  <i class="fas fa-plus mr-1"></i>新規作成
                </button>
              </div>
            </div>
            <div class="p-4">
              <div id="admin-blog-list" class="overflow-x-auto">
                <div class="text-center py-8 text-gray-500">
                  ${i18n.t('common.loading')}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Announcements Management Section -->
          <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 class="text-base font-bold text-gray-800 flex items-center">
                <i class="fas fa-bullhorn mr-2 text-blue-600"></i>
                お知らせ管理
              </h2>
              <div class="flex gap-2">
                <button onclick="loadAdminAnnouncements()" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm">
                  <i class="fas fa-sync-alt mr-1"></i>再読み込み
                </button>
                <button onclick="showAnnouncementModal()" class="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded transition-colors text-sm">
                  <i class="fas fa-plus mr-1"></i>新規作成
                </button>
              </div>
            </div>
            <div class="p-4">
              <div id="admin-announcements-list" class="overflow-x-auto">
                <div class="text-center py-8 text-gray-500">
                  ${i18n.t('common.loading')}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Ad Banner Management Section -->
          <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 class="text-base font-bold text-gray-800 flex items-center">
                <i class="fas fa-ad mr-2 text-purple-600"></i>
                広告バナー管理
              </h2>
              <button onclick="showAdBannerModal()" class="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded transition-colors text-sm">
                <i class="fas fa-plus mr-1"></i>新規作成
              </button>
            </div>
            <div class="p-4">
              <div id="admin-ad-banners-list">
                <div class="text-center py-8 text-gray-500">
                  ${i18n.t('common.loading')}
                </div>
              </div>
            </div>
          </div>
          

          
          <!-- Testimonials Management Section -->
          <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 class="text-base font-bold text-gray-800 flex items-center">
                <i class="fas fa-mountain mr-2 text-green-600"></i>
                クライマーメッセージ管理
              </h2>
              <button onclick="showTestimonialModal()" class="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded transition-colors text-sm">
                <i class="fas fa-plus mr-1"></i>新規作成
              </button>
            </div>
            <div class="p-4">
              <div id="admin-testimonials-list">
                <div class="text-center py-8 text-gray-500">
                  ${i18n.t('common.loading')}
                </div>
              </div>
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

// Load admin videos
async function loadAdminVideos() {
  try {
    const lang = state.currentLanguage || 'ja';
    const response = await axios.get(`/api/videos?limit=100&lang=${lang}`);
    const videos = response.data.videos || [];
    
    const container = document.getElementById('admin-videos-list');
    if (!container) return;
    
    if (videos.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-3"></i>
          <p>動画がありません</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">タイトル</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">プラットフォーム</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">カテゴリ</th>
            <th class="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">いいね</th>
            <th class="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">閲覧数</th>
            <th class="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${videos.map(video => `
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-900">${video.id}</td>
              <td class="px-3 py-2 text-gray-900 max-w-xs truncate" title="${video.title}">${video.title}</td>
              <td class="px-3 py-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${
                  video.media_source === 'youtube' ? 'bg-red-100 text-red-800' :
                  video.media_source === 'tiktok' ? 'bg-gray-900 text-white' :
                  video.media_source === 'instagram' ? 'bg-pink-100 text-pink-800' :
                  video.media_source === 'vimeo' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }">
                  ${video.media_source || 'youtube'}
                </span>
              </td>
              <td class="px-3 py-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  ${video.category || 'bouldering'}
                </span>
              </td>
              <td class="px-3 py-2 text-center text-gray-600">${video.likes || 0}</td>
              <td class="px-3 py-2 text-center text-gray-600">${video.views || 0}</td>
              <td class="px-3 py-2 text-center">
                <div class="flex gap-1 justify-center">
                  <button onclick="showVideoModal(${video.id})" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteVideo(${video.id})" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Failed to load admin videos:', error);
    const container = document.getElementById('admin-videos-list');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
          <p>動画の読み込みに失敗しました</p>
        </div>
      `;
    }
  }
}

// Load admin blogs
async function loadAdminBlogs() {
  try {
    const lang = state.currentLanguage || 'ja';
    const response = await axios.get(`/api/blog?lang=${lang}`);
    const blogs = response.data;
    
    const container = document.getElementById('admin-blog-list');
    if (!container) return;
    
    if (blogs.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-3"></i>
          <p>ブログ記事がありません</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">タイトル</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ジャンル</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">公開日</th>
            <th class="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${blogs.map(blog => `
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-900">${blog.id}</td>
              <td class="px-3 py-2 text-gray-900 max-w-xs truncate" title="${blog.title || blog.title_ja}">${blog.title || blog.title_ja}</td>
              <td class="px-3 py-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  ${blog.genre || 'general'}
                </span>
              </td>
              <td class="px-3 py-2 text-gray-600">${new Date(blog.published_date).toLocaleDateString('ja-JP')}</td>
              <td class="px-3 py-2 text-center">
                <div class="flex gap-1 justify-center">
                  <button onclick="showBlogModal(${blog.id})" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteBlog(${blog.id})" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Failed to load admin blogs:', error);
    const container = document.getElementById('admin-blog-list');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
          <p>ブログ記事の読み込みに失敗しました</p>
        </div>
      `;
    }
  }
}

// Load admin announcements
async function loadAdminAnnouncements() {
  try {
    const lang = state.currentLanguage || 'ja';
    const response = await axios.get(`/api/announcements?lang=${lang}`);
    const announcements = response.data;
    
    const container = document.getElementById('admin-announcements-list');
    if (!container) return;
    
    if (announcements.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-3"></i>
          <p>お知らせがありません</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">タイトル</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">内容</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ジャンル</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ステータス</th>
            <th class="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${announcements.map(announcement => `
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-900">${announcement.id}</td>
              <td class="px-3 py-2 text-gray-900 max-w-xs truncate" title="${announcement.title || announcement.title_ja}">${announcement.title || announcement.title_ja}</td>
              <td class="px-3 py-2 text-gray-600 max-w-md truncate" title="${announcement.content || announcement.content_ja}">${announcement.content || announcement.content_ja}</td>
              <td class="px-3 py-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  ${announcement.genre || 'general'}
                </span>
              </td>
              <td class="px-3 py-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                  ${announcement.is_active ? '公開中' : '非公開'}
                </span>
              </td>
              <td class="px-3 py-2 text-center">
                <div class="flex gap-1 justify-center">
                  <button onclick="showAnnouncementModal(${announcement.id})" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteAnnouncement(${announcement.id})" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Failed to load admin announcements:', error);
    const container = document.getElementById('admin-announcements-list');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
          <p>お知らせの読み込みに失敗しました</p>
        </div>
      `;
    }
  }
}

// Show announcement modal
function showAnnouncementModal(announcementId = null) {
  const isEdit = announcementId !== null;
  const announcement = isEdit ? state.announcements.find(a => a.id === announcementId) : null;
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 700px;" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">
          <i class="fas fa-bullhorn mr-2"></i>
          ${isEdit ? i18n.t('admin.announcement_edit') : i18n.t('admin.announcement_new')}
        </h3>
        <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form onsubmit="handleAnnouncementSubmit(event, ${announcementId})" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.announcement_title')} (日本語)</label>
          <input type="text" name="title" value="${announcement?.title || ''}" required class="w-full px-4 py-2 border rounded-lg" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.announcement_title')} (English)</label>
          <input type="text" name="title_en" value="${announcement?.title_en || ''}" class="w-full px-4 py-2 border rounded-lg" placeholder="English title" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.announcement_title')} (中文)</label>
          <input type="text" name="title_zh" value="${announcement?.title_zh || ''}" class="w-full px-4 py-2 border rounded-lg" placeholder="Chinese title" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.announcement_title')} (한국어)</label>
          <input type="text" name="title_ko" value="${announcement?.title_ko || ''}" class="w-full px-4 py-2 border rounded-lg" placeholder="Korean title" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.announcement_content')} (日本語)</label>
          <textarea name="content" rows="2" required class="w-full px-4 py-2 border rounded-lg">${announcement?.content || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.announcement_content')} (English)</label>
          <textarea name="content_en" rows="2" class="w-full px-4 py-2 border rounded-lg" placeholder="English content">${announcement?.content_en || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.announcement_content')} (中文)</label>
          <textarea name="content_zh" rows="2" class="w-full px-4 py-2 border rounded-lg" placeholder="Chinese content">${announcement?.content_zh || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.announcement_content')} (한국어)</label>
          <textarea name="content_ko" rows="2" class="w-full px-4 py-2 border rounded-lg" placeholder="Korean content">${announcement?.content_ko || ''}</textarea>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">${i18n.t('admin.announcement_priority')} (0-10)</label>
            <input type="number" name="priority" value="${announcement?.priority || 0}" min="0" max="10" class="w-full px-4 py-2 border rounded-lg" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Status</label>
            <select name="is_active" class="w-full px-4 py-2 border rounded-lg">
              <option value="1" ${!announcement || announcement.is_active ? 'selected' : ''}>${i18n.t('admin.announcement_active')}</option>
              <option value="0" ${announcement && !announcement.is_active ? 'selected' : ''}>${i18n.t('admin.announcement_inactive')}</option>
            </select>
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

async function handleAnnouncementSubmit(event, announcementId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const data = {
    title: formData.get('title'),
    title_en: formData.get('title_en') || null,
    title_zh: formData.get('title_zh') || null,
    title_ko: formData.get('title_ko') || null,
    content: formData.get('content'),
    content_en: formData.get('content_en') || null,
    content_zh: formData.get('content_zh') || null,
    content_ko: formData.get('content_ko') || null,
    priority: parseInt(formData.get('priority') || '0'),
    is_active: parseInt(formData.get('is_active'))
  };
  
  try {
    if (announcementId) {
      await axios.put(`/api/admin/announcements/${announcementId}`, data);
      showToast(i18n.getCurrentLanguage() === 'ja' ? 'お知らせを更新しました' : 'Announcement updated', 'success');
    } else {
      await axios.post('/api/admin/announcements', data);
      showToast(i18n.getCurrentLanguage() === 'ja' ? 'お知らせを作成しました' : 'Announcement created', 'success');
    }
    
    document.querySelector('.modal').remove();
    loadAdminAnnouncements();
    await loadInitialData();
  } catch (error) {
    showToast(error.response?.data?.error || 'Failed to save announcement', 'error');
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
    state.announcements = response.data;
    showAnnouncementModal(announcementId);
  } catch (error) {
    console.error('Failed to edit announcement:', error);
    showToast('Failed to load announcement data', 'error');
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
            ${i18n.t('contact.title')}
          </h1>
          <p class="text-gray-600 mb-2">
            ${i18n.t('contact.subtitle')}
          </p>
          <p class="text-sm text-red-500 mb-8">
            ${i18n.t('contact.required')}
          </p>
          
          <!-- Contact Form -->
          <form id="contactForm" class="space-y-6">
            <!-- Honeypot (hidden field for spam protection) -->
            <div class="hidden" aria-hidden="true">
              <input type="text" name="website" id="contact_honeypot" tabindex="-1" autocomplete="off">
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ${i18n.t('contact.name')} <span class="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="contact_name" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="${i18n.t('contact.name_placeholder')}"
                >
              </div>
              
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ${i18n.t('contact.email')} <span class="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  id="contact_email" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="${i18n.t('contact.email_placeholder')}"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Phone (optional) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ${i18n.t('contact.phone')}
                </label>
                <input 
                  type="tel" 
                  id="contact_phone" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="${i18n.t('contact.phone_placeholder')}"
                >
              </div>
              
              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ${i18n.t('contact.category')} <span class="text-red-500">*</span>
                </label>
                <select 
                  id="contact_category" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">${i18n.t('contact.category_general')}</option>
                  <option value="support">${i18n.t('contact.category_support')}</option>
                  <option value="feedback">${i18n.t('contact.category_feedback')}</option>
                  <option value="business">${i18n.t('contact.category_business')}</option>
                  <option value="press">${i18n.t('contact.category_press')}</option>
                  <option value="other">${i18n.t('contact.category_other')}</option>
                </select>
              </div>
            </div>
            
            <!-- Subject -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${i18n.t('contact.subject')} <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="contact_subject" 
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="${i18n.t('contact.subject_placeholder')}"
              >
            </div>
            
            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${i18n.t('contact.message')} <span class="text-red-500">*</span>
              </label>
              <textarea 
                id="contact_message" 
                required
                rows="8"
                minlength="10"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="${i18n.t('contact.message_placeholder')}"
              ></textarea>
            </div>
            
            <!-- Privacy Notice -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">
                <i class="fas fa-shield-alt mr-2 text-purple-600"></i>
                ${i18n.t('contact.privacy_notice')}
                <a href="#privacy" class="text-purple-600 hover:underline ml-1">${i18n.t('footer.privacy')}</a>
              </p>
            </div>
            
            <!-- Submit Buttons -->
            <div class="flex gap-4">
              <button 
                type="submit" 
                id="contact_submit_btn"
                class="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-paper-plane mr-2"></i>
                <span id="contact_submit_text">${i18n.t('contact.submit')}</span>
              </button>
              <a 
                href="#home" 
                class="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium text-center"
              >
                ${i18n.t('common.cancel')}
              </a>
            </div>
          </form>
          
          <!-- Success Message (hidden by default) -->
          <div id="contact_success" class="hidden mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <i class="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
            <h3 class="text-xl font-bold text-green-800 mb-2">${i18n.t('contact.success')}</h3>
            <p class="text-green-700">${i18n.t('contact.success_detail')}</p>
          </div>
        </div>
        
        <!-- Contact Information -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-bold text-gray-900 mb-4">
              <i class="fas fa-clock mr-2 text-purple-600"></i>
              ${i18n.t('footer.support')}
            </h3>
            <p class="text-gray-600">${i18n.t('footer.support_hours')}</p>
            <p class="text-sm text-gray-500 mt-2">
              ${i18n.getCurrentLanguage() === 'ja' ? '※土日祝日は休業日となります' : 
                i18n.getCurrentLanguage() === 'ko' ? '※주말 및 공휴일은 휴무입니다' :
                i18n.getCurrentLanguage() === 'zh' ? '※周末及节假日休息' :
                '※Closed on weekends and holidays'}
            </p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-bold text-gray-900 mb-4">
              <i class="fas fa-map-marker-alt mr-2 text-purple-600"></i>
              ${i18n.getCurrentLanguage() === 'ja' ? '所在地' : 
                i18n.getCurrentLanguage() === 'ko' ? '위치' :
                i18n.getCurrentLanguage() === 'zh' ? '地址' :
                'Location'}
            </h3>
            <div class="text-gray-600 space-y-3">
              <div>
                <p class="font-semibold text-purple-600 mb-1">${i18n.t('footer.supervisor')}</p>
                <p class="text-sm">${i18n.t('footer.supervisor_name')}</p>
                <p class="text-xs">${i18n.t('footer.supervisor_address')}</p>
              </div>
              <div>
                <p class="font-semibold text-purple-600 mb-1">${i18n.t('footer.producer')}</p>
                <p class="text-sm">${i18n.t('footer.producer_name')}</p>
                <p class="text-xs">${i18n.t('footer.producer_address')}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-8 text-center">
          <a href="#home" class="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
            <i class="fas fa-arrow-left"></i>
            ${i18n.t('footer.home')}
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
  
  const submitBtn = document.getElementById('contact_submit_btn');
  const submitText = document.getElementById('contact_submit_text');
  const form = document.getElementById('contactForm');
  const successDiv = document.getElementById('contact_success');
  
  // Get form values
  const name = document.getElementById('contact_name').value.trim();
  const email = document.getElementById('contact_email').value.trim();
  const phone = document.getElementById('contact_phone')?.value.trim() || '';
  const category = document.getElementById('contact_category')?.value || 'general';
  const subject = document.getElementById('contact_subject').value.trim();
  const message = document.getElementById('contact_message').value.trim();
  const honeypot = document.getElementById('contact_honeypot')?.value || '';
  const language = i18n.getCurrentLanguage();
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  submitText.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${i18n.t('contact.submitting')}`;
  
  try {
    const response = await axios.post('/api/contact', {
      name,
      email,
      phone,
      category,
      subject,
      message,
      honeypot,
      language
    });
    
    // Show success message
    const lang = i18n.getCurrentLanguage();
    const successMsg = lang === 'ja' ? response.data.message_ja :
                       lang === 'zh' ? response.data.message_zh :
                       lang === 'ko' ? response.data.message_ko :
                       response.data.message;
    
    showToast(successMsg || i18n.t('contact.success'), 'success');
    
    // Hide form and show success message
    form.style.display = 'none';
    successDiv.classList.remove('hidden');
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Redirect to home after 3 seconds
    setTimeout(() => {
      window.location.hash = 'home';
    }, 3000);
    
  } catch (error) {
    console.error('Failed to submit contact form:', error);
    
    // Get localized error message
    const errorResponse = error.response?.data;
    const lang = i18n.getCurrentLanguage();
    let errorMsg = i18n.t('contact.error');
    
    if (errorResponse) {
      errorMsg = lang === 'ja' ? (errorResponse.error_ja || errorResponse.error) :
                 lang === 'zh' ? (errorResponse.error_zh || errorResponse.error) :
                 lang === 'ko' ? (errorResponse.error_ko || errorResponse.error) :
                 errorResponse.error;
    }
    
    showToast(errorMsg, 'error');
    
    // Re-enable button
    submitBtn.disabled = false;
    submitText.innerHTML = `<i class="fas fa-paper-plane mr-2"></i>${i18n.t('contact.submit')}`;
  }
}

// ============ Announcements Modal ============
function showAnnouncementsModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.id = 'announcements-modal';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  const genreLabels = {
    '': i18n.t('announcements.all'),
    'feature': i18n.t('announcements.feature'),
    'maintenance': i18n.t('announcements.maintenance'),
    'event': i18n.t('announcements.event'),
    'campaign': i18n.t('announcements.campaign'),
    'general': i18n.t('announcements.general')
  };
  
  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onclick="event.stopPropagation()">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-xl font-bold text-gray-900">
            <i class="fas fa-bullhorn mr-2 text-purple-600"></i>
            ${i18n.t('announcements.modal_title')}
          </h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Genre Filters -->
        <div class="flex flex-wrap gap-2">
          ${renderFilterButtons('filterAnnouncements', state.announcementGenre, [
            { value: '', label: genreLabels[''], icon: 'fas fa-th' },
            { value: 'feature', label: genreLabels['feature'], icon: 'fas fa-star' },
            { value: 'maintenance', label: genreLabels['maintenance'], icon: 'fas fa-tools' },
            { value: 'event', label: genreLabels['event'], icon: 'fas fa-calendar-alt' },
            { value: 'campaign', label: genreLabels['campaign'], icon: 'fas fa-gift' },
            { value: 'general', label: genreLabels['general'], icon: 'fas fa-info-circle' }
          ])}
        </div>
      </div>
      <div class="overflow-y-auto max-h-[calc(85vh-140px)] bg-gray-50">
        <div class="p-4 space-y-3">
          ${state.announcements.map((a, index) => `
            <div class="bg-white rounded-lg p-4 border-l-4 ${
              index === 0 ? 'border-red-500' : 
              index === 1 ? 'border-orange-500' : 
              index === 2 ? 'border-yellow-500' : 
              'border-gray-300'
            } shadow-sm hover:shadow transition-shadow">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold text-sm text-gray-900">
                  ${a.title}
                </h3>
                <span class="text-xs px-2 py-0.5 rounded ${
                  a.genre === 'feature' ? 'bg-blue-100 text-blue-700' : 
                  a.genre === 'maintenance' ? 'bg-orange-100 text-orange-700' : 
                  a.genre === 'event' ? 'bg-green-100 text-green-700' : 
                  a.genre === 'campaign' ? 'bg-pink-100 text-pink-700' : 
                  'bg-gray-100 text-gray-700'
                }">
                  ${genreLabels[a.genre] || genreLabels['general']}
                </span>
              </div>
              <p class="text-gray-600 text-xs leading-relaxed mb-2">${a.content}</p>
              <div class="flex items-center text-xs text-gray-400">
                <i class="fas fa-calendar mr-1"></i>
                ${new Date(a.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          `).join('')}
        </div>
        ${state.announcements.length === 0 ? `
          <div class="text-center py-12">
            <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500 text-sm">${i18n.t('announcements.no_items')}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// ============ Admin User Management ============

async function loadAdminData() {
  if (!state.currentUser || !state.currentUser.is_admin) return;
  
  try {
    // Load statistics
    const lang = state.currentLanguage || 'ja';
    const [videosRes, blogsRes, announcementsRes] = await Promise.all([
      axios.get(`/api/videos?limit=1000&lang=${lang}`),
      axios.get(`/api/blog?lang=${lang}`),
      axios.get(`/api/announcements?lang=${lang}`)
    ]);
    
    updateStat('videos', videosRes.data.videos?.length || 0);
    updateStat('blogs', blogsRes.data?.length || 0);
    updateStat('announcements', announcementsRes.data?.length || 0);
    updateStat('users', 3); // Placeholder
    
    // Auto-load all lists
    await loadAdminVideos();
    await loadAdminBlogs();
    await loadAdminAnnouncements();
    
  } catch (error) {
    console.error('Failed to load admin data:', error);
  }
}

// Update admin statistics
function updateStat(key, value) {
  const el = document.getElementById(`stat-${key}`);
  if (el) {
    el.textContent = value.toLocaleString();
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
  const container = document.getElementById('admin-users-table');
  if (!container) return;
  
  if (users.length === 0) {
    container.innerHTML = '<div class="text-center py-8 text-gray-500">ユーザーがいません</div>';
    return;
  }
  
  container.innerHTML = `
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ユーザー名</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">メールアドレス</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">プラン</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">権限</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">登録日</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">操作</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        ${users.map(user => `
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">#${user.id}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">${user.username}</div>
              ${user.notes ? `<div class="text-xs text-gray-500 truncate max-w-xs" title="${user.notes}">${user.notes}</div>` : ''}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">${user.email}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="px-2 py-1 text-xs font-semibold rounded ${user.membership_type === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                ${user.membership_type === 'premium' ? 'プレミアム' : '無料'}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              ${user.is_admin ? '<span class="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800"><i class="fas fa-shield-alt mr-1"></i>管理者</span>' : '<span class="text-sm text-gray-500">一般</span>'}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">${formatDate(user.created_at)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
              <button onclick="editUser(${user.id})" class="text-blue-600 hover:text-blue-800 mr-3" title="編集">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteUser(${user.id}, '${user.email}')" class="text-red-600 hover:text-red-800" title="削除">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
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
  const container = document.getElementById('admin-announcements-table');
  if (!container) return;
  
  if (announcements.length === 0) {
    container.innerHTML = '<div class="text-center py-8 text-gray-500">お知らせがありません</div>';
    return;
  }
  
  // Map genre values to Japanese labels
  const genreLabels = {
    'feature': '機能追加',
    'maintenance': 'メンテナンス',
    'event': 'イベント',
    'campaign': 'キャンペーン',
    'general': '一般'
  };
  
  const genreColors = {
    'feature': 'bg-blue-100 text-blue-800',
    'maintenance': 'bg-yellow-100 text-yellow-800',
    'event': 'bg-green-100 text-green-800',
    'campaign': 'bg-purple-100 text-purple-800',
    'general': 'bg-gray-100 text-gray-800'
  };
  
  container.innerHTML = `
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ジャンル</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">タイトル</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">内容</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">作成日</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">操作</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        ${announcements.map(ann => `
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">#${ann.id}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="px-2 py-1 text-xs font-semibold rounded ${genreColors[ann.genre] || 'bg-gray-100 text-gray-800'}">
                ${genreLabels[ann.genre] || ann.genre}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="text-sm font-medium text-gray-900 max-w-xs truncate" title="${ann.title}">${ann.title}</div>
            </td>
            <td class="px-4 py-3">
              <div class="text-sm text-gray-600 max-w-md truncate" title="${ann.content}">${ann.content}</div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">${formatDate(ann.created_at)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
              <button onclick="editAnnouncement(${ann.id})" class="text-blue-600 hover:text-blue-800 mr-3" title="編集">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteAnnouncement(${ann.id})" class="text-red-600 hover:text-red-800" title="削除">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
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
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_title')} (日本語)</label>
          <input type="text" name="title" value="${blog?.title || ''}" required class="w-full px-4 py-2 border rounded-lg" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_title')} (English)</label>
          <input type="text" name="title_en" value="${blog?.title_en || ''}" class="w-full px-4 py-2 border rounded-lg" placeholder="English title" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_title')} (中文)</label>
          <input type="text" name="title_zh" value="${blog?.title_zh || ''}" class="w-full px-4 py-2 border rounded-lg" placeholder="Chinese title" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_title')} (한국어)</label>
          <input type="text" name="title_ko" value="${blog?.title_ko || ''}" class="w-full px-4 py-2 border rounded-lg" placeholder="Korean title" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">URL Slug (for SEO)</label>
          <input type="text" name="slug" value="${blog?.slug || ''}" class="w-full px-4 py-2 border rounded-lg" placeholder="my-blog-post-url" pattern="[a-z0-9-]+" />
          <small class="text-gray-500">Example: /blog/my-blog-post-url (lowercase, hyphens only)</small>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_content')} (日本語)</label>
          <textarea name="content" rows="4" required class="w-full px-4 py-2 border rounded-lg">${blog?.content || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_content')} (English)</label>
          <textarea name="content_en" rows="4" class="w-full px-4 py-2 border rounded-lg" placeholder="English content">${blog?.content_en || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_content')} (中文)</label>
          <textarea name="content_zh" rows="4" class="w-full px-4 py-2 border rounded-lg" placeholder="Chinese content">${blog?.content_zh || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">${i18n.t('admin.blog_content')} (한국어)</label>
          <textarea name="content_ko" rows="4" class="w-full px-4 py-2 border rounded-lg" placeholder="Korean content">${blog?.content_ko || ''}</textarea>
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
    title_en: formData.get('title_en') || null,
    title_zh: formData.get('title_zh') || null,
    title_ko: formData.get('title_ko') || null,
    content: formData.get('content'),
    content_en: formData.get('content_en') || null,
    content_zh: formData.get('content_zh') || null,
    content_ko: formData.get('content_ko') || null,
    image_url: formData.get('image_url') || null,
    published_date: formData.get('published_date'),
    slug: formData.get('slug') || null,
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

// ============ Climber Testimonials Management ============

// ============ Ad Banners Management ============

function renderAdBannersList(banners) {
  const container = document.getElementById('admin-ad-banners-list');
  if (!container) return;
  
  if (!banners || banners.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        広告バナーがありません
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="space-y-4">
      ${banners.map(banner => `
        <div class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
          <div class="flex items-start gap-4">
            <div class="w-32 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              <img 
                src="${banner.image_url}" 
                alt="${banner.title}"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-bold text-gray-900">${banner.title}</h4>
                  <p class="text-xs text-gray-600">${banner.position === 'hero_bottom' ? 'ヒーロー下' : 'ブログ上'}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-1 rounded ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}">
                    ${banner.is_active ? '公開中' : '非公開'}
                  </span>
                  <span class="text-xs text-gray-500">優先度: ${banner.priority}</span>
                </div>
              </div>
              <p class="text-xs text-gray-600 mb-2">${banner.link_url || 'リンクなし'}</p>
              <div class="flex items-center gap-4 text-xs text-gray-500 mb-2">
                <span><i class="fas fa-eye"></i> ${banner.impression_count || 0} 表示</span>
                <span><i class="fas fa-mouse-pointer"></i> ${banner.click_count || 0} クリック</span>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="editAdBanner(${banner.id})" class="text-xs text-blue-600 hover:text-blue-800">
                  <i class="fas fa-edit"></i> 編集
                </button>
                <button onclick="deleteAdBanner(${banner.id})" class="text-xs text-red-600 hover:text-red-800">
                  <i class="fas fa-trash"></i> 削除
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showAdBannerModal(bannerId = null) {
  axios.get('/api/ad-banners').then(res => {
    const banner = bannerId ? res.data.find(b => b.id === bannerId) : null;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold">
            ${banner ? '広告バナー編集' : '広告バナー作成'}
          </h3>
          <button class="btn btn-sm btn-secondary" onclick="this.closest('.modal').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form onsubmit="saveAdBanner(event, ${bannerId || 'null'})" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">タイトル</label>
            <input type="text" id="ad-title" value="${banner?.title || ''}" 
                   class="w-full px-3 py-2 border rounded-lg" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">画像URL</label>
            <input type="url" id="ad-image-url" value="${banner?.image_url || ''}" 
                   class="w-full px-3 py-2 border rounded-lg" required 
                   placeholder="https://example.com/banner.jpg" />
            <p class="text-xs text-gray-500 mt-1">推奨サイズ: 1200x150px（16:9比率）</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">リンクURL（オプション）</label>
            <input type="url" id="ad-link-url" value="${banner?.link_url || ''}" 
                   class="w-full px-3 py-2 border rounded-lg" 
                   placeholder="https://example.com" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">表示位置</label>
            <select id="ad-position" class="w-full px-3 py-2 border rounded-lg" required>
              <option value="hero_bottom" ${banner?.position === 'hero_bottom' ? 'selected' : ''}>ヒーロー下</option>
              <option value="blog_top" ${banner?.position === 'blog_top' ? 'selected' : ''}>ブログ上</option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">優先度</label>
              <input type="number" id="ad-priority" value="${banner?.priority || 0}" 
                     class="w-full px-3 py-2 border rounded-lg" min="0" />
              <p class="text-xs text-gray-500 mt-1">数値が小さいほど優先</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">ステータス</label>
              <select id="ad-is-active" class="w-full px-3 py-2 border rounded-lg">
                <option value="1" ${banner?.is_active ? 'selected' : ''}>公開</option>
                <option value="0" ${!banner?.is_active ? 'selected' : ''}>非公開</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">開始日時（オプション）</label>
              <input type="datetime-local" id="ad-start-date" 
                     value="${banner?.start_date ? new Date(banner.start_date).toISOString().slice(0, 16) : ''}" 
                     class="w-full px-3 py-2 border rounded-lg" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">終了日時（オプション）</label>
              <input type="datetime-local" id="ad-end-date" 
                     value="${banner?.end_date ? new Date(banner.end_date).toISOString().slice(0, 16) : ''}" 
                     class="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          
          <div class="flex gap-2 pt-4">
            <button type="button" onclick="this.closest('.modal').remove()" 
                    class="btn btn-secondary flex-1">
              キャンセル
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              <i class="fas fa-save mr-2"></i>
              保存
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  });
}

async function saveAdBanner(event, bannerId) {
  event.preventDefault();
  
  const data = {
    title: document.getElementById('ad-title').value,
    image_url: document.getElementById('ad-image-url').value,
    link_url: document.getElementById('ad-link-url').value || null,
    position: document.getElementById('ad-position').value,
    priority: parseInt(document.getElementById('ad-priority').value) || 0,
    is_active: parseInt(document.getElementById('ad-is-active').value),
    start_date: document.getElementById('ad-start-date').value || null,
    end_date: document.getElementById('ad-end-date').value || null
  };
  
  try {
    if (bannerId) {
      await axios.put(`/api/admin/ad-banners/${bannerId}`, data);
      showToast('広告バナーを更新しました', 'success');
    } else {
      await axios.post('/api/admin/ad-banners', data);
      showToast('広告バナーを作成しました', 'success');
    }
    
    document.querySelector('.modal').remove();
    await loadAdminData();
  } catch (error) {
    showToast('エラーが発生しました', 'error');
    console.error('Failed to save ad banner:', error);
  }
}

async function editAdBanner(bannerId) {
  showAdBannerModal(bannerId);
}

async function deleteAdBanner(bannerId) {
  if (!confirm('この広告バナーを削除してもよろしいですか？')) return;
  
  try {
    await axios.delete(`/api/admin/ad-banners/${bannerId}`);
    showToast('広告バナーを削除しました', 'success');
    await loadAdminData();
  } catch (error) {
    showToast('削除に失敗しました', 'error');
    console.error('Failed to delete ad banner:', error);
  }
}

// ============ Testimonials Management ============

function renderTestimonialsList(testimonials) {
  const container = document.getElementById('admin-testimonials-list');
  if (!container) return;
  
  if (!testimonials || testimonials.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        ${i18n.t('testimonials.no_testimonials')}
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="space-y-4">
      ${testimonials.map(testimonial => `
        <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
          <img 
            src="${testimonial.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'}" 
            alt="${testimonial.climber_name_ja}"
            class="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h4 class="font-bold text-gray-900">${testimonial.climber_name_ja}</h4>
                <p class="text-sm text-purple-600">${testimonial.title_ja}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs px-2 py-1 rounded ${testimonial.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}">
                  ${testimonial.is_active ? '公開中' : '非公開'}
                </span>
                <span class="text-xs text-gray-500">順序: ${testimonial.display_order}</span>
              </div>
            </div>
            <p class="text-sm text-gray-700 mb-2 line-clamp-2">${testimonial.comment_ja}</p>
            <div class="flex items-center gap-2">
              <button onclick="editTestimonial(${testimonial.id})" class="text-xs text-blue-600 hover:text-blue-800">
                <i class="fas fa-edit"></i> ${i18n.t('common.edit')}
              </button>
              <button onclick="deleteTestimonial(${testimonial.id})" class="text-xs text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i> ${i18n.t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showTestimonialModal(testimonialId = null) {
  const testimonial = testimonialId ? state.testimonials.find(t => t.id === testimonialId) : null;
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">
          ${testimonial ? i18n.t('admin.testimonials_edit') : i18n.t('admin.testimonials_new')}
        </h3>
        <button class="btn btn-sm btn-secondary" onclick="this.closest('.modal').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form onsubmit="saveTestimonial(event, ${testimonialId || 'null'})" class="space-y-4">
        <!-- Japanese -->
        <div class="bg-purple-50 p-4 rounded-lg">
          <h4 class="font-bold mb-3 text-purple-900">日本語 (必須)</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">${i18n.t('admin.testimonial_climber_name')}</label>
              <input type="text" id="climber_name_ja" value="${testimonial?.climber_name_ja || ''}" 
                     class="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">${i18n.t('admin.testimonial_title')}</label>
              <input type="text" id="title_ja" value="${testimonial?.title_ja || ''}" 
                     class="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">${i18n.t('admin.testimonial_comment')}</label>
              <textarea id="comment_ja" rows="3" class="w-full px-3 py-2 border rounded-lg" required>${testimonial?.comment_ja || ''}</textarea>
            </div>
          </div>
        </div>
        
        <!-- English -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-bold mb-3 text-blue-900">English (Required)</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">Climber Name</label>
              <input type="text" id="climber_name_en" value="${testimonial?.climber_name_en || ''}" 
                     class="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Title / Credentials</label>
              <input type="text" id="title_en" value="${testimonial?.title_en || ''}" 
                     class="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Comment</label>
              <textarea id="comment_en" rows="3" class="w-full px-3 py-2 border rounded-lg" required>${testimonial?.comment_en || ''}</textarea>
            </div>
          </div>
        </div>
        
        <!-- Chinese -->
        <div class="bg-red-50 p-4 rounded-lg">
          <h4 class="font-bold mb-3 text-red-900">中文 (可选)</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">攀岩者姓名</label>
              <input type="text" id="climber_name_zh" value="${testimonial?.climber_name_zh || ''}" 
                     class="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">头衔</label>
              <input type="text" id="title_zh" value="${testimonial?.title_zh || ''}" 
                     class="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">评论</label>
              <textarea id="comment_zh" rows="3" class="w-full px-3 py-2 border rounded-lg">${testimonial?.comment_zh || ''}</textarea>
            </div>
          </div>
        </div>
        
        <!-- Korean -->
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-bold mb-3 text-green-900">한국어 (선택)</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">클라이머 이름</label>
              <input type="text" id="climber_name_ko" value="${testimonial?.climber_name_ko || ''}" 
                     class="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">직함</label>
              <input type="text" id="title_ko" value="${testimonial?.title_ko || ''}" 
                     class="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">코멘트</label>
              <textarea id="comment_ko" rows="3" class="w-full px-3 py-2 border rounded-lg">${testimonial?.comment_ko || ''}</textarea>
            </div>
          </div>
        </div>
        
        <!-- Additional Fields -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">${i18n.t('admin.testimonial_avatar')}</label>
            <input type="url" id="avatar_url" value="${testimonial?.avatar_url || ''}" 
                   class="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">${i18n.t('admin.testimonial_display_order')}</label>
            <input type="number" id="display_order" value="${testimonial?.display_order || 0}" 
                   class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">${i18n.t('admin.testimonial_instagram')}</label>
            <input type="url" id="instagram_url" value="${testimonial?.instagram_url || ''}" 
                   class="w-full px-3 py-2 border rounded-lg" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">${i18n.t('admin.testimonial_youtube')}</label>
            <input type="url" id="youtube_url" value="${testimonial?.youtube_url || ''}" 
                   class="w-full px-3 py-2 border rounded-lg" placeholder="https://youtube.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">${i18n.t('admin.testimonial_website')}</label>
            <input type="url" id="website_url" value="${testimonial?.website_url || ''}" 
                   class="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
          </div>
          <div class="flex items-center">
            <label class="flex items-center gap-2">
              <input type="checkbox" id="is_active" ${testimonial?.is_active ? 'checked' : ''} 
                     class="w-5 h-5" />
              <span class="text-sm font-medium">${i18n.t('admin.testimonial_is_active')}</span>
            </label>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 pt-4">
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

async function saveTestimonial(event, testimonialId) {
  event.preventDefault();
  
  const data = {
    climber_name_ja: document.getElementById('climber_name_ja').value,
    climber_name_en: document.getElementById('climber_name_en').value,
    climber_name_zh: document.getElementById('climber_name_zh').value || null,
    climber_name_ko: document.getElementById('climber_name_ko').value || null,
    title_ja: document.getElementById('title_ja').value,
    title_en: document.getElementById('title_en').value,
    title_zh: document.getElementById('title_zh').value || null,
    title_ko: document.getElementById('title_ko').value || null,
    comment_ja: document.getElementById('comment_ja').value,
    comment_en: document.getElementById('comment_en').value,
    comment_zh: document.getElementById('comment_zh').value || null,
    comment_ko: document.getElementById('comment_ko').value || null,
    avatar_url: document.getElementById('avatar_url').value || null,
    instagram_url: document.getElementById('instagram_url').value || null,
    youtube_url: document.getElementById('youtube_url').value || null,
    website_url: document.getElementById('website_url').value || null,
    display_order: parseInt(document.getElementById('display_order').value) || 0,
    is_active: document.getElementById('is_active').checked ? 1 : 0
  };
  
  try {
    if (testimonialId) {
      await axios.put(`/api/admin/testimonials/${testimonialId}`, data);
    } else {
      await axios.post('/api/admin/testimonials', data);
    }
    
    showToast(i18n.t('admin.testimonial_save_success'), 'success');
    document.querySelector('.modal').remove();
    await loadAdminData();
    await loadInitialData(); // Refresh public testimonials
  } catch (error) {
    showToast(error.response?.data?.error || 'Failed to save testimonial', 'error');
  }
}

async function editTestimonial(testimonialId) {
  try {
    const response = await axios.get('/api/admin/testimonials');
    state.testimonials = response.data.testimonials;
    showTestimonialModal(testimonialId);
  } catch (error) {
    showToast('Failed to load testimonial data', 'error');
  }
}

async function deleteTestimonial(testimonialId) {
  if (!confirm(i18n.t('admin.testimonial_delete_confirm'))) return;
  
  try {
    await axios.delete(`/api/admin/testimonials/${testimonialId}`);
    showToast(i18n.t('admin.testimonial_delete_success'), 'success');
    await loadAdminData();
    await loadInitialData(); // Refresh public testimonials
  } catch (error) {
    showToast(error.response?.data?.error || 'Failed to delete testimonial', 'error');
  }
}

// ============ My Page Profile Update Functions ============

async function updateMyProfile(event) {
  event.preventDefault();
  
  const username = document.getElementById('profile-username').value;
  const email = document.getElementById('profile-email').value;
  
  try {
    await axios.put('/api/users/profile', {
      username,
      email
    });
    
    // Update local state
    state.currentUser.username = username;
    state.currentUser.email = email;
    
    showToast('プロフィールを更新しました', 'success');
  } catch (error) {
    showToast(error.response?.data?.error || 'プロフィールの更新に失敗しました', 'error');
  }
}

async function updateMyPassword(event) {
  event.preventDefault();
  
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  if (newPassword !== confirmPassword) {
    showToast('新しいパスワードが一致しません', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showToast('パスワードは6文字以上で入力してください', 'error');
    return;
  }
  
  try {
    await axios.put('/api/users/password', {
      currentPassword,
      newPassword
    });
    
    // Clear form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    showToast('パスワードを更新しました', 'success');
  } catch (error) {
    showToast(error.response?.data?.error || 'パスワードの更新に失敗しました', 'error');
  }
}

// ============ Expose Functions to Global Scope (for onclick handlers) ============
window.switchRankingPeriod = switchRankingPeriod;
window.navigateToMyPage = navigateToMyPage;


// ============ Video Platform Features ============

// Load all videos
async function loadVideos() {
  try {
    const params = new URLSearchParams();
    if (state.videoFilter.platform) {
      params.append('platform', state.videoFilter.platform);
    }
    if (state.videoFilter.category) {
      params.append('category', state.videoFilter.category);
    }
    if (state.videoFilter.search) {
      params.append('search', state.videoFilter.search);
    }
    
    const res = await axios.get(`/api/videos?${params.toString()}`);
    state.allVideos = res.data.videos || [];
    renderApp();
  } catch (error) {
    console.error('Failed to load videos:', error);
    showToast('動画の読み込みに失敗しました', 'error');
  }
}

// Load user settings
async function loadUserSettings() {
  if (!state.currentUser) return;
  
  try {
    const res = await axios.get('/api/settings');
    state.userSettings = res.data.settings || {};
    renderApp();
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Save user settings
async function saveSettings(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const settings = {
    youtube_api_key: formData.get('youtube_api_key'),
    openai_api_key: formData.get('openai_api_key'),
    vimeo_access_token: formData.get('vimeo_access_token'),
    instagram_access_token: formData.get('instagram_access_token'),
    tiktok_access_token: formData.get('tiktok_access_token'),
    notify_likes: formData.get('notify_likes') === 'on' ? 1 : 0,
    notify_comments: formData.get('notify_comments') === 'on' ? 1 : 0,
    profile_public: formData.get('profile_public') === 'on' ? 1 : 0,
    allow_comments: formData.get('allow_comments') === 'on' ? 1 : 0
  };
  
  try {
    await axios.put('/api/settings', settings);
    showToast('設定を保存しました', 'success');
    state.userSettings = settings;
  } catch (error) {
    showToast(error.response?.data?.error || '設定の保存に失敗しました', 'error');
  }
}

// Analyze video URL with AI
async function analyzeVideoUrl() {
  const url = document.getElementById('video-url').value.trim();
  
  if (!url) {
    showToast('URLを入力してください', 'error');
    return;
  }
  
  if (!state.userSettings?.openai_api_key) {
    showToast('OpenAI APIキーを設定ページで設定してください', 'error');
    window.location.hash = 'settings';
    return;
  }
  
  const analyzeBtn = document.querySelector('#analyze-btn');
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI解析中...';
  
  try {
    const res = await axios.post('/api/videos/analyze-url', {
      url,
      openai_api_key: state.userSettings.openai_api_key
    });
    
    const data = res.data.data;
    
    // Fill form with AI-extracted data
    document.getElementById('video-title').value = data.title;
    document.getElementById('video-description').value = data.description;
    document.getElementById('video-grade').value = data.grade;
    document.getElementById('video-location').value = data.location;
    document.getElementById('video-tags').value = data.tags;
    document.getElementById('platform-display').textContent = data.platform.toUpperCase();
    document.getElementById('thumbnail-preview').src = data.thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Thumbnail';
    document.getElementById('thumbnail-preview').classList.remove('hidden');
    
    // Store extracted data
    state.uploadProgress = data;
    
    showToast('AI解析が完了しました！', 'success');
  } catch (error) {
    showToast(error.response?.data?.error || 'URL解析に失敗しました', 'error');
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="fas fa-robot"></i> AI解析';
  }
}

// Submit video
async function submitVideo(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  if (!state.uploadProgress) {
    showToast('まずURLを解析してください', 'error');
    return;
  }
  
  const videoData = {
    ...state.uploadProgress,
    title: formData.get('title'),
    description: formData.get('description'),
    grade: formData.get('grade'),
    location: formData.get('location'),
    tags: formData.get('tags')
  };
  
  try {
    await axios.post('/api/videos', videoData);
    showToast('動画を投稿しました！', 'success');
    state.uploadProgress = null;
    form.reset();
    window.location.hash = 'videos';
  } catch (error) {
    showToast(error.response?.data?.error || '動画の投稿に失敗しました', 'error');
  }
}

// Open video modal
function openVideoModal(video) {
  const modal = document.getElementById('video-modal');
  const modalContent = modal.querySelector('.modal-video-content');
  
  let embedHtml = '';
  
  if (video.platform === 'youtube') {
    embedHtml = `<iframe width="100%" height="500" src="https://www.youtube.com/embed/${video.video_id_external}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else if (video.platform === 'youtube_shorts') {
    // YouTube Shorts embed (vertical format)
    embedHtml = `<iframe width="100%" height="600" src="https://www.youtube.com/embed/${video.video_id_external}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else if (video.platform === 'vimeo') {
    embedHtml = `<iframe width="100%" height="500" src="https://player.vimeo.com/video/${video.video_id_external}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  } else if (video.platform === 'instagram') {
    // Instagram embed using iframe format (for reels)
    embedHtml = `<iframe width="100%" height="600" src="https://www.instagram.com/reel/${video.video_id_external}/embed" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  } else if (video.platform === 'tiktok') {
    // TikTok embed using iframe format
    embedHtml = `<iframe width="100%" height="600" src="https://www.tiktok.com/embed/v2/${video.video_id_external}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  } else if (video.platform === 'x') {
    // X (Twitter) embed using iframe format
    embedHtml = `<iframe width="100%" height="600" src="https://platform.twitter.com/embed/Tweet.html?id=${video.video_id_external}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    embedHtml = `<p>このプラットフォームの埋め込みは対応していません。<a href="${video.url}" target="_blank" class="text-blue-600 hover:underline">元のURLで開く</a></p>`;
  }
  
  modalContent.innerHTML = `
    <div class="bg-gradient-to-r from-purple-600 to-pink-600 -mx-6 -mt-6 px-6 py-4 rounded-t-xl mb-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-white">${video.title}</h3>
        <button onclick="closeModal('video-modal')" class="text-white hover:text-gray-200 text-2xl">×</button>
      </div>
    </div>
    <div class="video-embed mb-4">
      ${embedHtml}
    </div>
    <div class="space-y-2 text-sm">
      <p class="text-gray-700">${video.description || '説明なし'}</p>
      ${video.grade ? `<p><strong>グレード:</strong> ${video.grade}</p>` : ''}
      ${video.location ? `<p><strong>場所:</strong> ${video.location}</p>` : ''}
      ${video.tags ? `<p><strong>タグ:</strong> ${video.tags}</p>` : ''}
      <p><strong>投稿者 ID:</strong> ${video.uploader_id || 'Unknown'}</p>
      <p><strong>閲覧数:</strong> ${video.views || 0}</p>
      
      <!-- Like and Favorite Buttons in Modal -->
      ${state.currentUser ? `
        <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <button 
            onclick="handleLikeClick(${video.id})" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              video.user_liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
            }">
            <i class="${video.user_liked ? 'fas' : 'far'} fa-heart"></i>
            <span>${i18n.t('video.like')}</span>
            <span class="font-bold">${video.likes_count || 0}</span>
          </button>
          
          <button 
            onclick="handleFavoriteClick(${video.id})" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              video.user_favorited ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
            }">
            <i class="${video.user_favorited ? 'fas' : 'far'} fa-star"></i>
            <span>${i18n.t('video.favorite')}</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;
  
  modal.classList.add('active');
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Filter videos
function filterVideos(platform) {
  state.videoFilter.platform = platform;
  loadVideos();
}

// Filter by category
function filterByCategory(category) {
  state.videoFilter.category = category;
  loadVideos();
}

// Search videos
function searchVideos(event) {
  if (event.key === 'Enter') {
    state.videoFilter.search = event.target.value;
    loadVideos();
  }
}

// Expose new functions to global scope
window.loadVideos = loadVideos;
window.loadUserSettings = loadUserSettings;
window.saveSettings = saveSettings;
window.analyzeVideoUrl = analyzeVideoUrl;
window.submitVideo = submitVideo;
window.openVideoModal = openVideoModal;
window.closeModal = closeModal;
window.filterVideos = filterVideos;
window.filterByCategory = filterByCategory;
window.searchVideos = searchVideos;
window.trackAdClick = trackAdClick;
window.filterAnnouncements = filterAnnouncements;
window.filterBlogsByGenre = filterBlogsByGenre;
window.filterVideosByCategory = filterVideosByCategory;

// ============ Render New Pages ============

// Render Settings Page
function renderSettingsPage() {
  const settings = state.userSettings || {};
  
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div class="flex items-center justify-between h-14 sm:h-16">
            <div class="flex items-center flex-shrink-0 min-w-0">
              <button onclick="navigateTo('home')" class="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors cursor-pointer">
                <i class="fas fa-mountain text-sm sm:text-base bg-gradient-to-br from-purple-600 to-pink-600" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                <h1 class="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 whitespace-nowrap" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ClimbHero</h1>
              </button>
            </div>
            
            <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button onclick="logout()" class="btn btn-sm btn-primary px-3">ログアウト</button>
              <button onclick="navigateTo('mypage')" class="btn btn-sm btn-secondary px-3">マイページ</button>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Settings Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 class="text-2xl font-bold text-white flex items-center">
              <i class="fas fa-cog mr-3"></i>
              設定
            </h2>
          </div>

          <form onsubmit="saveSettings(event)" class="p-6 space-y-6">
            <!-- API Keys Section -->
            <div class="space-y-4">
              <h3 class="text-lg font-bold text-gray-900 border-b pb-2">API設定</h3>
              
              <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <i class="fas fa-info-circle text-blue-600 text-xl mt-0.5"></i>
                  <div>
                    <p class="font-bold text-blue-900 mb-1">AI動画解析に必要</p>
                    <p class="text-sm text-blue-800">動画URLの自動解析にはOpenAI APIキーが必須です。</p>
                    <a href="https://platform.openai.com/api-keys" target="_blank" class="text-sm text-blue-600 hover:underline mt-1 inline-block">
                      OpenAI APIキーを取得する →
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fas fa-robot text-purple-600"></i> OpenAI API Key（必須）
                </label>
                <input 
                  type="password" 
                  name="openai_api_key" 
                  value="${settings.openai_api_key || ''}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="sk-..."
                />
                <p class="text-xs text-gray-500 mt-1">動画URLの自動解析・メタデータ抽出に使用</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-youtube text-red-600"></i> YouTube API Key（オプション）
                </label>
                <input 
                  type="password" 
                  name="youtube_api_key" 
                  value="${settings.youtube_api_key || ''}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="AIzaSy..."
                />
                <p class="text-xs text-gray-500 mt-1">YouTube動画の詳細情報取得に使用（オプション）</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-vimeo text-blue-500"></i> Vimeo Access Token（オプション）
                </label>
                <input 
                  type="password" 
                  name="vimeo_access_token" 
                  value="${settings.vimeo_access_token || ''}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="..."
                />
              </div>
            </div>

            <!-- Notification Settings -->
            <div class="space-y-4">
              <h3 class="text-lg font-bold text-gray-900 border-b pb-2">通知設定</h3>
              
              <label class="flex items-center space-x-3">
                <input type="checkbox" name="notify_likes" ${settings.notify_likes ? 'checked' : ''} class="w-4 h-4 text-purple-600 rounded">
                <span>いいね通知を受け取る</span>
              </label>
              
              <label class="flex items-center space-x-3">
                <input type="checkbox" name="notify_comments" ${settings.notify_comments ? 'checked' : ''} class="w-4 h-4 text-purple-600 rounded">
                <span>コメント通知を受け取る</span>
              </label>
            </div>

            <!-- Privacy Settings -->
            <div class="space-y-4">
              <h3 class="text-lg font-bold text-gray-900 border-b pb-2">プライバシー設定</h3>
              
              <label class="flex items-center space-x-3">
                <input type="checkbox" name="profile_public" ${settings.profile_public ? 'checked' : ''} class="w-4 h-4 text-purple-600 rounded">
                <span>プロフィールを公開する</span>
              </label>
              
              <label class="flex items-center space-x-3">
                <input type="checkbox" name="allow_comments" ${settings.allow_comments ? 'checked' : ''} class="w-4 h-4 text-purple-600 rounded">
                <span>コメントを許可する</span>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onclick="window.location.hash='mypage'" class="btn btn-secondary">
                キャンセル
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i>
                設定を保存
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `;
}

// Render Upload Page
function renderUploadPage() {
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div class="flex items-center justify-between h-14 sm:h-16">
            <div class="flex items-center flex-shrink-0 min-w-0">
              <button onclick="navigateTo('home')" class="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors cursor-pointer">
                <i class="fas fa-mountain text-sm sm:text-base bg-gradient-to-br from-purple-600 to-pink-600" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                <h1 class="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 whitespace-nowrap" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ClimbHero</h1>
              </button>
            </div>
            
            <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button onclick="navigateTo('videos')" class="btn btn-sm btn-secondary px-3">動画一覧</button>
              <button onclick="navigateTo('settings')" class="btn btn-sm btn-secondary px-3">設定</button>
              <button onclick="logout()" class="btn btn-sm btn-primary px-3">ログアウト</button>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 class="text-2xl font-bold text-white flex items-center">
              <i class="fas fa-upload mr-3"></i>
              動画を投稿
            </h2>
          </div>

          <form onsubmit="submitVideo(event)" class="p-6 space-y-6">
            <!-- AI URL Analysis -->
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
              <h3 class="text-lg font-bold text-purple-900 mb-3 flex items-center">
                <i class="fas fa-robot mr-2"></i>
                AI自動解析
              </h3>
              <p class="text-sm text-purple-800 mb-4">
                YouTube、Instagram、TikTok、VimeoのURLを入力すると、AIが自動的にタイトル、説明、サムネイルなどを抽出します。
              </p>
              
              <div class="flex gap-2">
                <input 
                  type="url" 
                  id="video-url" 
                  placeholder="https://www.youtube.com/watch?v=..."
                  class="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <button 
                  type="button" 
                  id="analyze-btn"
                  onclick="analyzeVideoUrl()" 
                  class="btn btn-primary whitespace-nowrap px-6">
                  <i class="fas fa-robot"></i> AI解析
                </button>
              </div>
              
              <div class="mt-4 text-center">
                <span id="platform-display" class="inline-block px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 border-2 border-purple-300 hidden"></span>
              </div>
              
              <img id="thumbnail-preview" class="hidden mt-4 w-full h-48 object-cover rounded-lg border-2 border-purple-300" />
            </div>

            <!-- Video Details -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">タイトル *</label>
                <input 
                  type="text" 
                  id="video-title"
                  name="title" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="動画のタイトル"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <textarea 
                  id="video-description"
                  name="description" 
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="動画の説明"
                ></textarea>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">グレード</label>
                  <input 
                    type="text" 
                    id="video-grade"
                    name="grade"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="V4, 5.11a, など"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">場所</label>
                  <input 
                    type="text" 
                    id="video-location"
                    name="location"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="場所"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">タグ（カンマ区切り）</label>
                <input 
                  type="text" 
                  id="video-tags"
                  name="tags"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="クライミング, ボルダリング, アウトドア"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onclick="window.location.hash='videos'" class="btn btn-secondary">
                キャンセル
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-paper-plane"></i>
                投稿する
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `;
}

// Render Videos Page
function renderVideosPage() {
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div class="flex items-center justify-between h-14 sm:h-16">
            <div class="flex items-center flex-shrink-0 min-w-0">
              <button onclick="navigateTo('home')" class="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors cursor-pointer">
                <i class="fas fa-mountain text-sm sm:text-base bg-gradient-to-br from-purple-600 to-pink-600" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                <h1 class="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 whitespace-nowrap" style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ClimbHero</h1>
              </button>
            </div>
            
            <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              ${state.currentUser ? `
                <button onclick="navigateTo('upload')" class="btn btn-sm btn-primary px-3">
                  投稿
                </button>
              ` : ''}
              <button onclick="navigateTo('home')" class="btn btn-sm btn-secondary px-3">ホーム</button>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Filter Bar -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <!-- Platform Filters -->
          <div class="mb-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">プラットフォーム</h3>
            <div class="flex flex-wrap gap-2">
              <button onclick="filterVideos('')" class="btn btn-sm ${!state.videoFilter.platform ? 'btn-primary' : 'btn-secondary'}">
                すべて
              </button>
              <button onclick="filterVideos('youtube')" class="btn btn-sm ${state.videoFilter.platform === 'youtube' ? 'btn-primary' : 'btn-secondary'}">
                <i class="fab fa-youtube"></i> YouTube
              </button>
              <button onclick="filterVideos('instagram')" class="btn btn-sm ${state.videoFilter.platform === 'instagram' ? 'btn-primary' : 'btn-secondary'}">
                <i class="fab fa-instagram"></i> Instagram
              </button>
              <button onclick="filterVideos('tiktok')" class="btn btn-sm ${state.videoFilter.platform === 'tiktok' ? 'btn-primary' : 'btn-secondary'}">
                <i class="fab fa-tiktok"></i> TikTok
              </button>
              <button onclick="filterVideos('vimeo')" class="btn btn-sm ${state.videoFilter.platform === 'vimeo' ? 'btn-primary' : 'btn-secondary'}">
                <i class="fab fa-vimeo"></i> Vimeo
              </button>
            </div>
          </div>
          
          <!-- Category Filters -->
          <div class="mb-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">カテゴリー</h3>
            <div class="flex flex-wrap gap-2">
              <button onclick="filterByCategory('')" class="btn btn-sm ${!state.videoFilter.category ? 'btn-primary' : 'btn-secondary'}">
                すべて
              </button>
              <button onclick="filterByCategory('bouldering')" class="btn btn-sm ${state.videoFilter.category === 'bouldering' ? 'btn-primary' : 'btn-secondary'}">
                ボルダリング
              </button>
              <button onclick="filterByCategory('competition')" class="btn btn-sm ${state.videoFilter.category === 'competition' ? 'btn-primary' : 'btn-secondary'}">
                コンペティション
              </button>
              <button onclick="filterByCategory('training')" class="btn btn-sm ${state.videoFilter.category === 'training' ? 'btn-primary' : 'btn-secondary'}">
                トレーニング
              </button>
              <button onclick="filterByCategory('tutorial')" class="btn btn-sm ${state.videoFilter.category === 'tutorial' ? 'btn-primary' : 'btn-secondary'}">
                チュートリアル
              </button>
              <button onclick="filterByCategory('lifestyle')" class="btn btn-sm ${state.videoFilter.category === 'lifestyle' ? 'btn-primary' : 'btn-secondary'}">
                ライフスタイル
              </button>
            </div>
          </div>
          
          <!-- Search Bar -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">検索</h3>
            <input 
              type="search" 
              placeholder="動画タイトルや説明で検索..."
              onkeypress="searchVideos(event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <!-- Videos Grid -->
        ${state.allVideos.length === 0 ? `
          <div class="text-center py-16">
            <i class="fas fa-video text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 text-lg">動画がまだありません</p>
            ${state.currentUser ? `
              <button onclick="navigateTo('upload')" class="btn btn-primary mt-4">
                <i class="fas fa-upload"></i>
                最初の動画を投稿する
              </button>
            ` : ''}
          </div>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${state.allVideos.map(video => `
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onclick='openVideoModal(${JSON.stringify(video)})'>
                <div class="relative aspect-video bg-gray-200">
                  <img 
                    src="${video.thumbnail_url || 'https://via.placeholder.com/400x225?text=No+Thumbnail'}" 
                    alt="${video.title}"
                    class="w-full h-full object-cover"
                    onerror="this.src='https://via.placeholder.com/400x225?text=No+Thumbnail'"
                  />
                  <div class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white" style="background: ${
                    video.platform === 'youtube' ? '#FF0000' :
                    video.platform === 'instagram' ? '#E4405F' :
                    video.platform === 'tiktok' ? '#000000' :
                    video.platform === 'vimeo' ? '#1AB7EA' : '#6B7280'
                  }">
                    ${video.platform.toUpperCase()}
                  </div>
                  ${video.views > 0 ? `
                    <div class="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                      <i class="fas fa-eye"></i> ${video.views}
                    </div>
                  ` : ''}
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">${video.title}</h3>
                  <p class="text-sm text-gray-600 mb-2 line-clamp-2">${video.description || ''}</p>
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span><i class="fas fa-user"></i> ${video.username || 'Unknown'}</span>
                    ${video.grade ? `<span class="font-bold text-purple-600">${video.grade}</span>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </main>

      <!-- Video Modal -->
      <div id="video-modal" class="modal">
        <div class="modal-content modal-video-content" style="max-width: 900px;">
          <!-- Content will be injected by openVideoModal() -->
        </div>
      </div>
    </div>
  `;
}

// ============ News Functions ============

// Show news modal with full article details
async function showNewsModal(articleId) {
  const modal = document.getElementById('news-modal');
  if (!modal) return;
  
  const content = document.getElementById('news-modal-content');
  if (!content) return;
  
  // Show loading state
  content.innerHTML = `
    <div class="flex items-center justify-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  `;
  modal.classList.add('active');
  
  try {
    const lang = state.currentLanguage || 'ja';
    const response = await axios.get(`/api/news/${articleId}?lang=${lang}`);
    const article = response.data.article;
    
    if (!article) {
      content.innerHTML = `<p class="text-center text-gray-500 py-8">記事が見つかりません</p>`;
      return;
    }
    
    const publishedDate = article.published_date ? formatDate(article.published_date) : '';
    const isLiked = article.is_liked || false;
    const isFavorited = article.is_favorited || false;
    const likeCount = article.like_count || 0;
    
    // Fallback image if none available
    const imageUrl = article.image_url || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=400&fit=crop';
    
    content.innerHTML = `
      <!-- Hero Image -->
      <div class="relative">
        <img 
          src="${imageUrl}" 
          alt="${article.title}" 
          class="w-full h-48 sm:h-64 object-cover"
          onerror="this.src='https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=400&fit=crop'"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <!-- Genre Badge -->
        ${article.genre ? `
          <span class="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-semibold shadow-lg">
            <i class="fas fa-tag mr-1"></i>
            ${i18n.t('news.genre.' + article.genre) || article.genre}
          </span>
        ` : ''}
        
        <!-- Source Badge -->
        ${article.source_name ? `
          <span class="absolute top-4 right-4 px-3 py-1 bg-white/90 text-gray-800 text-sm rounded-full font-medium shadow-lg">
            <i class="fas fa-newspaper mr-1"></i>
            ${article.source_name}
          </span>
        ` : ''}
        
        <!-- Close Button -->
        <button 
          onclick="closeModal('news-modal')" 
          class="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          style="right: ${article.source_name ? '140px' : '16px'}"
        >
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <!-- Title -->
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
          ${article.title}
        </h2>
        
        <!-- Meta Info -->
        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
          <span class="flex items-center">
            <i class="fas fa-calendar-alt mr-1"></i>
            ${publishedDate}
          </span>
          <span class="flex items-center">
            <i class="fas fa-eye mr-1"></i>
            ${article.view_count || 0} views
          </span>
          <span class="flex items-center">
            <i class="fas fa-heart mr-1 text-red-500"></i>
            <span id="modal-news-like-count">${likeCount}</span>
          </span>
        </div>
        
        <!-- Summary (AI Translated) -->
        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <div class="flex items-center mb-2">
            <i class="fas fa-robot text-purple-500 mr-2"></i>
            <span class="text-sm font-medium text-purple-700">AI ${i18n.t('news.summary') || '要約'}</span>
          </div>
          <p class="text-gray-700 leading-relaxed" id="news-modal-summary">
            ${article.summary || '要約を読み込み中...'}
          </p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3 mb-6">
          <button 
            onclick="toggleNewsLikeFromModal(${article.id})" 
            id="modal-news-like-btn"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all ${isLiked ? 'bg-red-100 text-red-600 border-2 border-red-300' : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'}"
          >
            <i class="fas fa-heart mr-2"></i>
            ${isLiked ? 'いいね済み' : 'いいね'}
          </button>
          
          <button 
            onclick="toggleNewsFavoriteFromModal(${article.id})" 
            id="modal-news-favorite-btn"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all ${isFavorited ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-300' : 'bg-gray-100 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'}"
          >
            <i class="fas fa-star mr-2"></i>
            ${isFavorited ? 'お気に入り済み' : 'お気に入り'}
          </button>
          
          <button 
            onclick="translateNewsInModal(${article.id})" 
            class="flex-1 sm:flex-none px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-all"
          >
            <i class="fas fa-language mr-2"></i>
            翻訳
          </button>
          
          <button 
            onclick="shareNews(${article.id}, '${encodeURIComponent(article.title)}', '${encodeURIComponent(article.url)}')" 
            class="flex-1 sm:flex-none px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-all"
          >
            <i class="fas fa-share-alt mr-2"></i>
            シェア
          </button>
        </div>
        
        <!-- Read Original Article Button -->
        <a 
          href="${article.url}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="block w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
        >
          <i class="fas fa-external-link-alt mr-2"></i>
          元の記事を読む
        </a>
      </div>
    `;
    
    // Store current article for actions
    state.currentNewsArticle = article;
    
  } catch (error) {
    console.error('Error loading news:', error);
    content.innerHTML = `
      <div class="p-8 text-center">
        <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
        <p class="text-gray-600">記事の読み込みに失敗しました</p>
        <button onclick="closeModal('news-modal')" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg">閉じる</button>
      </div>
    `;
  }
}

// Toggle like from modal
async function toggleNewsLikeFromModal(articleId) {
  await toggleNewsLike(articleId);
  // Refresh modal content
  setTimeout(() => showNewsModal(articleId), 300);
}

// Toggle favorite from modal
async function toggleNewsFavoriteFromModal(articleId) {
  await toggleNewsFavorite(articleId);
  // Refresh modal content
  setTimeout(() => showNewsModal(articleId), 300);
}

// Translate news in modal using AI
async function translateNewsInModal(articleId) {
  const summaryEl = document.getElementById('news-modal-summary');
  if (!summaryEl) return;
  
  summaryEl.innerHTML = '<span class="animate-pulse">翻訳中...</span>';
  
  try {
    const lang = state.currentLanguage || 'ja';
    const response = await axios.get(`/api/news/${articleId}/translate/${lang}`);
    
    if (response.data.summary) {
      summaryEl.textContent = response.data.summary;
      showToast('翻訳完了', 'success');
    }
  } catch (error) {
    console.error('Translation error:', error);
    summaryEl.textContent = state.currentNewsArticle?.summary || 'エラー';
    showToast('翻訳に失敗しました', 'error');
  }
}

// Share news
function shareNews(articleId, title, url) {
  const decodedTitle = decodeURIComponent(title);
  const decodedUrl = decodeURIComponent(url);
  
  if (navigator.share) {
    navigator.share({
      title: decodedTitle,
      url: decodedUrl
    });
  } else {
    navigator.clipboard.writeText(decodedUrl);
    showToast('URLをコピーしました', 'success');
  }
}

// Render news card (click opens modal)
function renderNewsCard(article) {
  const truncatedSummary = article.summary ? article.summary.substring(0, 120) + '...' : ''
  const publishedDate = article.published_date ? formatDate(article.published_date) : ''
  const isLiked = article.is_liked || false
  const isFavorited = article.is_favorited || false
  const likeCount = article.like_count || 0
  
  // Fallback image
  const imageUrl = article.image_url || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=300&fit=crop';
  
  return `
    <div class="scroll-item">
      <div class="video-card-compact cursor-pointer" onclick="showNewsModal(${article.id})">
        <div class="video-thumbnail">
          <img 
            src="${imageUrl}" 
            alt="${article.title}" 
            class="w-full h-full object-cover"
            onerror="this.src='https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=300&fit=crop'"
          >
          ${article.genre ? `
            <span class="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
              ${i18n.t('news.genre.' + article.genre) || article.genre}
            </span>
          ` : ''}
          <div class="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            <i class="fas fa-newspaper mr-1"></i>${article.source_name || 'News'}
          </div>
        </div>
        <div class="video-info-compact">
          <div class="video-title-compact line-clamp-2 font-bold">${article.title}</div>
          <p class="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">${truncatedSummary}</p>
          <div class="video-meta-compact text-xs">
            <span><i class="fas fa-calendar"></i> ${publishedDate}</span>
            <span><i class="fas fa-eye"></i> ${article.view_count || 0}</span>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button 
                onclick="event.stopPropagation(); toggleNewsLike(${article.id})" 
                class="text-xs px-2 py-1 rounded-full transition-colors ${isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'}"
                title="${isLiked ? 'いいね済み' : 'いいね'}">
                <i class="fas fa-heart"></i> <span id="news-like-count-${article.id}">${likeCount}</span>
              </button>
              <button 
                onclick="event.stopPropagation(); toggleNewsFavorite(${article.id})" 
                class="text-xs px-2 py-1 rounded-full transition-colors ${isFavorited ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'}"
                title="${isFavorited ? 'お気に入り済み' : 'お気に入り'}">
                <i class="fas fa-star"></i>
              </button>
            </div>
            <span class="text-xs text-blue-600 font-medium">
              詳細を見る <i class="fas fa-chevron-right ml-1"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Filter news by category
async function filterNewsByCategory(category) {
  state.currentNewsCategory = category;
  
  try {
    const lang = state.currentLanguage || 'ja';
    const categoryParam = category ? `&category=${category}` : '';
    const response = await axios.get(`/api/news?limit=20&lang=${lang}${categoryParam}`);
    state.newsArticles = response.data.articles || [];
    
    // Re-render news section
    renderNewsSection();
  } catch (error) {
    console.error('Error filtering news:', error);
    showToast(i18n.t('toast.data_load_error'), 'error');
  }
}

// Filter news by genre
async function filterNewsByGenre(genre) {
  state.currentNewsGenre = genre;
  
  try {
    const lang = state.currentLanguage || 'ja';
    const genreParam = genre ? `&genre=${genre}` : '';
    const response = await axios.get(`/api/news?limit=20&lang=${lang}${genreParam}`);
    state.newsArticles = response.data.articles || [];
    
    // Re-render news section
    renderNewsSection();
  } catch (error) {
    console.error('Error filtering news:', error);
    showToast(i18n.t('toast.data_load_error'), 'error');
  }
}

// Re-render news section
function renderNewsSection() {
  const newsContent = document.getElementById('news-section-content');
  if (!newsContent) return;
  
  newsContent.innerHTML = `
    <!-- Category Filters -->
    ${state.newsCategories && state.newsCategories.length > 0 ? renderFilterButtons('filterNewsByCategory', state.currentNewsCategory, [
      { value: '', label: i18n.t('news.category.all'), icon: 'fas fa-th' },
      ...state.newsCategories.map(c => ({
        value: c.category,
        label: i18n.t(`news.category.${c.category}`),
        icon: getCategoryIcon(c.category)
      }))
    ]) : ''}
    
    <!-- Horizontal Carousel -->
    <div class="carousel-container" id="news-carousel">
      <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel('news-carousel', -1)">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="horizontal-scroll" id="news-scroll">
        ${state.newsArticles.map(article => renderNewsCard(article)).join('')}
      </div>
      <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel('news-carousel', 1)">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
  
  // Re-initialize carousel
  initializeCarousels();
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    bouldering: 'fas fa-mountain',
    lead: 'fas fa-sort-up',
    alpine: 'fas fa-mountain',
    competition: 'fas fa-trophy',
    news: 'fas fa-newspaper',
    gear: 'fas fa-toolbox',
    other: 'fas fa-ellipsis-h'
  };
  return icons[category] || 'fas fa-circle';
}

// ============ News Like & Favorite Functions ============
async function toggleNewsLike(articleId) {
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  try {
    const article = state.newsArticles.find(a => a.id === articleId);
    if (!article) return;
    
    const response = await axios.post(`/api/news/${articleId}/like`);
    const { liked } = response.data;
    
    article.is_liked = liked;
    if (liked) {
      article.like_count = (article.like_count || 0) + 1;
      showToast('いいねしました', 'success');
    } else {
      article.like_count = Math.max((article.like_count || 0) - 1, 0);
      showToast('いいねを取り消しました', 'info');
    }
    
    // Update like count display
    const likeCountEl = document.getElementById(`news-like-count-${articleId}`);
    if (likeCountEl) {
      likeCountEl.textContent = article.like_count;
    }
    
    // Re-render news section
    renderNewsSection();
  } catch (error) {
    console.error('Error toggling news like:', error);
    showToast('操作に失敗しました', 'error');
  }
}

async function toggleNewsFavorite(articleId) {
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  try {
    const article = state.newsArticles.find(a => a.id === articleId);
    if (!article) return;
    
    const response = await axios.post(`/api/news/${articleId}/favorite`);
    const { favorited } = response.data;
    
    article.is_favorited = favorited;
    if (favorited) {
      showToast('お気に入りに追加しました', 'success');
    } else {
      showToast('お気に入りから削除しました', 'info');
    }
    
    await loadUserFavorites();
    
    // Re-render news section
    renderNewsSection();
  } catch (error) {
    console.error('Error toggling news favorite:', error);
    showToast('操作に失敗しました', 'error');
  }
}

// ============ Blog Like & Favorite Functions ============
async function toggleBlogLike(postId) {
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  try {
    const post = state.blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const response = await axios.post(`/api/blog/${postId}/like`);
    const { liked } = response.data;
    
    post.is_liked = liked;
    if (liked) {
      post.like_count = (post.like_count || 0) + 1;
      showToast('いいねしました', 'success');
    } else {
      post.like_count = Math.max((post.like_count || 0) - 1, 0);
      showToast('いいねを取り消しました', 'info');
    }
    
    // Update like count display
    const likeCountEl = document.getElementById(`blog-like-count-${postId}`);
    if (likeCountEl) {
      likeCountEl.textContent = post.like_count;
    }
    
    // Re-render blog section
    renderBlogSection();
  } catch (error) {
    console.error('Error toggling blog like:', error);
    showToast('操作に失敗しました', 'error');
  }
}

async function toggleBlogFavorite(postId) {
  if (!state.currentUser) {
    showAuthModal('login');
    return;
  }
  
  try {
    const post = state.blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const response = await axios.post(`/api/blog/${postId}/favorite`);
    const { favorited } = response.data;
    
    post.is_favorited = favorited;
    if (favorited) {
      showToast('お気に入りに追加しました', 'success');
    } else {
      showToast('お気に入りから削除しました', 'info');
    }
    
    await loadUserFavorites();
    // Re-render blog section
    renderBlogSection();
  } catch (error) {
    console.error('Error toggling blog favorite:', error);
    showToast('操作に失敗しました', 'error');
  }
}

// ============ Unified Favorites Page ============
async function renderFavoritesPage() {
  const root = document.getElementById('root');
  
  if (!state.currentUser) {
    showAuthModal('login');
    navigateTo('home');
    return;
  }
  
  // Show loading state
  root.innerHTML = `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
        <p class="text-gray-600">お気に入りを読み込み中...</p>
      </div>
    </div>
  `;
  
  // Initialize filter state
  if (!state.favoritesFilter) {
    state.favoritesFilter = { type: '', search: '', sort: 'recent' };
  }
  
  try {
    const lang = state.currentLanguage || 'ja';
    const { type, search, sort } = state.favoritesFilter;
    
    // Build query params
    const params = new URLSearchParams({ lang });
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    
    const response = await axios.get(`/api/favorites?${params.toString()}`);
    const { favorites, counts } = response.data;
    
    // Load collections
    const collectionsResponse = await axios.get('/api/collections');
    state.userCollections = collectionsResponse.data;
    
    root.innerHTML = `
      <!-- Enhanced Header with Filters -->
      <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between mb-4">
            <button onclick="navigateTo('home')" class="text-gray-600 hover:text-gray-900">
              <i class="fas fa-arrow-left mr-2"></i>ホームに戻る
            </button>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <i class="fas fa-star text-yellow-500"></i>
              お気に入り一覧
            </h1>
            <button onclick="showCollectionModal()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <i class="fas fa-folder-plus mr-2"></i>コレクション管理
            </button>
          </div>
          
          <!-- Filter Controls -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- Type Filter -->
            <select id="filter-type" onchange="updateFavoriteFilter('type', this.value)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600">
              <option value="">すべてのタイプ</option>
              <option value="video" ${type === 'video' ? 'selected' : ''}>動画のみ</option>
              <option value="blog" ${type === 'blog' ? 'selected' : ''}>ブログのみ</option>
              <option value="news" ${type === 'news' ? 'selected' : ''}>ニュースのみ</option>
            </select>
            
            <!-- Search -->
            <input 
              type="text" 
              id="filter-search" 
              placeholder="タイトルやタグで検索..."
              value="${search}"
              onkeyup="if(event.key==='Enter') updateFavoriteFilter('search', this.value)"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
            
            <!-- Sort -->
            <select id="filter-sort" onchange="updateFavoriteFilter('sort', this.value)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600">
              <option value="recent" ${sort === 'recent' ? 'selected' : ''}>最新順</option>
              <option value="popular" ${sort === 'popular' ? 'selected' : ''}>人気順</option>
              <option value="added" ${sort === 'added' ? 'selected' : ''}>追加順</option>
            </select>
          </div>
        </div>
      </header>
      
      <main class="bg-gray-50 min-h-screen py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Summary Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-white rounded-lg shadow p-4 text-center">
              <div class="text-3xl font-bold text-purple-600">${counts.total}</div>
              <div class="text-sm text-gray-600 mt-1">合計</div>
            </div>
            <div class="bg-white rounded-lg shadow p-4 text-center">
              <div class="text-3xl font-bold text-red-600">${counts.videos}</div>
              <div class="text-sm text-gray-600 mt-1">動画</div>
            </div>
            <div class="bg-white rounded-lg shadow p-4 text-center">
              <div class="text-3xl font-bold text-indigo-600">${counts.blogs}</div>
              <div class="text-sm text-gray-600 mt-1">ブログ</div>
            </div>
            <div class="bg-white rounded-lg shadow p-4 text-center">
              <div class="text-3xl font-bold text-blue-600">${counts.news}</div>
              <div class="text-sm text-gray-600 mt-1">ニュース</div>
            </div>
          </div>
          
          <!-- Favorites List -->
          ${favorites.length === 0 ? `
            <div class="bg-white rounded-lg shadow p-12 text-center">
              <i class="fas fa-star text-6xl text-gray-300 mb-4"></i>
              <h3 class="text-xl font-bold text-gray-700 mb-2">お気に入りがありません</h3>
              <p class="text-gray-500 mb-6">動画、ブログ、ニュースをお気に入りに追加してみましょう！</p>
              <button onclick="navigateTo('home')" class="btn btn-primary">
                コンテンツを探す
              </button>
            </div>
          ` : `
            <div class="space-y-4">
              ${favorites.map(item => renderFavoriteItem(item)).join('')}
            </div>
          `}
        </div>
      </main>
    `;
  } catch (error) {
    console.error('Error loading favorites:', error);
    root.innerHTML = `
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 class="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h3>
          <p class="text-gray-600 mb-6">お気に入りの読み込みに失敗しました</p>
          <button onclick="navigateTo('home')" class="btn btn-primary">
            ホームに戻る
          </button>
        </div>
      </div>
    `;
  }
}

function renderFavoriteItem(item) {
  const { content_type, favorited_at } = item;
  const timeAgo = formatTimeAgo(new Date(favorited_at));
  
  if (content_type === 'video') {
    const thumbnail = getThumbnailUrl(item.media_source, item.thumbnail_url, item.external_video_id);
    return `
      <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 cursor-pointer" onclick="openVideoModal(${item.id})">
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-40 h-24 bg-gray-200 rounded overflow-hidden">
            <img src="${thumbnail}" alt="${item.title}" class="w-full h-full object-cover">
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-lg font-bold text-gray-900 line-clamp-2">${item.title}</h3>
              <span class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
                <i class="fas fa-video"></i> 動画
              </span>
            </div>
            <p class="text-sm text-gray-600 line-clamp-2 mb-2">${item.description || ''}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span><i class="fas fa-heart text-red-500"></i> ${item.likes || 0}</span>
                <span><i class="fas fa-eye"></i> ${item.views || 0}</span>
                <span><i class="fas fa-clock"></i> ${timeAgo}にお気に入り追加</span>
              </div>
              <button 
                onclick="event.stopPropagation(); addToCollection('video', ${item.id})"
                class="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
                title="コレクションに追加"
              >
                <i class="fas fa-folder-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (content_type === 'blog') {
    return `
      <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 cursor-pointer" onclick="navigateTo('blog/${item.id}')">
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-40 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded overflow-hidden">
            ${item.image_url ? `
              <img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover">
            ` : `
              <div class="w-full h-full flex items-center justify-center">
                <i class="fas fa-blog text-4xl text-indigo-400"></i>
              </div>
            `}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-lg font-bold text-gray-900 line-clamp-2">${item.title}</h3>
              <span class="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full flex-shrink-0">
                <i class="fas fa-blog"></i> ブログ
              </span>
            </div>
            <p class="text-sm text-gray-600 line-clamp-2 mb-2">${stripHtml(item.content || '').substring(0, 120)}...</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span><i class="fas fa-calendar"></i> ${formatDate(item.published_date)}</span>
                <span><i class="fas fa-clock"></i> ${timeAgo}にお気に入り追加</span>
              </div>
              <button 
                onclick="event.stopPropagation(); addToCollection('blog', ${item.id})"
                class="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
                title="コレクションに追加"
              >
                <i class="fas fa-folder-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (content_type === 'news') {
    return `
      <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 cursor-pointer" onclick="showNewsModal(${item.id})">
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-40 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded overflow-hidden">
            ${item.image_url ? `
              <img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover">
            ` : `
              <div class="w-full h-full flex items-center justify-center">
                <i class="fas fa-newspaper text-4xl text-blue-400"></i>
              </div>
            `}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-lg font-bold text-gray-900 line-clamp-2">${item.title}</h3>
              <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex-shrink-0">
                <i class="fas fa-newspaper"></i> ニュース
              </span>
            </div>
            <p class="text-sm text-gray-600 line-clamp-2 mb-2">${item.summary || ''}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span><i class="fas fa-heart text-red-500"></i> ${item.like_count || 0}</span>
                <span><i class="fas fa-external-link-alt"></i> ${item.source_name || ''}</span>
                <span><i class="fas fa-clock"></i> ${timeAgo}にお気に入り追加</span>
              </div>
              <button 
                onclick="event.stopPropagation(); addToCollection('news', ${item.id})"
                class="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
                title="コレクションに追加"
              >
                <i class="fas fa-folder-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  return '';
}

// Helper functions
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return `${seconds}秒前`;
}

// ============ News Translation Function ============
async function translateNews(articleId) {
  try {
    const lang = state.currentLanguage || 'ja';
    showToast('翻訳中...', 'info');
    
    const response = await axios.get(`/api/news/${articleId}/translate/${lang}`);
    const translatedArticle = response.data;
    
    // Update article in state
    const articleIndex = state.newsArticles.findIndex(a => a.id === articleId);
    if (articleIndex !== -1) {
      state.newsArticles[articleIndex] = {
        ...state.newsArticles[articleIndex],
        ...translatedArticle
      };
    }
    
    showToast('翻訳が完了しました', 'success');
    renderNewsSection();
  } catch (error) {
    console.error('Translation error:', error);
    showToast('翻訳に失敗しました', 'error');
  }
}

// ============ Unified Favorite Card Renderer ============
function renderUnifiedFavoriteCard(item) {
  const { content_type } = item;
  
  if (content_type === 'video') {
    const thumbnail = getThumbnailUrl(item.media_source, item.thumbnail_url, item.external_video_id);
    return `
      <div class="scroll-item">
        <div class="video-card-compact" onclick="openVideoModal(${item.id})">
          <div class="video-thumbnail">
            <img src="${thumbnail}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400x225?text=Video'">
            <span class="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full font-semibold">
              <i class="fas fa-video"></i> 動画
            </span>
          </div>
          <div class="video-info-compact">
            <div class="video-title-compact line-clamp-2">${item.title}</div>
            <div class="video-meta-compact">
              <span><i class="fas fa-heart"></i> ${item.likes || 0}</span>
              <span><i class="fas fa-eye"></i> ${item.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (content_type === 'blog') {
    return `
      <div class="scroll-item">
        <div class="video-card-compact" onclick="navigateTo('blog/${item.id}')">
          ${item.image_url ? `
            <div class="video-thumbnail">
              <img src="${item.image_url}" alt="${item.title}">
              <span class="absolute top-2 left-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded-full font-semibold">
                <i class="fas fa-blog"></i> ブログ
              </span>
            </div>
          ` : `
            <div class="video-thumbnail" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <span class="absolute top-2 left-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded-full font-semibold">
                <i class="fas fa-blog"></i> ブログ
              </span>
            </div>
          `}
          <div class="video-info-compact">
            <div class="video-title-compact line-clamp-2">${item.title}</div>
            <div class="video-meta-compact">
              <span><i class="fas fa-calendar"></i> ${formatDate(item.published_date)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (content_type === 'news') {
    return `
      <div class="scroll-item">
        <div class="video-card-compact" onclick="showNewsModal(${item.id})">
          ${item.image_url ? `
            <div class="video-thumbnail">
              <img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover">
              <span class="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
                <i class="fas fa-newspaper"></i> ニュース
              </span>
            </div>
          ` : `
            <div class="video-thumbnail" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)">
              <span class="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
                <i class="fas fa-newspaper"></i> ニュース
              </span>
            </div>
          `}
          <div class="video-info-compact">
            <div class="video-title-compact line-clamp-2 font-bold">${item.title}</div>
            <p class="text-xs text-gray-600 line-clamp-2 mb-2">${item.summary ? item.summary.substring(0, 80) + '...' : ''}</p>
            <div class="video-meta-compact">
              <span><i class="fas fa-heart"></i> ${item.like_count || 0}</span>
              ${item.source_name ? `<span><i class="fas fa-newspaper"></i> ${item.source_name}</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  return '';
}

// ============ Favorites Filter Functions ============
function updateFavoriteFilter(key, value) {
  if (!state.favoritesFilter) {
    state.favoritesFilter = { type: '', search: '', sort: 'recent' };
  }
  
  state.favoritesFilter[key] = value;
  renderFavoritesPage();
}

// ============ Collection Management Functions ============
async function showCollectionModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.id = 'collection-modal';
  
  try {
    const response = await axios.get('/api/collections');
    const collections = response.data;
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <i class="fas fa-folder-open"></i>
            コレクション管理
          </h2>
          <button onclick="closeCollectionModal()" class="text-white hover:text-gray-200 text-2xl">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6">
          <!-- Create New Collection -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3">新しいコレクションを作成</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input 
                type="text" 
                id="new-collection-name" 
                placeholder="コレクション名"
                class="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
              <select id="new-collection-icon" class="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="folder">📁 フォルダー</option>
                <option value="star">⭐ スター</option>
                <option value="heart">❤️ ハート</option>
                <option value="bookmark">🔖 ブックマーク</option>
                <option value="flag">🚩 フラグ</option>
              </select>
              <button onclick="createCollection()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <i class="fas fa-plus mr-2"></i>作成
              </button>
            </div>
          </div>
          
          <!-- Collections List -->
          <div class="space-y-3">
            <h3 class="text-lg font-bold text-gray-900 mb-3">マイコレクション (${collections.length})</h3>
            ${collections.length === 0 ? `
              <div class="text-center py-12 text-gray-500">
                <i class="fas fa-folder-open text-6xl mb-4 text-gray-300"></i>
                <p>コレクションがまだありません</p>
                <p class="text-sm">上のフォームから新しいコレクションを作成しましょう</p>
              </div>
            ` : collections.map(col => `
              <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 flex-1">
                    <span class="text-2xl">${getCollectionIcon(col.icon)}</span>
                    <div class="flex-1">
                      <h4 class="font-bold text-gray-900">${col.name}</h4>
                      <p class="text-sm text-gray-500">${col.item_count || 0}件のアイテム</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="viewCollection(${col.id})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                      <i class="fas fa-eye mr-1"></i>表示
                    </button>
                    <button onclick="deleteCollection(${col.id})" class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                      <i class="fas fa-trash mr-1"></i>削除
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Failed to load collections:', error);
    showToast('コレクションの読み込みに失敗しました', 'error');
  }
}

function getCollectionIcon(icon) {
  const icons = {
    'folder': '📁',
    'star': '⭐',
    'heart': '❤️',
    'bookmark': '🔖',
    'flag': '🚩'
  };
  return icons[icon] || '📁';
}

function closeCollectionModal() {
  const modal = document.getElementById('collection-modal');
  if (modal) modal.remove();
}

async function createCollection() {
  const name = document.getElementById('new-collection-name').value.trim();
  const icon = document.getElementById('new-collection-icon').value;
  
  if (!name) {
    showToast('コレクション名を入力してください', 'error');
    return;
  }
  
  try {
    await axios.post('/api/collections', { name, icon });
    showToast('コレクションを作成しました', 'success');
    closeCollectionModal();
    showCollectionModal(); // Reload
  } catch (error) {
    console.error('Failed to create collection:', error);
    showToast('コレクションの作成に失敗しました', 'error');
  }
}

async function deleteCollection(collectionId) {
  if (!confirm('このコレクションを削除しますか？')) return;
  
  try {
    await axios.delete(`/api/collections/${collectionId}`);
    showToast('コレクションを削除しました', 'success');
    closeCollectionModal();
    showCollectionModal(); // Reload
  } catch (error) {
    console.error('Failed to delete collection:', error);
    showToast('コレクションの削除に失敗しました', 'error');
  }
}

async function viewCollection(collectionId) {
  // TODO: Implement collection detail view
  showToast('コレクション詳細は開発中です', 'info');
}

async function addToCollection(contentType, contentId) {
  try {
    const response = await axios.get('/api/collections');
    const collections = response.data;
    
    if (collections.length === 0) {
      showToast('まずコレクションを作成してください', 'info');
      showCollectionModal();
      return;
    }
    
    // Show collection selector
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'collection-selector-modal';
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">コレクションに追加</h2>
          <button onclick="document.getElementById('collection-selector-modal').remove()" class="text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-6 space-y-2">
          ${collections.map(col => `
            <button 
              onclick="confirmAddToCollection(${col.id}, '${contentType}', ${contentId})"
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-3"
            >
              <span class="text-2xl">${getCollectionIcon(col.icon)}</span>
              <div class="flex-1">
                <div class="font-semibold text-gray-900">${col.name}</div>
                <div class="text-sm text-gray-500">${col.item_count || 0}件</div>
              </div>
              <i class="fas fa-chevron-right text-gray-400"></i>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Failed to load collections:', error);
    showToast('コレクションの読み込みに失敗しました', 'error');
  }
}

async function confirmAddToCollection(collectionId, contentType, contentId) {
  try {
    await axios.post(`/api/collections/${collectionId}/items`, {
      content_type: contentType,
      content_id: contentId
    });
    showToast('コレクションに追加しました', 'success');
    const modal = document.getElementById('collection-selector-modal');
    if (modal) modal.remove();
  } catch (error) {
    if (error.response && error.response.status === 409) {
      showToast('既にこのコレクションに追加されています', 'info');
    } else {
      console.error('Failed to add to collection:', error);
      showToast('コレクションへの追加に失敗しました', 'error');
    }
  }
}

// Expose all functions to global scope
window.filterNewsByCategory = filterNewsByCategory;
window.filterNewsByGenre = filterNewsByGenre;
window.renderNewsCard = renderNewsCard;
window.showNewsModal = showNewsModal;
window.toggleNewsLikeFromModal = toggleNewsLikeFromModal;
window.toggleNewsFavoriteFromModal = toggleNewsFavoriteFromModal;
window.translateNewsInModal = translateNewsInModal;
window.shareNews = shareNews;
window.toggleNewsLike = toggleNewsLike;
window.toggleNewsFavorite = toggleNewsFavorite;
window.toggleBlogLike = toggleBlogLike;
window.toggleBlogFavorite = toggleBlogFavorite;
window.renderFavoritesPage = renderFavoritesPage;
window.translateNews = translateNews;
window.showAnnouncementsModal = showAnnouncementsModal;
window.filterAnnouncements = filterAnnouncements;
window.updateFavoriteFilter = updateFavoriteFilter;
window.showCollectionModal = showCollectionModal;
window.closeCollectionModal = closeCollectionModal;
window.createCollection = createCollection;
window.deleteCollection = deleteCollection;
window.viewCollection = viewCollection;
window.addToCollection = addToCollection;
window.confirmAddToCollection = confirmAddToCollection;
