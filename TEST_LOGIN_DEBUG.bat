@echo off
title Login Debug - MCQ System
color 0E

echo ========================================
echo    LOGIN DEBUG TOOL
echo ========================================
echo.

REM Check if server is running
echo [1] Checking if server is running...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Server is NOT running!
    echo.
    echo Please start the server first:
    echo   1. Double-click START.bat
    echo   2. Wait for "Server running" message
    echo   3. Then run this debug tool again
    echo.
    pause
    exit
)
echo [OK] Server is running!
echo.

REM Test database connection
echo [2] Testing database...
if exist data\database.db (
    echo [OK] Database file exists
) else (
    echo [ERROR] Database file NOT found!
    echo.
    echo Creating database...
    mkdir data 2>nul
    node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./data/database.db'); console.log('Database created!');"
)
echo.

REM Check for existing teachers
echo [3] Checking for existing teachers...
echo.
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./data/database.db'); db.all('SELECT username, name FROM teachers', (err, rows) => { if (err) { console.log('Error:', err.message); } else if (rows.length === 0) { console.log('No teachers found in database!'); console.log(''); console.log('Please register a new teacher:'); console.log('  1. Open: http://localhost:3000'); console.log('  2. Click Teacher Portal'); console.log('  3. Click \"Register new teacher account\"'); console.log('  4. Fill the form and register'); } else { console.log('Found ' + rows.length + ' teacher(s):'); rows.forEach(r => console.log('  - ' + r.username + ' (' + r.name + ')')); } db.close(); });"
echo.

echo ========================================
echo    MANUAL LOGIN TEST
echo ========================================
echo.
set /p USERNAME="Enter username to test: "
set /p PASSWORD="Enter password to test: "

echo.
echo Testing login with:
echo   Username: %USERNAME%
echo   Password: %PASSWORD%
echo.

REM Test login API
curl -X POST http://localhost:3000/api/teacher/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"%USERNAME%\",\"password\":\"%PASSWORD%\"}"

echo.
echo.
echo ========================================
echo    TROUBLESHOOTING TIPS
echo ========================================
echo.
echo If login fails:
echo.
echo 1. CHECK USERNAME/PASSWORD
echo    - Username is case-sensitive
echo    - Password must match exactly
echo.
echo 2. REGISTER NEW ACCOUNT
echo    - Open: http://localhost:3000
echo    - Click "Register new teacher account"
echo    - Use simple credentials (e.g., admin/admin123)
echo.
echo 3. RESET DATABASE (Last Resort)
echo    - Close server
echo    - Delete: data\database.db
echo    - Restart server
echo    - Register new account
echo.
echo 4. CHECK BROWSER CONSOLE
echo    - Press F12 in browser
echo    - Check Console tab for errors
echo    - Check Network tab for API calls
echo.
pause