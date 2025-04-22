import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class MaintenanceModel {
  /**
   * Crée une nouvelle entrée de maintenance
   * @param {Object} data - Données de maintenance
   * @returns {Promise<Object>} - La maintenance créée
   */
  static async createMaintenance(data) {
    return prisma.maintenance.create({ data });
  }

  /**
   * Récupère toutes les maintenances d'une chambre
   * @param {number} id_chambre - ID de la chambre
   * @returns {Promise<Array>} - Liste des maintenances triée par date
   */
  static async findByChambre(id_chambre) {
    return prisma.maintenance.findMany({
      where: { id_chambre: parseInt(id_chambre) },
      orderBy: { date: 'desc' }
    });
  }
}

export default MaintenanceModel;
