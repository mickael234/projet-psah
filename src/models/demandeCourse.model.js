import prisma from '../config/prisma.js';

class DemandeCourseModel {
    /**
     * Trouve une demande par son ID
     * @param {number} id - ID de la demande
     * @returns {Promise<Object>}
     */
    static async findById(id) {
        return await prisma.demandeCourse.findUnique({
            where: {
                id_demande_course: id
            },
            include: {
                client: {
                    select: {
                        prenom: true,
                        nom: true
                    }
                },
                trajet: true
            }
        });
    }

    /**
     * Liste des demandes d’un client
     * @param {number} clientId
     * @param {Object} filters - Filtres : statut, date
     * @returns {Promise<Array>}
     */
    static async findAllByClient(clientId, filters = {}) {
        const where = {
            id_client: clientId
        };

        if (filters.statut) {
            where.statut = filters.statut;
        }

        if (filters.dateMin || filters.dateMax) {
            where.date_demande = {};
            if (filters.dateMin) {
                where.date_demande.gte = new Date(filters.dateMin);
            }
            if (filters.dateMax) {
                where.date_demande.lte = new Date(filters.dateMax);
            }
        }

        return await prisma.demandeCourse.findMany({
            where,
            orderBy: {
                date_demande: 'desc'
            },
            include: {
                trajet: true
            }
        });
    }

    /**
     * Liste des demandes en attente (chauffeur)
     * @param {Object} filters - Filtres par date, lieu, etc.
     * @returns {Promise<Array>}
     */
    static async findPending(filters = {}) {
        const where = {
            statut: 'en_attente'
        };

        if (filters.dateMin || filters.dateMax) {
            where.date_demande = {};
            if (filters.dateMin) {
                where.date_demande.gte = new Date(filters.dateMin);
            }
            if (filters.dateMax) {
                where.date_demande.lte = new Date(filters.dateMax);
            }
        }

        return await prisma.demandeCourse.findMany({
            where,
            orderBy: {
                date_demande: 'asc'
            },
            include: {
                client: {
                    select: {
                        prenom: true,
                        nom: true
                    }
                }
            }
        });
    }

    /**
     * Crée une nouvelle demande de course
     * @param {Object} data - Données de la demande
     * @returns {Promise<Object>}
     */
    static async create(data) {
        return await prisma.demandeCourse.create({
            data
        });
    }

    /**
     * Mettre à jour une demande (ex: lieu ou horaires)
     * @param {number} id
     * @param {Object} data - Données modifiées
     * @returns {Promise<Object>}
     */
    static async update(id, data) {
        return await prisma.demandeCourse.update({
            where: {
                id_demande_course: id
            },
            data
        });
    }

    /**
     * Change le statut de la demande (acceptee, refusee, annulee)
     * @param {number} id
     * @param {string} statut
     * @returns {Promise<Object>}
     */
    static async updateStatut(id, statut) {
        return await prisma.demandeCourse.update({
            where: {
                id_demande_course: id
            },
            data: {
                statut
            }
        });
    }

    /**
     * Supprime une demande
     * @param {number} id
     * @returns {Promise<Object>}
     */
    static async delete(id) {
        return await prisma.demandeCourse.delete({
            where: {
                id_demande_course: id
            }
        });
    }
}

export default DemandeCourseModel;
