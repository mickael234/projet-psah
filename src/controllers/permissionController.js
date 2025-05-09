import prisma from "../config/prisma.js";;
import PermissionModel from "../models/permission.model.js"
import { RoleMapper } from "../utils/roleMapper.js"

;

/**
 * Vérifie si l'utilisateur a les permissions nécessaires
 * @param {Object} req - Requête Express
 * @param {Array} rolesAutorises - Rôles autorisés
 * @returns {boolean} - L'utilisateur a-t-il les permissions
 */
const verifierPermissions = (req, rolesAutorises) => {
  if (!req.user) {
    console.log("Aucun utilisateur dans la requête");
    return false;
  }
  
  console.log("Vérification des permissions pour:", {
    userRole: req.user.role,
    authorizedRoles: rolesAutorises
  });
  
  // Vérifier directement si le rôle de l'utilisateur est dans la liste des rôles autorisés
  if (rolesAutorises.includes(req.user.role)) {
    console.log("Rôle autorisé directement:", req.user.role);
    return true;
  }
  
  // Sinon, utiliser RoleMapper
  const hasRole = RoleMapper.hasAuthorizedRole(req.user, rolesAutorises);
  console.log("Résultat RoleMapper:", hasRole);
  return hasRole;
}

/**
 * Récupère toutes les permissions
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getAllPermissions = async (req, res) => {
  try {
    console.log("Requête de permissions reçue. Utilisateur:", req.user);
    
    // Vérifier les permissions (seuls les administrateurs peuvent voir les permissions)
    if (!req.user) {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentification requise d'accords",
      });
    }
    
    // Vérifier directement les permissions dans le token JWT
    if (req.user.permissions && Array.isArray(req.user.permissions)) {
      const requiredPermissions = ["MANAGE_PERMISSIONS", "MANAGE_ROLES"];
      const hasPermission = requiredPermissions.some(perm => req.user.permissions.includes(perm));
      
      if (hasPermission) {
        const permissions = await PermissionModel.getAllPermissions();
        return res.status(200).json({
          status: "OK",
          message: "Permissions récupérées avec succès",
          data: permissions,
        });
      }
    }
    
    // Sinon, vérifier les rôles
    if (!verifierPermissions(req, ["SUPER_ADMIN", "ADMIN_GENERAL"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour voir les permissions",
      });
    }

    const permissions = await PermissionModel.getAllPermissions();

    res.status(200).json({
      status: "OK",
      message: "Permissions récupérées avec succès",
      data: permissions,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des permissions:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération des permissions",
      error: error.message,
    });
  }
}

/**
 * Crée une nouvelle permission
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const createPermission = async (req, res) => {
  try {
    // Vérifier les permissions (seuls les super admins peuvent créer des permissions)
    if (!verifierPermissions(req, ["SUPER_ADMIN"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour créer des permissions",
      })
    }

    const { nom, description, code } = req.body

    // Validation des données
    if (!nom || !code) {
      return res.status(400).json({
        status: "ERROR",
        message: "Nom et code sont requis",
      })
    }

    // Vérifier si la permission existe déjà - CETTE LIGNE DOIT ÊTRE APRÈS L'EXTRACTION DE req.body
    const existingPermission = await prisma.permission.findUnique({
      where: { code }
    })

    if (existingPermission) {
      return res.status(400).json({
        status: "ERROR",
        message: "Une permission avec ce code existe déjà"
      })
    }

    const permission = await PermissionModel.createPermission({
      nom,
      description,
      code,
    })

    res.status(201).json({
      status: "OK",
      message: "Permission créée avec succès",
      data: permission,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la création de la permission",
      error: error.message,
    })
  }
}

/**
 * Met à jour une permission
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const updatePermission = async (req, res) => {
  try {
    // Vérifier les permissions (seuls les super admins peuvent modifier des permissions)
    if (!verifierPermissions(req, ["SUPER_ADMIN"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour modifier des permissions",
      })
    }

    const { id } = req.params
    const { nom, description, code } = req.body

    // Validation des données
    if (!nom || !code) {
      return res.status(400).json({
        status: "ERROR",
        message: "Nom et code sont requis",
      })
    }

    const permission = await PermissionModel.updatePermission(Number.parseInt(id), {
      nom,
      description,
      code,
    })

    res.status(200).json({
      status: "OK",
      message: "Permission mise à jour avec succès",
      data: permission,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la mise à jour de la permission",
      error: error.message,
    })
  }
}

/**
 * Supprime une permission
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const deletePermission = async (req, res) => {
  try {
    // Vérifier les permissions (seuls les super admins peuvent supprimer des permissions)
    if (!verifierPermissions(req, ["SUPER_ADMIN"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour supprimer des permissions",
      })
    }

    const { id } = req.params

    await PermissionModel.deletePermission(Number.parseInt(id))

    res.status(200).json({
      status: "OK",
      message: "Permission supprimée avec succès",
    })
  } catch (error) {
    console.error(error)
    if (error.message.includes("utilisée par des rôles")) {
      return res.status(400).json({
        status: "ERROR",
        message: error.message,
      })
    }
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la suppression de la permission",
      error: error.message,
    })
  }
}

/**
 * Récupère tous les rôles
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getAllRoles = async (req, res) => {
  try {
    // Vérifier les permissions (seuls les administrateurs peuvent voir les rôles)
    if (!verifierPermissions(req, ["SUPER_ADMIN", "ADMIN_GENERAL"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour voir les rôles",
      })
    }

    const roles = await PermissionModel.getAllRoles()

    res.status(200).json({
      status: "OK",
      message: "Rôles récupérés avec succès",
      data: roles,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération des rôles",
      error: error.message,
    })
  }
}

/**
 * Récupère un rôle par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getRoleById = async (req, res) => {
  try {
    // Vérifier les permissions (seuls les administrateurs peuvent voir les rôles)
    if (!verifierPermissions(req, ["SUPER_ADMIN", "ADMIN_GENERAL"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour voir les rôles",
      })
    }

    const { id } = req.params

    const role = await PermissionModel.getRoleById(Number.parseInt(id))

    if (!role) {
      return res.status(404).json({
        status: "ERROR",
        message: "Rôle non trouvé",
      })
    }

    res.status(200).json({
      status: "OK",
      message: "Rôle récupéré avec succès",
      data: role,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération du rôle",
      error: error.message,
    })
  }
}

/**
 * Crée un nouveau rôle
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const createRole = async (req, res) => {
  try {
    // Vérifier les permissions
    if (!verifierPermissions(req, ["SUPER_ADMIN"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour créer des rôles",
      });
    }

    const { nom, description, code } = req.body;

    // Validation des données
    if (!nom || !code) {
      return res.status(400).json({
        status: "ERROR",
        message: "Nom et code sont requis",
      });
    }

    // Vérifier si le rôle existe déjà
    const existingRole = await prisma.role.findUnique({
      where: { code }
    });

    if (existingRole) {
      return res.status(400).json({
        status: "ERROR",
        message: "Un rôle avec ce code existe déjà"
      });
    }

    // Créer le rôle
    const role = await PermissionModel.createRole({
      nom,
      description,
      code,
    });

    res.status(201).json({
      status: "OK",
      message: "Rôle créé avec succès",
      data: role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la création du rôle",
      error: error.message,
    });
  }
}

/**
 * Met à jour un rôle
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const updateRole = async (req, res) => {
  try {
    // Vérifier les permissions (seuls les super admins peuvent modifier des rôles)
    if (!verifierPermissions(req, ["SUPER_ADMIN"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour modifier des rôles",
      })
    }

    const { id } = req.params
    const { nom, description, code, permissions } = req.body

    // Validation des données
    if (!nom || !code) {
      return res.status(400).json({
        status: "ERROR",
        message: "Nom et code sont requis",
      })
    }

    const role = await PermissionModel.updateRole(Number.parseInt(id), {
      nom,
      description,
      code,
      permissions,
    })

    res.status(200).json({
      status: "OK",
      message: "Rôle mis à jour avec succès",
      data: role,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la mise à jour du rôle",
      error: error.message,
    })
  }
}

/**
 * Supprime un rôle
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const deleteRole = async (req, res) => {
  try {
    // Vérifier les permissions (seuls les super admins peuvent supprimer des rôles)
    if (!verifierPermissions(req, ["SUPER_ADMIN"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour supprimer des rôles",
      })
    }

    const { id } = req.params

    await PermissionModel.deleteRole(Number.parseInt(id))

    res.status(200).json({
      status: "OK",
      message: "Rôle supprimé avec succès",
    })
  } catch (error) {
    console.error(error)
    if (error.message.includes("utilisé par des utilisateurs")) {
      return res.status(400).json({
        status: "ERROR",
        message: error.message,
      })
    }
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la suppression du rôle",
      error: error.message,
    })
  }
}

/**
 * Attribue un rôle à un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const assignRoleToUser = async (req, res) => {
  try {
    // Vérifier les permissions (seuls les administrateurs peuvent attribuer des rôles)
    if (!verifierPermissions(req, ["SUPER_ADMIN", "ADMIN_GENERAL"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour attribuer des rôles",
      })
    }

    const { userId, roleId } = req.body

    // Validation des données
    if (!userId || !roleId) {
      return res.status(400).json({
        status: "ERROR",
        message: "ID utilisateur et ID rôle sont requis",
      })
    }

    // Récupérer le rôle pour obtenir son code
    const role = await prisma.role.findUnique({
      where: { id_role: Number.parseInt(roleId) }
    })

    if (!role) {
      return res.status(404).json({
        status: "ERROR",
        message: "Rôle non trouvé"
      })
    }

    // Convertir le code du rôle en RoleUtilisateur
    const baseRole = RoleMapper.toBaseRole(role.code)

    // Mettre à jour l'utilisateur avec le rôle et le type de rôle correct
    const utilisateur = await prisma.utilisateur.update({
      where: { id_utilisateur: Number.parseInt(userId) },
      data: {
        id_role: Number.parseInt(roleId),
        role: baseRole // Utiliser la valeur de l'énumération, pas le code du rôle
      },
      include: {
        role_relation: true
      }
    })

    res.status(200).json({
      status: "OK",
      message: "Rôle attribué avec succès",
      data: utilisateur,
    })
  } catch (error) {
    console.error(error)
    if (error.message.includes("non trouvé")) {
      return res.status(404).json({
        status: "ERROR",
        message: error.message,
      })
    }
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de l'attribution du rôle",
      error: error.message,
    })
  }
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const checkUserPermission = async (req, res) => {
  try {
    const { userId, permissionCode } = req.params

    // Validation des données
    if (!userId || !permissionCode) {
      return res.status(400).json({
        status: "ERROR",
        message: "ID utilisateur et code permission sont requis",
      })
    }

    const hasPermission = await PermissionModel.userHasPermission(Number.parseInt(userId), permissionCode)

    res.status(200).json({
      status: "OK",
      message: hasPermission ? "L'utilisateur a la permission" : "L'utilisateur n'a pas la permission",
      data: {
        hasPermission,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la vérification de la permission",
      error: error.message,
    })
  }
}

/**
 * Récupère toutes les permissions d'un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params

    // Vérifier que l'utilisateur est autorisé à voir ces permissions
    if (Number.parseInt(userId) !== req.user.userId && !verifierPermissions(req, ["SUPER_ADMIN", "ADMIN_GENERAL"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à voir les permissions de cet utilisateur",
      })
    }

    const permissions = await PermissionModel.getUserPermissions(Number.parseInt(userId))

    res.status(200).json({
      status: "OK",
      message: "Permissions récupérées avec succès",
      data: permissions,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération des permissions",
      error: error.message,
    })
  }
}