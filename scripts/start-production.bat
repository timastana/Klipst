@echo off
echo 🏭 Starting Klipst Production Server
echo ==================================
echo.

REM Check if build exists
if not exist ".next" (
    echo 📦 Building application...
    call npm run build
    
    if %errorlevel% neq 0 (
        echo ❌ Build failed!
        pause
        exit /b 1
    )
)

echo 🚀 Starting production server...
echo The application will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
