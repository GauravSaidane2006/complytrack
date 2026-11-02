@echo off
echo Building ComplyTrack Desktop App...
echo.

echo [1/5] Installing server dependencies...
cd ..\server
npm ci --omit=dev
if errorlevel 1 (
    echo Failed to install server dependencies
    exit /b 1
)

echo [2/5] Installing client dependencies...
cd ..\client
npm ci
if errorlevel 1 (
    echo Failed to install client dependencies
    exit /b 1
)

echo [3/5] Building client...
npm run build
if errorlevel 1 (
    echo Failed to build client
    exit /b 1
)

echo [4/5] Installing desktop app dependencies...
cd ..\complytrack-desktop
npm ci
if errorlevel 1 (
    echo Failed to install desktop dependencies
    exit /b 1
)

echo [5/5] Building Windows installer...
npm run build:win
if errorlevel 1 (
    echo Failed to build installer
    exit /b 1
)

echo.
echo Build complete! Installer is in complytrack-desktop/dist/