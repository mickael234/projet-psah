import prisma from "../config/prisma.js";

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

    /**
     * Génère un rapport financier en fonction d'une période
     * @param {String} dateMin - Date minimale
     * @param {String} dateMax - Date maximale
     * @returns {Promise<Object>} - Transactions effectuées lors de la période choisie
     */


    static async getRapportFinancier(dateMin, dateMax) {

        const minDate = dateMin ? new Date(dateMin) : new Date('2000-01-01');
        const maxDate = dateMax ? new Date(dateMax) : new Date();
        
    
        if (isNaN(minDate.getTime()) || isNaN(maxDate.getTime())) {
            throw new Error('Les dates fournies ne sont pas valides');
        }

        // Récupérer les transactions
        const transactions = await prisma.paiement.findMany({
            where: {
              etat: "complete",
              date_transaction: {
                lte: new Date(maxDate),
                gte: new Date(minDate)
              }
            }, 
            include: {
                reservation: {
                    include: {
                        client: {
                            select: {
                                prenom: true,
                                nom: true 
                            }
                        }
                    }
                }
            },
            orderBy: [
                { montant: "asc" }
            ]

        })

        // Calcul du total des montants des transactions
        const { _sum } = await prisma.paiement.aggregate({
            where: {
                etat: "complete",
                date_transaction: {
                    lte: maxDate,
                    gte: minDate
                }
            },
            _sum: {
                montant: true
            }
        });

        // Calcul du nombre total de transactions 
        const totalTransactions = await prisma.paiement.count({
            where: {
                etat: "complete",
                date_transaction: {
                    lte: maxDate,
                    gte: minDate
                }
            }
        });
      
        return {
            data: transactions,
            totalTransactions: totalTransactions,
            totalMontant: _sum.montant || 0
        };
    }

    /**
     * Calcule le revenu total 
     * @returns {Promise<number>} - Revenu total
     */

    static async getRevenuTotal(){
        const revenuTotal = await prisma.paiement
        .aggregate({ 
            _sum: { montant: true }, 
            where: { etat: "complete" } 
        })

        return revenuTotal._sum.montant;
    }
      
}

export default PaiementModel;
