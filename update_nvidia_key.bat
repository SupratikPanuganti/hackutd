@echo off
echo.
echo ========================================
echo NVIDIA API KEY UPDATER
echo ========================================
echo.
set /p NEW_KEY="Paste your new NVIDIA API key: "
echo.
echo Updating .env files...

REM Update root .env
powershell -Command "(Get-Content '.env') -replace 'NIM_API_KEY=.*', 'NIM_API_KEY=%NEW_KEY%' | Set-Content '.env'"

REM Update server/.env
powershell -Command "(Get-Content 'server\.env') -replace 'NIM_API_KEY=.*', 'NIM_API_KEY=%NEW_KEY%' | Set-Content 'server\.env'"
powershell -Command "(Get-Content 'server\.env') -replace 'NVIDIA_API_KEY=.*', 'NVIDIA_API_KEY=%NEW_KEY%' | Set-Content 'server\.env'"

echo.
echo Done! API key updated in both .env files.
echo Please restart your backend server.
echo.
pause
