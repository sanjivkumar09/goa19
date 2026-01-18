@echo off
color 0D
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║           📋 VIEWING PRODUCTION SERVER LOGS                    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🔍 Fetching logs from Hostinger server...
echo.

npm run logs

echo.
echo Press any key to close...
pause >nul
