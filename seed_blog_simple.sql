-- ============================================
-- Blog Posts Sample Data (5 posts - Simple Version)
-- ============================================

-- Clear existing blog posts
DELETE FROM blog_posts WHERE id BETWEEN 1 AND 5;

-- Blog Post 1
INSERT INTO blog_posts (
  id, title, title_en, title_zh, title_ko,
  content, content_en, content_zh, content_ko,
  image_url, published_date, slug, genre
) VALUES (
  1,
  'クライミングジム10施設と新規提携！全国200箇所以上で動画撮影が可能に',
  'New Partnership with 10 Climbing Gyms! Over 200 Locations Nationwide',
  '与10家攀岩馆建立新合作！全国200多个地点',
  '클라이밍 짐 10개 시설과 신규 제휴! 전국 200곳',
  '# 全国のクライマーに朗報です！

ClimbHeroは、新たに**10施設のクライミングジム**と提携契約を締結しました。提携ジムは全国で**200箇所以上**に拡大しました。

## 提携ジムの特典

- **撮影機材の無料レンタル**：GoPro、三脚、照明機材など
- **専用撮影エリア**：他の利用者の邪魔にならない専用スペース
- **プロカメラマンのアドバイス**：構図や照明の相談が可能

全国のクライマーの皆様、ぜひご利用ください！',
  'Great news! ClimbHero has partnered with 10 new gyms, expanding to over 200 locations nationwide. Free equipment rental, dedicated recording areas, and professional advice available!',
  '好消息！ClimbHero与10家新攀岩馆合作，全国扩展到200多个地点。免费设备租赁、专用录制区域和专业建议！',
  '좋은 소식! ClimbHero가 10개 새 짐과 파트너십을 맺어 전국 200개 이상 위치로 확장했습니다!',
  'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=1200&h=600&fit=crop&q=80',
  '2024-11-15',
  'gym-partnership-expansion',
  'partnership'
);

-- Blog Post 2
INSERT INTO blog_posts (
  id, title, title_en, title_zh, title_ko,
  content, content_en, content_zh, content_ko,
  image_url, published_date, slug, genre
) VALUES (
  2,
  '第1回クライミング動画コンテスト開催！賞金総額$10,000',
  'First Climbing Video Contest! Total Prize $10,000',
  '首届攀岩视频大赛！总奖金$10,000',
  '제1회 클라이밍 영상 콘테스트! 총 상금 $10,000',
  '# 史上最大級のクライミング動画コンテスト！

賞金総額**$10,000**のクライミング動画コンテストを開催します！

## 応募部門

- 🏆 **ベストクライミング部門**（$5,000）
- 🎬 **ベスト編集部門**（$3,000）
- 😂 **ベストエンターテイメント部門**（$2,000）

## 応募方法

1. ClimbHeroに動画をアップロード
2. ハッシュタグ **#ClimbHeroContest2024** を付ける
3. 応募フォームから登録

応募期間：2024年12月1日〜2025年1月31日

皆様の素晴らしい作品をお待ちしています！',
  'Biggest climbing video contest ever! $10,000 prize pool. Three categories: Best Climbing ($5,000), Best Editing ($3,000), Best Entertainment ($2,000). Entry period: Dec 1, 2024 - Jan 31, 2025.',
  '有史以来最大的攀岩视频比赛！$10,000奖金池。三个类别：最佳攀岩、最佳编辑、最佳娱乐。',
  '역대 최대 클라이밍 비디오 콘테스트! $10,000 상금. 세 가지 카테고리!',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&h=600&fit=crop&q=80',
  '2024-11-10',
  'video-contest-2024',
  'event'
);

-- Blog Post 3
INSERT INTO blog_posts (
  id, title, title_en, title_zh, title_ko,
  content, content_en, content_zh, content_ko,
  image_url, published_date, slug, genre
) VALUES (
  3,
  'クライマー向け安全な撮影ガイドラインを公開',
  'Safety Guidelines for Climbing Videography Released',
  '发布攀岩视频拍摄安全指南',
  '클라이밍 촬영 안전 가이드라인 발표',
  '# 安全第一！クライミング撮影の新ガイドライン

日本山岳協会と共同で**安全ガイドライン**を策定しました。

## 基本原則

1. **セーフティファースト**：撮影よりも安全を優先
2. **周囲への配慮**：他のクライマーの邪魔にならない
3. **機材の安全管理**：カメラは必ず固定する

## 推奨機材

- GoPro HERO 12 Black
- DJI Osmo Action 4
- Manfrotto 三脚

詳細なガイドラインは公式サイトでPDFをダウンロードできます。',
  'Safety first! New guidelines for climbing videography. Three principles: Safety first, consideration for others, secure equipment. Recommended gear: GoPro HERO 12, DJI Osmo Action 4.',
  '安全第一！攀岩视频拍摄新指南。三个原则：安全第一、考虑他人、固定设备。',
  '안전 제일! 클라이밍 촬영 새 가이드라인. 세 가지 원칙: 안전 우선, 타인 배려, 장비 고정.',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop&q=80',
  '2024-11-05',
  'safety-guidelines',
  'guide'
);

-- Blog Post 4
INSERT INTO blog_posts (
  id, title, title_en, title_zh, title_ko,
  content, content_en, content_zh, content_ko,
  image_url, published_date, slug, genre
) VALUES (
  4,
  'プレミアム会員限定：AI自動グレード検出機能をリリース',
  'Premium Exclusive: AI Auto Grade Detection Released',
  '高级会员专属：AI自动难度检测发布',
  '프리미엄 회원 전용: AI 자동 등급 감지 출시',
  '# 革新的なAI技術でグレード判定が可能に！

プレミアム会員向けに**AI自動グレード検出機能**をリリースしました。

## 機能概要

- **ボルダリング**：V0〜V17まで対応
- **リードクライミング**：5.5〜5.15dまで対応
- **推定精度**：85%以上

## 使用方法

1. プレミアムプランに登録
2. 動画をアップロード
3. 「AIグレード分析」ボタンをタップ
4. 約30秒で結果を表示

プレミアム会員の方は今すぐお試しください！',
  'Revolutionary AI technology for grade detection! Premium members can now auto-detect grades: Bouldering V0-V17, Lead 5.5-5.15d. Accuracy over 85%!',
  '革命性AI技术用于难度检测！高级会员现可自动检测难度：抱石V0-V17，先锋5.5-5.15d。',
  '혁신적인 AI 기술로 등급 감지! 프리미엄 회원은 이제 자동 등급 감지 가능!',
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=600&fit=crop&q=80',
  '2024-11-01',
  'ai-grade-detection',
  'feature'
);

-- Blog Post 5
INSERT INTO blog_posts (
  id, title, title_en, title_zh, title_ko,
  content, content_en, content_zh, content_ko,
  image_url, published_date, slug, genre
) VALUES (
  5,
  'ClimbHero、動画投稿数10,000本を突破！',
  'ClimbHero Reaches 10,000 Video Uploads!',
  'ClimbHero视频上传数突破10,000！',
  'ClimbHero 동영상 업로드 10,000개 돌파!',
  '# コミュニティの成長に感謝！

サービス開始から1年で**動画投稿数10,000本**を達成しました！

## 統計データ

- **登録ユーザー数**：25,000人以上
- **月間アクティブユーザー**：18,000人
- **総視聴回数**：500万回以上

## 記念キャンペーン

10,000本突破を記念して特別キャンペーンを実施！

### 🎁 プレミアム会員3ヶ月無料
- 期間：2024年10月28日〜11月30日
- コード：**CLIMB10K**

これからもClimbHeroをよろしくお願いします！',
  'Thank you for our growth! Reached 10,000 video uploads in one year! 25,000+ users, 18,000 monthly active, 5 million+ views. Special campaign: 3 months premium free with code CLIMB10K!',
  '感谢我们的成长！一年内达到10,000个视频上传！25,000+用户，18,000月活，500万+观看。',
  '성장에 감사! 1년 만에 10,000개 비디오 업로드 달성! 25,000+ 사용자!',
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&h=600&fit=crop&q=80',
  '2024-10-28',
  '10000-milestone',
  'milestone'
);

-- ============================================
-- Update videos table with realistic view counts
-- ============================================
UPDATE videos SET views = views + 250, likes = likes + 10 WHERE id BETWEEN 1 AND 5;
UPDATE videos SET views = views + 150, likes = likes + 5 WHERE id BETWEEN 6 AND 10;
UPDATE videos SET views = views + 100, likes = likes + 3 WHERE id BETWEEN 11 AND 15;
