import prisma from "../config/prisma.js";

class AvisModel {

    /**
     * Récupérer tous les avis de tous les clients
     * @returns {Promise<Array>} - Liste des avis
     */
    static async findAll(){
        return prisma.avis.findMany()
    }


    /**
     * Récupérer l'avis d'un client d'une réservation
     * @param {number} idReservation - ID de la réservation
     * @returns {Promise<Object>} - L'avis trouvé
     */
    static async findByReservation(idReservation) {
        return prisma.avis.findUnique({
            where: { id_reservation: idReservation }
        });
    }

    /**
     * Récupérer un avis par son ID
     * @param {number} id - ID de l'avis
     * @returns {Promise<Object>} - L'avis trouvé
     */
    static async findById(id){
        return prisma.avis.findUnique({
            where : {
                id_avis: id
            }
        })
    }

    /**
 * Récupérer les avis de tous les clients pour une chambre spécifique
 * @param {number} idChambre - ID de la chambre
 * @returns {Promise<Array>} - Liste des avis associés à cette chambre
 */
    static async findAllByChambre(idChambre) {
        return prisma.avis.findMany({
            where: {
                reservation: {
                    chambres: {
                        some: {
                            id_chambre: idChambre
                        }
                    }
                }
            },
            include: {
                reservation: {
                    include: {
                        client: {
                            include: {
                                utilisateur: true
                            }
                        }
                    }
                }
            }
        });
    }


    /**
     * Calculer la note moyenne des avis
     * @returns {Promise<number>} - Note moyenne
     */
    static async getAverageRating() {
        return prisma.avis
            .aggregate({
                _avg: {
                    note: true
                }
            })
            .then((result) => result._avg.note || 0);
    }

    /**
     * Récupérer les avis par note
     * @param {number} note - Note recherchée
     * @returns {Promise<Array>} - Liste des avis
     */
    static async findByRating(note) {
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
     * Créer un nouvel avis
     * @param {Object} nouvelAvis - Avis à créer
     * @returns {Promise<Object>} - Avis crée
     */
    static async create(avis){
        return prisma.avis.create({
            data: {
                nouvelAvis
            }
        })
    }

    /**
     * Répondre à un avis
     * @param {number} idAvis - Id de l'avis auquel on veut répondre
     * @param {Promise<Object>} reponse - Réponse du personnel
     * @returns {Promise<Object>} - Avis avec la réponse du personnel
     */
    static async update(idAvis, reponse){
        return prisma.avis.update({
            where : {
                id_avis: idAvis
            },
            data : {
                commentaire : reponse
            }
        })
    }


    /**
     * Supprimer un avis
     * @param {number} idAvis - Id de l'avis à supprimer
     * @returns {Promise<Object>} - Avis supprimé
     */

    static async delete(idAvis){
        return prisma.avis.delete({
            where : {
                id_avis: idAvis
            }
        })
    }
}

module.exports = AvisModel;
