import prisma from "../config/prisma.js";

class FormationModel {


    /**
     * Récupère une formation par son ID
     * @param {number} idFormation - ID de la formation
     * @returns {Promise<Object>} - Formation récuperée
     */

    static async findById(idFormation){
        return prisma.formation.findUnique({
            where : {
                id : idFormation
            }
        })
    }

    /**
     * Récupère toutes les formations du catalogue
     * @param {Object} [filters] - Filtres optionnels
     * @returns {Promise<Array>} - Liste des formations
     */
    static async findAll(filters = {}) {
        return prisma.formation.findMany({
            where: filters,
            orderBy: { id: 'asc' }
        });
    }

    /**
     * Assigner une formation à un chauffeur
     * @param {number} idPersonnel - ID du chauffeur
     * @param {number} idFormation - ID de la formation
     * @returns {Promise<Object>} - Liaison créée
     */
    static async assignerFormation(idPersonnel, idFormation) {
        return prisma.formationsChauffeur.create({
            data: {
                id_personnel: idPersonnel,
                id_formation: idFormation,
                completee: false,
                date_completion: null
            }
        });
    }


     /**
     * Liste les formations assignées à un chauffeur
     * @param {number} idPersonnel - ID du chauffeur
     * @returns {Promise<Array>} - Formations avec état de complétion
     */
    static async findByChauffeur(idPersonnel) {
        return prisma.formationsChauffeur.findMany({
            where: { id_personnel: idPersonnel },
            include: { formation: true },
            orderBy: { date_completion: 'desc' }
        });
    }


    /**
     * Liste les chauffeurs qui suivent une formation
     * @param {number} idFormation 
     * @returns {Promise<Array>} - Liste des chauffeurs 
     */
    static async getChauffeursParFormation(idFormation) {
        return prisma.formationsChauffeur.findMany({
            where: { id_formation: idFormation },
            include: { personnel: true },
            orderBy: { date_completion: 'desc' }
        });
    }


    /**
     * Marquer une formation comme complétée pour un chauffeur
     * @param {number} idPersonnel - ID du chauffeur
     * @param {number} idFormation - ID de la formation
     * @returns {Promise<Object>} - Mise à jour
     */
    static async marquerCommeComplete(idPersonnel, idFormation) {
        return prisma.formationsChauffeur.updateMany({
            where: {
                id_personnel: idPersonnel,
                id_formation: idFormation
            },
            data: {
                completee: true,
                date_completion: new Date()
            }
        });
    }


    
    /**
     * Créer une nouvelle formation dans le catalogue
     * @param {Object} data - Données de la formation
     * @returns {Promise<Object>} - Formation créée
     */
    static async create(data) {
        return prisma.formation.create({ data });
    }


    /**
     * Met à jour une formation (obligatoire, titre, etc.)
     * @param {number} id - ID de la formation
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<Object>} - Formation mise à jour
     */
    static async update(id, data) {
        return prisma.formation.update({
            where: { id },
            data
        });
    }

    /**
     * Supprime logiquement une formation du catalogue
     * @param {number} id - ID de la formation
     * @returns {Promise<Object>} - Formation désactivée
     */
    static async disable(id) {
        return prisma.formation.update({
            where: { id },
            data: { active: false }
        });
    }

    
}

export default FormationModel;
