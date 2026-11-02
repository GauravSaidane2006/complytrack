@echo off
REM ComplyTrack India - Disable/Enable Task
REM This script disables or enables the scheduled task

if "%1"=="disable" (
    echo Disabling ComplyTrack Scraper...
    schtasks /change /tn "ComplyTrack Scraper" /disable
    echo Task disabled.
) else if "%1"=="enable" (
    echo Enabling ComplyTrack Scraper...
    schtasks /change /tn "ComplyTrack Scraper" /enable
    echo Task enabled.
) else (
    echo Usage: toggle-task.bat [disable^|enable]
    echo.
    echo Examples:
    echo   toggle-task.bat disable
    echo   toggle-task.bat enable
)

echo.
pause
