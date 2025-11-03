#!/bin/bash
# GenSpark Deployment Build Script
# ClimbHero - クライミング動画共有プラットフォーム

set -e  # Exit on error

echo "🚀 GenSpark Deployment Build Starting..."
echo ""

# 1. Clean previous build
echo "📦 Cleaning previous build..."
rm -rf dist/
echo "✓ Clean completed"
echo ""

# 2. Install dependencies
echo "📥 Installing dependencies..."
npm install --production=false
echo "✓ Dependencies installed"
echo ""

# 3. Build project
echo "🔨 Building project..."
npm run build
echo "✓ Build completed"
echo ""

# 4. Verify build output
echo "🔍 Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ Error: dist/ directory not found"
  exit 1
fi

if [ ! -f "dist/_worker.js" ]; then
  echo "❌ Error: dist/_worker.js not found"
  exit 1
fi

echo "✓ Build verification passed"
echo ""

# 5. Display build info
echo "📊 Build Information:"
echo "  - Output directory: dist/"
echo "  - Worker file: $(ls -lh dist/_worker.js | awk '{print $5}')"
echo "  - Static files: $(find dist/static -type f 2>/dev/null | wc -l) files"
echo "  - Total size: $(du -sh dist/ | awk '{print $1}')"
echo ""

echo "✅ GenSpark build completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Open GenSpark AI Developer"
echo "  2. Go to '公開' (Public) tab"
echo "  3. Click 'ウェブサイトを公開' (Publish Website) button"
echo ""
