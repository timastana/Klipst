@echo off
echo 🔧 Fixing Docker connectivity issues...

echo Stopping all services...
docker-compose down

echo Removing orphaned containers...
docker-compose down --remove-orphans

echo Cleaning up networks...
docker network prune -f

echo Rebuilding images...
docker-compose build --no-cache

echo Starting services...
docker-compose up -d postgres

echo Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak

echo Starting other services...
docker-compose up -d

echo Checking service health...
timeout /t 5 /nobreak
docker-compose ps

echo ✅ Docker fix complete!
echo Check logs with: docker-compose logs -f
