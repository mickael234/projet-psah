import prisma from "../config/prisma.js";


class CommandeModel {
  /**
   * Crée une nouvelle commande de fournitures
   * @param {Object} data - Données de la commande
   * @param {Array} details - Détails de la commande
   * @returns {Promise<Object>} - La commande créée
   */
  static async create(data, details) {
    return prisma.$transaction(async (tx) => {
      // Créer la commande
      const commande = await tx.commandeFourniture.create({
        data: {
          reference: data.reference || `CMD-${Date.now()}`,
          fournisseur: data.fournisseur,
          date_commande: new Date(),
          date_livraison_prevue: data.date_livraison_prevue,
          statut: data.statut || "EN_ATTENTE",
          notes: data.notes,
          id_utilisateur: data.id_utilisateur,
        },
      })

      // Ajouter les détails
      for (const detail of details) {
        await tx.detailCommandeFourniture.create({
          data: {
            id_commande: commande.id_commande,
            id_fourniture: detail.id_fourniture,
            quantite: detail.quantite,
            prix_unitaire: detail.prix_unitaire,
          },
        })
      }

      // Récupérer la commande complète
      return tx.commandeFourniture.findUnique({
        where: { id_commande: commande.id_commande },
        include: {
          details: {
            include: {
              fourniture: true,
            },
          },
        },
      })
    })
  }

  /**
   * Met à jour le statut d'une commande
   * @param {number} id - ID de la commande
   * @param {string} statut - Nouveau statut
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} - La commande mise à jour
   */
  static async updateStatus(id, statut, options = {}) {
    const { notes, date_livraison } = options

    const commande = await prisma.commandeFourniture.findUnique({
      where: { id_commande: id },
      include: {
        details: true,
      },
    })

    if (!commande) {
      throw new Error("Commande non trouvée")
    }

    // Mise à jour de la commande
    const commandeMiseAJour = await prisma.commandeFourniture.update({
      where: { id_commande: id },
      data: {
        statut,
        notes: notes || commande.notes,
        date_livraison: statut === "LIVREE" ? new Date() : date_livraison || commande.date_livraison,
      },
    })

    // Si la commande est livrée, mettre à jour les stocks
    if (statut === "LIVREE" && commande.statut !== "LIVREE") {
      for (const detail of commande.details) {
        await prisma.fourniture.update({
          where: { id_fourniture: detail.id_fourniture },
          data: {
            quantite_stock: {
              increment: detail.quantite,
            },
          },
        })
      }
    }

    return commandeMiseAJour
  }

  /**
   * Récupère toutes les commandes avec filtres optionnels
   * @param {Object} filters - Filtres à appliquer
   * @param {number} page - Numéro de page pour la pagination
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Array>} - Liste des commandes
   */
  static async findAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    return prisma.commandeFourniture.findMany({
      where: filters,
      include: {
        details: {
          include: {
            fourniture: true,
          },
        },
        utilisateur: {
          select: {
            nom_utilisateur: true,
          },
        },
      },
      orderBy: {
        date_commande: "desc",
      },
      skip,
      take: limit,
    })
  }
}

export default CommandeModel;
