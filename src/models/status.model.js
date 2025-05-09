import prisma from "../config/prisma.js";


class StatusModel {
  /**
   * Récupère le statut de tous les hébergements avec filtres optionnels
   * @param {Object} filters - Filtres à appliquer
   * @param {number} page - Numéro de page pour la pagination
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Array>} - Liste des hébergements avec leur statut
   */
  static async getAllStatus(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    return prisma.chambre.findMany({
      where: filters,
      select: {
        id_chambre: true,
        numero_chambre: true,
        type_chambre: true,
        etat: true,
        description: true,
        maintenances: {
          where: {
            OR: [{ statut: "EN_ATTENTE" }, { statut: "EN_COURS" }],
          },
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
      skip,
      take: limit,
      orderBy: {
        numero_chambre: "asc",
      },
    })
  }

  /**
   * Met à jour le statut d'un hébergement
   * @param {number} id - ID de l'hébergement
   * @param {string} etat - Nouvel état
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} - L'hébergement mis à jour
   */
  static async updateStatus(id, etat, options = {}) {
    const { modifie_par } = options

    return prisma.chambre.update({
      where: { id_chambre: id },
      data: {
        etat,
        modifie_par,
        date_modification: new Date(),
      },
    })
  }

  /**
   * Crée une entrée de maintenance pour un hébergement
   * @param {number} id_chambre - ID de la chambre
   * @param {string} description - Description de la maintenance
   * @returns {Promise<Object>} - La maintenance créée
   */
  static async creerMaintenance(id_chambre, description) {
    return prisma.maintenance.create({
      data: {
        id_chambre,
        description,
        date: new Date(),
        statut: "EN_ATTENTE",
        priorite: "NORMALE",
      },
    })
  }
}

export default StatusModel;
