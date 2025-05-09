import jwt from "jsonwebtoken"
import { RoleMapper } from "../utils/roleMapper.js"
import PermissionModel from "../models/permission.model.js"
import prisma from "../config/prisma.js";

// SUPPRIMEZ CETTE LIGNE - Elle ne devrait pas être ici
// const permissions = await PermissionModel.getUserPermissions(utilisateur.id_utilisateur)


const permissionModel = PermissionModel;


// Dans middleware/auth.js - ne modifiez que la fonction authenticateJWT

/**
 * Middleware d'authentification JWT
 */
export const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    // Log pour débogage
    console.log("Headers reçus:", req.headers)
    console.log("Auth Header:", authHeader)
    
    if (!authHeader) {
      return res.status(401).json({
        status: "ERROR",
        message: "En-tête d'autorisation manquant"
      })
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: "ERROR",
        message: "Format d'en-tête d'autorisation invalide. Doit commencer par 'Bearer '"
      })
    }
    
    const token = authHeader.split(' ')[1]
    console.log("Token extrait:", token ? token.substring(0, 20) + "..." : "null")
    
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET non défini")
      return res.status(500).json({
        status: "ERROR",
        message: "Erreur de configuration du serveur"
      })
    }
    
    jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }, (err, decodedUser) => {
      if (err) {
        console.error("Erreur JWT:", err.name, err.message)
        return res.status(403).json({
          status: "ERROR",
          message: err.name === "TokenExpiredError" ? "Token expiré" : "Token invalide",
          error: err.message
        })
      }
      
      req.user = decodedUser
      console.log("Utilisateur décodé:", decodedUser)
      next()
    })
  } catch (error) {
    console.error("Erreur d'authentification:", error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de l'authentification",
      error: error.message
    })
  }
}

// Gardez toutes les autres fonctions telles quelles
/**
 * Middleware pour vérifier si l'utilisateur est un client
 */
export const isClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  if (req.user.role === "CLIENT" || RoleMapper.toBaseRole(req.user.role) === "client") {
    next()
  } else {
    return res.status(403).json({
      status: "ERROR",
      message: "Accès refusé. Rôle client requis."
    })
  }
}

/**
 * Middleware pour vérifier si l'utilisateur a accès aux données d'un client spécifique
 * Permet l'accès si l'utilisateur est le client lui-même ou un administrateur
 */
export const checkClientAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  const clientId = Number.parseInt(req.params.clientId)

  // Si l'utilisateur est un administrateur, autoriser l'accès
  if (
    req.user.role === "SUPER_ADMIN" ||
    req.user.role === "ADMIN_GENERAL" ||
    RoleMapper.toBaseRole(req.user.role) === "administrateur"
  ) {
    return next()
  }

  // Si l'utilisateur est le client lui-même, autoriser l'accès
  if (req.user.clientId === clientId) {
    return next()
  }

  // Sinon, refuser l'accès
  return res.status(403).json({
    status: "ERROR",
    message: "Vous n'êtes pas autorisé à accéder aux données de ce client"
  })
}

/**
 * Middleware pour vérifier si l'utilisateur a accès à une réservation spécifique
 * Permet l'accès si l'utilisateur est le client associé à la réservation ou un administrateur
 */
export const verifyClientAccessToReservation = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  try {
    const idReservation = Number.parseInt(req.params.idReservation)

    // Si l'utilisateur est un administrateur, autoriser l'accès
    if (
      req.user.role === "SUPER_ADMIN" ||
      req.user.role === "ADMIN_GENERAL" ||
      req.user.role === "RESPONSABLE_HEBERGEMENT" ||
      req.user.role === "RECEPTIONNISTE" ||
      RoleMapper.toBaseRole(req.user.role) === "administrateur" ||
      RoleMapper.toBaseRole(req.user.role) === "personnel"
    ) {
      return next()
    }

    // Récupérer la réservation pour vérifier le client associé
    const reservation = await prisma.reservation.findUnique({
      where: { id_reservation: idReservation },
      select: { id_client: true },
    })

    if (!reservation) {
      return res.status(404).json({
        status: "ERROR",
        message: "Réservation non trouvée"
      })
    }

    // Si l'utilisateur est le client associé à la réservation, autoriser l'accès
    if (req.user.clientId === reservation.id_client) {
      return next()
    }

    // Sinon, refuser l'accès
    return res.status(403).json({
      status: "ERROR",
      message: "Vous n'êtes pas autorisé à accéder à cette réservation"
    })
  } catch (error) {
    console.error("Erreur lors de la vérification de l'accès à la réservation:", error)
    return res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la vérification de l'accès à la réservation",
      error: error.message
    })
  }
}

/**
 * Middleware pour vérifier les rôles autorisés
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentification requise"
      })
    }

    console.log("Vérification des rôles:", {
      userRole: req.user.role,
      requiredRoles: roles,
    })

    // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
    if (roles.includes(req.user.role)) {
      return next()
    }

    // Sinon, utiliser RoleMapper
    if (RoleMapper.hasAuthorizedRole(req.user, roles)) {
      next()
    } else {
      res.status(403).json({
        status: "ERROR",
        message: "Accès non autorisé",
        debug: {
          userRole: req.user.role,
          requiredRoles: roles,
        },
      })
    }
  }
}

/**
 * Middleware pour vérifier si l'utilisateur a une permission spécifique
 * @param {string} permissionCode - Code de la permission requise
 * @returns {Function} - Middleware Express
 */
export const checkPermission = (permissionCode) => {
  return async (req, res, next) => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentification requise"
      })
    }

    try {
      // Vérifier si l'utilisateur a la permission requise dans le token JWT
      if (req.user.permissions && Array.isArray(req.user.permissions)) {
        if (req.user.permissions.includes(permissionCode)) {
          return next()
        }
      }

      // Sinon, vérifier dans la base de données
      const hasPermission = await permissionModel.userHasPermission(req.user.userId, permissionCode)

      if (!hasPermission) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas la permission nécessaire pour effectuer cette action"
        })
      }

      // Si l'utilisateur a la permission, continuer
      next()
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la vérification des permissions",
        error: error.message
      })
    }
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  // Vérifier directement le rôle
  if (req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN_GENERAL") {
    return next()
  }

  // Sinon, utiliser RoleMapper
  if (RoleMapper.toBaseRole(req.user.role) === "administrateur") {
    next()
  } else {
    return res.status(403).json({
      status: "ERROR",
      message: "Accès refusé. Rôle administrateur requis."
    })
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est personnel (admin ou réceptionniste)
 */
export const isPersonnel = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  // Vérifier directement le rôle
  if (["SUPER_ADMIN", "ADMIN_GENERAL", "RECEPTIONNISTE"].includes(req.user.role)) {
    return next()
  }

  // Sinon, utiliser RoleMapper
  const baseRole = RoleMapper.toBaseRole(req.user.role)
  if (baseRole === "personnel" || baseRole === "administrateur") {
    next()
  } else {
    return res.status(403).json({
      status: "ERROR",
      message: "Accès refusé. Rôle personnel ou administrateur requis."
    })
  }
}

/**
 * Middleware pour vérifier si l'utilisateur a les rôles autorisés pour la maintenance
 */
export const verifierRoleMaintenance = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  const authorizedRoles = ["MAINTENANCE", "RESPONSABLE_HEBERGEMENT", "ADMIN_GENERAL", "SUPER_ADMIN"]

  // Vérifier directement le rôle
  if (authorizedRoles.includes(req.user.role)) {
    return next()
  }

  // Sinon, utiliser RoleMapper
  if (RoleMapper.hasAuthorizedRole(req.user, authorizedRoles)) {
    next()
  } else {
    return res.status(403).json({
      status: "ERROR",
      message: "Accès non autorisé. Rôle MAINTENANCE requis."
    })
  }
}