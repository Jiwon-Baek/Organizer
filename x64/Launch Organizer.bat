@echo off
setlocal
cd /d "%~dp0\.."

if exist "node_modules\.bin\electron.cmd" (
  call "node_modules\.bin\electron.cmd" .
  exit /b %errorlevel%
)

echo Windows Electron dependency was not found.
echo.
echo Run "x64\Install Organizer Windows Dependencies.bat" once from this folder.
echo If Node.js is not installed on Windows, install it first.
echo.
pause
exit /b 1
