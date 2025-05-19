import UtilisateurModel from "../models/utilisateur.model.js"
import prisma from "../config/prisma.js"

class SecurityController {
  /**
   * Récupère les paramètres de sécurité d'un utilisateur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getSecuritySettings(req, res) {
    try {
      const userId = req.user.userId

      // Récupérer l'utilisateur avec ses paramètres de sécurité
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id_utilisateur: userId },
        select: {
          authentification_deux_facteurs: true,
          derniere_connexion: true,
          fournisseur_auth: true,
          date_modification_mdp: true,
          preferences: {
            where: {
              type_preference: {
                startsWith: "securite_",
              },
            },
          },
        },
      })

      if (!utilisateur) {
        return res.status(404).json({
          status: "ERROR",
          message: "Utilisateur non trouvé",
        })
      }

      // Récupérer les dernières activités de sécurité
      const activites = await prisma.securiteLog.findMany({
        where: { id_utilisateur: userId },
        orderBy: { date_creation: "desc" },
        take: 5,
      })

      // Formater les préférences de sécurité
      const preferences = {}
      utilisateur.preferences.forEach((pref) => {
        const key = pref.type_preference.replace("securite_", "")
        preferences[key] = pref.valeur
      })

      res.status(200).json({
        status: "OK",
        message: "Paramètres de sécurité récupérés avec succès",
        data: {
          twoFactorEnabled: utilisateur.authentification_deux_facteurs,
          lastLogin: utilisateur.derniere_connexion,
          oauthProvider: utilisateur.fournisseur_auth,
          lastPasswordChange: utilisateur.date_modification_mdp,
          preferences: preferences,
          recentActivity: activites.map((act) => ({
            type: act.type_activite,
            date: act.date_creation,
            ip: act.adresse_ip,
            userAgent: act.user_agent,
            details: act.details ? JSON.parse(act.details) : null,
          })),
        },
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des paramètres de sécurité:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la récupération des paramètres de sécurité",
        error: error.message,
      })
    }
  }

  /**
   * Met à jour les paramètres de sécurité d'un utilisateur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async updateSecuritySettings(req, res) {
    try {
      const userId = req.user.userId
      const { notifyOnLogin, notifyOnPasswordChange, sessionTimeout, ipRestrictions } = req.body

      // Mettre à jour les préférences de sécurité
      const preferencesToUpdate = [
        { type: "securite_notification_connexion", value: notifyOnLogin },
        { type: "securite_notification_mdp", value: notifyOnPasswordChange },
        { type: "securite_timeout_session", value: sessionTimeout },
        { type: "securite_restrictions_ip", value: ipRestrictions },
      ]

      for (const pref of preferencesToUpdate) {
        if (pref.value !== undefined) {
          // Vérifier si la préférence existe déjà
          const existingPref = await prisma.preferenceUtilisateur.findFirst({
            where: {
              id_utilisateur: userId,
              type_preference: pref.type,
            },
          })

          if (existingPref) {
            // Mettre à jour la préférence existante
            await prisma.preferenceUtilisateur.update({
              where: { id: existingPref.id },
              data: { valeur: String(pref.value) },
            })
          } else {
            // Créer une nouvelle préférence
            await prisma.preferenceUtilisateur.create({
              data: {
                id_utilisateur: userId,
                type_preference: pref.type,
                valeur: String(pref.value),
              },
            })
          }
        }
      }

      // Enregistrer l'activité de sécurité
      await prisma.securiteLog.create({
        data: {
          id_utilisateur: userId,
          type_activite: "MODIFICATION_PARAMETRES_SECURITE",
          adresse_ip: req.ip,
          user_agent: req.headers["user-agent"],
          details: JSON.stringify(req.body),
        },
      })

      res.status(200).json({
        status: "OK",
        message: "Paramètres de sécurité mis à jour avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres de sécurité:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la mise à jour des paramètres de sécurité",
        error: error.message,
      })
    }
  }

  /**
   * Change le mot de passe d'un utilisateur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.userId
      const { currentPassword, newPassword, confirmPassword } = req.body

      // Vérifier que tous les champs sont présents
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          status: "ERROR",
          message: "Tous les champs sont requis",
        })
      }

      // Vérifier que les nouveaux mots de passe correspondent
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          status: "ERROR",
          message: "Les nouveaux mots de passe ne correspondent pas",
        })
      }

      // Vérifier la complexité du nouveau mot de passe
      if (newPassword.length < 8) {
        return res.status(400).json({
          status: "ERROR",
          message: "Le nouveau mot de passe doit contenir au moins 8 caractères",
        })
      }

      // Récupérer l'utilisateur
      const utilisateur = await UtilisateurModel.trouverParId(userId)
      if (!utilisateur) {
        return res.status(404).json({
          status: "ERROR",
          message: "Utilisateur non trouvé",
        })
      }

      // Vérifier le mot de passe actuel
      const isPasswordValid = await UtilisateurModel.verifierMotDePasse(currentPassword, utilisateur.mot_de_passe)
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "ERROR",
          message: "Mot de passe actuel incorrect",
        })
      }

      // Mettre à jour le mot de passe
      await UtilisateurModel.mettreAJour(userId, {
        mot_de_passe: newPassword, // Le modèle se charge du hachage
        date_modification: new Date(),
        date_modification_mdp: new Date(),
      })

      // Enregistrer l'activité de sécurité
      await prisma.securiteLog.create({
        data: {
          id_utilisateur: userId,
          type_activite: "CHANGEMENT_MDP",
          adresse_ip: req.ip,
          user_agent: req.headers["user-agent"],
          details: JSON.stringify({
            date: new Date(),
          }),
        },
      })

      // Vérifier si l'utilisateur a activé les notifications de changement de mot de passe
      const notifyPref = await prisma.preferenceUtilisateur.findFirst({
        where: {
          id_utilisateur: userId,
          type_preference: "securite_notification_mdp",
        },
      })

      if (notifyPref && notifyPref.valeur === "true") {
        // Envoyer un email de notification (à implémenter)
        // await sendEmail({...})
      }

      res.status(200).json({
        status: "OK",
        message: "Mot de passe changé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors du changement de mot de passe",
        error: error.message,
      })
    }
  }

  /**
   * Récupère les logs de sécurité (admin uniquement)
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getSecurityLogs(req, res) {
    try {
      const { userId, startDate, endDate, type, page = 1, limit = 20 } = req.query

      // Construire les filtres
      const filters = {}

      if (userId) {
        filters.id_utilisateur = Number.parseInt(userId)
      }

      if (startDate && endDate) {
        filters.date_creation = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      } else if (startDate) {
        filters.date_creation = {
          gte: new Date(startDate),
        }
      } else if (endDate) {
        filters.date_creation = {
          lte: new Date(endDate),
        }
      }

      if (type) {
        filters.type_activite = type
      }

      // Calculer le nombre total de logs
      const totalLogs = await prisma.securiteLog.count({
        where: filters,
      })

      // Récupérer les logs paginés
      const logs = await prisma.securiteLog.findMany({
        where: filters,
        include: {
          utilisateur: {
            select: {
              id_utilisateur: true,
              nom_utilisateur: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { date_creation: "desc" },
        skip: (page - 1) * limit,
        take: Number.parseInt(limit),
      })

      // Formater les logs
      const formattedLogs = logs.map((log) => ({
        id: log.id,
        userId: log.id_utilisateur,
        userName: log.utilisateur.nom_utilisateur,
        email: log.utilisateur.email,
        role: log.utilisateur.role,
        type: log.type_activite,
        date: log.date_creation,
        ip: log.adresse_ip,
        userAgent: log.user_agent,
        details: log.details ? JSON.parse(log.details) : null,
      }))

      res.status(200).json({
        status: "OK",
        message: "Logs de sécurité récupérés avec succès",
        data: {
          logs: formattedLogs,
          pagination: {
            total: totalLogs,
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            pages: Math.ceil(totalLogs / limit),
          },
        },
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des logs de sécurité:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la récupération des logs de sécurité",
        error: error.message,
      })
    }
  }
}

export default SecurityController
