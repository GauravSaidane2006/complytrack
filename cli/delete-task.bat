@echo off
REM ComplyTrack India - Delete Task
REM This script deletes the scheduled task

echo Warning: This will delete the ComplyTrack Scraper scheduled task.
echo.
set /p confirm="Are you sure? (Y/N): "

if /i "%confirm%"=="Y" (
    echo Deleting ComplyTrack Scraper...
    schtasks /delete /tn "ComplyTrack Scraper" /f
    echo Task deleted.
) else (
    echo Operation cancelled.
)

echo.
pause
