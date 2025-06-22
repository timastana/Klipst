"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Bed, Bath, Car, Leaf } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import type { Property, PropertyImage } from "@prisma/client"

interface PropertyCardProps {
  property: Property & {
    images: PropertyImage[]
  }
  onFavorite?: (propertyId: string) => void
  isFavorited?: boolean
}

export function PropertyCard({ property, onFavorite, isFavorited }: PropertyCardProps) {
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0]

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={primaryImage?.url || "/placeholder.svg?height=200&width=300"}
          alt={property.title}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge variant={property.status === "AVAILABLE" ? "default" : "secondary"}>{property.status}</Badge>
        </div>
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={() => onFavorite(property.id)}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {property.city}, {property.postcode}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms}
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms}
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

          <div className="flex items-center justify-between pt-2">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(property.price)}
              <span className="text-sm font-normal">/month</span>
            </div>
            <Button asChild>
              <Link href={`/properties/${property.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
