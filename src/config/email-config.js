import nodemailer from "nodemailer"

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Vérifier la configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify()
    console.log("Configuration email vérifiée avec succès")
    return true
  } catch (error) {
    console.error("Erreur de configuration email:", error)
    return false
  }
}

export { transporter, verifyEmailConfig }
