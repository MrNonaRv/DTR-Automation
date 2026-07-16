@echo off
TITLE DTR Automate

:: Ensure we are in the directory where the script is located
cd /d "%~dp0"

echo ===================================================
echo DTR Automate - Local Server Startup
echo ===================================================

:: Check if Node.js is installed
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed! 
    echo Please download and install it from https://nodejs.org/
    pause
    exit /b
)

:: Stop any existing server running on port 3000
FOR /F "tokens=5" %%a in ('netstat -aon ^| find ":3000 " ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
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

:: Create a VBScript to run Node invisibly
echo Set WshShell = CreateObject("WScript.Shell") > run-hidden.vbs
echo WshShell.Run "cmd.exe /c node dist/server.cjs", 0, false >> run-hidden.vbs

:: Start the server invisibly
echo [INFO] Starting the server in the background...
cscript //nologo run-hidden.vbs

:: Wait for a few seconds to let the server boot up
timeout /t 3 /nobreak >nul

:: Open Chrome in app mode (looks like a native desktop window)
echo [INFO] Opening the application window...
start chrome --app=http://localhost:3000

echo.
echo ===================================================
echo [SUCCESS] The application is running!
echo This window will now close automatically.
echo To stop the system later, use the "stop-windows.bat" file.
echo ===================================================
timeout /t 3 /nobreak >nul
exit
