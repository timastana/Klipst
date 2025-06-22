import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?message=You must be signed in to access the dashboard")
  }

  // Fetch data based on user role
  let properties = []
  let viewingRequests = []
  let applications = []
  let rentPayments = []

  if (session.user.role === "LANDLORD") {
    properties = await prisma.property.findMany({
      where: { ownerId: session.user.id },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    })

    viewingRequests = await prisma.viewingRequest.findMany({
      where: { property: { ownerId: session.user.id } },
      include: {
        property: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } else if (session.user.role === "TENANT") {
    applications = await prisma.application.findMany({
      where: { tenantId: session.user.id },
      include: { property: { include: { images: true } } },
      orderBy: { createdAt: "desc" },
    })

    viewingRequests = await prisma.viewingRequest.findMany({
      where: { userId: session.user.id },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    })

    rentPayments = await prisma.rentPayment.findMany({
      where: { tenantId: session.user.id },
      include: { property: true },
      orderBy: { dueDate: "desc" },
    })
  } else if (session.user.role === "ADMIN") {
    properties = await prisma.property.findMany({
      take: 5,
      include: { images: true },
      orderBy: { createdAt: "desc" },
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {session.user.role === "LANDLORD" && (
          <Button asChild>
            <Link href="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {session.user.role === "LANDLORD" && <TabsTrigger value="properties">My Properties</TabsTrigger>}
          {session.user.role === "LANDLORD" && <TabsTrigger value="viewings">Viewing Requests</TabsTrigger>}
          {session.user.role === "TENANT" && <TabsTrigger value="applications">My Applications</TabsTrigger>}
          {session.user.role === "TENANT" && <TabsTrigger value="viewings">My Viewings</TabsTrigger>}
          {session.user.role === "TENANT" && <TabsTrigger value="payments">Rent Payments</TabsTrigger>}
          {session.user.role === "ADMIN" && <TabsTrigger value="users">Users</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {session.user.role === "LANDLORD" && "Total Properties"}
                  {session.user.role === "TENANT" && "Active Applications"}
                  {session.user.role === "ADMIN" && "Total Users"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {session.user.role === "LANDLORD" && properties.length}
                  {session.user.role === "TENANT" && applications.length}
                  {session.user.role === "ADMIN" && "N/A"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {session.user.role === "LANDLORD" && "Viewing Requests"}
                  {session.user.role === "TENANT" && "Scheduled Viewings"}
                  {session.user.role === "ADMIN" && "Total Properties"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {session.user.role === "LANDLORD" && viewingRequests.length}
                  {session.user.role === "TENANT" && viewingRequests.length}
                  {session.user.role === "ADMIN" && "N/A"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {session.user.role === "LANDLORD" && "Rented Properties"}
                  {session.user.role === "TENANT" && "Upcoming Payments"}
                  {session.user.role === "ADMIN" && "New Users (30d)"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {session.user.role === "LANDLORD" &&
                    properties.filter((property) => property.status === "RENTED").length}
                  {session.user.role === "TENANT" &&
                    rentPayments.filter((payment) => payment.status === "PENDING").length}
                  {session.user.role === "ADMIN" && "N/A"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {session.user.role === "LANDLORD" && "Available Properties"}
                  {session.user.role === "TENANT" && "Completed Payments"}
                  {session.user.role === "ADMIN" && "Support Tickets"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {session.user.role === "LANDLORD" &&
                    properties.filter((property) => property.status === "AVAILABLE").length}
                  {session.user.role === "TENANT" && rentPayments.filter((payment) => payment.status === "PAID").length}
                  {session.user.role === "ADMIN" && "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {session.user.role === "LANDLORD" && "Recent Properties"}
                {session.user.role === "TENANT" && "Recent Applications"}
                {session.user.role === "ADMIN" && "Recent Properties"}
              </CardTitle>
              <CardDescription>
                {session.user.role === "LANDLORD" && "Your most recently added properties"}
                {session.user.role === "TENANT" && "Your most recent property applications"}
                {session.user.role === "ADMIN" && "Recently added properties across the platform"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.user.role === "LANDLORD" && properties.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't added any properties yet.</p>
                  <Button asChild>
                    <Link href="/properties/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Property
                    </Link>
                  </Button>
                </div>
              )}

              {session.user.role === "LANDLORD" && properties.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.slice(0, 3).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}

              {session.user.role === "TENANT" && applications.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't applied to any properties yet.</p>
                  <Button asChild>
                    <Link href="/properties">Browse Properties</Link>
                  </Button>
                </div>
              )}

              {session.user.role === "TENANT" && applications.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applications.slice(0, 3).map((application) => (
                    <PropertyCard key={application.property.id} property={application.property} />
                  ))}
                </div>
              )}

              {session.user.role === "ADMIN" && properties.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.slice(0, 3).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {session.user.role === "LANDLORD" && (
          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Properties</CardTitle>
                <CardDescription>Manage your property listings</CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't added any properties yet.</p>
                    <Button asChild>
                      <Link href="/properties/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Property
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Additional tabs would be implemented here */}
      </Tabs>
    </div>
  )
}
