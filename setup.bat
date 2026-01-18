@echo off
color 0A
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              🚀 AUTOMATIC SETUP SCRIPT                         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 📦 Creating environment files...
echo.

REM Create .env.local file
(
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=
echo DB_NAME=games
echo PORT=3000
echo NODE_ENV=development
echo SERVER_HOST=localhost
echo JWT_SECRET=your_jwt_secret_key_here_change_this_to_random_string
) > .env.local

echo ✅ Created .env.local ^(for localhost development - using phpMyAdmin database 'games'^)

REM Create .env.production file
(
echo DB_HOST=localhost
echo DB_USER=mumbai
echo DB_PASSWORD=4h5aOTQ1rMHx8Tgw20om
echo DB_NAME=mumbai
echo PORT=3000
echo NODE_ENV=production
echo SERVER_HOST=0.0.0.0
echo JWT_SECRET=your_jwt_secret_key_here_change_this_to_random_string
) > .env.production

echo ✅ Created .env.production ^(for Hostinger server^)

REM Copy local as default
copy /Y .env.local .env >nul 2>&1
echo ✅ Set local environment as default

echo.
echo 📦 Installing dependencies...
echo.
call npm install

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              ✅ SETUP COMPLETED SUCCESSFULLY!                  ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🎯 Next steps:
echo    1. Double-click "START-LOCALHOST.bat" to run the site
echo    2. Double-click "DEPLOY.bat" to deploy to Hostinger
echo.
echo Press any key to close...
pause >nul
