import jwt from "jsonwebtoken"
import { RoleMapper } from "../utils/roleMapper.js"

/**
 * Middleware d'authentification JWT
 */
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise",
    })
  }

  const token = authHeader.split(" ")[1]

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "ERROR",
        message: "Token invalide ou expiré",
      })
    }

    req.user = user
    next()
  })
}

/**
 * Middleware pour vérifier si l'utilisateur est un client
 */
export const isClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise",
    })
  }

  // Vérifier si le rôle est CLIENT ou si le rôle de base est 'client'
  if (req.user.role === "CLIENT" || RoleMapper.toBaseRole(req.user.role) === "client") {
    next()
  } else {
    return res.status(403).json({
      status: "ERROR",
      message: "Accès refusé. Rôle client requis.",
    })
  }
}

/**
 * Middleware pour vérifier les rôles
 * @param {Array<string>} roles - Liste des rôles autorisés
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentification requise",
      })
    }

    // Utiliser le service RoleMapper pour vérifier les rôles
    if (RoleMapper.hasAuthorizedRole(req.user, roles)) {
      next()
    } else {
      res.status(403).json({
        status: "ERROR",
        message: "Accès non autorisé",
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
      message: "Authentification requise",
    })
  }

  // Vérifier si le rôle de base est 'administrateur'
  if (RoleMapper.toBaseRole(req.user.role) === "administrateur") {
    next()
  } else {
    return res.status(403).json({
      status: "ERROR",
      message: "Accès refusé. Rôle administrateur requis.",
    })
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est un membre du personnel
 */
export const isPersonnel = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise",
    })
  }

  // Vérifier si le rôle de base est 'personnel' ou 'administrateur'
  const baseRole = RoleMapper.toBaseRole(req.user.role)
  if (baseRole === "personnel" || baseRole === "administrateur") {
    next()
  } else {
    return res.status(403).json({
      status: "ERROR",
      message: "Accès refusé. Rôle personnel ou administrateur requis.",
    })
  }
}

