@echo off
REM ComplyTrack India - Manual Trigger
REM This script manually runs the scheduled task

echo Running ComplyTrack Scraper manually...
echo.

schtasks /run /tn "ComplyTrack Scraper"

if %errorlevel% equ 0 (
    echo.
    echo Task started successfully!
) else (
    echo.
    echo Task not found. Please run setup-scheduler.ps1 first.
)

echo.
pause
