import prisma from "../config/prisma.js";


class PermissionModel {
  /**
   * Récupère toutes les permissions
   * @returns {Promise<Array>} - Liste des permissions
   */
  static async getAllPermissions() {
    return prisma.permission.findMany({
      orderBy: {
        nom: "asc",
      },
    })
  }

  /**
   * Crée une nouvelle permission
   * @param {Object} data - Données de la permission
   * @returns {Promise<Object>} - La permission créée
   */
  static async createPermission(data) {
    return prisma.permission.create({
      data: {
        nom: data.nom,
        description: data.description,
        code: data.code,
      },
    })
  }

  /**
   * Met à jour une permission
   * @param {number} id - ID de la permission
   * @param {Object} data - Nouvelles données
   * @returns {Promise<Object>} - La permission mise à jour
   */
  static async updatePermission(id, data) {
    return prisma.permission.update({
      where: { id_permission: id },
      data: {
        nom: data.nom,
        description: data.description,
        code: data.code,
      },
    })
  }

  /**
   * Supprime une permission
   * @param {number} id - ID de la permission
   * @returns {Promise<Object>} - La permission supprimée
   */
  static async deletePermission(id) {
    // Vérifier si la permission est utilisée
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { id_permission: id },
    })

    if (rolePermissions.length > 0) {
      throw new Error("Cette permission est utilisée par des rôles et ne peut pas être supprimée")
    }

    return prisma.permission.delete({
      where: { id_permission: id },
    })
  }

  /**
   * Récupère tous les rôles
   * @returns {Promise<Array>} - Liste des rôles
   */
  static async getAllRoles() {
    return prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        nom: "asc",
      },
    })
  }

  /**
   * Récupère un rôle par son ID
   * @param {number} id - ID du rôle
   * @returns {Promise<Object>} - Le rôle trouvé
   */
  static async getRoleById(id) {
    return prisma.role.findUnique({
      where: { id_role: id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })
  }

  /**
   * Crée un nouveau rôle
   * @param {Object} data - Données du rôle
   * @returns {Promise<Object>} - Le rôle créé
   */
  static async createRole(data) {
    return prisma.$transaction(async (tx) => {
      // Créer le rôle
      const role = await tx.role.create({
        data: {
          nom: data.nom,
          description: data.description,
          code: data.code,
        },
      })

      // Ajouter les permissions si fournies
      if (data.permissions && Array.isArray(data.permissions) && data.permissions.length > 0) {
        for (const permissionId of data.permissions) {
          await tx.rolePermission.create({
            data: {
              id_role: role.id_role,
              id_permission: permissionId,
            },
          })
        }
      }

      // Récupérer le rôle avec ses permissions
      return tx.role.findUnique({
        where: { id_role: role.id_role },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      })
    })
  }

  /**
   * Met à jour un rôle
   * @param {number} id - ID du rôle
   * @param {Object} data - Nouvelles données
   * @returns {Promise<Object>} - Le rôle mis à jour
   */
  static async updateRole(id, data) {
    return prisma.$transaction(async (tx) => {
      // Mettre à jour le rôle
      const role = await tx.role.update({
        where: { id_role: id },
        data: {
          nom: data.nom,
          description: data.description,
          code: data.code,
        },
      })

      // Mettre à jour les permissions si fournies
      if (data.permissions && Array.isArray(data.permissions)) {
        // Supprimer les permissions existantes
        await tx.rolePermission.deleteMany({
          where: { id_role: id },
        })

        // Ajouter les nouvelles permissions
        for (const permissionId of data.permissions) {
          await tx.rolePermission.create({
            data: {
              id_role: id,
              id_permission: permissionId,
            },
          })
        }
      }

      // Récupérer le rôle avec ses permissions
      return tx.role.findUnique({
        where: { id_role: id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      })
    })
  }

  /**
   * Supprime un rôle
   * @param {number} id - ID du rôle
   * @returns {Promise<Object>} - Le rôle supprimé
   */
  static async deleteRole(id) {
    // Vérifier si le rôle est utilisé par des utilisateurs
    const utilisateurs = await prisma.utilisateur.findMany({
      where: { id_role: id },
    })

    if (utilisateurs.length > 0) {
      throw new Error("Ce rôle est utilisé par des utilisateurs et ne peut pas être supprimé")
    }

    return prisma.$transaction(async (tx) => {
      // Supprimer les permissions associées au rôle
      await tx.rolePermission.deleteMany({
        where: { id_role: id },
      })

      // Supprimer le rôle
      return tx.role.delete({
        where: { id_role: id },
      })
    })
  }

  /**
   * Attribue un rôle à un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {number} roleId - ID du rôle
   * @returns {Promise<Object>} - L'utilisateur mis à jour
   */
  static async assignRoleToUser(userId, roleId) {
    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: userId },
    })

    if (!utilisateur) {
      throw new Error("Utilisateur non trouvé")
    }

    // Vérifier si le rôle existe
    const role = await prisma.role.findUnique({
      where: { id_role: roleId },
    })

    if (!role) {
      throw new Error("Rôle non trouvé")
    }

    // Attribuer le rôle à l'utilisateur
    return prisma.utilisateur.update({
      where: { id_utilisateur: userId },
      data: {
        id_role: roleId,
        role: role.code, // Mettre à jour le champ role avec le code du rôle
      },
      include: {
        role_relation: true,
      },
    })
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   * @param {number} userId - ID de l'utilisateur
   * @param {string} permissionCode - Code de la permission
   * @returns {Promise<boolean>} - L'utilisateur a-t-il la permission
   */
  static async userHasPermission(userId, permissionCode) {
    // Récupérer l'utilisateur avec son rôle et ses permissions
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: userId },
      include: {
        role_relation: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })

    if (!utilisateur || !utilisateur.role_relation) {
      return false
    }

    // Vérifier si l'utilisateur a la permission
    return utilisateur.role_relation.permissions.some((rp) => rp.permission.code === permissionCode)
  }

  /**
   * Récupère toutes les permissions d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des permissions
   */
  static async getUserPermissions(userId) {
    try {
      console.log(`Récupération des permissions pour l'utilisateur ${userId}`);
      
      // Récupérer l'utilisateur avec son rôle et ses permissions
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id_utilisateur: userId },
        include: {
          role_relation: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
  
      console.log("Données utilisateur pour les permissions:", JSON.stringify({
        userId,
        hasRoleRelation: !!utilisateur?.role_relation,
        roleId: utilisateur?.id_role,
        roleName: utilisateur?.role_relation?.nom,
        roleCode: utilisateur?.role_relation?.code,
        permissionsCount: utilisateur?.role_relation?.permissions?.length || 0
      }, null, 2));
  
      if (!utilisateur) {
        console.log(`Utilisateur ${userId} non trouvé`);
        return [];
      }
      
      if (!utilisateur.role_relation) {
        console.log(`Aucune relation de rôle trouvée pour l'utilisateur ${userId}`);
        return [];
      }
  
      // Extraire les permissions
      const permissions = utilisateur.role_relation.permissions.map((rp) => rp.permission);
      console.log(`Permissions trouvées pour l'utilisateur ${userId}:`, 
        permissions.map(p => ({ id: p.id_permission, code: p.code, nom: p.nom }))
      );
      
      return permissions;
    } catch (error) {
      console.error("Erreur lors de la récupération des permissions utilisateur:", error);
      throw error;
    }
  }
}

export default PermissionModel