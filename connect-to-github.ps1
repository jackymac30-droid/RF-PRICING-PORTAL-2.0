# Connect Cursor to GitHub
$REPO_URL = "https://github.com/jackymac30-droid/RF-PRICING-PORTAL-2.0.git"

Write-Host "🔗 Connecting Cursor to GitHub" -ForegroundColor Cyan
Write-Host "Repository: $REPO_URL" -ForegroundColor Gray
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart Cursor and run this script again." -ForegroundColor Yellow
    exit 1
}

# Initialize git if needed
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Cyan
    git init
    Write-Host "✅ Repository initialized" -ForegroundColor Green
}

# Check git config
Write-Host ""
Write-Host "📋 Checking Git configuration..." -ForegroundColor Cyan
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName) {
    Write-Host "⚠️  Git user.name is not set" -ForegroundColor Yellow
    Write-Host "   You'll need to set it with: git config --global user.name 'Your Name'" -ForegroundColor Gray
}

if (-not $userEmail) {
    Write-Host "⚠️  Git user.email is not set" -ForegroundColor Yellow
    Write-Host "   You'll need to set it with: git config --global user.email 'your.email@example.com'" -ForegroundColor Gray
}

# Add remote
Write-Host ""
Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $REPO_URL
Write-Host "✅ Remote added!" -ForegroundColor Green

# Show remote status
Write-Host ""
Write-Host "📡 Remote Configuration:" -ForegroundColor Cyan
git remote -v
Write-Host ""

# Stage all files
Write-Host "➕ Staging all files..." -ForegroundColor Cyan
git add .
Write-Host "✅ Files staged" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "💾 Creating commit..." -ForegroundColor Cyan
$commitMessage = @"
Initial commit: RF Pricing Dashboard with enhanced Predictive Analytics

- AI-powered price predictions with interactive trend charts
- Summary statistics dashboard
- Filtering and sorting capabilities
- Confidence gauges and expandable forecast details
- Complete historical data integration
- Enhanced UI/UX with dark theme
"@

git commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Commit may have failed or nothing to commit" -ForegroundColor Yellow
}
Write-Host ""

# Set branch to main
Write-Host "🌿 Setting branch to main..." -ForegroundColor Cyan
git branch -M main
Write-Host ""

# Instructions for push
Write-Host "📤 Ready to push to GitHub!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To push, you'll need to authenticate:" -ForegroundColor Yellow
Write-Host "  1. Get a Personal Access Token from:" -ForegroundColor White
Write-Host "     https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "  2. Generate new token (classic) with 'repo' scope" -ForegroundColor White
Write-Host "  3. Then run one of these:" -ForegroundColor White
Write-Host ""
Write-Host "     Option A - Use token directly:" -ForegroundColor Green
Write-Host "     git push https://YOUR_TOKEN@github.com/jackymac30-droid/RF-PRICING-PORTAL-2.0.git main" -ForegroundColor Gray
Write-Host ""
Write-Host "     Option B - Use GitHub CLI (if installed):" -ForegroundColor Green
Write-Host "     gh auth login" -ForegroundColor Gray
Write-Host "     git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "     Option C - Use Git Credential Manager:" -ForegroundColor Green
Write-Host "     git push -u origin main" -ForegroundColor Gray
Write-Host "     (Windows will prompt for credentials)" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Repository URL: https://github.com/jackymac30-droid/RF-PRICING-PORTAL-2.0" -ForegroundColor Cyan