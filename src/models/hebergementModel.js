import prisma from "../config/prisma.js";


class ChambreModel {
    /**
     * Récupère une chambre avec ses relations
     * @param {number} id - ID de la chambre
     * @returns {Promise<Object>} - La chambre avec ses relations
     */
    static async getWithRelations(id) {
        return prisma.chambre.findUnique({
            where: { id_chambre: id },
            include: {
                equipements: {
                    include: {
                        equipement: true
                    }
                },
                medias: true
            }
        });
    }

    /**
     * Récupère les chambres par type
     * @param {string} type - Type de chambre
     * @returns {Promise<Array>} - Liste des chambres
     */
    static async findByType(type) {
        return prisma.chambre.findMany({
            where: { type_chambre: type }
        });
    }

    /**
     * Récupère les chambres disponibles
     * @returns {Promise<Array>} - Liste des chambres disponibles
     */
    static async findAvailable() {
        return prisma.chambre.findMany({
            where: { etat: 'disponible' }
        });
    }

    /**
     * Crée une nouvelle chambre
     * @param {Object} chambreData - Données de la chambre
     * @param {Array<number>} equipements - IDs des équipements
     * @returns {Promise<Object>} - La chambre créée avec ses relations
     */
    static async create(chambreData, equipements = []) {
        const chambre = await prisma.chambre.create({
            data: chambreData
        });

        if (equipements.length > 0) {
            for (const idEquipement of equipements) {
                await prisma.chambresEquipements.create({
                    data: {
                        id_chambre: chambre.id_chambre,
                        id_equipement: idEquipement
                    }
                });
            }
        }

        return ChambreModel.getWithRelations(chambre.id_chambre);
    }

    /**
     * Récupère une chambre par son ID
     * @param {number} id - ID de la chambre
     * @returns {Promise<Object>} - La chambre trouvée
     */
    static async findById(id) {
        return ChambreModel.getWithRelations(id);
    }

    /**
     * Récupère toutes les chambres avec filtres
     * @param {Object} filters - Filtres optionnels
     * @returns {Promise<Array>} - Liste des chambres
     */
    static async findAll(filters = {}) {
        return prisma.chambre.findMany({
            where: filters,
            include: {
                equipements: {
                    include: {
                        equipement: true
                    }
                },
                medias: true
            }
        });
    }

    /**
     * Met à jour une chambre
     * @param {number} id - ID de la chambre
     * @param {Object} chambreData - Nouvelles données de la chambre
     * @returns {Promise<Object>} - La chambre mise à jour
     */
    static async update(id, chambreData) {
        return prisma.chambre.update({
            where: { id_chambre: id },
            data: chambreData
        });
    }

    /**
     * Supprime une chambre
     * @param {number} id - ID de la chambre
     * @returns {Promise<Object>} - La chambre supprimée
     */
    static async delete(id) {
        await prisma.chambresEquipements.deleteMany({
            where: { id_chambre: id }
        });

        await prisma.media.deleteMany({
            where: { id_chambre: id }
        });

        return prisma.chambre.delete({
            where: { id_chambre: id }
        });
    }

    /**
     * Met à jour l'état d'une chambre
     * @param {number} id - ID de la chambre
     * @param {string} etat - Nouvel état de la chambre
     * @returns {Promise<Object>} - La chambre mise à jour
     */
    static async updateEtat(id, etat) {
        return prisma.chambre.update({
            where: { id_chambre: id },
            data: { etat }
        });
    }

    /**
     * Ajoute un équipement à une chambre
     * @param {number} idChambre - ID de la chambre
     * @param {number} idEquipement - ID de l'équipement
     * @returns {Promise<Object>} - La relation créée
     */
    static async addEquipement(idChambre, idEquipement) {
        return prisma.chambresEquipements.create({
            data: {
                id_chambre: idChambre,
                id_equipement: idEquipement
            }
        });
    }

    /**
     * Supprime un équipement d'une chambre
     * @param {number} idChambre - ID de la chambre
     * @param {number} idEquipement - ID de l'équipement
     * @returns {Promise<Object>} - La relation supprimée
     */
    static async removeEquipement(idChambre, idEquipement) {
        return prisma.chambresEquipements.delete({
            where: {
                id_chambre_id_equipement: {
                    id_chambre: idChambre,
                    id_equipement: idEquipement
                }
            }
        });
    }

    /**
     * Met à jour le prix d'une chambre et enregistre l'historique
     * @param {number} id - ID de la chambre
     * @param {number} nouveauPrix - Nouveau prix de la chambre
     * @param {string} modifiePar - Utilisateur ayant modifié
     * @returns {Promise<Object>} - La chambre mise à jour
     */
    static async updatePrix(id, nouveauPrix, modifiePar) {
        const chambre = await this.findById(id);

        await prisma.historiquePrix.create({
            data: {
                id_chambre: id,
                ancien_prix: chambre.prix_par_nuit,
                nouveau_prix: nouveauPrix,
                modifie_par: modifiePar
            }
        });

        return prisma.chambre.update({
            where: { id_chambre: id },
            data: { prix_par_nuit: nouveauPrix }
        });
    }
}

export default ChambreModel;
