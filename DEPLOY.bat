@echo off
color 0E
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║           🚀 DEPLOYING TO HOSTINGER VPS                        ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 📦 This will deploy your code to the live server...
echo.
echo ⚠️  Make sure you've tested everything locally first!
echo.
echo Press any key to continue or close this window to cancel...
pause >nul

echo.
echo 🚀 Starting deployment...
echo.

node deploy.js

echo.
echo Press any key to close...
pause >nul
