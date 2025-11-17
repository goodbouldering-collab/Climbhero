# 動画プラットフォーム統合ガイド

## 📹 サポートされているプラットフォーム

ClimbHeroは以下の動画プラットフォームに完全対応しています：

| プラットフォーム | サムネイル | モーダル埋め込み | 外部リンク |
|------------------|-----------|-----------------|-----------|
| **YouTube** | ✅ 自動生成 | ✅ iframe | ✅ |
| **YouTube Shorts** | ✅ 自動生成 | ✅ iframe | ✅ |
| **TikTok** | ✅ フォールバック画像 | ✅ iframe | ✅ |
| **Instagram Reels** | ✅ フォールバック画像 | ✅ iframe | ✅ |
| **Vimeo** | ✅ フォールバック画像 | ✅ iframe | ✅ |

## 🎯 実装機能

### 1. サムネイル生成システム

**video-helpers.js** の `getVideoThumbnail()` 関数により、各プラットフォームに最適化されたサムネイルを提供：

```javascript
// YouTube: 最高品質のサムネイルを自動取得
https://i.ytimg.com/vi/{VIDEO_ID}/maxresdefault.jpg

// TikTok/Instagram/Vimeo: 高品質なフォールバック画像
// クライミング関連のUnsplash画像を使用
```

**フォールバック機能:**
- 画像読み込み失敗時に自動的にデフォルト画像に切り替え
- `onerror` 属性によるエラーハンドリング
- ユーザー体験の一貫性を保証

### 2. モーダル埋め込みシステム

**renderEnhancedVideoEmbed()** 関数により、各プラットフォームに最適化されたiframe埋め込み：

#### YouTube/YouTube Shorts
```html
<iframe src="https://www.youtube.com/embed/{VIDEO_ID}?autoplay=0&rel=0&modestbranding=1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen>
</iframe>
```

#### TikTok
```html
<iframe src="https://www.tiktok.com/embed/v2/{VIDEO_ID}"
        allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        style="width: 100%; height: 100%; border: none;">
</iframe>
```

#### Instagram Reels
```html
<iframe src="{REEL_URL}/embed"
        scrolling="no"
        style="width: 100%; height: 100%; border: none;">
</iframe>
```

#### Vimeo
```html
<iframe src="https://player.vimeo.com/video/{VIDEO_ID}?autoplay=0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen>
</iframe>
```

### 3. プラットフォームバッジ

各動画カードに視覚的なプラットフォーム識別子を表示：

- **YouTube**: 赤 (#FF0000) + YouTube アイコン
- **TikTok**: 黒 (#000000) + TikTok アイコン
- **Instagram**: ピンク (#E1306C) + Instagram アイコン
- **Vimeo**: シアン (#1AB7EA) + Vimeo アイコン

## 📊 本番環境のサンプルデータ

### YouTube動画（10本）
1. ヤンヤ・ガンブレット パリ2024で金メダル獲得｜完全リプレイ
2. ボルダリング決勝｜ソウル2024
3. 2024年ベストクライム
4. トレーニングルーティン ベータ解説
5. 3日間で学ぶボルダリング完全ガイド
6. リードクライミング フォール練習
7. アレックス・オノルド - エルキャピタンフリーソロ
8. マグナス・ミットボー V15ボルダリング挑戦
9. アダム・オンドラ 9c初登
10. クリス・シャルマ ディープウォーターソロ

### TikTok動画（5本）
16. スイスアルプスでのアルパインクライミング
17. 冬季アルパイン遠征
18. リードクライミングワールドカップ決勝
19. ボルダリング進化 2024-2025
20. キャンパスボードトレーニングセッション

### Instagram Reels（5本）
11. ABYSS - 北米最高峰のボルダリング
12. ホワイトスパイダー - ボルダリング入門動画
13. ラストセッション行こう！#climbing #bouldering
14. プーケット ロッククライミングアドベンチャー
15. バックカントリー 親子クライミング

### Vimeo動画（5本）
21. Arc'teryx Presents: Climbing Through
22. The Future of Climbing
23. Holcomb Climbing Trip | 2024
24. カリムノス スポートクライミング
25. カナディアンロッキー アイスクライミング

## 🔧 開発者向け情報

### video-helpers.js の主要関数

```javascript
// サムネイル取得
getVideoThumbnail(video) → 各プラットフォームに最適化されたサムネイルURL

// 埋め込みURL生成
getVideoEmbedUrl(video) → プラットフォーム固有の埋め込みURL

// 埋め込み可能性チェック
canEmbedVideo(video) → true/false

// 埋め込みHTML生成
renderEnhancedVideoEmbed(video) → 完全なiframe HTML

// プラットフォームメタ情報
getMediaIcon(mediaSource) → Font Awesomeアイコンクラス
getMediaName(mediaSource) → プラットフォーム表示名
getMediaColor(mediaSource) → ブランドカラー
getPlatformBadge(mediaSource) → バッジHTML
```

### app.js での使用方法

```javascript
// サムネイル表示（カード）
const thumbnailUrl = getVideoThumbnail(video);
<img src="${thumbnailUrl}" 
     onerror="this.src='https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop&q=80'">

// モーダル埋め込み
async function showVideoDetail(videoId) {
  const video = await fetchVideo(videoId);
  const embedHtml = renderEnhancedVideoEmbed(video);
  // モーダルに表示
}
```

## 🌐 本番環境URL

- **最新デプロイ**: https://fb4d2735.project-02ceb497.pages.dev
- **メインURL**: https://project-02ceb497.pages.dev

## 🎨 UIの特徴

### サムネイル表示
- **220px × 自動高さ**: コンパクトで統一されたデザイン
- **aspect-ratio**: 16:9を維持
- **ホバー効果**: 1.1倍拡大、シマーエフェクト
- **エラー処理**: onerrorでフォールバック画像に自動切り替え

### モーダル埋め込み
- **aspect-video**: 16:9の完璧なレスポンシブレイアウト
- **最大幅**: 4xl（896px）
- **フルスクリーン対応**: allowfullscreen属性
- **プラットフォーム最適化**: 各プラットフォーム固有の属性設定

### プラットフォームバッジ
- **左上配置**: サムネイル上に重ねて表示
- **半透明背景**: rgba(0, 0, 0, 0.7)
- **アイコン + テキスト**: Font Awesome + プラットフォーム名
- **レスポンシブ**: モバイルでも視認性良好

## ✅ 動作確認項目

### トップページ
- [ ] YouTube動画のサムネイルが表示される
- [ ] TikTok動画にフォールバック画像が表示される
- [ ] Instagram動画にフォールバック画像が表示される
- [ ] Vimeo動画にフォールバック画像が表示される
- [ ] 各動画にプラットフォームバッジが表示される

### 動画カード
- [ ] ホバー時にサムネイルが拡大する
- [ ] メディアソースアイコンが表示される
- [ ] いいね・お気に入りボタンが機能する

### 動画モーダル
- [ ] YouTube動画がiframeで再生される
- [ ] TikTok動画がiframeで再生される
- [ ] Instagram Reelsがiframeで再生される
- [ ] Vimeo動画がiframeで再生される
- [ ] 外部リンクボタンが正しく動作する（必要な場合）

### エラーハンドリング
- [ ] サムネイル読み込み失敗時にフォールバック画像が表示される
- [ ] 無効なURLでもエラーメッセージが表示される
- [ ] モーダルが正常に閉じる

## 🚀 今後の改善案

1. **サムネイル生成の強化**
   - TikTok API統合（認証が必要）
   - Instagram Graph API統合（認証が必要）
   - Vimeo API統合（無料プランで可能）

2. **埋め込みの最適化**
   - 遅延読み込み（Lazy Loading）
   - プレースホルダー画像の表示
   - 読み込み中のスピナー表示

3. **アナリティクス**
   - 動画再生回数のトラッキング
   - プラットフォーム別の視聴統計
   - ユーザーエンゲージメント分析

## 📝 注意事項

### TikTok
- 埋め込みは動作するが、一部の動画で制限がある可能性
- モバイルでの表示が最適化されている

### Instagram
- Reels URLは `/reel/` パスを含む必要がある
- 通常の投稿（/p/）は別途対応が必要

### Vimeo
- プライバシー設定により埋め込みが制限される場合がある
- プレミアムアカウントの動画は追加設定が必要な場合がある

## 🔗 関連ファイル

- **video-helpers.js**: 動画プラットフォームヘルパー関数
- **app.js**: メインアプリケーションロジック
- **src/index.tsx**: バックエンドAPI
- **seed.sql**: サンプルデータ（25本の動画）

---

**最終更新**: 2025-11-17
**作成者**: ClimbHero開発チーム
