const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PaiementModel {
    /**
     * Récupère les paiements d'une réservation
     * @param {number} idReservation - ID de la réservation
     * @returns {Promise<Array>} - Liste des paiements
     */
    static findByReservation(idReservation) {
        return prisma.paiement.findMany({
            where: { id_reservation: idReservation }
        });
    }

    /**
     * Calcule le total des paiements d'une réservation
     * @param {number} idReservation - ID de la réservation
     * @returns {Promise<number>} - Total des paiements
     */
    static getTotalPaiements(idReservation) {
        return prisma.paiement
            .aggregate({
                where: {
                    id_reservation: idReservation,
                    etat: 'complete'
                },
                _sum: {
                    montant: true
                }
            })
            .then((result) => result._sum.montant || 0);
    }

    /**
     * Vérifie si une réservation est entièrement payée
     * @param {number} idReservation - ID de la réservation
     * @returns {Promise<boolean>} - True si la réservation est payée
     */
    static async isReservationPaid(idReservation) {
        const reservation = await prisma.reservation.findUnique({
            where: { id_reservation: idReservation }
        });

        const totalPaye = await this.getTotalPaiements(idReservation);

        return totalPaye >= reservation.prix_total;
    }
}

module.exports = PaiementModel;
