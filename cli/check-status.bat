@echo off
REM ComplyTrack India - Task Status
REM This script shows the status of the scheduled task

echo ========================================
echo ComplyTrack Scraper - Task Status
echo ========================================
echo.

schtasks /query /tn "ComplyTrack Scraper" /v /fo list 2>nul
if %errorlevel% neq 0 (
    echo Task not found. Please run setup-scheduler.ps1 first.
)

echo.
echo ========================================
pause
