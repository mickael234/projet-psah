import prisma from "../config/prisma.js";



class Role {
  /**
   * Trouve un rôle par son nom
   * @param {string} name - Nom du rôle
   * @returns {Promise<Object>} - Le rôle trouvé
   */
  static async findByName(name) {
    return prisma.role.findUnique({
      where: { code: name },
    })
  }

  /**
   * Trouve un rôle par son ID
   * @param {number} id - ID du rôle
   * @returns {Promise<Object>} - Le rôle trouvé
   */
  static async findById(id) {
    // Utiliser le nom de champ correct selon votre base de données
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
   * Récupère tous les rôles
   * @returns {Promise<Array>} - Liste des rôles
   */
  static async findAll() {
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
   * Crée un nouveau rôle
   * @param {Object} data - Données du rôle
   * @returns {Promise<Object>} - Le rôle créé
   */
  static async create(data) {
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
}

export default Role
