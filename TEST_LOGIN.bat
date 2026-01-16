@echo off
echo ========================================
echo    LOGIN TEST SCRIPT
echo    Testing Registration and Login
echo ========================================
echo.

echo This script will help you test:
echo 1. Registration
echo 2. Login
echo 3. Database connection
echo.

echo Step 1: Checking if server is running...
echo.

curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server is NOT running!
    echo.
    echo Please start the server first:
    echo 1. Double-click START.bat
    echo 2. Wait for "Server running on http://localhost:3000"
    echo 3. Then run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Server is running!
echo.

echo Step 2: Checking database...
echo.

if not exist "data\database.db" (
    echo ❌ Database file not found!
    echo.
    echo Please run FIX_DATABASE.bat first
    echo.
    pause
    exit /b 1
)

echo ✅ Database exists!
echo.

echo ========================================
echo    MANUAL TESTING STEPS
echo ========================================
echo.

echo Step 1: Open browser
echo    http://localhost:3000
echo.

echo Step 2: Click "Teacher Portal"
echo.

echo Step 3: Click "Register new teacher account"
echo.

echo Step 4: Fill registration form:
echo    Name: Test Teacher
echo    Username: test1
echo    Password: test123
echo    Confirm: test123
echo.

echo Step 5: Click "Register"
echo    - Should see green success message
echo    - Should redirect to login page
echo.

echo Step 6: Login with:
echo    Username: test1
echo    Password: test123
echo.

echo Step 7: Click "Login"
echo    - Should see "Login successful!"
echo    - Should redirect to teacher dashboard
echo.

echo ========================================
echo    COMMON ERRORS AND FIXES
echo ========================================
echo.

echo Error 1: "Cannot read properties of undefined"
echo Fix: Download latest version from GitHub
echo.

echo Error 2: "Invalid credentials"
echo Fix: Make sure you registered first
echo      Use exact same username/password
echo.

echo Error 3: "SQLITE_CANTOPEN"
echo Fix: Run FIX_DATABASE.bat
echo.

echo Error 4: Server not responding
echo Fix: Restart server (Ctrl+C then START.bat)
echo.

echo ========================================
echo    VERIFICATION CHECKLIST
echo ========================================
echo.

echo ☐ Server running (http://localhost:3000)
echo ☐ Database exists (data\database.db)
echo ☐ Registration page loads
echo ☐ Can fill registration form
echo ☐ Registration succeeds (green message)
echo ☐ Redirects to login page
echo ☐ Can login with registered credentials
echo ☐ Redirects to teacher dashboard
echo.

echo ========================================
echo.

echo Press any key to open browser...
pause >nul

start http://localhost:3000

echo.
echo Browser opened!
echo Follow the steps above to test.
echo.
pause