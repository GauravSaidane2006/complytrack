param(
    [switch]$Clean
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootDir = $scriptDir

Write-Host "Building ComplyTrack Desktop App..." -ForegroundColor Cyan
Write-Host "Root directory: $rootDir" -ForegroundColor Gray

if ($Clean) {
    Write-Host "[0/5] Cleaning previous builds..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "$rootDir\server\node_modules" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force "$rootDir\client\node_modules" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force "$rootDir\client\dist" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force "$rootDir\complytrack-desktop\node_modules" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force "$rootDir\complytrack-desktop\dist" -ErrorAction SilentlyContinue
}

Write-Host "[1/5] Installing server dependencies..." -ForegroundColor Green
Set-Location "$rootDir\server"
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to install server dependencies"; exit 1 }

Write-Host "[2/5] Installing client dependencies..." -ForegroundColor Green
Set-Location "$rootDir\client"
npm ci
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to install client dependencies"; exit 1 }

Write-Host "[3/5] Building client..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to build client"; exit 1 }

Write-Host "[4/5] Installing desktop app dependencies..." -ForegroundColor Green
Set-Location "$rootDir\complytrack-desktop"
npm ci
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to install desktop dependencies"; exit 1 }

Write-Host "[5/5] Building Windows installer..." -ForegroundColor Green
npm run build:win
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to build installer"; exit 1 }

Write-Host "`nBuild complete! Installer is in complytrack-desktop/dist/" -ForegroundColor Cyan