const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CatalogueRecompenseModel {
  /**
   * Crée une nouvelle récompense
   * @param {Object} recompenseData - Données de la récompense
   * @returns {Promise<Object>} - La récompense créée
   */
  async create(recompenseData) {
    return prisma.catalogueRecompense.create({
      data: recompenseData
    });
  }

  /**
   * Récupère une récompense par son ID
   * @param {number} id - ID de la récompense
   * @returns {Promise<Object>} - La récompense trouvée
   */
  async findById(id) {
    return prisma.catalogueRecompense.findUnique({
      where: { id_recompense: id }
    });
  }

  /**
   * Récupère toutes les récompenses
   * @returns {Promise<Array>} - Liste des récompenses
   */
  async findAll() {
    return prisma.catalogueRecompense.findMany({
      orderBy: { points_requis: 'asc' }
    });
  }

  /**
   * Met à jour une récompense
   * @param {number} id - ID de la récompense
   * @param {Object} recompenseData - Nouvelles données
   * @returns {Promise<Object>} - La récompense mise à jour
   */
  async update(id, recompenseData) {
    return prisma.catalogueRecompense.update({
      where: { id_recompense: id },
      data: recompenseData
    });
  }

  /**
   * Supprime une récompense
   * @param {number} id - ID de la récompense
   * @returns {Promise<Object>} - La récompense supprimée
   */
  async delete(id) {
    // Vérifier si la récompense est utilisée dans des échanges
    const echanges = await prisma.echangeFidelite.findMany({
      where: { id_recompense: id }
    });
    
    if (echanges.length > 0) {
      throw new Error('Cette récompense est utilisée dans des échanges et ne peut pas être supprimée');
    }
    
    return prisma.catalogueRecompense.delete({
      where: { id_recompense: id }
    });
  }

  /**
   * Récupère les récompenses disponibles pour un nombre de points donné
   * @param {number} points - Points disponibles
   * @returns {Promise<Array>} - Liste des récompenses disponibles
   */
  static getAvailableRewards(points) {
    return prisma.catalogueRecompense.findMany({
      where: {
        points_requis: { lte: points }
      },
      orderBy: { points_requis: 'desc' }
    });
  }
}

module.exports = CatalogueRecompenseModel;
