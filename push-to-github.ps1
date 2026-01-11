# Push to GitHub - PowerShell Script
$REPO_URL = "https://github.com/jackymac30-droid/RF-PRICING-PORTAL-2.0.git"

Write-Host "Pushing changes to GitHub..." -ForegroundColor Cyan
Write-Host "Repository: $REPO_URL" -ForegroundColor Gray
Write-Host ""

# Try to find git.exe in common locations
$gitPaths = @(
    "git",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "${env:ProgramFiles}\Git\bin\git.exe",
    "${env:ProgramFiles(x86)}\Git\bin\git.exe"
)

$gitCmd = $null
foreach ($path in $gitPaths) {
    try {
        if ($path -eq "git") {
            $null = Get-Command git -ErrorAction Stop
            $gitCmd = "git"
            break
        } elseif (Test-Path $path) {
            $gitCmd = $path
            break
        }
    } catch {
        continue
    }
}

if (-not $gitCmd) {
    Write-Host "ERROR: Git is not installed or not in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart Cursor and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can use GitHub Desktop or the GitHub web interface to commit and push changes." -ForegroundColor Yellow
    exit 1
}

Write-Host "Git found: $gitCmd" -ForegroundColor Green
Write-Host ""

# Check if .git directory exists
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Cyan
    & $gitCmd init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to initialize git repository" -ForegroundColor Red
        exit 1
    }
    Write-Host "Repository initialized" -ForegroundColor Green
    Write-Host ""
}

# Check git config
Write-Host "Checking Git configuration..." -ForegroundColor Cyan
$userName = & $gitCmd config user.name 2>$null
$userEmail = & $gitCmd config user.email 2>$null

if (-not $userName -or -not $userEmail) {
    Write-Host "WARNING: Git user configuration is missing" -ForegroundColor Yellow
    Write-Host "Setting default values..." -ForegroundColor Gray
    if (-not $userName) {
        & $gitCmd config user.name "RF Pricing Dashboard"
    }
    if (-not $userEmail) {
        & $gitCmd config user.email "rf-pricing@example.com"
    }
    Write-Host "Git configuration updated" -ForegroundColor Green
    Write-Host ""
}

# Check if remote exists
Write-Host "Checking remote repository..." -ForegroundColor Cyan
$remoteExists = & $gitCmd remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Adding remote repository..." -ForegroundColor Gray
    & $gitCmd remote add origin $REPO_URL
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to add remote repository" -ForegroundColor Red
        exit 1
    }
    Write-Host "Remote added" -ForegroundColor Green
} else {
    Write-Host "Remote already configured: $remoteExists" -ForegroundColor Green
}
Write-Host ""

# Stage all changes
Write-Host "Staging changes..." -ForegroundColor Cyan
& $gitCmd add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to stage changes" -ForegroundColor Red
    exit 1
}
Write-Host "Changes staged" -ForegroundColor Green
Write-Host ""

# Check if there are changes to commit
$status = & $gitCmd status --porcelain 2>$null
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "INFO: No changes to commit" -ForegroundColor Yellow
    Write-Host "Everything is up to date!" -ForegroundColor Gray
    exit 0
}

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Cyan
$commitMessage = @"
Fix: Critical supplier response handling and validation issues

- CRITICAL #1: Added missing UI buttons in Allocation exceptions mode (Accept Response, Revise Offer)
- CRITICAL #2: Fixed updateAllocation to sync offered_volume when accepting supplier responses
- CRITICAL #3: Verified Allocation filtering logic matches closeVolumeLoop validation
- CRITICAL #4: Added explicit data integrity check in closeVolumeLoop for supplier_volume_accepted existence

All 4 critical issues from audit fixed. Build passing.
"@

& $gitCmd commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to commit changes" -ForegroundColor Red
    Write-Host "   This might be because there are no changes, or git is not configured." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Changes committed" -ForegroundColor Green
Write-Host ""

# Determine current branch
$currentBranch = & $gitCmd branch --show-current 2>$null
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    $currentBranch = "main"
    Write-Host "Creating main branch..." -ForegroundColor Cyan
    & $gitCmd branch -M main 2>$null
}
Write-Host "Current branch: $currentBranch" -ForegroundColor Gray
Write-Host ""

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "This may require authentication..." -ForegroundColor Yellow
Write-Host ""

& $gitCmd push -u origin $currentBranch 2>&1
$pushExitCode = $LASTEXITCODE

if ($pushExitCode -eq 0) {
    Write-Host ""
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "View repository: https://github.com/jackymac30-droid/RF-PRICING-PORTAL-2.0" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "ERROR: Push failed. Common issues:" -ForegroundColor Red
    Write-Host "   1. Authentication required:" -ForegroundColor Yellow
    Write-Host "      - Use GitHub Desktop for easy authentication" -ForegroundColor Gray
    Write-Host "      - Or use GitHub CLI: gh auth login" -ForegroundColor Gray
    Write-Host "      - Or use Personal Access Token in URL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Repository doesn't exist or you don't have access" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   3. Network connectivity issues" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "TIP: Use GitHub Desktop or GitHub web interface to push changes" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "All done!" -ForegroundColor Green
