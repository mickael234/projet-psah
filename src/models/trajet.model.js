import prisma from '../config/prisma.js';

class TrajetModel {
    /**
     * Trouve un trajet par son ID
     * @param {number} id - ID du trajet
     * @returns {Promise<Object>} - Le trajet trouvé
     */
    static async findById(id) {
        return await prisma.trajet.findUnique({
            where: {
                id_trajet: id
            },
            include: {
                personnel: true,
                demandeCourse: {
                    select: {
                        id_client: true
                    }
                }
            }
        });
    }

    /**
     * Trouve un trajet associé à une demande de course
     * @param {number} id_demande_course - ID de la demande de course
     * @returns {Promise<Object|null>}
     */
    static async findByDemandeId(id_demande_course) {
        return await prisma.trajet.findUnique({
        where: { id_demande_course }
        });
    }

    /**
     * Trouve tous les trajets pour un chauffeur, filtrés par date et statut
     * @param {number} personnelId - ID du personnel (chauffeur)
     * @param {Object} filters - Filtres optionnels : dateMin, dateMax, statut
     * @returns {Promise<Array>} - Liste des trajets
     */
    static async findAllByChauffeur(personnelId, filters = {}) {
        const where = {
            id_personnel: personnelId
        };

        if (filters.statut) {
            where.statut = filters.statut;
        }

        if (filters.dateMin || filters.dateMax) {
            where.date_prise_en_charge = {};
            if (filters.dateMin) {
                where.date_prise_en_charge.gte = new Date(filters.dateMin);
            }
            if (filters.dateMax) {
                where.date_prise_en_charge.lte = new Date(filters.dateMax);
            }
        }

        return await prisma.trajet.findMany({
            where,
            orderBy: {
                date_prise_en_charge: 'asc'
            },
            include: {
                demandeCourse: true
            }
        });
    }

    /**
     * Récupère les trajets groupés par jour pour un chauffeur
     * @param {number} personnelId 
     * @param {Date} dateDebut 
     * @param {Date} dateFin 
     */
    static async getPlanningParJour(personnelId, dateDebut, dateFin) {
        return await prisma.trajet.findMany({
            where: {
                id_personnel: personnelId,
                date_prise_en_charge: {
                    gte: new Date(dateDebut),
                    lte: new Date(dateFin)
                }
            },
            orderBy: {
                date_prise_en_charge: 'asc'
            },
            include: {
                demandeCourse: true
            }
        });
    }

    /**
     * Crée un nouveau trajet
     * @param {Object} trajetData - Données du trajet
     * @returns {Promise<Object>} - Le trajet créé
     */
    static async create(trajetData) {
        return await prisma.trajet.create({
            data: trajetData
        });
    }

    /**
     * Met à jour le statut d’un trajet
     * @param {number} id - ID du trajet
     * @param {string} statut - Nouveau statut (ex: en_cours, termine)
     * @returns {Promise<Object>} - Le trajet mis à jour
     */
    static async updateStatut(id, statut) {
        return await prisma.trajet.update({
            where: {
                id_trajet: id
            },
            data: {
                statut: statut
            }
        });
    }

    /**
     * Met à jour les horaires de prise en charge et de dépose
     * @param {number} id - ID du trajet
     * @param {Date} priseEnCharge - Nouvelle date de prise en charge
     * @param {Date} depose - Nouvelle date de dépose
     * @returns {Promise<Object>} - Le trajet mis à jour
     */
    static async updateHoraires(id, priseEnCharge, depose) {
        return await prisma.trajet.update({
            where: {
                id_trajet: id
            },
            data: {
                date_prise_en_charge: new Date(priseEnCharge),
                date_depose: new Date(depose)
            }
        });
    }
}

export default TrajetModel;
