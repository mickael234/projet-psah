import prisma from "../config/prisma.js"

class MaintenanceModel {
  /**
   * Crée une nouvelle maintenance
   * @param {Object} data - Données de la maintenance
   * @returns {Promise<Object>} - La maintenance créée
   */
  static async createMaintenance(data) {
    return prisma.maintenance.create({
      data: {
        id_chambre: data.id_chambre,
        description: data.description,
        date: data.date,
        statut: data.statut || "EN_ATTENTE",
        priorite: data.priorite || "NORMALE",
      },
    })
  }

  /**
   * Récupère les maintenances pour une chambre
   * @param {number} id_chambre - ID de la chambre
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Array>} - Liste des maintenances
   */
  static async findByChambre(id_chambre, options = {}) {
    const { statut, priorite } = options
    const where = { id_chambre: Number.parseInt(id_chambre) }

    if (statut) {
      where.statut = statut
    }

    if (priorite) {
      where.priorite = priorite
    }

    return prisma.maintenance.findMany({
      where,
      orderBy: [{ statut: "asc" }, { priorite: "desc" }, { date: "desc" }],
    })
  }

  /**
   * Met à jour le statut d'une maintenance
   * @param {number} id_maintenance - ID de la maintenance
   * @param {string} statut - Nouveau statut
   * @returns {Promise<Object>} - La maintenance mise à jour
   */
  static async updateStatus(id_maintenance, statut) {
    return prisma.maintenance.update({
      where: { id_maintenance: Number.parseInt(id_maintenance) },
      data: { statut },
    })
  }
}

export default MaintenanceModel
