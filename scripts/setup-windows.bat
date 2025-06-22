@echo off
echo 🏠 Klipst Property Management - Windows Setup
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo Recommended version: 18.x or higher
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL not found in PATH
    echo Please ensure PostgreSQL is installed and added to PATH
    echo Or use the Docker option below
) else (
    echo ✅ PostgreSQL found:
    psql --version
)

echo.
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 📋 Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file from template
    echo ⚠️  Please edit .env file with your database credentials
) else (
    echo ✅ .env file already exists
)

echo.
echo 🗄️  Database setup options:
echo 1. Use local PostgreSQL
echo 2. Use Docker PostgreSQL
echo 3. Skip database setup (manual)
echo.
set /p choice="Choose option (1-3): "

if "%choice%"=="1" goto :local_db
if "%choice%"=="2" goto :docker_db
if "%choice%"=="3" goto :skip_db

:local_db
echo.
echo 🗄️  Setting up local PostgreSQL database...
call :setup_local_database
goto :continue

:docker_db
echo.
echo 🐳 Setting up Docker PostgreSQL...
call :setup_docker_database
goto :continue

:skip_db
echo.
echo ⏭️  Skipping database setup
goto :continue

:continue
echo.
echo 🔧 Generating Prisma client...
call npx prisma generate

echo.
echo 📊 Database schema setup...
call npx prisma db push

if %errorlevel% neq 0 (
    echo ❌ Failed to push database schema
    echo Please check your database connection
    pause
    exit /b 1
)

echo.
echo 🌱 Seeding database with sample data...
call npm run db:seed

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the application:
echo    npm run dev
echo.
echo 🌐 The app will be available at: http://localhost:3000
echo.
echo 📧 Demo credentials:
echo    Email: tenant@klipst.com
echo    Password: password123
echo.
pause
exit /b 0

:setup_local_database
echo Creating local PostgreSQL database...
echo Please ensure PostgreSQL service is running
echo.
echo Run these commands in PostgreSQL (psql):
echo CREATE DATABASE klipst_db;
echo CREATE USER klipst_user WITH PASSWORD 'klipst_password';
echo GRANT ALL PRIVILEGES ON DATABASE klipst_db TO klipst_user;
echo.
echo Update your .env file with:
echo DATABASE_URL="postgresql://klipst_user:klipst_password@localhost:5432/klipst_db"
echo.
pause
goto :eof

:setup_docker_database
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Starting PostgreSQL with Docker...
call docker-compose up -d postgres

if %errorlevel% neq 0 (
    echo ❌ Failed to start Docker PostgreSQL
    pause
    exit /b 1
)

echo ✅ PostgreSQL started with Docker
echo Database URL: postgresql://postgres:password@localhost:5432/klipst_db
goto :eof
