@echo off
color 0C
title DATABASE CONNECTION FIX

echo.
echo ╔═══════════════════════════════════════════════╗
echo ║   ⚠️  DATABASE CONNECTION ERROR!             ║
echo ╚═══════════════════════════════════════════════╝
echo.
echo ❌ Error: ECONNREFUSED
echo    Database connection refused!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    POSSIBLE CAUSES:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. MySQL/XAMPP is not running
echo 2. Wrong database credentials in .env file
echo 3. Database 'games' doesn't exist
echo 4. Wrong port number
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    SOLUTIONS:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔧 OPTION 1: Start XAMPP/MySQL
echo ────────────────────────────────────────────────
echo 1. Open XAMPP Control Panel
echo 2. Click "Start" on MySQL
echo 3. Wait for it to turn green
echo 4. Run START-SERVER-NOW.bat again
echo.
echo 🔧 OPTION 2: Check .env File
echo ────────────────────────────────────────────────
echo Open .env file and verify:
echo.
echo   DB_HOST=localhost
echo   DB_USER=root
echo   DB_PASS=
echo   DB_NAME=games
echo   DB_PORT=3306
echo.
echo 🔧 OPTION 3: Create Database
echo ────────────────────────────────────────────────
echo 1. Open phpMyAdmin (http://localhost/phpmyadmin)
echo 2. Create database: 'games'
echo 3. Run START-SERVER-NOW.bat again
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Press any key after fixing...
pause >nul

echo.
echo Testing database connection...
echo.

REM Try to start MySQL service
net start MySQL80 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ MySQL service started!
    echo   Please run START-SERVER-NOW.bat again
) else (
    echo ⚠️  Could not start MySQL service automatically
    echo    Please start XAMPP manually
)

echo.
pause
