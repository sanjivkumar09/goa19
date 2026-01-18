@echo off
color 0C
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║           🔄 RESTARTING PRODUCTION SERVER                      ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🔄 Restarting the Hostinger server...
echo.

npm run deploy:restart

echo.
echo ✅ Server restarted!
echo.
echo Press any key to close...
pause >nul
