# Push Workflow Fixes to GitHub
# Repository: jackymac30-droid/RF-PRICING-PORTAL-2.0

Write-Host "Pushing Workflow Fixes to GitHub..." -ForegroundColor Green

# Try to find Git
$gitPath = $null
$possiblePaths = @(
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\git.exe",
    "git"
)

foreach ($path in $possiblePaths) {
    try {
        if ($path -eq "git") {
            $version = & git --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                $gitPath = "git"
                break
            }
        } else {
            if (Test-Path $path) {
                $version = & $path --version 2>$null
                if ($LASTEXITCODE -eq 0) {
                    $gitPath = $path
                    break
                }
            }
        }
    } catch {
        continue
    }
}

if (-not $gitPath) {
    Write-Host "Git not found. Please install Git or use GitHub Desktop." -ForegroundColor Red
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "1. Install Git: https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host "2. Use GitHub Desktop: https://desktop.github.com" -ForegroundColor Cyan
    Write-Host "3. Use VS Code Source Control panel" -ForegroundColor Cyan
    exit 1
}

Write-Host "Found Git: $gitPath" -ForegroundColor Green
Write-Host ""

# Check if we're in a git repo
$isRepo = & $gitPath rev-parse --git-dir 2>$null
if (-not $isRepo) {
    Write-Host "Not a git repository. Initializing..." -ForegroundColor Yellow
    & $gitPath init
}

# Check remote
$remote = & $gitPath remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    & $gitPath remote add origin https://github.com/jackymac30-droid/RF-PRICING-PORTAL-2.0.git
} else {
    Write-Host "Remote configured: $remote" -ForegroundColor Green
}

# Check status
Write-Host ""
Write-Host "Checking status..." -ForegroundColor Yellow
& $gitPath status --short

# Stage all changes
Write-Host ""
Write-Host "Staging all changes..." -ForegroundColor Yellow
& $gitPath add .

# Commit
Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = "FIXED WORKFLOW: All 9 items complete`n`n- Week creation -> email to suppliers`n- Pricing submit -> award volume opens`n- Close Pricing Tab button added`n- Volume plug and play working`n- Lock/unlock per SKU persists`n- Send allocation validates all SKUs locked`n- Supplier dashboard shows edit/revise`n- Final price and qty displayed per SKU`n- All 8 weeks visible, defaults to week 8`n`nProduction ready - Netlify auto-deploy enabled"

& $gitPath commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed. Check for errors above." -ForegroundColor Red
    exit 1
}

Write-Host "Committed successfully!" -ForegroundColor Green

# Push
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
& $gitPath push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Check Netlify -> Deploys tab" -ForegroundColor White
    Write-Host "2. Should see new deployment starting" -ForegroundColor White
    Write-Host "3. Wait 2-3 minutes for build to complete" -ForegroundColor White
    Write-Host "4. Site will update with all workflow fixes!" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Push failed. Possible issues:" -ForegroundColor Red
    Write-Host "- Authentication required (use GitHub Desktop or configure credentials)" -ForegroundColor Yellow
    Write-Host "- Branch name might be different (check with: git branch)" -ForegroundColor Yellow
    Write-Host "- Network issue - try again later" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tip: Use GitHub Desktop for easier authentication" -ForegroundColor Cyan
}
