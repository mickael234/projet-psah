import prisma from "../config/prisma.js";


class PromotionModel {
    /**
     * Récupère les promotions actives
     * @returns {Promise<Array>} - Liste des promotions actives
     */
    static findActive() {
        const now = new Date();
        return prisma.promotion.findMany({
            where: {
                date_debut: {
                    lte: now
                },
                date_fin: {
                    gte: now
                },
                active: true
            },
            orderBy: { pourcentage_reduction: 'desc' }
        });
    }

    /**
     * Récupère les promotions à venir
     * @returns {Promise<Array>} - Liste des promotions à venir
     */
    static findUpcoming() {
        const now = new Date();
        return prisma.promotion.findMany({
            where: {
                date_debut: {
                    gt: now
                },
                active: true
            },
            orderBy: { date_debut: 'asc' }
        });
    }

    /**
     * Récupère les promotions par code
     * @param {string} code - Code de promotion
     * @returns {Promise<Object>} - La promotion trouvée
     */
    static findByCode(code) {
        return prisma.promotion.findFirst({
            where: {
                code_promo: code,
                active: true
            }
        });
    }

    /**
     * Vérifie si un code promo est valide
     * @param {string} code - Code de promotion
     * @returns {Promise<boolean>} - True si le code est valide
     */
    static async isCodeValid(code) {
        const now = new Date();
        const promotion = await prisma.promotion.findFirst({
            where: {
                code_promo: code,
                date_debut: {
                    lte: now
                },
                date_fin: {
                    gte: now
                },
                active: true
            }
        });

        return !!promotion;
    }
}

export defaultPromotionModel;
