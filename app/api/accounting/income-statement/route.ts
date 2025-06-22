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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const incomeStatement = await AccountingService.generateIncomeStatement(
      propertyId,
      new Date(startDate),
      new Date(endDate),
    )

    return NextResponse.json(incomeStatement)
  } catch (error) {
    console.error("Error generating income statement:", error)
    return NextResponse.json({ error: "Failed to generate income statement" }, { status: 500 })
  }
}
