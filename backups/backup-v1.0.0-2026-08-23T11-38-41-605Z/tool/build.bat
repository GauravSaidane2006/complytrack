@echo off
echo ============================================
echo   ComplyTrack Key Generator - Build Script
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found. Install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

:: Install PyInstaller if not present
pip show pyinstaller >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing PyInstaller...
    pip install pyinstaller
)

echo.
echo Building ComplyTrackKeyGen.exe...
echo.

pyinstaller ^
    --onefile ^
    --windowed ^
    --name "ComplyTrackKeyGen" ^
    --clean ^
    keygen.py

echo.
if exist "dist\ComplyTrackKeyGen.exe" (
    echo ============================================
    echo   BUILD SUCCESSFUL
    echo   Output: dist\ComplyTrackKeyGen.exe
    echo ============================================
    echo.
    echo Copy the exe from the dist folder.
) else (
    echo BUILD FAILED. Check errors above.
)

pause
