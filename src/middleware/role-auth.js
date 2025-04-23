import { RoleMapper } from "../utils/RoleMapper.js"

/**
 * Middleware pour vérifier si l'utilisateur a les rôles autorisés
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

    // Vérifier si l'utilisateur a un rôle autorisé
    if (!RoleMapper.hasAuthorizedRole(req.user, authorizedRoles)) {
      return res.status(403).json({
        status: "ERROR",
        message: "Accès non autorisé",
      })
    }

    // Si l'utilisateur a un rôle autorisé, continuer
    next()
  }
}
