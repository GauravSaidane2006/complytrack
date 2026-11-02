@echo off
echo Building ComplyTrack API Key Generator GUI...
echo.

where pyinstaller >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PyInstaller not found. Installing...
    pip install pyinstaller
)

echo Building GUI executable...
pyinstaller --onefile --windowed --name ComplyTrackApiKeyGenGUI apikeygen_gui.py --noconfirm

echo.
if exist "dist\ComplyTrackApiKeyGenGUI.exe" (
    echo Build successful!
    echo Output: dist\ComplyTrackApiKeyGenGUI.exe
) else (
    echo Build failed. Check output above.
)

echo.
pause
