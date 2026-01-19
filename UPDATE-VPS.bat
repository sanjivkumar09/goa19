@echo off
echo.
echo ========================================
echo   UPDATE VPS WITH LATEST CHANGES
echo ========================================
echo.
echo This will update your VPS server with the latest code
echo.
pause

echo.
echo INSTRUCTIONS:
echo.
echo 1. Connect to your VPS via SSH
echo.
echo 2. Run these commands:
echo.
echo    cd /root
echo    git pull origin main
echo    pm2 restart goa-games
echo.
echo 3. Visit: https://bdgwin24.com
echo.
echo ========================================
echo.
pause
