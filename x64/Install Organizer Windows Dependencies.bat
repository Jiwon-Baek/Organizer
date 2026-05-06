@echo off
setlocal
cd /d "%~dp0\.."

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm.cmd could not be found.
  echo Install Node.js for Windows first, then try again.
  pause
  exit /b 1
)

call npm.cmd install
if errorlevel 1 (
  echo.
  echo Windows dependency installation failed.
  pause
  exit /b %errorlevel%
)

echo.
echo Windows dependencies are installed.
echo You can now run "x64\Launch Organizer.bat" or "x64\Launch Organizer.vbs".
pause
