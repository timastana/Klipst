@echo off
echo 🚀 Starting Klipst Development Server
echo ===================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ❌ Dependencies not installed!
    echo Please run setup-windows.bat first
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo ❌ Environment file not found!
    echo Please run setup-windows.bat first
    pause
    exit /b 1
)

echo 🔧 Generating Prisma client...
call npx prisma generate

echo.
echo 🌐 Starting development server...
echo The application will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
