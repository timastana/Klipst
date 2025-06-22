import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createPropertySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postcode: z.string().min(1),
  price: z.number().positive(),
  bedrooms: z.number().int().positive(),
  bathrooms: z.number().int().positive(),
  propertyType: z.enum(["HOUSE", "FLAT", "STUDIO", "ROOM", "COMMERCIAL"]),
  furnished: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  garden: z.boolean().optional(),
  parking: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const city = searchParams.get("city")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const bedrooms = searchParams.get("bedrooms")
    const propertyType = searchParams.get("propertyType")

    const where: any = { status: "AVAILABLE" }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { postcode: { contains: search, mode: "insensitive" } },
      ]
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" }
    }

    if (minPrice) {
      where.price = { ...where.price, gte: Number.parseFloat(minPrice) }
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: Number.parseFloat(maxPrice) }
    }

    if (bedrooms) {
      where.bedrooms = Number.parseInt(bedrooms)
    }

    if (propertyType) {
      where.propertyType = propertyType
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        images: true,
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPropertySchema.parse(body)

    const property = await prisma.property.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
      },
      include: {
        images: true,
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    console.error("Error creating property:", error)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
