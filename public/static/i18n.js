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
    'hero.subtitle': 'ClimbHero - 世界中のクライミング動画を発見し、共有しよう',
    'hero.upload': '動画を投稿',
    'hero.premium_badge': 'Premium',
    
    // Section Headers
    'section.latest': '最新動画',
    'section.bouldering': 'ボルダリング',
    'section.lead': 'リード',
    'section.alpine': 'アルパイン',
    'section.other': 'その他',
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
    'pricing.title': 'プレミアムで動画投稿+10いいね👍',
    'pricing.trial': '15日間無料トライアル実施中',
    'pricing.free.title': '無料プラン',
    'pricing.free.price': '$0',
    'pricing.free.month': '/月',
    'pricing.free.upload': '動画投稿',
    'pricing.free.upload_status': '（不可）',
    'pricing.free.likes': 'いいね',
    'pricing.free.likes_status': '（1回まで）',
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
    'admin.announcements': 'お知らせ管理',
    'admin.stripe': 'Stripe決済設定',
    'admin.email': 'メール配信',
    'admin.users': 'ユーザー管理',
    'admin.stats': '統計情報',
    'admin.video_title': 'タイトル',
    'admin.video_category': 'カテゴリー',
    'admin.video_likes': 'いいね数',
    'admin.video_views': '視聴回数',
    'admin.video_edit': '編集',
    'admin.video_delete': '削除',
    'admin.video_confirm_delete': 'この動画を削除してもよろしいですか？',
    'admin.announcement_title': 'お知らせタイトル',
    'admin.announcement_content': '内容',
    'admin.announcement_priority': '優先度',
    'admin.announcement_active': '公開中',
    'admin.announcement_inactive': '非公開',
    'admin.announcement_new': '新規お知らせ作成',
    'admin.announcement_edit': 'お知らせ編集',
    'admin.announcement_delete': '削除',
    'admin.announcement_confirm_delete': 'このお知らせを削除してもよろしいですか？',
    
    // Announcements
    'announcement.title': 'お知らせ',
    'announcement.no_announcements': 'お知らせはありません',
    
    // Stripe Settings
    'stripe.title': 'Stripe決済設定',
    'stripe.public_key': 'Publishable Key',
    'stripe.secret_key': 'Secret Key',
    'stripe.webhook_secret': 'Webhook Secret',
    'stripe.save': '設定を保存',
    'stripe.saved': 'Stripe設定を保存しました',
    'stripe.error': 'Stripe設定の保存に失敗しました',
    
    // Email Campaign
    'email.title': 'メールマガジン配信',
    'email.new_campaign': '新規配信作成',
    'email.subject': '件名',
    'email.content': '本文',
    'email.recipient_count': '配信対象',
    'email.status': 'ステータス',
    'email.status_draft': '下書き',
    'email.status_sending': '送信中',
    'email.status_sent': '送信済み',
    'email.send': '配信する',
    'email.confirm_send': 'すべてのユーザーにメールを配信しますか？',
    'email.sent_success': 'メール配信を開始しました',
    'email.sent_error': 'メール配信に失敗しました',
    'email.history': '配信履歴',
    'email.sent_at': '送信日時',
    
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
    
    // Annual Subscription
    'pricing.annual.title': '年間プラン',
    'pricing.annual.price': '$192',
    'pricing.annual.year': '/年',
    'pricing.annual.discount': '20% OFF',
    'pricing.annual.save': '$48お得',
    'pricing.toggle.monthly': '月額',
    'pricing.toggle.annual': '年額',
    
    // Posting Limits
    'posting.limit_title': '投稿制限',
    'posting.limit_today': '本日の投稿',
    'posting.limit_reached': '本日の投稿上限に達しました',
    'posting.limit_upgrade': 'プレミアムプランで30件まで投稿可能',
    'posting.remaining': '残り{count}件',
    
    // AI Validation
    'ai.validating': 'AI解析中...',
    'ai.genre_detected': 'ジャンル: {genre}',
    'ai.confidence': '信頼度: {score}%',
    'ai.authentic': '✓ クライミング動画として認証済み',
    'ai.not_authentic': '⚠ クライミング動画として認識できませんでした',
    'ai.duplicate': 'この動画は既に投稿されています',
    
    // Contests
    'contest.title': 'コンテスト',
    'contest.active': '開催中のコンテスト',
    'contest.prize': '賞金総額',
    'contest.deadline': '応募締切',
    'contest.submit': 'エントリー',
    'contest.vote': '投票',
    'contest.submissions': '応募作品',
    'contest.rules': 'ルール',
    'contest.prizes': '賞金',
    'contest.categories': 'カテゴリー',
    'contest.pro': 'プロ部門',
    'contest.amateur': 'アマチュア部門',
    'contest.submitted': '応募済み',
    'contest.vote_success': '投票しました！',
    'contest.already_voted': '既に投票済みです',
    
    // Safety Guidelines
    'safety.title': '安全ガイドライン',
    'safety.filming': '撮影時の安全',
    'safety.gym_etiquette': 'ジムマナー',
    'safety.outdoor': '外岩での注意',
    'safety.download_pdf': 'PDFをダウンロード',
    'safety.version': 'バージョン',
    'safety.updated': '最終更新',
    
    // Partners
    'partner.title': 'パートナージム',
    'partner.gyms': '提携ジム',
    'partner.count': '全国{count}箇所以上',
    'partner.filming_ok': '撮影可能',
    'partner.map': '地図から探す',
    'partner.prefecture': '都道府県',
    'partner.details': '詳細',
    'partner.website': 'ウェブサイト',
    'partner.phone': '電話番号',
    'partner.address': '住所',
    
    // Dashboard
    'dashboard.title': 'マイページ',
    'dashboard.stats': '統計',
    'dashboard.my_videos': '投稿動画',
    'dashboard.posting_history': '投稿履歴',
    'dashboard.total_posts': '総投稿数',
    'dashboard.approved': '承認済み',
    'dashboard.pending': '審査中',
    
    // Footer Enhanced
    'footer.support_hours': 'サポート時間',
    'footer.weekday_hours': '平日 10:00-18:00',
    'footer.address': '住所',
    'footer.tokyo_address': '〒100-0001 東京都千代田区1-1-1',
    'footer.social': 'SNS',
    
    // Feature Explanation (Top)
    'feature.title': 'ClimbHeroの使い方',
    'feature.step1.title': '1. 会員登録（無料）',
    'feature.step1.desc': '右上の「会員登録」からアカウントを作成',
    'feature.step2.title': '2. 動画を探す',
    'feature.step2.desc': 'カテゴリーやランキングから好きな動画を発見',
    'feature.step3.title': '3. いいねで応援',
    'feature.step3.desc': '無料会員は1回まで、プレミアム会員は無制限でいいね可能',
    'feature.step4.title': '4. 動画を投稿',
    'feature.step4.desc': 'プレミアム会員（$20/月）になると、1日30件まで投稿できます',
    'feature.free_trial': '15日間無料トライアル実施中！',
    'feature.upgrade': 'プレミアムにアップグレード',
    
    // Announcement Banner
    'announcement.latest': '最新のお知らせ',
    'announcement.view_all': 'すべて見る',
    
    // Company Info (Supervisor & Technical)
    'company.supervisor': '監修',
    'company.supervisor_name': 'クライミングジム プロジェクト',
    'company.supervisor_address': '〒224-0054 神奈川県横浜市都筑区佐江戸町417',
    'company.technical': 'テクニカルワーク',
    'company.technical_name': 'グッぼる ボルダリングCafe & Shop',
    'company.technical_address': '〒522-0063 滋賀県彦根市中央町3-8',
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
    'hero.subtitle': 'ClimbHero - Discover and share climbing videos from around the world',
    'hero.upload': 'Upload Video',
    'hero.premium_badge': 'Premium',
    
    // Section Headers
    'section.latest': 'Latest Videos',
    'section.bouldering': 'Bouldering',
    'section.lead': 'Lead Climbing',
    'section.alpine': 'Alpine Climbing',
    'section.other': 'Other',
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
    'pricing.title': 'Support Climbers with Premium',
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
    'admin.announcements': 'Announcements',
    'admin.stripe': 'Stripe Payment Settings',
    'admin.email': 'Email Campaigns',
    'admin.users': 'User Management',
    'admin.stats': 'Statistics',
    'admin.video_title': 'Title',
    'admin.video_category': 'Category',
    'admin.video_likes': 'Likes',
    'admin.video_views': 'Views',
    'admin.video_edit': 'Edit',
    'admin.video_delete': 'Delete',
    'admin.video_confirm_delete': 'Are you sure you want to delete this video?',
    'admin.announcement_title': 'Title',
    'admin.announcement_content': 'Content',
    'admin.announcement_priority': 'Priority',
    'admin.announcement_active': 'Active',
    'admin.announcement_inactive': 'Inactive',
    'admin.announcement_new': 'New Announcement',
    'admin.announcement_edit': 'Edit Announcement',
    'admin.announcement_delete': 'Delete',
    'admin.announcement_confirm_delete': 'Are you sure you want to delete this announcement?',
    
    // Announcements
    'announcement.title': 'Announcements',
    'announcement.no_announcements': 'No announcements',
    
    // Stripe Settings
    'stripe.title': 'Stripe Payment Settings',
    'stripe.public_key': 'Publishable Key',
    'stripe.secret_key': 'Secret Key',
    'stripe.webhook_secret': 'Webhook Secret',
    'stripe.save': 'Save Settings',
    'stripe.saved': 'Stripe settings saved successfully',
    'stripe.error': 'Failed to save Stripe settings',
    
    // Email Campaign
    'email.title': 'Email Newsletter',
    'email.new_campaign': 'New Campaign',
    'email.subject': 'Subject',
    'email.content': 'Content',
    'email.recipient_count': 'Recipients',
    'email.status': 'Status',
    'email.status_draft': 'Draft',
    'email.status_sending': 'Sending',
    'email.status_sent': 'Sent',
    'email.send': 'Send',
    'email.confirm_send': 'Send email to all users?',
    'email.sent_success': 'Email campaign started',
    'email.sent_error': 'Failed to send emails',
    'email.history': 'Campaign History',
    'email.sent_at': 'Sent At',
    
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
    
    // Annual Subscription
    'pricing.annual.title': 'Annual Plan',
    'pricing.annual.price': '$192',
    'pricing.annual.year': '/year',
    'pricing.annual.discount': '20% OFF',
    'pricing.annual.save': 'Save $48',
    'pricing.toggle.monthly': 'Monthly',
    'pricing.toggle.annual': 'Annual',
    
    // Posting Limits
    'posting.limit_title': 'Posting Limit',
    'posting.limit_today': 'Posts Today',
    'posting.limit_reached': 'Daily posting limit reached',
    'posting.limit_upgrade': 'Upgrade to Premium for 30 posts per day',
    'posting.remaining': '{count} remaining',
    
    // AI Validation
    'ai.validating': 'AI analyzing...',
    'ai.genre_detected': 'Genre: {genre}',
    'ai.confidence': 'Confidence: {score}%',
    'ai.authentic': '✓ Verified as climbing video',
    'ai.not_authentic': '⚠ Could not recognize as climbing video',
    'ai.duplicate': 'This video has already been posted',
    
    // Contests
    'contest.title': 'Contests',
    'contest.active': 'Active Contests',
    'contest.prize': 'Total Prize Pool',
    'contest.deadline': 'Submission Deadline',
    'contest.submit': 'Enter',
    'contest.vote': 'Vote',
    'contest.submissions': 'Entries',
    'contest.rules': 'Rules',
    'contest.prizes': 'Prizes',
    'contest.categories': 'Categories',
    'contest.pro': 'Professional',
    'contest.amateur': 'Amateur',
    'contest.submitted': 'Submitted',
    'contest.vote_success': 'Voted successfully!',
    'contest.already_voted': 'Already voted',
    
    // Safety Guidelines
    'safety.title': 'Safety Guidelines',
    'safety.filming': 'Filming Safety',
    'safety.gym_etiquette': 'Gym Etiquette',
    'safety.outdoor': 'Outdoor Precautions',
    'safety.download_pdf': 'Download PDF',
    'safety.version': 'Version',
    'safety.updated': 'Last Updated',
    
    // Partners
    'partner.title': 'Partner Gyms',
    'partner.gyms': 'Partner Gyms',
    'partner.count': 'Over {count} locations nationwide',
    'partner.filming_ok': 'Filming Allowed',
    'partner.map': 'Find on Map',
    'partner.prefecture': 'Prefecture',
    'partner.details': 'Details',
    'partner.website': 'Website',
    'partner.phone': 'Phone',
    'partner.address': 'Address',
    
    // Dashboard
    'dashboard.title': 'My Page',
    'dashboard.stats': 'Statistics',
    'dashboard.my_videos': 'My Videos',
    'dashboard.posting_history': 'Posting History',
    'dashboard.total_posts': 'Total Posts',
    'dashboard.approved': 'Approved',
    'dashboard.pending': 'Pending Review',
    
    // Footer Enhanced
    'footer.support_hours': 'Support Hours',
    'footer.weekday_hours': 'Weekdays 10:00-18:00',
    'footer.address': 'Address',
    'footer.tokyo_address': '〒100-0001 1-1-1 Chiyoda, Chiyoda-ku, Tokyo',
    'footer.social': 'Social Media',
    
    // Feature Explanation (Top)
    'feature.title': 'How to Use ClimbHero',
    'feature.step1.title': '1. Register (Free)',
    'feature.step1.desc': 'Create an account from "Sign Up" at the top right',
    'feature.step2.title': '2. Explore Videos',
    'feature.step2.desc': 'Discover videos by category or rankings',
    'feature.step3.title': '3. Like & Support',
    'feature.step3.desc': 'Free members: 3 likes, Premium: unlimited likes',
    'feature.step4.title': '4. Post Videos',
    'feature.step4.desc': 'Premium members ($20/month) can post up to 30 videos per day',
    'feature.free_trial': '15-day free trial available!',
    'feature.upgrade': 'Upgrade to Premium',
    
    // Announcement Banner
    'announcement.latest': 'Latest Announcements',
    'announcement.view_all': 'View All',
    
    // Company Info (Supervisor & Technical)
    'company.supervisor': 'Supervised by',
    'company.supervisor_name': 'Climbing Gym Project',
    'company.supervisor_address': '〒224-0054 417 Saedo-cho, Tsuzuki-ku, Yokohama, Kanagawa',
    'company.technical': 'Technical Work',
    'company.technical_name': 'Gubboru Bouldering Cafe & Shop',
    'company.technical_address': '〒522-0063 3-8 Chuo-cho, Hikone, Shiga',
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
