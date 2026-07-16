@echo off
TITLE Mambusao DTR Automate

echo ===================================================
echo Mambusao DTR Automate - Local Server Startup
echo ===================================================

:: Check if Node.js is installed
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed! 
    echo Please download and install it from https://nodejs.org/
    pause
    exit /b
)

:: Install dependencies if not present
IF NOT EXIST "node_modules" (
    echo [INFO] Installing required packages...
    call npm install
)

:: Build the project if not built
IF NOT EXIST "dist\server.cjs" (
    echo [INFO] Building the application...
    call npm run build
)

:: Start the server
echo [INFO] Starting the server...
start /b cmd /c "node dist/server.cjs"

:: Wait for a few seconds to let the server boot up
timeout /t 3 /nobreak >nul

:: Open Chrome in app mode (looks like a native desktop window)
echo [INFO] Opening the application window...
start chrome --app=http://localhost:3000

echo.
echo ===================================================
echo [SUCCESS] The application is running!
echo Keep this command window open. 
echo To stop the system, simply close this black window.
echo ===================================================
pause
