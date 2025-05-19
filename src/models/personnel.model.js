import prisma from '../config/prisma.js';

class PersonnelModel {
    /**
     * Récupère un membre du personnel avec ses relations
     * @param {number} id - ID du personnel
     * @returns {Promise<Object>} - Le membre du personnel avec ses relations
     */
    static getWithRelations(id) {
        return prisma.personnel.findUnique({
            where: { id_personnel: id },
            include: {
                utilisateur: true
            }
        });
    }

    /**
     * Récupère un membre du personnel par l'ID de son utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object>} - Le membre du personnel trouvé
     */
    static findByUserId(userId) {
        return prisma.personnel.findUnique({
            where: { id_utilisateur: userId }
        });
    }

    /**
     * Récupère le personnel par poste
     * @param {string} poste - Poste recherché
     * @returns {Promise<Array>} - Personnel correspondant
     */
    static findByPoste(poste) {
        return prisma.personnel.findMany({
            where: { poste }
        });
    }

    /**
     * Récupère le personnel avec ses documents et formations
     * @param {number} id
     * @returns {Promise<Object>}
     */
    static getWithDocumentsAndFormations(id) {
        return prisma.personnel.findUnique({
            where: { id_personnel: id },
            include: {
                documents: true,
                formations: true,
                utilisateur: true
            }
        });
    }

    /**
     * Désactive un chauffeur qui a un permis invalide
     * @returns 
     */
    static async desactiverChauffeursAvecPermisExpire() {
    return prisma.personnel.updateMany({
        where: {
            date_expiration_permis: { lt: new Date() },
            est_actif: true
        },
        data: { est_actif: false }
    });
}

}

export default PersonnelModel;
