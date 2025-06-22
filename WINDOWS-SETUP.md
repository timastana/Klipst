# 🪟 Windows On-Premise Setup Guide

## Prerequisites

### Required Software
1. **Node.js 18.x or higher**
   - Download from: https://nodejs.org/
   - Choose the LTS version
   - Make sure to check "Add to PATH" during installation

2. **PostgreSQL 14 or higher**
   - Download from: https://www.postgresql.org/download/windows/
   - Remember the password you set for the postgres user
   - Make sure PostgreSQL service starts automatically

3. **Git for Windows** (optional but recommended)
   - Download from: https://git-scm.com/download/win

### Optional Software
4. **Docker Desktop** (alternative to local PostgreSQL)
   - Download from: https://www.docker.com/products/docker-desktop

5. **Visual Studio Code** (recommended editor)
   - Download from: https://code.visualstudio.com/

## Quick Setup

### Option 1: Automated Setup (Recommended)
1. Open Command Prompt as Administrator
2. Navigate to your project folder
3. Run the setup script:
   \`\`\`cmd
   scripts\setup-windows.bat
   \`\`\`

### Option 2: PowerShell Setup
1. Open PowerShell as Administrator
2. Navigate to your project folder
3. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\scripts\setup-windows.ps1
   \`\`\`

### Option 3: Manual Setup
Follow the detailed steps below.

## Manual Setup Steps

### 1. Install Dependencies
\`\`\`cmd
npm install
\`\`\`

### 2. Setup Environment
\`\`\`cmd
copy .env.example .env
\`\`\`
Edit the `.env` file with your database credentials.

### 3. Setup PostgreSQL Database

#### Using pgAdmin (GUI):
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `klipst_db`
5. Right-click "Login/Group Roles" → "Create" → "Login/Group Role"
6. Name: `klipst_user`, Password: `klipst_password`
7. In "Privileges" tab, check "Can login?" and "Superuser?"

#### Using Command Line:
\`\`\`cmd
psql -U postgres
CREATE DATABASE klipst_db;
CREATE USER klipst_user WITH PASSWORD 'klipst_password';
GRANT ALL PRIVILEGES ON DATABASE klipst_db TO klipst_user;
\q
\`\`\`

### 4. Setup Database Schema
\`\`\`cmd
npx prisma generate
npx prisma db push
npm run db:seed
\`\`\`

### 5. Start Development Server
\`\`\`cmd
npm run dev
\`\`\`

## Running the Application

### Development Mode
\`\`\`cmd
# Using the batch script
scripts\start-dev.bat

# Or manually
npm run dev
\`\`\`

### Production Mode
\`\`\`cmd
# Build first
npm run build

# Then start
npm start

# Or use the batch script
scripts\start-production.bat
\`\`\`

## Database Management

### View Database
\`\`\`cmd
npm run db:studio
\`\`\`
This opens Prisma Studio at http://localhost:5555

### Reset Database
\`\`\`cmd
npm run db:reset
\`\`\`

### Check Database Connection
\`\`\`cmd
npm run db:check
\`\`\`

## Troubleshooting

### Common Issues

#### 1. "psql is not recognized"
- PostgreSQL is not in your PATH
- Add `C:\Program Files\PostgreSQL\15\bin` to your system PATH
- Restart Command Prompt

#### 2. "Connection refused"
- PostgreSQL service is not running
- Start it from Services (services.msc) or:
  \`\`\`cmd
  net start postgresql-x64-15
  \`\`\`

#### 3. "Permission denied"
- Run Command Prompt as Administrator
- Check PostgreSQL user permissions

#### 4. "Port 3000 already in use"
- Another application is using port 3000
- Kill the process or use a different port:
  \`\`\`cmd
  set PORT=3001
  npm run dev
  \`\`\`

#### 5. "Module not found"
- Dependencies not installed properly
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Windows Firewall
If you need to access the app from other computers on your network:
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change Settings" → "Allow another app"
4. Browse to your Node.js installation
5. Add both Private and Public networks

## Performance Tips

### For Better Performance:
1. **Use SSD storage** for better database performance
2. **Increase Node.js memory** if needed:
   \`\`\`cmd
   set NODE_OPTIONS="--max-old-space-size=4096"
   npm run dev
   \`\`\`
3. **Close unnecessary applications** to free up RAM
4. **Use Windows Terminal** instead of Command Prompt for better experience

## Security Considerations

### For Production Use:
1. Change all default passwords
2. Use strong NEXTAUTH_SECRET
3. Enable Windows Firewall
4. Keep Windows and all software updated
5. Use HTTPS (consider using a reverse proxy like nginx)
6. Regular database backups

## Backup and Restore

### Backup Database:
\`\`\`cmd
pg_dump -U klipst_user -h localhost klipst_db > backup.sql
\`\`\`

### Restore Database:
\`\`\`cmd
psql -U klipst_user -h localhost klipst_db &lt; backup.sql
\`\`\`

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify your `.env` file configuration
4. Check Windows Event Viewer for system errors
