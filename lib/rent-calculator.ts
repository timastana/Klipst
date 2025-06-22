import { prisma } from "./prisma"
import { addMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns"

export class RentCalculator {
  // Calculate prorated rent for partial months
  static calculateProratedRent(monthlyRent: number, moveInDate: Date, moveOutDate?: Date): number {
    const monthStart = startOfMonth(moveInDate)
    const monthEnd = endOfMonth(moveInDate)

    const actualMoveOut = moveOutDate || monthEnd
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1
    const daysOccupied = differenceInDays(actualMoveOut, moveInDate) + 1

    return (monthlyRent / daysInMonth) * daysOccupied
  }

  // Apply rent increases
  static async applyRentIncrease(leaseId: string): Promise<void> {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
    })

    if (!lease || !lease.nextIncreaseDate || lease.nextIncreaseDate > new Date()) {
      return
    }

    const newRent = lease.monthlyRent * (1 + lease.rentIncreaseRate / 100)
    const nextIncreaseDate = addMonths(lease.nextIncreaseDate, 12)

    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        monthlyRent: newRent,
        nextIncreaseDate,
      },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        propertyId: lease.propertyId,
        leaseId: lease.id,
        type: "INCOME",
        category: "Rent Increase",
        description: `Rent increased by ${lease.rentIncreaseRate}% to $${newRent}`,
        amount: newRent - lease.monthlyRent,
        date: lease.nextIncreaseDate,
      },
    })
  }

  // Calculate total monthly charges
  static async calculateMonthlyCharges(leaseId: string, month: Date) {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        leaseCharges: {
          where: {
            isActive: true,
            startDate: { lte: month },
            OR: [{ endDate: null }, { endDate: { gte: month } }],
          },
        },
      },
    })

    if (!lease) return 0

    let totalCharges = lease.monthlyRent

    for (const charge of lease.leaseCharges) {
      switch (charge.frequency) {
        case "MONTHLY":
          totalCharges += charge.amount
          break
        case "QUARTERLY":
          if (month.getMonth() % 3 === 0) {
            totalCharges += charge.amount
          }
          break
        case "ANNUALLY":
          if (month.getMonth() === 0) {
            totalCharges += charge.amount
          }
          break
      }
    }

    return totalCharges
  }

  // Apply discounts and promotions
  static async applyDiscounts(leaseId: string, paymentAmount: number): Promise<number> {
    // Example: Early payment discount
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
    })

    if (!lease) return paymentAmount

    // 2% discount for early payment (before due date)
    const today = new Date()
    const dueDate = new Date(today.getFullYear(), today.getMonth(), lease.rentDueDay)

    if (today < dueDate) {
      return paymentAmount * 0.98 // 2% discount
    }

    return paymentAmount
  }

  // Generate recurring rent payments
  static async generateRecurringPayments(leaseId: string): Promise<void> {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
    })

    if (!lease || lease.status !== "ACTIVE") return

    const today = new Date()
    const endDate = lease.endDate
    let currentDate = new Date(today.getFullYear(), today.getMonth(), lease.rentDueDay)

    // Generate payments for the next 12 months or until lease end
    while (currentDate <= endDate && currentDate <= addMonths(today, 12)) {
      const existingPayment = await prisma.rentPayment.findFirst({
        where: {
          leaseId,
          dueDate: currentDate,
        },
      })

      if (!existingPayment) {
        const monthlyCharges = await this.calculateMonthlyCharges(leaseId, currentDate)

        await prisma.rentPayment.create({
          data: {
            leaseId,
            amount: monthlyCharges,
            baseRent: lease.monthlyRent,
            dueDate: currentDate,
            status: "PENDING",
          },
        })
      }

      currentDate = addMonths(currentDate, 1)
    }
  }
}
