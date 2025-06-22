import Stripe from "stripe"

// Only initialize Stripe if the secret key is provided
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null

export async function createPaymentIntent(amount: number, currency = "gbp") {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.")
  }

  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to pence
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}
