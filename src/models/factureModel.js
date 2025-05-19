import prisma from "../config/prisma.js";
const prisma = new PrismaClient()

class FactureModel {
  /**
   * Récupère une facture par son ID
   * @param {number} id - ID de la facture
   * @returns {Promise<Object>} - La facture trouvée
   */
  static async findById(id) {
    return prisma.facture.findUnique({
      where: { id_facture: id },
      include: {
        reservation: {
          include: {
            client: true,
            chambres: {
              include: {
                chambre: true,
              },
            },
            services: {
              include: {
                service: true,
              },
            },
            paiements: true,
          },
        },
      },
    })
  }

  /**
   * Récupère une facture par l'ID de réservation
   * @param {number} idReservation - ID de la réservation
   * @returns {Promise<Object>} - La facture trouvée
   */
  static async findByReservationId(idReservation) {
    return prisma.facture.findFirst({
      where: { id_reservation: idReservation },
      include: {
        reservation: {
          include: {
            client: true,
            chambres: {
              include: {
                chambre: true,
              },
            },
            services: {
              include: {
                service: true,
              },
            },
            paiements: true,
          },
        },
      },
    })
  }

  /**
   * Récupère toutes les factures avec filtrage
   * @param {Object} filters - Filtres à appliquer
   * @param {number} skip - Nombre de factures à ignorer (pagination)
   * @param {number} take - Nombre de factures à récupérer (pagination)
   * @returns {Promise<Array>} - Les factures trouvées
   */
  static async findAll(filters = {}, skip = 0, take = 10) {
    return prisma.facture.findMany({
      where: filters,
      include: {
        reservation: {
          include: {
            client: {
              include: {
                utilisateur: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date_creation: "desc",
      },
      skip,
      take,
    })
  }

  /**
   * Crée une nouvelle facture
   * @param {Object} factureData - Données de la facture
   * @returns {Promise<Object>} - La facture créée
   */
  static async create(factureData) {
    return prisma.facture.create({
      data: factureData,
    })
  }

  /**
   * Met à jour une facture
   * @param {number} id - ID de la facture
   * @param {Object} factureData - Nouvelles données
   * @returns {Promise<Object>} - La facture mise à jour
   */
  static async update(id, factureData) {
    return prisma.facture.update({
      where: { id_facture: id },
      data: factureData,
    })
  }

  /**
   * Marque une facture comme payée
   * @param {number} id - ID de la facture
   * @returns {Promise<Object>} - La facture mise à jour
   */
  static async markAsPaid(id) {
    return prisma.facture.update({
      where: { id_facture: id },
      data: {
        etat: "payee",
        date_paiement: new Date(),
      },
    })
  }

  /**
   * Marque une facture comme envoyée
   * @param {number} id - ID de la facture
   * @returns {Promise<Object>} - La facture mise à jour
   */
  static async markAsSent(id) {
    return prisma.facture.update({
      where: { id_facture: id },
      data: {
        etat: "envoyee",
        date_envoi: new Date(),
      },
    })
  }

  /**
   * Annule une facture
   * @param {number} id - ID de la facture
   * @param {string} raison - Raison de l'annulation
   * @returns {Promise<Object>} - La facture mise à jour
   */
  static async cancel(id, raison) {
    return prisma.facture.update({
      where: { id_facture: id },
      data: {
        etat: "annulee",
        notes: raison || "Annulation sans raison spécifiée",
      },
    })
  }
}

export default FactureModel
