"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "lucide-react"

interface ViewingRequestFormProps {
  propertyId: string
}

export function ViewingRequestForm({ propertyId }: ViewingRequestFormProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    requestedDate: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to request a viewing.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/viewings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          propertyId,
          requestedDate: new Date(formData.requestedDate),
        }),
      })

      if (response.ok) {
        toast({
          title: "Viewing requested!",
          description: "The landlord will confirm your viewing request soon.",
        })
        setFormData({
          requestedDate: "",
          message: "",
        })
      } else {
        throw new Error("Failed to request viewing")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request viewing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Request Viewing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="requestedDate">Preferred Date & Time</Label>
            <Input
              id="requestedDate"
              type="datetime-local"
              value={formData.requestedDate}
              onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <Label htmlFor="message">Additional Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Any specific requirements or questions..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Requesting..." : "Request Viewing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
