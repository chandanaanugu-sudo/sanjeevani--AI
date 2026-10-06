@echo off
title Sanjeevani AI - Healthcare Command Ecosystem
color 0A

echo ================================================================
echo        SANJEEVANI AI - DUAL HEALTHCARE ECOSYSTEM LAUNCHER
echo ================================================================
echo.
echo [*] Checking project directory...
cd /d "C:\Users\laxmi\OneDrive\Desktop\Sanjeevani AI"

echo [*] Checking if server is already running on port 5173...
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo [OK] Server is already running on port 5173!
) else (
    echo [*] Launching Sanjeevani AI server...
    start /min "Sanjeevani Vite Server" cmd /k "cd /d C:\Users\laxmi\OneDrive\Desktop\Sanjeevani AI && npm run dev"
    timeout /t 3 /nobreak >nul
)

echo [*] Opening Patient Portal and Admin Command Center...
start msedge "http://localhost:5173/" "http://localhost:5173/admin" 2>nul || (
    start http://localhost:5173/
    timeout /t 2 /nobreak >nul
    start http://localhost:5173/admin
)

echo.
echo ================================================================
echo   SUCCESS! SANJEEVANI AI IS LIVE AND READY FOR JUDGES:
echo   - Patient Portal:  http://localhost:5173/
echo   - Admin Portal:    http://localhost:5173/admin
echo.
echo   * Keep this launcher open or minimize it during presentation.
echo ================================================================
echo.
pause
