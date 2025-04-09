const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AvisModel {
    /**
     * Récupère l'avis d'une réservation
     * @param {number} idReservation - ID de la réservation
     * @returns {Promise<Object>} - L'avis trouvé
     */
    static findByReservation(idReservation) {
        return prisma.avis.findUnique({
            where: { id_reservation: idReservation }
        });
    }

    /**
     * Calcule la note moyenne des avis
     * @returns {Promise<number>} - Note moyenne
     */
    static getAverageRating() {
        return prisma.avis
            .aggregate({
                _avg: {
                    note: true
                }
            })
            .then((result) => result._avg.note || 0);
    }

    /**
     * Récupère les avis par note
     * @param {number} note - Note recherchée
     * @returns {Promise<Array>} - Liste des avis
     */
    static findByRating(note) {
        return prisma.avis.findMany({
            where: { note },
            include: {
                reservation: {
                    include: {
                        client: true
                    }
                }
            }
        });
    }
}

module.exports = AvisModel;
