import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { PropertySearch } from "@/components/property-search"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface PropertiesPageProps {
  searchParams: {
    search?: string
    city?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    propertyType?: string
    status?: string
  }
}

async function getProperties(searchParams: PropertiesPageProps["searchParams"]) {
  const where: any = {}

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
      { address: { contains: searchParams.search, mode: "insensitive" } },
      { city: { contains: searchParams.search, mode: "insensitive" } },
      { postcode: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  if (searchParams.city) {
    where.city = { contains: searchParams.city, mode: "insensitive" }
  }

  if (searchParams.minPrice) {
    where.price = { ...where.price, gte: Number.parseFloat(searchParams.minPrice) }
  }

  if (searchParams.maxPrice) {
    where.price = { ...where.price, lte: Number.parseFloat(searchParams.maxPrice) }
  }

  if (searchParams.bedrooms) {
    where.bedrooms = Number.parseInt(searchParams.bedrooms)
  }

  if (searchParams.propertyType) {
    where.propertyType = searchParams.propertyType
  }

  if (searchParams.status) {
    where.status = searchParams.status
  } else {
    where.status = "AVAILABLE" // Only show available properties by default
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

  return properties
}

function PropertySkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Perfect Property</h1>
        <PropertySearch />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <PropertyFilters />
        </div>

        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertySkeleton key={i} />
                ))}
              </div>
            }
          >
            <PropertiesList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function PropertiesList({ searchParams }: { searchParams: PropertiesPageProps["searchParams"] }) {
  const properties = await getProperties(searchParams)

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No properties found</h3>
        <p className="text-muted-foreground">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {properties.length} {properties.length === 1 ? "property" : "properties"} found
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
