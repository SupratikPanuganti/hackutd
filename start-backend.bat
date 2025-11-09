@echo off
echo ========================================
echo Starting T-Care Backend Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Python is not installed or not in PATH
    echo Sentiment analysis will not work without Python
    echo Install Python from https://python.org
    echo.
)

echo [1/3] Checking Node version...
node --version

echo.
echo [2/3] Checking Python version...
python --version 2>nul || echo Python not found

echo.
echo [3/3] Starting backend server...
echo Backend will run on http://localhost:3001
echo WebSocket will run on ws://localhost:3001/sentiment
echo.
echo Press Ctrl+C to stop the server
echo.

cd server
npm run dev
