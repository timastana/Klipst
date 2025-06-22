"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimpleMapProps {
  latitude: number
  longitude: number
  title: string
  address?: string
}

export function SimpleMap({ latitude, longitude, title, address }: SimpleMapProps) {
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
  const appleMapsUrl = `https://maps.apple.com/?q=${latitude},${longitude}`

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <p className="text-muted-foreground mb-1">{title}</p>
            {address && <p className="text-sm text-muted-foreground mb-2">{address}</p>}
            <p className="text-xs text-muted-foreground">
              Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm" asChild>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Google Maps
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={appleMapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Apple Maps
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
