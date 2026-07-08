# ComplyTrack India - Task Scheduler Setup
# Run this script to set up automatic scheduled runs

$taskName = "ComplyTrack Scraper"
$description = "Automatic compliance laws scraper for ComplyTrack India"
$scriptPath = "$PSScriptRoot\run-scraper.bat"

# Check if running as Administrator
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "This script needs to run as Administrator." -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Remove existing task if exists
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Create action
$action = New-ScheduledTaskAction -Execute $scriptPath -WorkingDirectory $PSScriptRoot

# Create trigger - Run daily at 2:00 AM
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"

# Create settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Register the task
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description $description -RunLevel Highest

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Task Scheduler Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Task Name: $taskName"
Write-Host "Schedule: Daily at 2:00 AM"
Write-Host "Script: $scriptPath"
Write-Host ""
Write-Host "To manage the task:" -ForegroundColor Yellow
Write-Host "  1. Open Task Scheduler (taskschd.msc)"
Write-Host "  2. Look for '$taskName'"
Write-Host "  3. Right-click to run, modify, or delete"
Write-Host ""
Write-Host "To run manually now:" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName '$taskName'"
Write-Host ""
