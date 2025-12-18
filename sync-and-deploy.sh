#!/bin/bash
# ClimbHero - Sync and Deploy Helper Script
# GitHubとサンドボックスの同期を保ち、デプロイを自動化

set -e

echo "🔄 ClimbHero Sync & Deploy"
echo "=========================="
echo ""

# 1. Git Status Check
echo "📊 Git Status:"
git status --short
echo ""

# 2. Commit if changes exist
if [[ -n $(git status --porcelain) ]]; then
  echo "📝 Uncommitted changes detected"
  read -p "Commit message: " commit_msg
  git add .
  git commit -m "$commit_msg"
  echo "✅ Changes committed"
else
  echo "✅ No uncommitted changes"
fi
echo ""

# 3. Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main
echo "✅ Pushed to GitHub"
echo ""

# 4. Build
echo "🏗️ Building project..."
npm run build
echo "✅ Build complete"
echo ""

# 5. Deploy to Cloudflare
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name project-02ceb497 | tee /tmp/deploy-output.txt
echo ""

# 6. Extract and display deployment URL
DEPLOY_URL=$(grep -oP 'https://[a-z0-9]+\.project-02ceb497\.pages\.dev' /tmp/deploy-output.txt | tail -1)
echo "=========================="
echo "✅ Deployment Complete!"
echo "=========================="
echo ""
echo "📍 Production URL: https://project-02ceb497.pages.dev"
echo "📍 Latest Deploy: $DEPLOY_URL"
echo "📍 GitHub Repo: https://github.com/goodbouldering-collab/Climbhero"
echo "📍 Sandbox Dev: https://3000-ihff41104hfhdqarv2j1z-de59bda9.sandbox.novita.ai"
echo ""

# 7. Update PROJECT_INFO.md
sed -i "s|- \*\*最新デプロイ\*\*:.*|- **最新デプロイ**: $DEPLOY_URL|" PROJECT_INFO.md
sed -i "s|最終更新:.*|最終更新: $(date '+%Y-%m-%d %H:%M:%S')|" PROJECT_INFO.md
git add PROJECT_INFO.md
git commit -m "Update deployment URL in PROJECT_INFO.md" || true
git push origin main || true

echo "📄 PROJECT_INFO.md updated with latest URL"
echo ""
