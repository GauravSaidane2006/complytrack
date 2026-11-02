@echo off
echo ========================================
echo   ComplyTrack - Ship to Client
echo ========================================
echo.

set /p CLIENT_NAME="Client name: "
set /p CLIENT_EMAIL="Client email: "
set /p API_KEY="API Key (from main server): "
set /p MAIN_SERVER_URL="Main Server URL (e.g. http://YOUR_IP:5100): "

set DIST_DIR=%~dp0dist\ComplyTrack-%CLIENT_NAME%

echo.
echo Building package for %CLIENT_NAME%...

echo [1/4] Cleaning previous build...
if exist "%DIST_DIR%" rmdir /s /q "%DIST_DIR%"
mkdir "%DIST_DIR%"

echo [2/4] Copying EXE...
copy "%~dp0ComplyTrack.exe" "%DIST_DIR%\" >nul

echo [3/4] Copying server and client...
xcopy "%~dp0server" "%DIST_DIR%\server\" /E /I /Q /Y
xcopy "%~dp0client\dist" "%DIST_DIR%\client\dist\" /E /I /Q /Y

echo [4/4] Installing server production dependencies...
cd /d "%DIST_DIR%\server"
call npm ci --omit=dev 2>nul
cd /d "%~dp0"

echo.
echo Writing client config...
(
echo NODE_ENV=development
echo PORT=5173
echo MONGODB_URI=
echo MONGOMS_DEBUG=1
echo JWT_SECRET=a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
echo JWT_EXPIRES_IN=15m
echo JWT_REFRESH_EXPIRES_IN=7d
echo.
echo EMAIL_HOST=smtp-relay.brevo.com
echo EMAIL_PORT=587
echo EMAIL_USER=b51eb5001@smtp-brevo.com
echo EMAIL_PASS=xsmtpsib-5df95d35fcade3af7a004af9c54c0c8736bfc94c6161dabe5b290f9fc76c481b-WPkai8F8NLoHFNLQ
echo EMAIL_FROM=admin@complytrack.online
echo.
echo SMS_API_KEY=your-sms-api-key
echo SMS_API_URL=https://api.msg91.com/api/v5/flow/
echo.
echo CLIENT_URL=http://localhost:5173
echo CLIENT_URL_NETWORK=http://localhost:5173
echo.
echo UPLOAD_DIR=uploads
echo MAX_FILE_SIZE=10485760
echo.
echo MAIN_SERVER_URL=%MAIN_SERVER_URL%
echo COMPLYTRACK_API_KEY=%API_KEY%
echo MAIN_SERVER_CHECK_INTERVAL=15000
echo MAIN_SERVER_HEARTBEAT_INTERVAL=30000
echo MAIN_SERVER_REQUEST_TIMEOUT=5000
) > "%DIST_DIR%\server\.env"

echo.
echo Creating ZIP...
powershell -command "Compress-Archive -Path '%DIST_DIR%\*' -DestinationPath '%~dp0dist\ComplyTrack-%CLIENT_NAME%.zip' -Force"

echo.
echo ========================================
echo   Package Ready!
echo ========================================
echo.
echo   ZIP: %~dp0dist\ComplyTrack-%CLIENT_NAME%.zip
echo   Folder: %DIST_DIR%
echo.
echo   Send the ZIP to %CLIENT_NAME%.
echo   They just extract and double-click ComplyTrack.exe!
echo.
pause
