@echo off
echo ========================================
echo    RESTORE BACKUP
echo    Database Recovery System
echo ========================================
echo.

REM Check if backups directory exists
if not exist "data\backups" (
    echo ❌ ERROR: No backups found!
    echo    Backups folder does not exist.
    echo.
    echo    Please create a backup first using BACKUP_SYSTEM.bat
    pause
    exit /b 1
)

REM Count backups
set COUNT=0
for %%f in (data\backups\*.db) do set /a COUNT+=1

if %COUNT% EQU 0 (
    echo ❌ ERROR: No backup files found!
    echo    Backups folder is empty.
    echo.
    echo    Please create a backup first using BACKUP_SYSTEM.bat
    pause
    exit /b 1
)

echo Available Backups (%COUNT% found):
echo ========================================
echo.

REM List all backups with numbers
set INDEX=0
for %%f in (data\backups\*.db) do (
    set /a INDEX+=1
    echo [!INDEX!] %%~nxf (%%~zf bytes)
)

echo.
echo ========================================
echo.

REM Ask user to select backup
set /p CHOICE="Enter backup number to restore (or 0 to cancel): "

if "%CHOICE%"=="0" (
    echo.
    echo ❌ Restore cancelled.
    pause
    exit /b 0
)

REM Validate choice
if %CHOICE% LSS 1 (
    echo ❌ Invalid choice!
    pause
    exit /b 1
)

if %CHOICE% GTR %COUNT% (
    echo ❌ Invalid choice!
    pause
    exit /b 1
)

echo.
echo ⚠️  WARNING: This will replace your current database!
echo.
set /p CONFIRM="Type YES to confirm: "

if not "%CONFIRM%"=="YES" (
    echo.
    echo ❌ Restore cancelled.
    pause
    exit /b 0
)

echo.
echo Creating safety backup of current database...

REM Create safety backup
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set BACKUP_TIME=%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%

copy "data\database.db" "data\backups\before_restore_%BACKUP_DATE%_%BACKUP_TIME%.db" >nul

echo ✅ Safety backup created
echo.

REM Get selected backup file
set INDEX=0
for %%f in (data\backups\*.db) do (
    set /a INDEX+=1
    if !INDEX! EQU %CHOICE% (
        set BACKUP_FILE=%%f
        goto :restore
    )
)

:restore
echo Restoring from: %BACKUP_FILE%
echo.

REM Restore backup
copy "%BACKUP_FILE%" "data\database.db" /Y >nul

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo    ✅ RESTORE SUCCESSFUL!
    echo ========================================
    echo.
    echo Database restored from: %BACKUP_FILE%
    echo.
    echo Next steps:
    echo 1. Restart the server (run START.bat)
    echo 2. Login and verify data
    echo 3. If something wrong, restore again
    echo.
    echo Safety backup saved as:
    echo before_restore_%BACKUP_DATE%_%BACKUP_TIME%.db
) else (
    echo ========================================
    echo    ❌ RESTORE FAILED!
    echo ========================================
    echo.
    echo Please try again or contact support.
)

echo.
pause