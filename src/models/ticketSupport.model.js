import prisma from "../config/prisma.js"

class TicketSupportModel {

    /**
     * Récupère un ticket par son ID
     * @param {Number} id - ID du ticket
     * @returns {Promise<Object>} - Le ticket trouvé
     */
    static async findById(id) {
        return prisma.ticketSupport.findUnique({
            where: {
                id_ticket: id
            },
            include: {
                client: true,
                personnel: true,
                emails_envoyes: true
            }
        });
    }

    /**
     * Récupère tous les tickets, avec possibilité de filtrer par statut ou type
     * @param {Object} filters - Filtres possibles : statut, type, etc.
     * @returns {Promise<Array>} - Liste des tickets
     */
    static async findAll(filters = {}) {
        return prisma.ticketSupport.findMany({
            where: {
                ...filters
            },
            include: {
                client: true,
                personnel: true,
                emails_envoyes: true
            }
        });
    }

    /**
     * Récupère les tickets d’un client
     * @param {Number} clientId - ID du client
     * @returns {Promise<Array>} - Liste des tickets du client
     */
    static async findByClient(clientId) {
        return prisma.ticketSupport.findMany({
            where: {
                id_client: clientId
            }
        });
    }


    /**
     * Crée un ticket support
     * @param {Object} data - Données du ticket
     * @returns {Promise<Object>} - Le ticket créé
     */
    static async create(data) {
        return prisma.ticketSupport.create({
            data: {
              id_client: data.id_client,
              id_personnel: data.id_personnel,
              sujet: data.sujet,
              description: data.description,
              type: data.type,
              statut: data.statut,
              date_creation: data.date_creation
            }
        });
    }

    
    /**
     * S’assigne un ticket à soi-même (réceptionniste)
     * @param {Number} ticketId - ID du ticket
     * @param {Number} personnelId - ID du personnel
     * @returns {Promise<Object>} - Le ticket mis à jour
     */
    static async assignToSelf(ticketId, personnelId) {
        return prisma.ticketSupport.update({
            where: { id_ticket: ticketId },
            data: { id_personnel: personnelId }
        });
    }

    /**
     * Change le statut d’un ticket
     * @param {Number} ticketId - ID du ticket
     * @param {String} statut - Nouveau statut
     * @returns {Promise<Object>} - Le ticket mis à jour
     */
    static async updateStatut(ticketId, statut) {
        return prisma.ticketSupport.update({
            where: { id_ticket: ticketId },
            data: { statut }
        });
    }

    /**
     * Réassigne un ticket à un autre personnel
     * @param {Number} ticketId - ID du ticket
     * @param {Number} newPersonnelId - ID du nouveau personnel
     * @returns {Promise<Object>} - Le ticket mis à jour
     */
    static async reassignTo(ticketId, newPersonnelId) {
        return prisma.ticketSupport.update({
            where: { id_ticket: ticketId },
            data: { id_personnel: newPersonnelId }
        });
    }
}

export default TicketSupportModel;