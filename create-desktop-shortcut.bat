@echo off
TITLE Create Desktop Shortcut

echo ===================================================
echo Creating Desktop Shortcut for DTR Automate
echo ===================================================

set VBS_SCRIPT="%TEMP%\CreateShortcut.vbs"

:: Create the VBScript file that creates the shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > %VBS_SCRIPT%
echo sLinkFile = "%USERPROFILE%\Desktop\DTR Automate.lnk" >> %VBS_SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %VBS_SCRIPT%
echo oLink.TargetPath = "%~dp0start-windows.bat" >> %VBS_SCRIPT%
echo oLink.WorkingDirectory = "%~dp0" >> %VBS_SCRIPT%
echo oLink.Description = "DTR Automate Local Server" >> %VBS_SCRIPT%
:: Note: Windows requires .ico files for shortcuts, so we rely on Chrome's PWA feature for the best icon experience,
:: but we still create this easy-to-click launcher on the desktop.
echo oLink.Save >> %VBS_SCRIPT%

:: Execute and clean up
cscript /nologo %VBS_SCRIPT%
del %VBS_SCRIPT%

echo.
echo [SUCCESS] Shortcut created on your Desktop!
echo You can now close this window and double-click the "DTR Automate" icon on your Desktop to start the system.
echo.
pause
