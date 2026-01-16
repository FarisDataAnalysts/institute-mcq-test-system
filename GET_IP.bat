@echo off
title Network IP Address - MCQ System
color 0B

echo.
echo ========================================
echo    YOUR NETWORK IP ADDRESS
echo ========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP: =!
    echo Your IP:%%a
)

echo.
echo ========================================
echo.
echo Share this URL with students/teachers:
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    echo http:%%a:3000
)
echo.
echo ========================================
echo.
echo Instructions:
echo 1. Make sure server is running (START.bat)
echo 2. Share the URL above
echo 3. Students/Teachers open in browser
echo 4. Same WiFi network required
echo.
echo ========================================
echo.

pause