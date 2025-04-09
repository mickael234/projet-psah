// src/models/profileModel.js
import prisma from '../config/prisma.js';

class Profile {
    static async getProfile(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            include: {
                billingInfo: true,
                role: true
            }
        });
    }

    static async updateProfile(userId, userData) {
        return prisma.user.update({
            where: { id: userId },
            data: userData
        });
    }

    static async updateProfilePhoto(userId, photoUrl) {
        return prisma.user.update({
            where: { id: userId },
            data: { profilePhoto: photoUrl }
        });
    }

    static async getBillingInfo(userId) {
        return prisma.billingInfo.findUnique({
            where: { userId }
        });
    }

    static async updateBillingInfo(userId, billingData) {
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

    static async setupTwoFactorAuth(userId, secret) {
        return prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret }
        });
    }

    static async enableTwoFactorAuth(userId) {
        return prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true }
        });
    }

    static async disableTwoFactorAuth(userId) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null
            }
        });
    }
}

export default Profile;
