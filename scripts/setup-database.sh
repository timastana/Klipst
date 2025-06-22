#!/bin/bash

echo "🗄️  Setting up Klipst Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

# Load environment variables
source .env

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️  Pushing database schema..."
npx prisma db push

echo "🌱 Seeding database with sample data..."
npx prisma db seed

echo "✅ Database setup complete!"
echo ""
echo "🎉 You can now:"
echo "   - Run 'npm run dev' to start the development server"
echo "   - Run 'npx prisma studio' to view your database"
echo "   - Visit http://localhost:3000 to see your app"
echo ""
echo "📧 Demo login credentials:"
echo "   Email: tenant@klipst.com"
echo "   Password: password123"
