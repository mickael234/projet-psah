import { RoleMapper } from "../utils/roleMapper.js"
import PermissionModel from "../models/permission.model.js"
import { authenticateJWT } from "./auth.js"
const permissionModel = PermissionModel;

//const permissions = await PermissionModel.getUserPermissions(utilisateur.id_utilisateur)


// Exporter authenticateJWT pour qu'il soit disponible lors de l'import de ce fichier
export { authenticateJWT }

/**
 * Middleware pour vérifier si l'utilisateur a les rôles autorisés
 */
// Dans middleware/role-auth.js - ne modifiez que la fonction verifierRoleMaintenance

/**
 * Middleware pour vérifier si l'utilisateur a les rôles autorisés pour la maintenance
 */
export const verifierRoleMaintenance = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "ERROR",
      message: "Authentification requise" // Supprimé "d'accord"
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

// Gardez toutes les autres fonctions telles quelles

/**
 * Middleware pour vérifier si l'utilisateur a un rôle autorisé
 * @param {Array<string>} authorizedRoles - Liste des rôles autorisés
 * @returns {Function} - Middleware Express
 */
export const checkRole = (authorizedRoles) => {
  return (req, res, next) => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentification requise",
      })
    }

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
        message: "Accès non autorisé",
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
        message: "Authentification requise",
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
          message: "Vous n'avez pas la permission nécessaire pour effectuer cette action",
        })
      }

      // Si l'utilisateur a la permission, continuer
      next()
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la vérification des permissions",
        error: error.message,
      })
    }
  }
}
