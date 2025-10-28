// ============ Multi-Language Support ============

const translations = {
  ja: {
    // Navigation & Header
    'nav.home': 'ホーム',
    'nav.rankings': 'ランキング',
    'nav.blog': 'ブログ',
    'nav.admin': '管理画面',
    'nav.login': 'ログイン',
    'nav.signup': '会員登録',
    'nav.logout': 'ログアウト',
    'nav.profile': 'プロフィール',
    
    // Hero Section
    'hero.title': 'クライミング動画共有プラットフォーム',
    'hero.subtitle': '世界中のクライミング動画を発見し、共有しよう',
    'hero.upload': '動画を投稿',
    'hero.premium_badge': 'Premium',
    
    // Section Headers
    'section.latest': '最新動画',
    'section.bouldering': 'ボルダリング',
    'section.sport': 'スポーツクライミング',
    'section.trad': 'トラッドクライミング',
    'section.tutorial': 'チュートリアル',
    'section.competition': '大会',
    'section.gear': 'ギア・装備',
    'section.rankings': 'ランキング',
    'section.blog': 'ブログ記事',
    
    // Rankings Tab
    'ranking.daily': 'デイリー',
    'ranking.weekly': 'ウィークリー',
    'ranking.monthly': 'マンスリー',
    'ranking.yearly': 'イヤリー',
    
    // Video Card
    'video.views': '回視聴',
    'video.views_count': '{count}回視聴',
    'video.likes': 'いいね',
    'video.likes_count': '{count}',
    'video.channel': 'チャンネル',
    'video.duration': '再生時間',
    'video.like_btn': 'いいね',
    'video.liked': 'いいね済み',
    
    // Pricing Section
    'pricing.title': 'プレミアムで、あなたの動画を応援',
    'pricing.trial': '15日間無料トライアル実施中',
    'pricing.free.title': '無料プラン',
    'pricing.free.price': '$0',
    'pricing.free.month': '/月',
    'pricing.free.upload': '動画投稿',
    'pricing.free.upload_status': '（不可）',
    'pricing.free.likes': 'いいね',
    'pricing.free.likes_status': '（3回まで）',
    'pricing.premium.title': 'プレミアムプラン',
    'pricing.premium.price': '$20',
    'pricing.premium.month': '/月',
    'pricing.premium.feature1': 'あなたの動画を投稿できる',
    'pricing.premium.feature2': '無制限にいいねできる',
    'pricing.premium.feature3': '動画を応援してランキングUP',
    'pricing.cta': '今すぐ始める',
    
    // Auth Modal
    'auth.login.title': 'ログイン',
    'auth.signup.title': '新規登録',
    'auth.email': 'メールアドレス',
    'auth.password': 'パスワード',
    'auth.name': '名前',
    'auth.login_btn': 'ログイン',
    'auth.signup_btn': '登録',
    'auth.switch_to_signup': 'アカウントをお持ちでない方',
    'auth.switch_to_login': 'すでにアカウントをお持ちの方',
    'auth.close': '閉じる',
    
    // Upload Modal
    'upload.title': '動画をアップロード',
    'upload.premium_only': 'プレミアム限定機能',
    'upload.url': '動画URL',
    'upload.url_placeholder': 'YouTube, Vimeo, Instagram, TikTokのURL',
    'upload.video_title': '動画タイトル',
    'upload.description': '説明',
    'upload.category': 'カテゴリー',
    'upload.category.bouldering': 'ボルダリング',
    'upload.category.sport': 'スポーツクライミング',
    'upload.category.trad': 'トラッドクライミング',
    'upload.category.tutorial': 'チュートリアル',
    'upload.category.competition': '大会',
    'upload.category.gear': 'ギア・装備',
    'upload.analyze': 'URL解析',
    'upload.submit': 'アップロード',
    'upload.cancel': 'キャンセル',
    'upload.analyzing': '解析中...',
    'upload.uploading': 'アップロード中...',
    
    // Premium Modals
    'premium_limit.title': 'もっと応援しませんか？',
    'premium_limit.subtitle': '無料プランでは{count}回までいいねができます',
    'premium_limit.features_title': 'プレミアムでできること',
    'premium_limit.feature1': '無制限にいいねしてお気に入り動画を応援',
    'premium_limit.feature2': 'あなたの動画を投稿してコミュニティと共有',
    'premium_limit.feature3': 'ランキングに貢献して人気動画を作る',
    'premium_limit.price': '$20',
    'premium_limit.month': '/月',
    'premium_limit.trial': '15日間無料トライアル',
    'premium_limit.cta': '今すぐ始める',
    
    'premium_upload.title': '動画投稿はプレミアム限定',
    'premium_upload.subtitle': 'あなたのクライミング動画をコミュニティと共有しませんか？',
    'premium_upload.feature1': 'YouTube、Vimeo、Instagram、TikTokから投稿',
    'premium_upload.feature2': 'AIが自動で動画情報を解析',
    'premium_upload.feature3': 'ランキングに参加して注目を集める',
    'premium_upload.price': '$20',
    'premium_upload.month': '/月',
    'premium_upload.trial': '15日間無料トライアル',
    'premium_upload.cta': 'プレミアムを始める',
    
    // Video Detail Modal
    'detail.views': '回視聴',
    'detail.likes': 'いいね',
    'detail.description': '説明',
    'detail.channel': 'チャンネル',
    'detail.category': 'カテゴリー',
    'detail.close': '閉じる',
    
    // Toast Messages
    'toast.like_success': 'いいねしました！',
    'toast.like_remaining': 'あと{count}回いいねできます',
    'toast.like_limit': '無料プランの上限に達しました',
    'toast.already_liked': 'すでにいいね済みです',
    'toast.login_required': 'ログインが必要です',
    'toast.upload_success': '動画をアップロードしました',
    'toast.upload_error': 'アップロードに失敗しました',
    'toast.data_load_error': 'データの読み込みに失敗しました',
    'toast.admin_only': '管理者権限が必要です',
    'toast.auth_success': 'ログインしました',
    'toast.auth_error': '認証に失敗しました',
    'toast.logout_success': 'ログアウトしました',
    
    // Footer
    'footer.about': 'ClimbHeroについて',
    'footer.terms': '利用規約',
    'footer.privacy': 'プライバシーポリシー',
    'footer.contact': 'お問い合わせ',
    'footer.copyright': '© 2024 ClimbHero. All rights reserved.',
    
    // Admin Panel
    'admin.title': '管理画面',
    'admin.videos': '動画管理',
    'admin.users': 'ユーザー管理',
    'admin.stats': '統計情報',
    
    // Common
    'common.loading': '読み込み中...',
    'common.cancel': 'キャンセル',
    'common.close': '閉じる',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.search': '検索',
    'common.filter': 'フィルター',
    'common.reply': '返信',
    'common.report': '報告',
    'common.share': '共有',
    'common.follow': 'フォロー',
    'common.following': 'フォロー中',
    'common.submit': '送信',
    
    // Comments
    'comments.title': 'コメント',
    'comments.add': 'コメントを追加',
    'comments.placeholder': 'コメントを入力してください...',
    'comments.reply_to': '{name}に返信',
    'comments.show_replies': '{count}件の返信を表示',
    'comments.hide_replies': '返信を非表示',
    'comments.edit': '編集',
    'comments.delete': '削除',
    'comments.deleted': 'このコメントは削除されました',
    'comments.no_comments': 'まだコメントがありません',
    'comments.be_first': '最初にコメントしましょう！',
    
    // Share
    'share.title': '共有',
    'share.copy_link': 'リンクをコピー',
    'share.copied': 'リンクをコピーしました',
    'share.twitter': 'Twitterで共有',
    'share.facebook': 'Facebookで共有',
    'share.line': 'LINEで共有',
    
    // User Profile
    'profile.videos': '動画',
    'profile.followers': 'フォロワー',
    'profile.following': 'フォロー中',
    'profile.bio': '自己紹介',
    'profile.location': '場所',
    'profile.climbing_since': 'クライミング歴',
    'profile.years': '年',
    'profile.edit_profile': 'プロフィール編集',
    
    // Notifications
    'notifications.title': '通知',
    'notifications.mark_read': '既読にする',
    'notifications.mark_all_read': 'すべて既読にする',
    'notifications.no_notifications': '通知はありません',
    'notifications.new_comment': '{user}があなたの動画にコメントしました',
    'notifications.new_reply': '{user}があなたのコメントに返信しました',
    'notifications.new_like': '{user}があなたの動画をいいねしました',
    'notifications.new_follower': '{user}があなたをフォローしました',
    
    // Search
    'search.placeholder': '動画、ユーザーを検索...',
    'search.results': '検索結果',
    'search.no_results': '検索結果が見つかりませんでした',
    'search.videos': '動画',
    'search.users': 'ユーザー',
  },
  
  en: {
    // Navigation & Header
    'nav.home': 'Home',
    'nav.rankings': 'Rankings',
    'nav.blog': 'Blog',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    
    // Hero Section
    'hero.title': 'Climbing Video Sharing Platform',
    'hero.subtitle': 'Discover and share climbing videos from around the world',
    'hero.upload': 'Upload Video',
    'hero.premium_badge': 'Premium',
    
    // Section Headers
    'section.latest': 'Latest Videos',
    'section.bouldering': 'Bouldering',
    'section.sport': 'Sport Climbing',
    'section.trad': 'Trad Climbing',
    'section.tutorial': 'Tutorials',
    'section.competition': 'Competitions',
    'section.gear': 'Gear & Equipment',
    'section.rankings': 'Rankings',
    'section.blog': 'Blog Posts',
    
    // Rankings Tab
    'ranking.daily': 'Daily',
    'ranking.weekly': 'Weekly',
    'ranking.monthly': 'Monthly',
    'ranking.yearly': 'Yearly',
    
    // Video Card
    'video.views': ' views',
    'video.views_count': '{count} views',
    'video.likes': ' likes',
    'video.likes_count': '{count}',
    'video.channel': 'Channel',
    'video.duration': 'Duration',
    'video.like_btn': 'Like',
    'video.liked': 'Liked',
    
    // Pricing Section
    'pricing.title': 'Support Your Videos with Premium',
    'pricing.trial': '15-day free trial available',
    'pricing.free.title': 'Free Plan',
    'pricing.free.price': '$0',
    'pricing.free.month': '/month',
    'pricing.free.upload': 'Video Upload',
    'pricing.free.upload_status': '(Not available)',
    'pricing.free.likes': 'Likes',
    'pricing.free.likes_status': '(Up to 3)',
    'pricing.premium.title': 'Premium Plan',
    'pricing.premium.price': '$20',
    'pricing.premium.month': '/month',
    'pricing.premium.feature1': 'Upload your videos',
    'pricing.premium.feature2': 'Unlimited likes',
    'pricing.premium.feature3': 'Boost rankings with your support',
    'pricing.cta': 'Get Started',
    
    // Auth Modal
    'auth.login.title': 'Login',
    'auth.signup.title': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.login_btn': 'Login',
    'auth.signup_btn': 'Sign Up',
    'auth.switch_to_signup': 'Don\'t have an account?',
    'auth.switch_to_login': 'Already have an account?',
    'auth.close': 'Close',
    
    // Upload Modal
    'upload.title': 'Upload Video',
    'upload.premium_only': 'Premium Only',
    'upload.url': 'Video URL',
    'upload.url_placeholder': 'YouTube, Vimeo, Instagram, TikTok URL',
    'upload.video_title': 'Video Title',
    'upload.description': 'Description',
    'upload.category': 'Category',
    'upload.category.bouldering': 'Bouldering',
    'upload.category.sport': 'Sport Climbing',
    'upload.category.trad': 'Trad Climbing',
    'upload.category.tutorial': 'Tutorial',
    'upload.category.competition': 'Competition',
    'upload.category.gear': 'Gear & Equipment',
    'upload.analyze': 'Analyze URL',
    'upload.submit': 'Upload',
    'upload.cancel': 'Cancel',
    'upload.analyzing': 'Analyzing...',
    'upload.uploading': 'Uploading...',
    
    // Premium Modals
    'premium_limit.title': 'Want to support more?',
    'premium_limit.subtitle': 'Free plan allows up to {count} likes',
    'premium_limit.features_title': 'What you can do with Premium',
    'premium_limit.feature1': 'Like unlimited videos and support your favorites',
    'premium_limit.feature2': 'Post your videos and share with the community',
    'premium_limit.feature3': 'Contribute to rankings and create popular videos',
    'premium_limit.price': '$20',
    'premium_limit.month': '/month',
    'premium_limit.trial': '15-day free trial',
    'premium_limit.cta': 'Get Started',
    
    'premium_upload.title': 'Video Upload is Premium Only',
    'premium_upload.subtitle': 'Share your climbing videos with the community',
    'premium_upload.feature1': 'Upload from YouTube, Vimeo, Instagram, TikTok',
    'premium_upload.feature2': 'AI automatically analyzes video information',
    'premium_upload.feature3': 'Join rankings and get attention',
    'premium_upload.price': '$20',
    'premium_upload.month': '/month',
    'premium_upload.trial': '15-day free trial',
    'premium_upload.cta': 'Start Premium',
    
    // Video Detail Modal
    'detail.views': ' views',
    'detail.likes': ' likes',
    'detail.description': 'Description',
    'detail.channel': 'Channel',
    'detail.category': 'Category',
    'detail.close': 'Close',
    
    // Toast Messages
    'toast.like_success': 'Liked!',
    'toast.like_remaining': '{count} likes remaining',
    'toast.like_limit': 'Free plan limit reached',
    'toast.already_liked': 'Already liked',
    'toast.login_required': 'Login required',
    'toast.upload_success': 'Video uploaded successfully',
    'toast.upload_error': 'Upload failed',
    'toast.data_load_error': 'Failed to load data',
    'toast.admin_only': 'Admin access required',
    'toast.auth_success': 'Logged in successfully',
    'toast.auth_error': 'Authentication failed',
    'toast.logout_success': 'Logged out successfully',
    
    // Footer
    'footer.about': 'About ClimbHero',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.contact': 'Contact',
    'footer.copyright': '© 2024 ClimbHero. All rights reserved.',
    
    // Admin Panel
    'admin.title': 'Admin Panel',
    'admin.videos': 'Video Management',
    'admin.users': 'User Management',
    'admin.stats': 'Statistics',
    
    // Common
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.reply': 'Reply',
    'common.report': 'Report',
    'common.share': 'Share',
    'common.follow': 'Follow',
    'common.following': 'Following',
    'common.submit': 'Submit',
    
    // Comments
    'comments.title': 'Comments',
    'comments.add': 'Add a comment',
    'comments.placeholder': 'Write a comment...',
    'comments.reply_to': 'Reply to {name}',
    'comments.show_replies': 'Show {count} replies',
    'comments.hide_replies': 'Hide replies',
    'comments.edit': 'Edit',
    'comments.delete': 'Delete',
    'comments.deleted': 'This comment has been deleted',
    'comments.no_comments': 'No comments yet',
    'comments.be_first': 'Be the first to comment!',
    
    // Share
    'share.title': 'Share',
    'share.copy_link': 'Copy Link',
    'share.copied': 'Link copied',
    'share.twitter': 'Share on Twitter',
    'share.facebook': 'Share on Facebook',
    'share.line': 'Share on LINE',
    
    // User Profile
    'profile.videos': 'Videos',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    'profile.bio': 'Bio',
    'profile.location': 'Location',
    'profile.climbing_since': 'Climbing since',
    'profile.years': 'years',
    'profile.edit_profile': 'Edit Profile',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark_read': 'Mark as read',
    'notifications.mark_all_read': 'Mark all as read',
    'notifications.no_notifications': 'No notifications',
    'notifications.new_comment': '{user} commented on your video',
    'notifications.new_reply': '{user} replied to your comment',
    'notifications.new_like': '{user} liked your video',
    'notifications.new_follower': '{user} started following you',
    
    // Search
    'search.placeholder': 'Search videos, users...',
    'search.results': 'Search Results',
    'search.no_results': 'No results found',
    'search.videos': 'Videos',
    'search.users': 'Users',
  }
};

// Current language state
let currentLanguage = localStorage.getItem('climbhero_language') || 'ja';

// Get translation
function t(key, params = {}) {
  let text = translations[currentLanguage][key] || translations['ja'][key] || key;
  
  // Replace parameters like {count}
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
}

// Set language
function setLanguage(lang) {
  if (!translations[lang]) {
    console.error('Language not supported:', lang);
    return;
  }
  
  currentLanguage = lang;
  localStorage.setItem('climbhero_language', lang);
  
  // Trigger language change event
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Get current language
function getCurrentLanguage() {
  return currentLanguage;
}

// Get available languages
function getAvailableLanguages() {
  return [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];
}

// Export functions
window.i18n = {
  t,
  setLanguage,
  getCurrentLanguage,
  getAvailableLanguages
};
