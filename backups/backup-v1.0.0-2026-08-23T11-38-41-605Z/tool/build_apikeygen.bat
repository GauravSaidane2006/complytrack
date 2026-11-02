@echo off
echo Building ComplyTrack API Key Generator...
echo.

where pyinstaller >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PyInstaller not found. Installing...
    pip install pyinstaller
)

echo Building executable...
pyinstaller --onefile --name ComplyTrackApiKeyGen apikeygen.py --noconfirm

echo.
if exist "dist\ComplyTrackApiKeyGen.exe" (
    echo Build successful!
    echo Output: dist\ComplyTrackApiKeyGen.exe
) else (
    echo Build failed. Check output above.
)

echo.
pause
