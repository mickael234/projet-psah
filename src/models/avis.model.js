const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AvisModel {

    /**
     * Récupère tous les avis
     * @returns {Promise<Array>} - Liste des avis
     */
    static findAll(){
        return prisma.avis.findMany()
    }


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
     * Récupère les avis des tous les clients d'une réservation
     * @param {number} idReservation - ID de la réservation
     * @returns {Promise<Array>} - Liste des avis dans une réservation
     */
    static findAllByReservation(idReservation){
        return prisma.avis.findMany({
            where: { id_reservation: idReservation }
        })
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

    /**
     * Crée un nouvel avis
     * @param {Object} avisData - Avis à créer
     * @return {Promise<AvisModel>} - Avis crée
     */
    static create(avisData){
        return prisma.avis.create({
            data: {
                avisData 
            }
        })
    }

    /**
     * Supprime un avis
     * @param {number} idAvis - Id de l'avis à supprimer
     */

    static delete(idAvis){
        return prisma.avis.delete({
            where : {
                id_avis: idAvis
            }
        })
    }
}

module.exports = AvisModel;
