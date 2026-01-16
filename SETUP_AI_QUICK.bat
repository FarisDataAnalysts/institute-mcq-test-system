@echo off
title AI Setup - MCQ Test System
color 0A

echo ========================================
echo    AI QUESTION GENERATOR SETUP
echo ========================================
echo.

REM Check if .env exists
if exist .env (
    echo [OK] .env file found!
    echo.
) else (
    echo [!] Creating .env file...
    echo.
    
    REM Create .env from example
    if exist .env.example (
        copy .env.example .env >nul
        echo [OK] .env file created from template
    ) else (
        REM Create new .env
        (
            echo # Google Gemini API Key ^(FREE^)
            echo GEMINI_API_KEY=YOUR_API_KEY_HERE
            echo.
            echo # Server Configuration
            echo PORT=3000
            echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        ) > .env
        echo [OK] .env file created
    )
    echo.
)

echo ========================================
echo    STEP 1: GET FREE API KEY
echo ========================================
echo.
echo 1. Opening Google AI Studio...
echo 2. Login with your Gmail account
echo 3. Click "Create API Key"
echo 4. Copy the API key
echo.
start https://makersuite.google.com/app/apikey
echo.
pause

echo.
echo ========================================
echo    STEP 2: ENTER YOUR API KEY
echo ========================================
echo.
set /p APIKEY="Paste your Gemini API key here: "

if "%APIKEY%"=="" (
    echo [ERROR] No API key entered!
    pause
    exit
)

REM Update .env file
powershell -Command "(gc .env) -replace 'YOUR_API_KEY_HERE', '%APIKEY%' | Out-File -encoding ASCII .env"

echo.
echo [OK] API key saved to .env file!
echo.

echo ========================================
echo    STEP 3: INSTALL DEPENDENCIES
echo ========================================
echo.
echo Installing required packages...
call npm install
echo.
echo [OK] Dependencies installed!
echo.

echo ========================================
echo    STEP 4: START SERVER
echo ========================================
echo.
echo Starting server with AI enabled...
echo.
echo Look for this message:
echo   [32m AI Features: ENABLED[0m
echo.
pause

call npm start

pause