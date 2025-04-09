const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MediaModel {
  /**
   * Crée un nouveau média
   * @param {Object} mediaData - Données du média
   * @returns {Promise<Object>} - Le média créé
   */
  async create(mediaData) {
    return prisma.media.create({
      data: mediaData
    });
  }

  /**
   * Récupère un média par son ID
   * @param {number} id - ID du média
   * @returns {Promise<Object>} - Le média trouvé
   */
  async findById(id) {
    return prisma.media.findUnique({
      where: { id_media: id },
      include: {
        chambre: true
      }
    });
  }

  /**
   * Récupère tous les médias
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Array>} - Liste des médias
   */
  async findAll(filters = {}) {
    return prisma.media.findMany({
      where: filters,
      include: {
        chambre: true
      }
    });
  }

  /**
   * Met à jour un média
   * @param {number} id - ID du média
   * @param {Object} mediaData - Nouvelles données
   * @returns {Promise<Object>} - Le média mis à jour
   */
  async update(id, mediaData) {
    return prisma.media.update({
      where: { id_media: id },
      data: mediaData
    });
  }

  /**
   * Supprime un média
   * @param {number} id - ID du média
   * @returns {Promise<Object>} - Le média supprimé
   */
  async delete(id) {
    return prisma.media.delete({
      where: { id_media: id }
    });
  }

  /**
   * Récupère les médias d'une chambre
   * @param {number} idChambre - ID de la chambre
   * @returns {Promise<Array>} - Liste des médias
   */
  static findByChambre(idChambre) {
    return prisma.media.findMany({
      where: { id_chambre: idChambre }
    });
  }

  /**
   * Récupère les médias par type
   * @param {string} type - Type de média
   * @returns {Promise<Array>} - Liste des médias
   */
  static findByType(type) {
    return prisma.media.findMany({
      where: { type_media: type }
    });
  }
}

module.exports = MediaModel;