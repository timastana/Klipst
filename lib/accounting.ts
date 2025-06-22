import { prisma } from "./prisma"
import { endOfMonth } from "date-fns"

export class AccountingService {
  // Calculate monthly rent roll
  static async generateRentRoll(propertyId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = endOfMonth(startDate)

    // Get all leases for the property in this period
    const leases = await prisma.lease.findMany({
      where: {
        propertyId,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
          {
            startDate: { lte: endDate },
            status: "ACTIVE",
          },
        ],
      },
      include: {
        rentPayments: {
          where: {
            dueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        tenant: true,
      },
    })

    // Calculate metrics
    const totalUnits = await prisma.property.count({ where: { id: propertyId } })
    const occupiedUnits = leases.filter((lease) => lease.status === "ACTIVE").length
    const vacantUnits = totalUnits - occupiedUnits

    const potentialRent = leases.reduce((sum, lease) => sum + lease.monthlyRent, 0)
    const actualRent = leases.reduce((sum, lease) => {
      const paidPayments = lease.rentPayments.filter((payment) => payment.status === "PAID")
      return sum + paidPayments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
    }, 0)

    const lossToVacancy = potentialRent - actualRent

    // Get other income (late fees, etc.)
    const otherIncome = leases.reduce((sum, lease) => {
      return (
        sum +
        lease.rentPayments.reduce((paymentSum, payment) => {
          return paymentSum + payment.lateFees + payment.otherCharges
        }, 0)
      )
    }, 0)

    const totalIncome = actualRent + otherIncome

    // Get expenses for the period
    const expenses = await prisma.expense.findMany({
      where: {
        propertyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const netOperatingIncome = totalIncome - totalExpenses

    // Save or update rent roll
    return await prisma.rentRoll.upsert({
      where: {
        propertyId_month_year: {
          propertyId,
          month,
          year,
        },
      },
      update: {
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate: totalUnits > 0 ? occupiedUnits / totalUnits : 0,
        potentialRent,
        actualRent,
        lossToVacancy,
        otherIncome,
        totalIncome,
        totalExpenses,
        netOperatingIncome,
      },
      create: {
        propertyId,
        month,
        year,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate: totalUnits > 0 ? occupiedUnits / totalUnits : 0,
        potentialRent,
        actualRent,
        lossToVacancy,
        otherIncome,
        totalIncome,
        totalExpenses,
        netOperatingIncome,
      },
    })
  }

  // Calculate late fees
  static async calculateLateFees(leaseId: string) {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        rentPayments: {
          where: {
            status: "OVERDUE",
            lateFeeApplied: false,
          },
        },
      },
    })

    if (!lease) return

    const today = new Date()

    for (const payment of lease.rentPayments) {
      const daysLate = Math.floor((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysLate > lease.lateFeeGraceDays) {
        await prisma.rentPayment.update({
          where: { id: payment.id },
          data: {
            lateFees: lease.lateFeeAmount,
            daysLate,
            lateFeeApplied: true,
            amount: payment.amount + lease.lateFeeAmount,
          },
        })

        // Create transaction record
        await prisma.transaction.create({
          data: {
            propertyId: lease.propertyId,
            leaseId: lease.id,
            type: "INCOME",
            category: "Late Fees",
            description: `Late fee for rent payment - ${daysLate} days late`,
            amount: lease.lateFeeAmount,
            date: today,
            referenceId: payment.id,
            referenceType: "RENT_PAYMENT",
          },
        })
      }
    }
  }

  // Generate financial statements
  static async generateIncomeStatement(propertyId: string, startDate: Date, endDate: Date) {
    // Income
    const rentIncome = await prisma.transaction.aggregate({
      where: {
        propertyId,
        type: "INCOME",
        category: { in: ["Rent", "Late Fees"] },
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    })

    const otherIncome = await prisma.transaction.aggregate({
      where: {
        propertyId,
        type: "INCOME",
        category: { notIn: ["Rent", "Late Fees"] },
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    })

    // Expenses by category
    const expenses = await prisma.expense.groupBy({
      by: ["category"],
      where: {
        propertyId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    })

    const totalIncome = (rentIncome._sum.amount || 0) + (otherIncome._sum.amount || 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense._sum.amount || 0), 0)

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      income: {
        rent: rentIncome._sum.amount || 0,
        other: otherIncome._sum.amount || 0,
        total: totalIncome,
      },
      expenses: expenses.map((expense) => ({
        category: expense.category,
        amount: expense._sum.amount || 0,
      })),
      totalExpenses,
      netOperatingIncome: totalIncome - totalExpenses,
    }
  }

  // Tax reporting
  static async generateTaxReport(landlordId: string, year: number) {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    const properties = await prisma.property.findMany({
      where: { ownerId: landlordId },
    })

    const report = {
      year,
      properties: [],
      summary: {
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        deductibleExpenses: 0,
      },
    }

    for (const property of properties) {
      const incomeStatement = await this.generateIncomeStatement(property.id, startDate, endDate)

      const deductibleExpenses = await prisma.expense.aggregate({
        where: {
          propertyId: property.id,
          date: { gte: startDate, lte: endDate },
          taxDeductible: true,
        },
        _sum: { amount: true },
      })

      const propertyReport = {
        property: property.title,
        address: property.address,
        income: incomeStatement.income.total,
        expenses: incomeStatement.totalExpenses,
        netIncome: incomeStatement.netOperatingIncome,
        deductibleExpenses: deductibleExpenses._sum.amount || 0,
      }

      report.properties.push(propertyReport)
      report.summary.totalIncome += propertyReport.income
      report.summary.totalExpenses += propertyReport.expenses
      report.summary.deductibleExpenses += propertyReport.deductibleExpenses
    }

    report.summary.netIncome = report.summary.totalIncome - report.summary.totalExpenses

    return report
  }
}
