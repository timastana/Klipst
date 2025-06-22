#!/bin/bash

echo "🔧 Fixing Docker connectivity issues..."

# Stop all services
echo "Stopping all services..."
docker-compose down

# Remove orphaned containers
echo "Removing orphaned containers..."
docker-compose down --remove-orphans

# Clean up networks
echo "Cleaning up networks..."
docker network prune -f

# Clean up volumes (optional - be careful with data)
echo "Do you want to clean up volumes? This will delete all data! (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    docker volume prune -f
fi

# Rebuild images
echo "Rebuilding images..."
docker-compose build --no-cache

# Start services with dependency order
echo "Starting services..."
docker-compose up -d postgres

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Start other services
docker-compose up -d

# Check service health
echo "Checking service health..."
sleep 5
docker-compose ps

echo "✅ Docker fix complete!"
echo "Check logs with: docker-compose logs -f"
