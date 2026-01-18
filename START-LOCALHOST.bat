@echo off
color 0B
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║           🚀 STARTING LOCAL DEVELOPMENT SERVER                 ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Check if setup has been run
if not exist .env.local (
    echo ⚠️  Setup not completed yet!
    echo.
    echo Please run setup first:
    echo    1. Close this window
    echo    2. Double-click: setup.bat
    echo    3. Then try again
    echo.
    pause
    exit
)

REM Switch to local environment
echo 📝 Switching to local environment...
copy /Y .env.local .env >nul 2>&1
echo ✅ Environment switched to LOCAL
echo.

REM Check configuration
echo 🔍 Verifying configuration...
node check-config.js
if errorlevel 1 (
    echo.
    echo ❌ Configuration check failed!
    pause
    exit
)
echo.

REM Wait a moment
timeout /t 1 /nobreak >nul

REM Open browser after 3 seconds
echo 🌐 Opening browser in 3 seconds...
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

REM Start the server
echo.
echo 🚀 Starting server...
echo ═══════════════════════════════════════════════════════════════
echo.
echo 🌐 Your site will open at: http://localhost:3000
echo 📝 Admin Panel: http://localhost:3000/account/login
echo 🔐 Admin Login: 9981474023 / 1234
echo.
echo ⚠️  Press CTRL+C to stop the server
echo ═══════════════════════════════════════════════════════════════
echo.

npm start
