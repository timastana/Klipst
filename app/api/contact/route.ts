import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message, propertyId, landlordId } = await request.json()

    if (!name || !email || !message || !propertyId || !landlordId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get property and landlord details
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

    // Send email to landlord (if email is configured)
    const emailHtml = `
      <h2>New Property Inquiry</h2>
      <p><strong>Property:</strong> ${property.title}</p>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `

    // Try to send email, but don't fail if it doesn't work
    await sendEmail({
      to: property.owner.email,
      subject: `Property Inquiry: ${property.title}`,
      html: emailHtml,
    }).catch((error) => {
      console.error("Failed to send email:", error)
      // Continue execution even if email fails
    })

    // Store the contact request in the database (optional)
    // This could be implemented later

    return NextResponse.json({ message: "Contact request sent successfully" })
  } catch (error) {
    console.error("Error sending contact request:", error)
    return NextResponse.json({ error: "Failed to send contact request" }, { status: 500 })
  }
}
