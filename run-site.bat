@echo off
REM Shortcut to run both backend and frontend
cd /d %~dp0
start "Backend" cmd /k "npx babel-node src/server.js"
REM If you have a frontend build (like React/Vue), add the command below
REM start "Frontend" cmd /k "npm run frontend"
REM If frontend is static, open browser
start "" http://localhost:3000/home
