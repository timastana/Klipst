// Use a type assertion to handle the missing type declarations
const nodemailer = require("nodemailer") as any

// Only create transporter if SMTP is configured
const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number.parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!transporter) {
    console.warn("Email is not configured. Skipping email send.")
    return { success: false, error: "Email not configured" }
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error }
  }
}
