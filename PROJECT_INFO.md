# ClimbHero - プロジェクト情報

## 📋 基本情報
- **プロジェクトタイトル**: ClimbHero - クライミング動画共有プラットフォーム
- **コードネーム**: webapp
- **Cloudflareプロジェクト名**: project-02ceb497

## 🌐 デプロイURL

### 本番環境
- **メインURL**: https://project-02ceb497.pages.dev
- **最新デプロイ**: https://ec8ad569.project-02ceb497.pages.dev
- **GitHubリポジトリ**: https://github.com/goodbouldering-collab/Climbhero

### サンドボックス環境
- **開発サーバー**: https://3000-ihff41104hfhdqarv2j1z-de59bda9.sandbox.novita.ai

## 📝 重要な注意事項

### タイトル管理
- プロジェクトタイトルは `meta_info` で管理
- Gensparkの有料機能切れに影響されません
- 変更方法: `meta_info(action="write", key="project_title", value="新しいタイトル")`

### GitHub同期
- ローカル変更は必ず `git push origin main` でGitHubに反映
- デプロイ前に必ずGitHubと同期を確認
- サンドボックスとGitHubのズレを防ぐため、常に最新状態を保つ

### デプロイフロー
1. ローカルで開発・テスト
2. `git add . && git commit -m "message"`
3. `git push origin main` (GitHubに反映)
4. `npm run build`
5. `npx wrangler pages deploy dist --project-name project-02ceb497`
6. デプロイURL確認

## 🔗 最新URL（自動更新）
最終更新: $(date '+%Y-%m-%d %H:%M:%S')

