@echo off
REM ComplyTrack India - Scheduled Scraper
REM This script runs the compliance laws scraper automatically

echo ========================================
echo ComplyTrack India - Compliance Scraper
echo ========================================
echo.
echo Starting scheduled run at %date% %time%
echo.

cd /d "%~dp0"

REM Run the scraper for all sectors
node scraper.js scrape --all --output ./output

echo.
echo Run completed at %date% %time%
echo ========================================
