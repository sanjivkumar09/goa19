@echo off
title Goa Games - Stop Server
color 0C

echo ========================================
echo    GOA GAMES - STOP SERVER
echo ========================================
echo.

echo Stopping all Node.js processes...
echo.

tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /F /IM node.exe
    echo.
    echo [OK] Server stopped successfully!
) else (
    echo [INFO] No running server found.
)

echo.
echo ========================================
echo    SERVER STOPPED
echo ========================================
echo.
pause
