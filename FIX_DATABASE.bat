@echo off
echo ========================================
echo    DATABASE FIX SCRIPT
echo    Fixing SQLITE_CANTOPEN Error
echo ========================================
echo.

REM Check if data folder exists
if not exist "data" (
    echo Creating data folder...
    mkdir data
    echo ✅ data folder created
) else (
    echo ✅ data folder already exists
)

REM Check if backups folder exists
if not exist "data\backups" (
    echo Creating backups folder...
    mkdir data\backups
    echo ✅ backups folder created
) else (
    echo ✅ backups folder already exists
)

REM Create empty database file if not exists
if not exist "data\database.db" (
    echo Creating empty database file...
    type nul > data\database.db
    echo ✅ database.db file created
) else (
    echo ✅ database.db already exists
)

echo.
echo ========================================
echo    CHECKING PERMISSIONS
echo ========================================
echo.

REM Check if we have write permissions
echo Testing write permissions...
echo test > data\test.txt 2>nul

if exist "data\test.txt" (
    echo ✅ Write permissions OK
    del data\test.txt
) else (
    echo ❌ No write permissions!
    echo.
    echo Please run this script as Administrator:
    echo 1. Right-click FIX_DATABASE.bat
    echo 2. Select "Run as Administrator"
    echo 3. Click Yes
    pause
    exit /b 1
)

echo.
echo ========================================
echo    FIX COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Close this window
echo 2. Run START.bat
echo 3. Server should start without errors
echo.
echo If still getting errors:
echo 1. Run this script as Administrator
echo 2. Check antivirus settings
echo 3. Check folder permissions
echo.
pause