import prisma from '../config/prisma.js';

class DocumentChauffeurModel {
    /**
     * Crée ou met à jour les documents d'un chauffeur
     * @param {number} personnelId - ID du chauffeur
     * @param {Object} data - URLs des documents et date d'expiration
     * @returns {Promise<Object>} - Le personnel mis à jour
     */
    static async uploadDocuments(personnelId, data) {
        return prisma.personnel.update({
            where: { id_personnel: personnelId },
            data: {
                permis_url: data.permis_url,
                piece_identite_url: data.piece_identite_url,
                date_expiration_permis: data.date_expiration_permis,
                documents_verifies: false
            }
        });
    }

    /**
     * Valide les documents du chauffeur
     * @param {number} personnelId
     * @param {boolean} isValid
     * @returns {Promise<Object>}
     */
    static async validerDocuments(personnelId, isValid) {
        return prisma.personnel.update({
            where: { id_personnel: personnelId },
            data: { documents_verifies: isValid }
        });
    }

    /**
     * Liste des chauffeurs avec permis expiré
     * @returns {Promise<Array>}
     */
    static async findChauffeursAvecPermisExpire() {
        return prisma.personnel.findMany({
            where: {
                date_expiration_permis: {
                    lt: new Date()
                },
                est_actif: true
            }
        });
    }
}

export default DocumentChauffeurModel;
