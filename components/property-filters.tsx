"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/properties?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/properties")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Enter city"
            defaultValue={searchParams.get("city") || ""}
            onChange={(e) => updateFilter("city", e.target.value)}
          />
        </div>

        <Separator />

        <div>
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input
              placeholder="Min price"
              type="number"
              defaultValue={searchParams.get("minPrice") || ""}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
            />
            <Input
              placeholder="Max price"
              type="number"
              defaultValue={searchParams.get("maxPrice") || ""}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div>
          <Label>Bedrooms</Label>
          <Select
            defaultValue={searchParams.get("bedrooms") || "Any"}
            onValueChange={(value) => updateFilter("bedrooms", value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any">Any</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Property Type</Label>
          <Select
            defaultValue={searchParams.get("propertyType") || "Any"}
            onValueChange={(value) => updateFilter("propertyType", value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any">Any</SelectItem>
              <SelectItem value="HOUSE">House</SelectItem>
              <SelectItem value="FLAT">Flat</SelectItem>
              <SelectItem value="STUDIO">Studio</SelectItem>
              <SelectItem value="ROOM">Room</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  )
}
