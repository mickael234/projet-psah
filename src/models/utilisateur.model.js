import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class UtilisateurModel {
    /**
     * Crée un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise<Object>} - L'utilisateur créé
     */
    static async create(userData) {
        const hashedPassword = await bcrypt.hash(userData.mot_de_passe, 10);
        return prisma.utilisateur.create({
            data: {
                ...userData,
                mot_de_passe: hashedPassword
            }
        });
    }

    /**
     * Récupère un utilisateur par son ID
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<Object>} - L'utilisateur trouvé
     */
    static async findById(id) {
        return prisma.utilisateur.findUnique({
            where: { id_utilisateur: id },
            include: {
                client: true,
                personnel: true
            }
        });
    }

    /**
     * Récupère un utilisateur avec ses relations
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<Object>} - L'utilisateur avec ses relations
     */
    static async getWithRelations(id) {
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
    static async findByEmail(email) {
        return prisma.utilisateur.findUnique({
            where: { email }
        });
    }

    /**
     * Récupère un utilisateur par son nom d'utilisateur
     * @param {string} username - Nom d'utilisateur
     * @returns {Promise<Object>} - L'utilisateur trouvé
     */
    static async findByUsername(username) {
        return prisma.utilisateur.findUnique({
            where: { nom_utilisateur: username }
        });
    }

    /**
     * Récupère tous les utilisateurs
     * @param {Object} filters - Filtres optionnels
     * @returns {Promise<Array>} - Liste des utilisateurs
     */
    static async findAll(filters = {}) {
        return prisma.utilisateur.findMany({
            where: {
                ...filters,
                supprime_le: null
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
    static async update(id, userData) {
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
    static async delete(id) {
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
    static async authenticate(email, password) {
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
    static async hasRole(id, role) {
        const user = await UtilisateurModel.findById(id);
        return user && user.role === role;
    }
}

export default UtilisateurModel;
