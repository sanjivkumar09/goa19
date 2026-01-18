@echo off
echo ========================================
echo Starting 5D Game Server
echo ========================================
echo.
echo Checking for existing Node processes...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Found running Node process. Stopping it...
    taskkill /IM node.exe /F >NUL 2>&1
    timeout /t 2 >NUL
)

echo.
echo Starting server on port 3000...
echo.
echo Access the 5D game at: http://localhost:3000/5d
echo Press Ctrl+C to stop the server
echo.
node src/server.js
