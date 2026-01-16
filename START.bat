@echo off
title MCQ Test System - Starting...
color 0A

echo.
echo ========================================
echo    MCQ Test System - Starting...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] First time setup - Installing packages...
    echo This will take 2-3 minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Installation failed!
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Installation complete!
    echo.
)

REM Start the server
echo [INFO] Starting server...
echo.
echo ========================================
echo   Server will start on:
echo   http://localhost:3000
echo.
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

call npm start

pause