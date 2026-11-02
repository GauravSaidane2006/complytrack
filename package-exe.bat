@echo off
echo ========================================
echo   ComplyTrack - Package for Distribution
echo ========================================
echo.

set DIST_DIR=%~dp0dist\ComplyTrack

echo Cleaning previous build...
if exist "%~dp0dist" rmdir /s /q "%~dp0dist"
mkdir "%DIST_DIR%"

echo [1/3] Copying EXE...
copy "%~dp0ComplyTrack.exe" "%DIST_DIR%\"
if errorlevel 1 (
    echo ERROR: ComplyTrack.exe not found. Run build-exe.bat first!
    pause
    exit /b 1
)

echo [2/3] Copying server (excluding dev files)...
xcopy "%~dp0server" "%DIST_DIR%\server\" /E /I /Q /Y
cd /d "%DIST_DIR%\server"
if exist node_modules rmdir /s /q node_modules
if exist .git rmdir /s /q .git
cd /d "%~dp0"

echo [3/3] Copying client build...
xcopy "%~dp0client\dist" "%DIST_DIR%\client\dist\" /E /I /Q /Y

echo.
echo Creating ZIP...
powershell -command "Compress-Archive -Path '%DIST_DIR%\*' -DestinationPath '%~dp0dist\ComplyTrack.zip' -Force"

echo.
echo ========================================
echo   Package Complete!
echo ========================================
echo.
echo ZIP file: %~dp0dist\ComplyTrack.zip
echo Folder:   %DIST_DIR%
echo.
echo Distribution structure:
echo   ComplyTrack/
echo     ComplyTrack.exe
echo     server/
echo       src/
echo       node_modules/
echo       ...
echo     client/
echo       dist/
echo         index.html
echo         assets/
echo.
pause
