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
  echo npm install failed.
  pause
  exit /b %errorlevel%
)

call npm.cmd run dist:win
if errorlevel 1 (
  echo.
  echo EXE build failed.
  pause
  exit /b %errorlevel%
)

echo.
echo Build completed. Check the x64\dist folder.
pause
