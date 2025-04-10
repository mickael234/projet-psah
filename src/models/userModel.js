import prisma from "../config/prisma.js"
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
   * @returns {Promise<Object>} - L'utilisateur créé
   */
  static async create(fullName, email, password, roleId, phoneNumber) {
    // Validation du nom complet
    if (fullName && !validateName(fullName)) {
      throw new Error("Le nom complet ne doit pas contenir de chiffres")
    }

    // Validation du numéro de téléphone
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      throw new Error("Format de numéro de téléphone invalide")
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
      include: { role: true },
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
}

export default User
