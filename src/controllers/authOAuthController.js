import jwt from "jsonwebtoken"
import UtilisateurModel from "../models/utilisateur.model.js"
import RoleModel from "../models/roleModel.js"
import { v4 as uuidv4 } from "uuid"
import prisma from "../config/prisma.js"
import axios from "axios"

class AuthOAuthController {
  /**
   * Initialise le processus d'authentification OAuth
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async initiateOAuth(req, res) {
    try {
      const { provider } = req.params

      if (!["google", "facebook"].includes(provider)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Fournisseur OAuth non pris en charge",
        })
      }

      // Générer un état pour la sécurité CSRF
      const state = uuidv4()

      // Stocker l'état dans la base de données
      await prisma.oAuthState.create({
        data: {
          state,
          provider,
          date_expiration: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      })

      // Construire l'URL de redirection en fonction du fournisseur
      let redirectUrl
      switch (provider) {
        case "google":
          redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
            process.env.GOOGLE_CLIENT_ID
          }&redirect_uri=${encodeURIComponent(
            process.env.OAUTH_REDIRECT_URI + "/google",
          )}&response_type=code&scope=email%20profile&state=${state}`
          break
        case "facebook":
          redirectUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${
            process.env.FACEBOOK_CLIENT_ID
          }&redirect_uri=${encodeURIComponent(
            process.env.OAUTH_REDIRECT_URI + "/facebook",
          )}&state=${state}&scope=email,public_profile`
          break
      }

      res.status(200).json({
        status: "OK",
        message: "Redirection vers le fournisseur OAuth",
        data: {
          redirectUrl,
          state,
        },
      })
    } catch (error) {
      console.error("Erreur lors de l'initialisation OAuth:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de l'initialisation de l'authentification OAuth",
        error: error.message,
      })
    }
  }

  /**
   * Gère le callback OAuth après l'authentification
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async oauthCallback(req, res) {
    try {
      const { provider } = req.params
      const { code, state, error } = req.query

      // Vérifier s'il y a une erreur
      if (error) {
        return res.status(400).json({
          status: "ERROR",
          message: "Erreur lors de l'authentification OAuth",
          error,
        })
      }

      // Vérifier l'état pour la sécurité CSRF
      const oauthState = await prisma.oauthState.findFirst({
        where: {
          state,
          provider,
          date_expiration: {
            gt: new Date(),
          },
        },
      })

      if (!oauthState) {
        return res.status(400).json({
          status: "ERROR",
          message: "État OAuth invalide ou expiré",
        })
      }

      // Supprimer l'état utilisé
      await prisma.oauthState.delete({
        where: {
          id: oauthState.id,
        },
      })

      // Échanger le code contre un token d'accès
      let accessToken
      let userData

      switch (provider) {
        case "google":
          accessToken = await AuthOAuthController.getGoogleAccessToken(code)
          userData = await AuthOAuthController.getGoogleUserData(accessToken)
          break
        case "facebook":
          accessToken = await AuthOAuthController.getFacebookAccessToken(code)
          userData = await AuthOAuthController.getFacebookUserData(accessToken)
          break
        default:
          return res.status(400).json({
            status: "ERROR",
            message: "Fournisseur OAuth non pris en charge",
          })
      }

      // Rechercher si l'utilisateur existe déjà
      let utilisateur = await UtilisateurModel.trouverParEmail(userData.email)

      if (utilisateur) {
        // Mettre à jour les informations OAuth si l'utilisateur existe
        utilisateur = await UtilisateurModel.mettreAJour(utilisateur.id_utilisateur, {
          fournisseur_auth: provider,
          id_auth_externe: userData.id,
          date_modification: new Date(),
        })
      } else {
        // Créer un nouvel utilisateur
        const roleClient = await RoleModel.findByName("CLIENT")
        if (!roleClient) {
          return res.status(500).json({
            status: "ERROR",
            message: "Rôle CLIENT non trouvé",
          })
        }

        // Générer un mot de passe aléatoire pour les comptes OAuth
        const randomPassword = Math.random().toString(36).slice(-10)

        utilisateur = await UtilisateurModel.creerAvecParametres(
          userData.name,
          userData.email,
          randomPassword,
          roleClient.id_role,
          null, // Pas de téléphone pour l'instant
          roleClient.code,
        )

        // Mettre à jour les informations OAuth
        utilisateur = await UtilisateurModel.mettreAJour(utilisateur.id_utilisateur, {
          fournisseur_auth: provider,
          id_auth_externe: userData.id,
        })
      }

      // Récupérer les permissions
      const permissions = await prisma.permission.findMany({
        where: {
          rolePermissions: {
            some: {
              id_role: utilisateur.id_role,
            },
          },
        },
      })

      // Récupérer le code du rôle depuis role_relation
      let roleCode = utilisateur.role
      if (utilisateur.role_relation) {
        roleCode = utilisateur.role_relation.code
      }

      // Déterminer si l'utilisateur est un client et récupérer son ID client
      let clientId = null
      if (utilisateur.client) {
        clientId = utilisateur.client.id_client
      }

      // Créer le token JWT
      const token = jwt.sign(
        {
          userId: utilisateur.id_utilisateur,
          role: roleCode,
          email: utilisateur.email,
          clientId: clientId,
          permissions: permissions.map((p) => p.code),
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      )

      // Rediriger vers la page de succès avec le token
      res.redirect(`${process.env.FRONTEND_URL}/auth/oauth-success?token=${token}`)
    } catch (error) {
      console.error("Erreur lors du callback OAuth:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors du traitement du callback OAuth",
        error: error.message,
      })
    }
  }

  /**
   * Lie un compte OAuth à un compte existant
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async linkAccount(req, res) {
    try {
      const userId = req.user.userId
      const { provider, accessToken } = req.body

      if (!["google", "facebook"].includes(provider)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Fournisseur OAuth non pris en charge",
        })
      }

      // Récupérer les données utilisateur du fournisseur OAuth
      let userData
      switch (provider) {
        case "google":
          userData = await AuthOAuthController.getGoogleUserData(accessToken)
          break
        case "facebook":
          userData = await AuthOAuthController.getFacebookUserData(accessToken)
          break
      }

      // Vérifier si un autre compte utilise déjà cet ID OAuth
      const existingUser = await prisma.utilisateur.findFirst({
        where: {
          fournisseur_auth: provider,
          id_auth_externe: userData.id,
          id_utilisateur: {
            not: userId,
          },
        },
      })

      if (existingUser) {
        return res.status(400).json({
          status: "ERROR",
          message: "Ce compte OAuth est déjà lié à un autre utilisateur",
        })
      }

      // Mettre à jour l'utilisateur avec les informations OAuth
      await UtilisateurModel.mettreAJour(userId, {
        fournisseur_auth: provider,
        id_auth_externe: userData.id,
        date_modification: new Date(),
      })

      res.status(200).json({
        status: "OK",
        message: "Compte lié avec succès",
        data: {
          provider,
          email: userData.email,
        },
      })
    } catch (error) {
      console.error("Erreur lors de la liaison du compte:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la liaison du compte",
        error: error.message,
      })
    }
  }

  /**
   * Délie un compte OAuth d'un compte existant
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async unlinkAccount(req, res) {
    try {
      const userId = req.user.userId
      const { password } = req.body

      // Vérifier le mot de passe pour des raisons de sécurité
      const utilisateur = await UtilisateurModel.trouverParId(userId)
      if (!utilisateur) {
        return res.status(404).json({
          status: "ERROR",
          message: "Utilisateur non trouvé",
        })
      }

      const isPasswordValid = await UtilisateurModel.verifierMotDePasse(password, utilisateur.mot_de_passe)
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "ERROR",
          message: "Mot de passe incorrect",
        })
      }

      // Vérifier si l'utilisateur a un fournisseur OAuth
      if (!utilisateur.fournisseur_auth) {
        return res.status(400).json({
          status: "ERROR",
          message: "Aucun compte OAuth lié à cet utilisateur",
        })
      }

      // Mettre à jour l'utilisateur pour supprimer les informations OAuth
      await UtilisateurModel.mettreAJour(userId, {
        fournisseur_auth: null,
        id_auth_externe: null,
        date_modification: new Date(),
      })

      res.status(200).json({
        status: "OK",
        message: "Compte OAuth délié avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la déliaison du compte:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la déliaison du compte",
        error: error.message,
      })
    }
  }

  // Méthodes utilitaires pour les différents fournisseurs OAuth

  /**
   * Récupère un token d'accès Google
   * @param {string} code - Code d'autorisation
   * @returns {Promise<string>} - Token d'accès
   */
  static async getGoogleAccessToken(code) {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.OAUTH_REDIRECT_URI + "/google",
      grant_type: "authorization_code",
    })

    return response.data.access_token
  }

  /**
   * Récupère les données utilisateur Google
   * @param {string} accessToken - Token d'accès
   * @returns {Promise<Object>} - Données utilisateur
   */
  static async getGoogleUserData(accessToken) {
    const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name || `${response.data.given_name} ${response.data.family_name}`,
      picture: response.data.picture,
    }
  }

  /**
   * Récupère un token d'accès Facebook
   * @param {string} code - Code d'autorisation
   * @returns {Promise<string>} - Token d'accès
   */
  static async getFacebookAccessToken(code) {
    const response = await axios.get(
      `https://graph.facebook.com/v12.0/oauth/access_token?client_id=${
        process.env.FACEBOOK_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
        process.env.OAUTH_REDIRECT_URI + "/facebook",
      )}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`,
    )

    return response.data.access_token
  }

  /**
   * Récupère les données utilisateur Facebook
   * @param {string} accessToken - Token d'accès
   * @returns {Promise<Object>} - Données utilisateur
   */
  static async getFacebookUserData(accessToken) {
    try {
      console.log("Récupération des données Facebook avec token:", accessToken)
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
      )
      console.log("Réponse Facebook:", response.data)

      return {
        id: response.data.id,
        email: response.data.email || `${response.data.id}@facebook.com`, // Fallback si l'email n'est pas disponible
        name: response.data.name,
        picture: response.data.picture?.data?.url,
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données Facebook:", error.response?.data || error.message)
      throw new Error(`Erreur Facebook API: ${error.response?.data?.error?.message || error.message}`)
    }
  }
}

export default AuthOAuthController
