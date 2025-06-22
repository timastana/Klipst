import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log("🔍 Checking database connection...")

    // Test connection
    await prisma.$connect()
    console.log("✅ Database connection successful!")

    // Check if tables exist
    const userCount = await prisma.user.count()
    const propertyCount = await prisma.property.count()

    console.log(`📊 Database stats:`)
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Properties: ${propertyCount}`)

    if (userCount === 0) {
      console.log("⚠️  No users found. Run 'npm run db:seed' to add sample data.")
    }

    if (propertyCount === 0) {
      console.log("⚠️  No properties found. Run 'npm run db:seed' to add sample data.")
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    console.log("\n🔧 Troubleshooting:")
    console.log("   1. Make sure your DATABASE_URL is correct in .env")
    console.log("   2. Ensure your database server is running")
    console.log("   3. Check if the database exists")
    console.log("   4. Verify user permissions")
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
