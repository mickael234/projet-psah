import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import bcrypt from "bcrypt"

class UtilisateurModel {
  /**
   * Crée un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur créé
   */
  static async create(userData) {
    // Changé de 'async create' à 'static async create'
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(userData.mot_de_passe, 10)

    return prisma.utilisateur.create({
      data: {
        ...userData,
        mot_de_passe: hashedPassword,
      },
    })
  }

  /**
   * Récupère un utilisateur par son ID
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur trouvé
   */
  async findById(id) {
    return prisma.utilisateur.findUnique({
      where: { id_utilisateur: id },
      include: {
        client: true,
        personnel: true,
      },
    })
  }


  /**
   * Récupère un utilisateur avec ses relations
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur avec ses relations
   */
  static getWithRelations(id) {
    return prisma.utilisateur.findUnique({
      where: { id_utilisateur: id },
      include: {
        client: true,
        personnel: true
      }
    });
  }

  /**
   * Récupère un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur trouvé
   */
  static findByEmail(email) {
    return prisma.utilisateur.findUnique({
      where: { email }
    });
  }

  /**
   * Récupère un utilisateur par son nom d'utilisateur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise<Object>} - L'utilisateur trouvé
   */
  static findByUsername(username) {
    return prisma.utilisateur.findUnique({
      where: { nom_utilisateur: username }
    });
  }

  /**
   * Récupère tous les utilisateurs
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Array>} - Liste des utilisateurs
   */
  async findAll(filters = {}) {
    return prisma.utilisateur.findMany({
      where: {
        ...filters,
        supprime_le: null // Exclure les utilisateurs supprimés
      },
      include: {
        client: true,
        personnel: true
      }
    });
  }

  /**
   * Met à jour un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @param {Object} userData - Nouvelles données
   * @returns {Promise<Object>} - L'utilisateur mis à jour
   */
  async update(id, userData) {
    // Si le mot de passe est fourni, le hacher
    if (userData.mot_de_passe) {
      userData.mot_de_passe = await bcrypt.hash(userData.mot_de_passe, 10);
    }
    
    return prisma.utilisateur.update({
      where: { id_utilisateur: id },
      data: userData
    });
  }

  /**
   * Suppression logique d'un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur supprimé
   */
  async delete(id) {
    return prisma.utilisateur.update({
      where: { id_utilisateur: id },
      data: { supprime_le: new Date() }
    });
  }

  /**
   * Authentifie un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object|null>} - L'utilisateur authentifié ou null
   */
  async authenticate(email, password) {
    const user = await UtilisateurModel.findByEmail(email);
    
    if (!user || user.supprime_le) {
      return null;
    }
    
    const passwordMatch = await bcrypt.compare(password, user.mot_de_passe);
    
    return passwordMatch ? user : null;
  }

  /**
   * Vérifie si un utilisateur a un rôle spécifique
   * @param {number} id - ID de l'utilisateur
   * @param {string} role - Rôle à vérifier
   * @returns {Promise<boolean>} - True si l'utilisateur a le rôle
   */
  async hasRole(id, role) {
    const user = await this.findById(id);
    return user && user.role === role;
  }
}

export default UtilisateurModel;
