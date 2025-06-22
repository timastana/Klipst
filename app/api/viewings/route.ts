import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { propertyId, requestedDate, message } = await request.json()

    if (!propertyId || !requestedDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get property details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Create viewing request
    const viewingRequest = await prisma.viewingRequest.create({
      data: {
        userId: session.user.id,
        propertyId,
        requestedDate: new Date(requestedDate),
        message: message || null,
      },
    })

    // Send email to landlord (if email is configured)
    const emailHtml = `
      <h2>New Viewing Request</h2>
      <p><strong>Property:</strong> ${property.title}</p>
      <p><strong>Requested by:</strong> ${session.user.name || session.user.email}</p>
      <p><strong>Requested Date:</strong> ${new Date(requestedDate).toLocaleString()}</p>
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
      <p>Please log in to your dashboard to confirm or reschedule this viewing.</p>
    `

    // Try to send email, but don't fail if it doesn't work
    await sendEmail({
      to: property.owner.email,
      subject: `Viewing Request: ${property.title}`,
      html: emailHtml,
    }).catch((error) => {
      console.error("Failed to send email:", error)
      // Continue execution even if email fails
    })

    return NextResponse.json(viewingRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating viewing request:", error)
    return NextResponse.json({ error: "Failed to create viewing request" }, { status: 500 })
  }
}
