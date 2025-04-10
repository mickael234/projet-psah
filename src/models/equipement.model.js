const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EquipementModel {
  /**
   * Crée un nouvel équipement
   * @param {Object} equipementData - Données de l'équipement
   * @returns {Promise<Object>} - L'équipement créé
   */
  async create(equipementData) {
    return prisma.equipement.create({
      data: equipementData
    });
  }

  /**
   * Récupère un équipement par son ID
   * @param {number} id - ID de l'équipement
   * @returns {Promise<Object>} - L'équipement trouvé
   */
  async findById(id) {
    return prisma.equipement.findUnique({
      where: { id_equipement: id }
    });
  }

  /**
   * Récupère tous les équipements
   * @returns {Promise<Array>} - Liste des équipements
   */
  async findAll() {
    return prisma.equipement.findMany();
  }

  /**
   * Met à jour un équipement
   * @param {number} id - ID de l'équipement
   * @param {Object} equipementData - Nouvelles données
   * @returns {Promise<Object>} - L'équipement mis à jour
   */
  async update(id, equipementData) {
    return prisma.equipement.update({
      where: { id_equipement: id },
      data: equipementData
    });
  }

  /**
   * Supprime un équipement
   * @param {number} id - ID de l'équipement
   * @returns {Promise<Object>} - L'équipement supprimé
   */
  async delete(id) {
    // Supprimer d'abord les relations
    await prisma.chambresEquipements.deleteMany({
      where: { id_equipement: id }
    });
    
    return prisma.equipement.delete({
      where: { id_equipement: id }
    });
  }

  /**
   * Récupère les chambres qui ont un équipement spécifique
   * @param {number} id - ID de l'équipement
   * @returns {Promise<Array>} - Liste des chambres
   */
  static getChambres(id) {
    return prisma.chambresEquipements.findMany({
      where: { id_equipement: id },
      include: {
        chambre: true
      }
    });
  }
}

module.exports = EquipementModel;