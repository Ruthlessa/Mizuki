@echo off
echo ====================================
echo   Mizuki Admin System Launcher
echo ====================================
echo.

echo [1/3] Installing dependencies...
npm install

echo.
echo [2/3] Starting backend server on port 3000...
start "Mizuki Admin Server" cmd /k "npm run server"

echo.
echo [3/3] Starting frontend dev server on port 3001...
start "Mizuki Admin Frontend" cmd /k "npm run dev"

echo.
echo ====================================
echo   All services started!
echo ====================================
echo.
echo   Backend API:  http://localhost:3000
echo   Frontend:    http://localhost:3001
echo.
echo   Default login:
echo   Username: admin
echo   Password: admin123
echo ====================================
pause
