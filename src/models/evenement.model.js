import prisma from "../config/prisma.js";


class EvenementModel {
    /**
     * Récupère les événements à venir
     * @returns {Promise<Array>} - Liste des événements à venir
     */
    static findUpcoming() {
        const now = new Date();
        return prisma.evenement.findMany({
            where: {
                date_debut: {
                    gte: now
                }
            },
            orderBy: { date_debut: 'asc' }
        });
    }

    /**
     * Récupère les événements en cours
     * @returns {Promise<Array>} - Liste des événements en cours
     */
    static findCurrent() {
        const now = new Date();
        return prisma.evenement.findMany({
            where: {
                date_debut: {
                    lte: now
                },
                date_fin: {
                    gte: now
                }
            },
            orderBy: { date_debut: 'asc' }
        });
    }

    /**
     * Récupère les événements par période
     * @param {Date} debut - Date de début
     * @param {Date} fin - Date de fin
     * @returns {Promise<Array>} - Liste des événements
     */
    static findByPeriod(debut, fin) {
        return prisma.evenement.findMany({
            where: {
                OR: [
                    {
                        date_debut: {
                            gte: debut,
                            lte: fin
                        }
                    },
                    {
                        date_fin: {
                            gte: debut,
                            lte: fin
                        }
                    },
                    {
                        AND: [
                            { date_debut: { lte: debut } },
                            { date_fin: { gte: fin } }
                        ]
                    }
                ]
            },
            orderBy: { date_debut: 'asc' }
        });
    }

    /**
     * Récupère les événements par type
     * @param {string} type - Type d'événement
     * @returns {Promise<Array>} - Liste des événements
     */
    static findByType(type) {
        return prisma.evenement.findMany({
            where: { type },
            orderBy: { date_debut: 'asc' }
        });
    }
}

export defaultEvenementModel;
