# Quick Deploy to Netlify - PowerShell Script
# This deploys your code directly to Netlify (no GitHub needed)

Write-Host "🚀 Building and deploying to Netlify..." -ForegroundColor Green

# Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Deploy to Netlify
Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Yellow
npx netlify-cli deploy --prod --dir=dist

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🎉 Your site is now live on Netlify!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed. Check errors above." -ForegroundColor Red
    Write-Host "💡 Make sure you're logged into Netlify: npx netlify-cli login" -ForegroundColor Yellow
}
