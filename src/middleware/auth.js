import jwt from "jsonwebtoken"
import { RoleMapper } from "../utils/roleMapper.js"
import PermissionModel from "../models/permission.model.js"
import prisma from "../config/prisma.js"

const permissionModel = PermissionModel

/**
 * Middleware d'authentification JWT
 */
export const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        status: "ERROR",
        message: "En-tête d'autorisation manquant"
      })
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "ERROR",
        message: "Format d'en-tête d'autorisation invalide. Doit commencer par 'Bearer '"
      })
    }

    const token = authHeader.split(" ")[1]

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET non défini")
      return res.status(500).json({
        status: "ERROR",
        message: "Erreur de configuration du serveur"
      })
    }

    jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }, (err, decodedUtilisateur) => {
      if (err) {
        console.error("Erreur JWT:", err.name, err.message)
        return res.status(403).json({
          status: "ERROR",
          message: err.name === "TokenExpiredError" ? "Token expiré" : "Token invalide",
          error: err.message
        })
      }

      req.utilisateur = decodedUtilisateur
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

/**
 * Middleware pour vérifier si l'utilisateur est un client
 */
export const isClient = (req, res, next) => {
  if (!req.utilisateur) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  if (
    req.utilisateur.role === "CLIENT" ||
    RoleMapper.toBaseRole(req.utilisateur.role) === "client"
  ) {
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
  if (!req.utilisateur) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  const clientId = Number.parseInt(req.params.clientId)

  if (
    req.utilisateur.role === "SUPER_ADMIN" ||
    req.utilisateur.role === "ADMIN_GENERAL" ||
    RoleMapper.toBaseRole(req.utilisateur.role) === "administrateur"
  ) {
    return next()
  }

  if (req.utilisateur.clientId === clientId) {
    return next()
  }

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
  if (!req.utilisateur) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  try {
    const idReservation = Number.parseInt(req.params.idReservation)

    if (
      req.utilisateur.role === "SUPER_ADMIN" ||
      req.utilisateur.role === "ADMIN_GENERAL" ||
      req.utilisateur.role === "RESPONSABLE_HEBERGEMENT" ||
      req.utilisateur.role === "RECEPTIONNISTE" ||
      RoleMapper.toBaseRole(req.utilisateur.role) === "administrateur" ||
      RoleMapper.toBaseRole(req.utilisateur.role) === "personnel"
    ) {
      return next()
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id_reservation: idReservation },
      select: { id_client: true }
    })

    if (!reservation) {
      return res.status(404).json({
        status: "ERROR",
        message: "Réservation non trouvée"
      })
    }

    if (req.utilisateur.clientId === reservation.id_client) {
      return next()
    }

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
    if (!req.utilisateur) {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentification requise"
      })
    }

    if (roles.includes(req.utilisateur.role)) {
      return next()
    }

    if (RoleMapper.hasAuthorizedRole(req.utilisateur, roles)) {
      next()
    } else {
      res.status(403).json({
        status: "ERROR",
        message: "Accès non autorisé",
        debug: {
          userRole: req.utilisateur.role,
          requiredRoles: roles
        }
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
    if (!req.utilisateur) {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentification requise"
      })
    }

    try {
      if (
        req.utilisateur.permissions &&
        Array.isArray(req.utilisateur.permissions) &&
        req.utilisateur.permissions.includes(permissionCode)
      ) {
        return next()
      }

      const hasPermission = await permissionModel.userHasPermission(
        req.utilisateur.id_utilisateur,
        permissionCode
      )

      if (!hasPermission) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas la permission nécessaire pour effectuer cette action"
        })
      }

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
  if (!req.utilisateur) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  if (
    req.utilisateur.role === "SUPER_ADMIN" ||
    req.utilisateur.role === "ADMIN_GENERAL"
  ) {
    return next()
  }

  if (RoleMapper.toBaseRole(req.utilisateur.role) === "administrateur") {
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
  console.log("Role" + req.utilisateur.role);
  
  if (!req.utilisateur) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  if (["SUPER_ADMIN", "ADMIN_GENERAL", "RECEPTIONNISTE"].includes(req.utilisateur.role)) {
    return next()
  }

  const baseRole = RoleMapper.toBaseRole(req.utilisateur.role)
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
  if (!req.utilisateur) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise"
    })
  }

  const authorizedRoles = [
    "MAINTENANCE",
    "RESPONSABLE_HEBERGEMENT",
    "ADMIN_GENERAL",
    "SUPER_ADMIN"
  ]

  if (authorizedRoles.includes(req.utilisateur.role)) {
    return next()
  }

  if (RoleMapper.hasAuthorizedRole(req.utilisateur, authorizedRoles)) {
    next()
  } else {
    return res.status(403).json({
      status: "ERROR",
      message: "Accès non autorisé. Rôle MAINTENANCE requis."
    })
  }
}
