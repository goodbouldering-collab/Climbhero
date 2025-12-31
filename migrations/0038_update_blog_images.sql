-- Migration: Update blog post images with AI-generated headers and inline images
-- Created: 2025-12-31

-- Update マルチピッチクライミング完全ガイド
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/3gqfmrP7?cache_control=3600',
  content = '<h2>はじめに</h2>
<p>マルチピッチクライミングは、複数のピッチに分かれた長いルートを登攀する技術です。30年の経験を活かし、安全で楽しいマルチピッチの世界をご紹介します。</p>
<img src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&h=600&fit=crop" alt="マルチピッチクライミングの様子" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>必要な装備</h2>
<p>ダブルロープ、ヘルメット、十分な数のクイックドロー、ビレイデバイス、ハーネス、スリング各種。装備の選び方から使い方まで詳しく解説。</p>
<img src="https://images.unsplash.com/photo-1609336803104-a83e1662f8c0?w=1200&h=600&fit=crop" alt="クライミング装備" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>基本技術</h2>
<p>リードとフォロー、確保点の作り方、ロープワーク、コミュニケーション方法など、マルチピッチに必須の技術を習得しましょう。</p>
<h2>リスク管理</h2>
<p>天候判断、ルートファインディング、エスケープルートの確保、緊急時の対応など、安全登山のために知っておくべきことを詳しく説明します。</p>'
WHERE slug = 'multipitch-climbing-guide';

-- Update ボルダリングV難度完全攻略法
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/zF2tRL3M?cache_control=3600',
  content = '<h2>V難度システムとは</h2>
<p>V0からV17まで、世界標準のボルダリンググレードシステムを詳しく解説。Hueco Tanksで生まれたこのシステムは、現在世界中で使用されています。</p>
<img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop" alt="ボルダリングジムの様子" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>各グレードの特徴</h2>
<p>V0-V3: 初心者向け、基本ムーブの習得。V4-V7: 中級者、体力と技術のバランス。V8-V11: 上級者、専門的なトレーニング必須。V12以上: エリートレベル、世界トップの技術。</p>
<img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=600&fit=crop" alt="ボルダリング課題" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>グレード突破のコツ</h2>
<p>30年のクライミング経験から、各グレードを突破するための具体的なトレーニング方法、栄養管理、メンタルアプローチを科学的データに基づいて解説します。</p>
<h2>グッぼるの課題設定</h2>
<p>当ジムでは全課題を独自の管理システムで運用し、登攀データを蓄積・分析。年間2.5万人の利用者データから、最適な課題進行ルートをご提案します。</p>'
WHERE slug = 'v-grade-complete-guide';

-- Update クライミングと環境保全活動
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/l7oq07Lb?cache_control=3600',
  content = '<h2>プロギングとは</h2>
<p>ランニングとゴミ拾いを組み合わせた環境保全活動。スウェーデン発祥のこの活動を、クライミングエリアでも実践しています。</p>
<img src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200&h=600&fit=crop" alt="プロギング活動" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>プロギングジャパンの活動</h2>
<p>副会長として年間30回超のイベントをプロデュース。スターバックス等と協業し、参加者延べ4,000人。廃プラスチック回収量は年間2.4トンに達しました。</p>
<img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=600&fit=crop" alt="環境保全活動" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>クライミングエリアの保全</h2>
<p>美しい岩場を次世代に残すため、Leave No Traceの原則を守り、定期的な清掃活動を実施。地域住民との協力関係構築も重要です。</p>
<h2>SDGsとクライミング</h2>
<p>持続可能な開発目標(SDGs)の視点から、クライミングコミュニティができる環境保全活動を具体的に提案します。</p>'
WHERE slug = 'climbing-and-environment';

-- Update クライミングジム選びのポイント
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/k5lEsVrM?cache_control=3600',
  content = '<h2>立地とアクセス</h2>
<p>通いやすさは継続の鍵。駅からの距離、駐車場の有無、営業時間を確認しましょう。定期的に通える環境が上達への近道です。</p>
<img src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&h=600&fit=crop" alt="クライミングジムの内観" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>設備と課題の質</h2>
<p>壁の種類（垂壁、スラブ、ルーフ）、ホールドの更新頻度、課題設定者のレベルをチェック。グッぼるでは独自の課題管理システムで常に新鮮な課題を提供しています。</p>
<img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop" alt="ボルダリング壁" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>コミュニティの雰囲気</h2>
<p>初心者に優しいか、上級者向けの課題も充実しているか。スタッフの対応、利用者層の多様性も重要なポイントです。</p>
<h2>付帯サービス</h2>
<p>カフェ併設、ショップの品揃え、シャワー設備など。14施設の立ち上げ経験から、本当に価値あるサービスをお伝えします。グッぼるでは年間2.5万人が利用する総合施設を運営しています。</p>'
WHERE slug = 'choosing-climbing-gym';

-- Update 2024年最新クライミングシューズレビュー
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/kVRc1D8G?cache_control=3600',
  content = '<h2>シューズ選びの基本</h2>
<p>足型（エジプト型、ギリシャ型、スクエア型）、登るスタイル（フェイス、カチ、スメア）、グレードに応じた最適なシューズ選びを解説。</p>
<img src="https://images.unsplash.com/photo-1606112219348-204989d2e98e?w=1200&h=600&fit=crop" alt="クライミングシューズ" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>2024年注目モデル</h2>
<p>La Sportiva Solution: 精密な足裏感覚でV12+に対応。Scarpa Instinct VS: 抜群のエッジング性能。Five Ten Hiangle: オールラウンダーの決定版。各モデルの詳細データを公開。</p>
<img src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&h=600&fit=crop" alt="シューズラインナップ" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px 0;">
<h2>グッぼるショップの強み</h2>
<p>常時120モデル在庫、試履き→ジムで試登まで一気通貫。LINE接客→EC→店頭の seamlessな購入体験を提供しています。</p>
<h2>足型別おすすめシューズ</h2>
<p>30年の経験とショップ運営で蓄積した膨大なフィッティングデータから、あなたの足型に最適なシューズをご提案します。</p>'
WHERE slug = 'shoes-review-2024';
