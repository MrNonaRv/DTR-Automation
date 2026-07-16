@echo off
TITLE Stop DTR Automate

:: Ensure we are in the directory where the script is located
cd /d "%~dp0"

echo ===================================================
echo Stopping DTR Automate Server...
echo ===================================================

:: Stop any existing server running on port 3000
FOR /F "tokens=5" %%a in ('netstat -aon ^| find ":3000 " ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    echo Server process (PID: %%a) has been stopped.
)

echo.
echo [SUCCESS] The system has been successfully stopped.
timeout /t 3 /nobreak >nul
exit
