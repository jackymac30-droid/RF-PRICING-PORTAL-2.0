#!/bin/bash

echo "🚀 Publishing to GitHub..."
echo ""

# Build the project first
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors and try again."
    exit 1
fi

echo ""
echo "✅ Build complete!"
echo ""

# Add all changes
echo "📝 Staging all changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit."
else
    # Commit with timestamp
    echo "💾 Committing changes..."
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Push to GitHub
    echo "📤 Pushing to GitHub..."
    git push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🌐 Netlify will automatically deploy in 2-3 minutes"
        echo "   Check: https://app.netlify.com"
    else
        echo ""
        echo "❌ Failed to push. Check your git configuration."
        exit 1
    fi
fi

echo ""
echo "✨ Done! Your changes will be live on Netlify shortly."

