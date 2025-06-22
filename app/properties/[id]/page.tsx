import { notFound } from "next/navigation"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatPrice, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Bed, Bath, Car, Leaf, Phone, Mail } from "lucide-react"
import { ContactLandlordForm } from "@/components/contact-landlord-form"
import { ViewingRequestForm } from "@/components/viewing-request-form"
import { SimpleMap } from "@/components/simple-map"

async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  })

  return property
}

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id)

  if (!property) {
    notFound()
  }

  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0]
  const otherImages = property.images.filter((img) => !img.isPrimary)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {primaryImage && (
              <div className="relative">
                <Image
                  src={primaryImage.url || "/placeholder.svg?height=500&width=800"}
                  alt={property.title}
                  width={800}
                  height={500}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant={property.status === "AVAILABLE" ? "default" : "secondary"}>{property.status}</Badge>
                </div>
              </div>
            )}

            {otherImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {otherImages.slice(0, 4).map((image) => (
                  <Image
                    key={image.id}
                    src={image.url || "/placeholder.svg?height=150&width=200"}
                    alt={image.alt || property.title}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {property.address}, {property.city}, {property.postcode}
              </div>
              <div className="text-3xl font-bold text-primary">
                {formatPrice(property.price)}
                <span className="text-lg font-normal">/month</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                {property.bedrooms} {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                {property.bathrooms} {property.bathrooms === 1 ? "bathroom" : "bathrooms"}
              </div>
              {property.parking && (
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-1" />
                  Parking
                </div>
              )}
              {property.garden && (
                <div className="flex items-center">
                  <Leaf className="h-4 w-4 mr-1" />
                  Garden
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Property Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span>Property Type</span>
                  <Badge variant="outline">{property.propertyType}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Furnished</span>
                  <Badge variant="outline">{property.furnished ? "Yes" : "No"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pet Friendly</span>
                  <Badge variant="outline">{property.petFriendly ? "Yes" : "No"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Available From</span>
                  <span className="text-sm">{formatDate(property.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Map */}
            {property.latitude && property.longitude && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <SimpleMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                  address={`${property.address}, ${property.city}, ${property.postcode}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Landlord Info */}
          <Card>
            <CardHeader>
              <CardTitle>Landlord Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{property.owner.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {property.owner.email}
                </div>
                {property.owner.phone && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    {property.owner.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <ContactLandlordForm propertyId={property.id} landlordId={property.owner.id} />

          {/* Viewing Request */}
          <ViewingRequestForm propertyId={property.id} />
        </div>
      </div>
    </div>
  )
}
