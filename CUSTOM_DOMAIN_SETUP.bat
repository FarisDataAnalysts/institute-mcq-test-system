@echo off
echo ========================================
echo    CUSTOM DOMAIN SETUP
echo    mcq-system.local banane ke liye
echo ========================================
echo.

REM Get current IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP:~1%
echo Aapka Current IP: %IP%
echo.

echo Custom domain bana rahe hain...
echo.

REM Add to hosts file (requires admin)
echo %IP% mcq-system.local >> C:\Windows\System32\drivers\etc\hosts

echo.
echo ========================================
echo    SETUP COMPLETE!
echo ========================================
echo.
echo Ab teachers ko bolo:
echo.
echo    Browser mein likho: mcq-system.local:3000
echo.
echo Yaad rakhna easy hai!
echo ========================================
echo.
pause