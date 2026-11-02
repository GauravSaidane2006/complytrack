@echo off
echo ========================================
echo   ComplyTrack EXE Builder
echo ========================================
echo.

echo [1/4] Building client...
cd /d "%~dp0client"
call npm run build
if errorlevel 1 (
    echo Failed to build client
    pause
    exit /b 1
)

echo.
echo [2/4] Installing server production dependencies...
cd /d "%~dp0server"
call npm ci --omit=dev
if errorlevel 1 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Installing pkg...
call npx pkg --version >nul 2>&1
if errorlevel 1 (
    echo Installing pkg globally...
    call npm install -g pkg
    if errorlevel 1 (
        echo Failed to install pkg
        pause
        exit /b 1
    )
)

echo.
echo [4/4] Compiling launcher to EXE...
cd /d "%~dp0"
call npx pkg launcher.js --targets node18-win-x64 --output ComplyTrack.exe
if errorlevel 1 (
    echo Failed to compile EXE
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Your EXE is at: %~dp0ComplyTrack.exe
echo.
echo To distribute, copy these together:
echo   ComplyTrack.exe
echo   server\          (with node_modules)
echo   client\dist\     (built client)
echo.
echo User just double-clicks ComplyTrack.exe!
echo.
pause
