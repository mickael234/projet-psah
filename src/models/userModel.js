import prisma from "../config/prisma.js";
import bcrypt from "bcrypt"
import { validatePhoneNumber, validateName } from "../utils/validators.js"



class User {
  /**
   * Crée un nouvel utilisateur
   * @param {string} fullName - Nom complet
   * @param {string} email - Email
   * @param {string} password - Mot de passe
   * @param {number} roleId - ID du rôle
   * @param {string} phoneNumber - Numéro de téléphone
   * @param {string} roleCode - Code du rôle (optionnel)
   * @returns {Promise<Object>} - L'utilisateur créé
   */
  static async create(fullName, email, password, roleId, phoneNumber, roleCode = null) {
    // Validation du nom complet
    if (fullName && !validateName(fullName)) {
      throw new Error("Le nom complet ne doit pas contenir de chiffres")
    }

    // Validation du numéro de téléphone
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      throw new Error("Format de numéro de téléphone invalide")
    }

    // Si le code du rôle n'est pas fourni, le récupérer depuis la base de données
    if (!roleCode && roleId) {
      try {
        const role = await prisma.role.findUnique({
          where: { id_role: roleId },
        })

        if (!role) {
          throw new Error("Rôle non trouvé")
        }

        roleCode = role.code
      } catch (error) {
        console.error("Erreur lors de la recherche du rôle:", error)
        throw new Error(`Impossible de trouver le rôle avec l'ID ${roleId}: ${error.message}`)
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    return prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        roleId,
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        Role: true,
      },
    })
  }

  /**
   * Trouve un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur trouvé
   */
  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        Role: {
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
  }

  /**
   * Trouve un utilisateur par son ID
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur trouvé
   */
  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        Role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        billingInfo: true,
      },
    })
  }

  /**
   * Met à jour un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} - L'utilisateur mis à jour
   */
  static async update(id, data) {
    // Validation du nom complet si fourni
    if (data.fullName && !validateName(data.fullName)) {
      throw new Error("Le nom complet ne doit pas contenir de chiffres")
    }

    // Validation du numéro de téléphone si fourni
    if (data.phoneNumber && !validatePhoneNumber(data.phoneNumber)) {
      throw new Error("Format de numéro de téléphone invalide")
    }

    // Si un nouveau mot de passe est fourni, le hacher
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    // Ajouter la date de mise à jour
    data.updatedAt = new Date()

    return prisma.user.update({
      where: { id },
      data,
      include: {
        Role: {
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
  }

  /**
   * Vérifie un mot de passe
   * @param {string} password - Mot de passe en clair
   * @param {string} hashedPassword - Mot de passe haché
   * @returns {Promise<boolean>} - True si le mot de passe est correct
   */
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword)
  }

  /**
   * Récupère les permissions d'un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des permissions
   */
  static async getUserPermissions(id) {
    const user = await this.findById(id)

    if (!user || !user.Role) {
      return []
    }

    return user.Role.permissions.map((rp) => rp.permission)
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   * @param {number} id - ID de l'utilisateur
   * @param {string} permissionCode - Code de la permission
   * @returns {Promise<boolean>} - True si l'utilisateur a la permission
   */
  static async hasPermission(id, permissionCode) {
    const permissions = await this.getUserPermissions(id)
    return permissions.some((p) => p.code === permissionCode)
  }
}

export default User
