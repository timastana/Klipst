import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AccountingService } from "@/lib/accounting"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("propertyId")
    const month = Number.parseInt(searchParams.get("month") || "")
    const year = Number.parseInt(searchParams.get("year") || "")

    if (!propertyId || !month || !year) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const rentRoll = await AccountingService.generateRentRoll(propertyId, month, year)

    return NextResponse.json(rentRoll)
  } catch (error) {
    console.error("Error generating rent roll:", error)
    return NextResponse.json({ error: "Failed to generate rent roll" }, { status: 500 })
  }
}
