import prisma from '../config/prisma.js';
import { validatePhoneNumber, validateName } from '../utils/validators.js';

class Profile {
    /**
     * Récupère le profil d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object>} - Le profil de l'utilisateur
     */
    static async getProfile(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            include: {
                billingInfo: true,
                role: true
            }
        });
    }

    /**
     * Met à jour le profil d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {Object} userData - Données du profil
     * @returns {Promise<Object>} - Le profil mis à jour
     */
    static async updateProfile(userId, userData) {
        // Validation du nom complet
        if (userData.fullName && !validateName(userData.fullName)) {
            throw new Error('Le nom complet ne doit pas contenir de chiffres');
        }

        // Validation du numéro de téléphone
        if (
            userData.phoneNumber &&
            !validatePhoneNumber(userData.phoneNumber)
        ) {
            throw new Error('Format de numéro de téléphone invalide');
        }

        return prisma.user.update({
            where: { id: userId },
            data: userData
        });
    }

    /**
     * Met à jour la photo de profil d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {string} photoUrl - URL de la photo
     * @returns {Promise<Object>} - Le profil mis à jour
     */
    static async updateProfilePhoto(userId, photoUrl) {
        return prisma.user.update({
            where: { id: userId },
            data: { profilePhoto: photoUrl }
        });
    }

    /**
     * Récupère les informations de facturation d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object>} - Les informations de facturation
     */
    static async getBillingInfo(userId) {
        return prisma.billingInfo.findUnique({
            where: { userId }
        });
    }

    /**
     * Met à jour les informations de facturation d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {Object} billingData - Données de facturation
     * @returns {Promise<Object>} - Les informations de facturation mises à jour
     */
    static async updateBillingInfo(userId, billingData) {
        // Validation du nom de facturation
        if (billingData.billingName && !validateName(billingData.billingName)) {
            throw new Error(
                'Le nom de facturation ne doit pas contenir de chiffres'
            );
        }

        // Vérifier si les informations de facturation existent déjà
        const existingInfo = await prisma.billingInfo.findUnique({
            where: { userId }
        });

        if (existingInfo) {
            // Mettre à jour les informations existantes
            return prisma.billingInfo.update({
                where: { userId },
                data: billingData
            });
        } else {
            // Créer de nouvelles informations
            return prisma.billingInfo.create({
                data: {
                    ...billingData,
                    userId
                }
            });
        }
    }

    /**
     * Configure l'authentification à deux facteurs
     * @param {number} userId - ID de l'utilisateur
     * @param {string} secret - Clé secrète
     * @returns {Promise<Object>} - Le profil mis à jour
     */
    static async setupTwoFactorAuth(userId, secret) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: secret,
                updatedAt: new Date()
            }
        });
    }

    /**
     * Active l'authentification à deux facteurs
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object>} - Le profil mis à jour
     */
    static async enableTwoFactorAuth(userId) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                updatedAt: new Date()
            }
        });
    }

    /**
     * Désactive l'authentification à deux facteurs
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object>} - Le profil mis à jour
     */
    static async disableTwoFactorAuth(userId) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                updatedAt: new Date()
            }
        });
    }
}

export default Profile;
