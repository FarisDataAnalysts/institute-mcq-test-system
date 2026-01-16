@echo off
echo ========================================
echo    AUTOMATIC BACKUP SYSTEM
echo    Database Backup aur Recovery
echo ========================================
echo.

REM Create backups directory if not exists
if not exist "data\backups" mkdir data\backups

REM Get current date and time
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set BACKUP_TIME=%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%

echo Current Date: %BACKUP_DATE%
echo Current Time: %BACKUP_TIME%
echo.

REM Check if database exists
if not exist "data\database.db" (
    echo ❌ ERROR: Database file not found!
    echo    Path: data\database.db
    echo.
    echo    Please run START.bat first to create database.
    pause
    exit /b 1
)

echo Creating backup...
echo.

REM Create backup with timestamp
copy "data\database.db" "data\backups\backup_%BACKUP_DATE%_%BACKUP_TIME%.db" >nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Backup created successfully!
    echo    File: backup_%BACKUP_DATE%_%BACKUP_TIME%.db
    echo    Location: data\backups\
) else (
    echo ❌ Backup failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    BACKUP STATISTICS
echo ========================================
echo.

REM Count total backups
set COUNT=0
for %%f in (data\backups\*.db) do set /a COUNT+=1
echo Total Backups: %COUNT%

REM Show backup size
for %%f in (data\database.db) do set SIZE=%%~zf
set /a SIZE_KB=%SIZE%/1024
echo Database Size: %SIZE_KB% KB

echo.
echo ========================================
echo    CLEANUP OLD BACKUPS
echo    (Keeping last 7 days only)
echo ========================================
echo.

REM Delete backups older than 7 days
forfiles /P "data\backups" /M *.db /D -7 /C "cmd /c del @path" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Old backups cleaned
) else (
    echo ℹ️  No old backups to clean
)

echo.
echo ========================================
echo    BACKUP COMPLETE!
echo ========================================
echo.
echo Backup location: data\backups\
echo.
echo To restore a backup:
echo 1. Stop the server (Ctrl+C in START.bat)
echo 2. Run RESTORE_BACKUP.bat
echo 3. Select backup file
echo 4. Restart server
echo.
pause