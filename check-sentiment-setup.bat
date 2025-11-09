@echo off
echo ========================================
echo T-Care Sentiment Analysis Diagnostic
echo ========================================
echo.

set PASS=0
set FAIL=0

REM Check 1: Node.js
echo [1/7] Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    node --version
    echo ✓ Node.js is installed
    set /a PASS+=1
) else (
    echo ✗ Node.js NOT found
    echo   Install from: https://nodejs.org
    set /a FAIL+=1
)
echo.

REM Check 2: Python
echo [2/7] Checking Python installation...
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python --version
    echo ✓ Python is installed
    set /a PASS+=1
) else (
    echo ✗ Python NOT found
    echo   Install from: https://python.org
    set /a FAIL+=1
)
echo.

REM Check 3: OpenCV
echo [3/7] Checking opencv-python...
python -c "import cv2; print('✓ opencv-python installed (version: ' + cv2.__version__ + ')')" 2>nul
if %ERRORLEVEL% EQU 0 (
    set /a PASS+=1
) else (
    echo ✗ opencv-python NOT installed
    echo   Run: pip install opencv-python
    set /a FAIL+=1
)
echo.

REM Check 4: Requests
echo [4/7] Checking requests library...
python -c "import requests; print('✓ requests installed (version: ' + requests.__version__ + ')')" 2>nul
if %ERRORLEVEL% EQU 0 (
    set /a PASS+=1
) else (
    echo ✗ requests NOT installed
    echo   Run: pip install requests
    set /a FAIL+=1
)
echo.

REM Check 5: NumPy
echo [5/7] Checking numpy library...
python -c "import numpy; print('✓ numpy installed (version: ' + numpy.__version__ + ')')" 2>nul
if %ERRORLEVEL% EQU 0 (
    set /a PASS+=1
) else (
    echo ✗ numpy NOT installed
    echo   Run: pip install numpy
    set /a FAIL+=1
)
echo.

REM Check 6: .env file
echo [6/7] Checking .env configuration...
if exist .env (
    findstr /C:"NIM_API_KEY" .env >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✓ .env file exists with NIM_API_KEY
        set /a PASS+=1
    ) else (
        findstr /C:"OPENAI_KEY" .env >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo ✓ .env file exists with OPENAI_KEY
            set /a PASS+=1
        ) else (
            echo ✗ .env file exists but no API key found
            echo   Add NIM_API_KEY or OPENAI_KEY to .env
            set /a FAIL+=1
        )
    )
) else (
    echo ✗ .env file NOT found
    echo   Create .env file with API keys
    set /a FAIL+=1
)
echo.

REM Check 7: Backend server running
echo [7/7] Checking if backend server is running...
netstat -ano | findstr "LISTENING" | findstr ":3001" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Backend server is running on port 3001
    set /a PASS+=1
) else (
    echo ✗ Backend server is NOT running
    echo   Run: start-backend.bat
    set /a FAIL+=1
)
echo.

echo ========================================
echo RESULTS: %PASS% passed, %FAIL% failed
echo ========================================

if %FAIL% EQU 0 (
    echo.
    echo ✓✓✓ ALL CHECKS PASSED! ✓✓✓
    echo.
    echo Sentiment analysis should work!
    echo.
    echo Next steps:
    echo 1. If backend isn't running, run: start-backend.bat
    echo 2. Start frontend: npm run dev
    echo 3. Enable Agent Mode in the UI
    echo 4. Grant camera permissions when prompted
    echo.
) else (
    echo.
    echo ✗✗✗ SOME CHECKS FAILED ✗✗✗
    echo.
    echo Please fix the issues above before continuing.
    echo.
    if %FAIL% GEQ 1 (
        echo Quick fix - Install Python dependencies:
        echo   cd scripts
        echo   pip install -r requirements.txt
        echo.
    )
)

pause
