@echo off
title Goa Games Server
color 0A
echo.
echo ╔═══════════════════════════════════════════════╗
echo ║   🚀 STARTING GOA GAMES SERVER               ║
echo ╚═══════════════════════════════════════════════╝
echo.
echo [1/3] Starting server...
cd /d "%~dp0"
start "Goa Games Server" cmd /k "npm start"
echo       ✓ Server starting...
echo.
echo [2/3] Waiting for server to be ready...
timeout /t 8 /nobreak >nul
echo       ✓ Server should be ready!
echo.
echo [3/3] Opening browser...
start http://localhost:3000
echo       ✓ Browser opened!
echo.
echo ╔═══════════════════════════════════════════════╗
echo ║   ✅ GOA GAMES IS NOW RUNNING!               ║
echo ╚═══════════════════════════════════════════════╝
echo.
echo  📍 URL: http://localhost:3000
echo  👤 Admin Login: 9981474023 / 1234
echo.
echo  ⚠️  Keep the server window open!
echo     Close this window to continue...
echo.
pause
