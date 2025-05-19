import express from "express"
import { sendEmail } from "../utils/emailService.js"

const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const { to } = req.body
    
    if (!to) {
      return res.status(400).json({
        status: "ERROR",
        message: "L'adresse email du destinataire est requise",
      })
    }
    
    await sendEmail({
      to,
      subject: "Test de configuration email PSAH Hotel",
      text: "Si vous recevez cet email, la configuration est correcte.",
      html: "<h1>Test de configuration email</h1><p>Si vous recevez cet email, la configuration est correcte.</p>",
    })
    
    res.status(200).json({
      status: "OK",
      message: "Email de test envoyé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de test:", error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de l'envoi de l'email de test",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

export default router