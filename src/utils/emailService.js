import { transporter } from "../config/email-config.js"

/**
 * Envoie un email
 * @param {Object} options - Options de l'email
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet
 * @param {string} options.text - Contenu texte
 * @param {string} options.html - Contenu HTML
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "PSAH Hotel <noreply@psahhotel.com>",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email envoyé:", info.messageId)
    return info
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    throw error
  }
}

/**
 * Envoie un email de bienvenue
 * @param {string} to - Adresse email du destinataire
 * @param {string} name - Nom du destinataire
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export const sendWelcomeEmail = async (to, name) => {
  return sendEmail({
    to,
    subject: "Bienvenue sur PSAH Hotel",
    text: `Bonjour ${name},\n\nNous vous souhaitons la bienvenue sur PSAH Hotel. Nous sommes ravis de vous compter parmi nos clients.\n\nCordialement,\nL'équipe PSAH Hotel`,
    html: `
      <h1>Bienvenue sur PSAH Hotel</h1>
      <p>Bonjour ${name},</p>
      <p>Nous vous souhaitons la bienvenue sur PSAH Hotel. Nous sommes ravis de vous compter parmi nos clients.</p>
      <p>Cordialement,<br>L'équipe PSAH Hotel</p>
    `,
  })
}

/**
 * Envoie un email de notification de connexion
 * @param {string} to - Adresse email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} ip - Adresse IP
 * @param {string} userAgent - User-Agent
 * @param {Date} date - Date de connexion
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export const sendLoginNotificationEmail = async (to, name, ip, userAgent, date) => {
  return sendEmail({
    to,
    subject: "Nouvelle connexion à votre compte PSAH Hotel",
    text: `Bonjour ${name},\n\nNous avons détecté une nouvelle connexion à votre compte PSAH Hotel.\n\nDate: ${date}\nAdresse IP: ${ip}\nAppareil: ${userAgent}\n\nSi vous n'êtes pas à l'origine de cette connexion, veuillez sécuriser votre compte immédiatement en changeant votre mot de passe.\n\nCordialement,\nL'équipe PSAH Hotel`,
    html: `
      <h1>Nouvelle connexion à votre compte PSAH Hotel</h1>
      <p>Bonjour ${name},</p>
      <p>Nous avons détecté une nouvelle connexion à votre compte PSAH Hotel.</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Adresse IP:</strong> ${ip}</li>
        <li><strong>Appareil:</strong> ${userAgent}</li>
      </ul>
      <p>Si vous n'êtes pas à l'origine de cette connexion, veuillez sécuriser votre compte immédiatement en changeant votre mot de passe.</p>
      <p>Cordialement,<br>L'équipe PSAH Hotel</p>
    `,
  })
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} to - Adresse email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} resetUrl - URL de réinitialisation
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export const sendPasswordResetEmail = async (to, name, resetUrl) => {
  return sendEmail({
    to,
    subject: "Réinitialisation de votre mot de passe PSAH Hotel",
    text: `Bonjour ${name},\n\nVous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien suivant pour définir un nouveau mot de passe :\n\n${resetUrl}\n\nCe lien expirera dans 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\nCordialement,\nL'équipe PSAH Hotel`,
    html: `
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Bonjour ${name},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
      </p>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
      <p>Cordialement,<br>L'équipe PSAH Hotel</p>
    `,
  })
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail,
}
