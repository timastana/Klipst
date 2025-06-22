import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook processing is not configured" }, { status: 503 })
  }

  const body = await request.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        const paymentId = paymentIntent.metadata.paymentId

        if (paymentId) {
          await prisma.rentPayment.update({
            where: { id: paymentId },
            data: {
              status: "PAID",
              paidDate: new Date(),
              paymentMethod: "stripe",
            },
          })
        }
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        const failedPaymentId = failedPayment.metadata.paymentId

        if (failedPaymentId) {
          await prisma.rentPayment.update({
            where: { id: failedPaymentId },
            data: {
              status: "FAILED",
            },
          })
        }
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}
