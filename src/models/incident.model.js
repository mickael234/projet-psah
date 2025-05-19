import prisma from '../config/prisma.js';

class IncidentModel {
    /**
     * Créer un signalement d'incident
     * @param {Object} data - Données de l'incident
     * @returns {Promise<Object>}
     */
    static async signaler(data) {
        return prisma.incident.create({ data });
    }

    /**
     * Trouve un incident par rapport à un trajet
     * @param {Object} idTrajet - ID du trajet
     * @returns {Promise<Object>}
     */
    static async findByTrajetId(idTrajet){
        return await prisma.incident.findUnique({
            where :  {
                id_trajet : idTrajet
            }
        })
    }

    /**
     * Liste tous les incidents
     * @returns {Promise<Array>}
     */
    static async findAll() {
        return prisma.incident.findMany({
            orderBy: { date: 'desc' },
            include: { utilisateur: true }
        });
    }

    /**
     * Marquer un incident comme résolu
     * @param {number} id - ID de l'incident
     * @returns {Promise<Object>}
     */
    static async marquerCommeTraite(id) {
        return prisma.incident.update({
            where: { id_incident: id },
            data: { statut: 'traite' }
        });
    }
}

export default IncidentModel;
