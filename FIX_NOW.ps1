# ONE-STOP FIX SCRIPT (PowerShell) — Run this to make app demo-ready

Write-Host "🚀 ONE-STOP FIX — Making app demo-ready..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating template..." -ForegroundColor Yellow
    @"
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DEV_MODE=true
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ Created .env template. Please fill in your Supabase credentials!" -ForegroundColor Green
    Write-Host ""
}

# Step 2: Check if demo-magic-button.ts has keys
$demoFile = Get-Content demo-magic-button.ts -Raw
if ($demoFile -match "YOUR-SERVICE-ROLE-KEY-HERE" -or $demoFile -match "YOUR-SUPABASE-URL-HERE") {
    Write-Host "⚠️  demo-magic-button.ts needs your Supabase keys!" -ForegroundColor Yellow
    Write-Host "   Open demo-magic-button.ts and replace:"
    Write-Host "   - SERVICE_ROLE_KEY with your service role key"
    Write-Host "   - SUPABASE_URL with your Supabase URL"
    Write-Host ""
    Read-Host "Press Enter after you've updated demo-magic-button.ts"
}

# Step 3: Run seed script
Write-Host "📦 Step 1: Seeding database..." -ForegroundColor Cyan
npx tsx demo-magic-button.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Seed failed. Check your Supabase keys in demo-magic-button.ts" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Step 2: Verifying environment variables..." -ForegroundColor Cyan
$envContent = Get-Content .env -Raw
if ($envContent -match "your-project" -or $envContent -match "your-anon-key") {
    Write-Host "⚠️  .env file has placeholder values. Please update with real credentials!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file looks good" -ForegroundColor Green
}

Write-Host ""
Write-Host "🌐 Step 3: Building app..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Check for errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ ONE-STOP FIX COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Hard refresh browser: Ctrl+Shift+R"
Write-Host "2. Check console for: 'Fetched ALL weeks: [1,2,3,4,5,6,7,8]'"
Write-Host "3. Verify all 8 weeks show in dropdown"
Write-Host "4. Test login and navigation"
Write-Host ""
Write-Host "🚀 App should now be demo-ready!" -ForegroundColor Green
