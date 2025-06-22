import { PrismaClient, UserRole, PropertyType, PropertyStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@klipst.com" },
    update: {},
    create: {
      email: "admin@klipst.com",
      name: "Admin User",
      role: UserRole.ADMIN,
    },
  })

  // Create landlord
  const landlordPassword = await bcrypt.hash("landlord123", 12)
  const landlord = await prisma.user.upsert({
    where: { email: "landlord@klipst.com" },
    update: {},
    create: {
      email: "landlord@klipst.com",
      name: "John Landlord",
      role: UserRole.LANDLORD,
      phone: "+44 7700 900123",
      address: "123 Property Street, London, SW1A 1AA",
    },
  })

  // Create tenant
  const tenantPassword = await bcrypt.hash("tenant123", 12)
  const tenant = await prisma.user.upsert({
    where: { email: "tenant@klipst.com" },
    update: {},
    create: {
      email: "tenant@klipst.com",
      name: "Jane Tenant",
      role: UserRole.TENANT,
      phone: "+44 7700 900456",
    },
  })

  // Create sample properties
  const properties = [
    {
      title: "Modern 2-Bedroom Flat in Central London",
      description:
        "Beautiful modern apartment with stunning city views. Recently renovated with high-end finishes throughout.",
      address: "45 Baker Street",
      city: "London",
      postcode: "NW1 6XE",
      latitude: 51.5194,
      longitude: -0.1581,
      price: 2500,
      bedrooms: 2,
      bathrooms: 2,
      propertyType: PropertyType.FLAT,
      status: PropertyStatus.AVAILABLE,
      furnished: true,
      petFriendly: false,
      garden: false,
      parking: true,
      ownerId: landlord.id,
    },
    {
      title: "Spacious 3-Bedroom House with Garden",
      description: "Family-friendly house with large garden and parking. Perfect for families with children.",
      address: "78 Oak Avenue",
      city: "Manchester",
      postcode: "M1 4ET",
      latitude: 53.4808,
      longitude: -2.2426,
      price: 1800,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: PropertyType.HOUSE,
      status: PropertyStatus.AVAILABLE,
      furnished: false,
      petFriendly: true,
      garden: true,
      parking: true,
      ownerId: landlord.id,
    },
    {
      title: "Studio Apartment Near University",
      description: "Compact studio perfect for students. Walking distance to university campus.",
      address: "12 Student Lane",
      city: "Birmingham",
      postcode: "B1 2AA",
      latitude: 52.4862,
      longitude: -1.8904,
      price: 800,
      bedrooms: 1,
      bathrooms: 1,
      propertyType: PropertyType.STUDIO,
      status: PropertyStatus.AVAILABLE,
      furnished: true,
      petFriendly: false,
      garden: false,
      parking: false,
      ownerId: landlord.id,
    },
  ]

  for (const propertyData of properties) {
    const property = await prisma.property.create({
      data: propertyData,
    })

    // Add sample images for each property
    await prisma.propertyImage.createMany({
      data: [
        {
          propertyId: property.id,
          url: "/placeholder.svg?height=400&width=600",
          alt: `${property.title} - Main Image`,
          isPrimary: true,
        },
        {
          propertyId: property.id,
          url: "/placeholder.svg?height=400&width=600",
          alt: `${property.title} - Living Room`,
          isPrimary: false,
        },
        {
          propertyId: property.id,
          url: "/placeholder.svg?height=400&width=600",
          alt: `${property.title} - Bedroom`,
          isPrimary: false,
        },
      ],
    })
  }

  // Create contract template
  await prisma.contractTemplate.create({
    data: {
      name: "Standard Tenancy Agreement",
      content: `
TENANCY AGREEMENT

This agreement is made between:
Landlord: {{landlord_name}}
Address: {{landlord_address}}

Tenant: {{tenant_name}}
Address: {{tenant_address}}

Property: {{property_address}}
Rent: £{{monthly_rent}} per month
Deposit: £{{deposit_amount}}
Start Date: {{start_date}}
End Date: {{end_date}}

Terms and Conditions:
1. The tenant agrees to pay rent monthly in advance
2. The property must be kept in good condition
3. No pets allowed unless specified: {{pets_allowed}}
4. Notice period: {{notice_period}} months

Signatures:
Landlord: _________________ Date: _________
Tenant: _________________ Date: _________
      `,
      variables: {
        landlord_name: "text",
        landlord_address: "text",
        tenant_name: "text",
        tenant_address: "text",
        property_address: "text",
        monthly_rent: "number",
        deposit_amount: "number",
        start_date: "date",
        end_date: "date",
        pets_allowed: "boolean",
        notice_period: "number",
      },
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
