import crypto from "crypto"
import UtilisateurModel from "../models/utilisateur.model.js"
import prisma from "../config/prisma.js"
import { sendEmail } from "../utils/emailService.js"

class PasswordResetController {
  /**
   * Demande de réinitialisation de mot de passe
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({
          status: "ERROR",
          message: "L'email est requis",
        })
      }

      // Rechercher l'utilisateur par email
      const utilisateur = await UtilisateurModel.trouverParEmail(email)

      // Si l'utilisateur n'existe pas, renvoyer quand même une réponse positive pour des raisons de sécurité
      if (!utilisateur) {
        return res.status(200).json({
          status: "OK",
          message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé",
        })
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")

      // Enregistrer le token dans la base de données
      await prisma.resetPassword.create({
        data: {
          id_utilisateur: utilisateur.id_utilisateur,
          token: resetTokenHash,
          date_expiration: new Date(Date.now() + 60 * 60 * 1000), // 1 heure
        },
      })

      // Construire l'URL de réinitialisation
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

      // Envoyer l'email
      await sendEmail({
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        text: `Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\nVeuillez cliquer sur le lien suivant ou le coller dans votre navigateur pour terminer le processus :\n\n${resetUrl}\n\nSi vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe restera inchangé.\n\nCe lien expirera dans 1 heure.`,
        html: `
          <h1>Réinitialisation de votre mot de passe</h1>
          <p>Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.</p>
          <p>Veuillez cliquer sur le bouton ci-dessous pour terminer le processus :</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
          <p>Si le bouton ne fonctionne pas, veuillez copier et coller le lien suivant dans votre navigateur :</p>
          <p>${resetUrl}</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe restera inchangé.</p>
          <p>Ce lien expirera dans 1 heure.</p>
        `,
      })

      // Enregistrer l'activité de sécurité
      await prisma.securiteLog.create({
        data: {
          id_utilisateur: utilisateur.id_utilisateur,
          type_activite: "DEMANDE_REINITIALISATION_MDP",
          adresse_ip: req.ip,
          user_agent: req.headers["user-agent"],
          details: JSON.stringify({
            email: utilisateur.email,
            date: new Date(),
          }),
        },
      })

      res.status(200).json({
        status: "OK",
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé",
      })
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation de mot de passe:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la demande de réinitialisation de mot de passe",
        error: error.message,
      })
    }
  }

  /**
   * Valide un token de réinitialisation de mot de passe
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async validateResetToken(req, res) {
    try {
      const { token } = req.params

      if (!token) {
        return res.status(400).json({
          status: "ERROR",
          message: "Token manquant",
        })
      }

      // Hacher le token pour la comparaison
      const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex")

      // Rechercher le token dans la base de données
      const resetToken = await prisma.resetPassword.findFirst({
        where: {
          token: resetTokenHash,
          date_expiration: {
            gt: new Date(),
          },
        },
        include: {
          utilisateur: {
            select: {
              email: true,
            },
          },
        },
      })

      if (!resetToken) {
        return res.status(400).json({
          status: "ERROR",
          message: "Token invalide ou expiré",
        })
      }

      res.status(200).json({
        status: "OK",
        message: "Token valide",
        data: {
          email: resetToken.utilisateur.email,
        },
      })
    } catch (error) {
      console.error("Erreur lors de la validation du token de réinitialisation:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la validation du token de réinitialisation",
        error: error.message,
      })
    }
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async resetPassword(req, res) {
    try {
      const { token } = req.params
      const { password, confirmPassword } = req.body

      if (!token) {
        return res.status(400).json({
          status: "ERROR",
          message: "Token manquant",
        })
      }

      if (!password || !confirmPassword) {
        return res.status(400).json({
          status: "ERROR",
          message: "Mot de passe et confirmation requis",
        })
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          status: "ERROR",
          message: "Les mots de passe ne correspondent pas",
        })
      }

      // Vérifier la complexité du mot de passe
      if (password.length < 8) {
        return res.status(400).json({
          status: "ERROR",
          message: "Le mot de passe doit contenir au moins 8 caractères",
        })
      }

      // Hacher le token pour la comparaison
      const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex")

      // Rechercher le token dans la base de données
      const resetToken = await prisma.resetPassword.findFirst({
        where: {
          token: resetTokenHash,
          date_expiration: {
            gt: new Date(),
          },
        },
      })

      if (!resetToken) {
        return res.status(400).json({
          status: "ERROR",
          message: "Token invalide ou expiré",
        })
      }

      // Mettre à jour le mot de passe de l'utilisateur
      await UtilisateurModel.mettreAJour(resetToken.id_utilisateur, {
        mot_de_passe: password, // Le modèle se charge du hachage
        date_modification: new Date(),
      })

      // Supprimer tous les tokens de réinitialisation pour cet utilisateur
      await prisma.resetPassword.deleteMany({
        where: {
          id_utilisateur: resetToken.id_utilisateur,
        },
      })

      // Enregistrer l'activité de sécurité
      await prisma.securiteLog.create({
        data: {
          id_utilisateur: resetToken.id_utilisateur,
          type_activite: "REINITIALISATION_MDP",
          adresse_ip: req.ip,
          user_agent: req.headers["user-agent"],
          details: JSON.stringify({
            date: new Date(),
          }),
        },
      })

      res.status(200).json({
        status: "OK",
        message: "Mot de passe réinitialisé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la réinitialisation du mot de passe",
        error: error.message,
      })
    }
  }
}

export default PasswordResetController
