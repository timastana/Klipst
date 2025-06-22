# PowerShell setup script for Windows
Write-Host "🏠 Klipst Property Management - Windows PowerShell Setup" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  Running without Administrator privileges" -ForegroundColor Yellow
    Write-Host "Some operations may require elevated permissions" -ForegroundColor Yellow
    Write-Host ""
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Recommended version: 18.x or higher" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check PostgreSQL
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
    $pgInstalled = $true
} catch {
    Write-Host "⚠️  PostgreSQL not found in PATH" -ForegroundColor Yellow
    Write-Host "Please ensure PostgreSQL is installed and added to PATH" -ForegroundColor Yellow
    Write-Host "Or use the Docker option" -ForegroundColor Yellow
    $pgInstalled = $false
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📋 Setting up environment file..." -ForegroundColor Blue
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file with your database credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🗄️  Database setup options:" -ForegroundColor Blue
Write-Host "1. Use local PostgreSQL" -ForegroundColor White
Write-Host "2. Use Docker PostgreSQL" -ForegroundColor White
Write-Host "3. Skip database setup (manual)" -ForegroundColor White
Write-Host ""

do {
    $choice = Read-Host "Choose option (1-3)"
} while ($choice -notin @("1", "2", "3"))

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🗄️  Setting up local PostgreSQL database..." -ForegroundColor Blue
        Write-Host "Please run these commands in PostgreSQL (psql):" -ForegroundColor Yellow
        Write-Host "CREATE DATABASE klipst_db;" -ForegroundColor Cyan
        Write-Host "CREATE USER klipst_user WITH PASSWORD 'klipst_password';" -ForegroundColor Cyan
        Write-Host "GRANT ALL PRIVILEGES ON DATABASE klipst_db TO klipst_user;" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Update your .env file with:" -ForegroundColor Yellow
        Write-Host 'DATABASE_URL="postgresql://klipst_user:klipst_password@localhost:5432/klipst_db"' -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Press Enter when database is ready"
    }
    "2" {
        Write-Host ""
        Write-Host "🐳 Setting up Docker PostgreSQL..." -ForegroundColor Blue
        try {
            $dockerVersion = docker --version
            Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
            
            Write-Host "Starting PostgreSQL with Docker..." -ForegroundColor Blue
            docker-compose up -d postgres
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ PostgreSQL started with Docker" -ForegroundColor Green
                Write-Host "Database URL: postgresql://postgres:password@localhost:5432/klipst_db" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Failed to start Docker PostgreSQL" -ForegroundColor Red
                Read-Host "Press Enter to continue"
            }
        } catch {
            Write-Host "❌ Docker is not installed!" -ForegroundColor Red
            Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
            Read-Host "Press Enter to continue"
        }
    }
    "3" {
        Write-Host ""
        Write-Host "⏭️  Skipping database setup" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

Write-Host ""
Write-Host "📊 Database schema setup..." -ForegroundColor Blue
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push database schema" -ForegroundColor Red
    Write-Host "Please check your database connection" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Blue
npm run db:seed

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Blue
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 The app will be available at: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "📧 Demo credentials:" -ForegroundColor Blue
Write-Host "   Email: tenant@klipst.com" -ForegroundColor Cyan
Write-Host "   Password: password123" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
