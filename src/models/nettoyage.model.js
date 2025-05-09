import prisma from "../config/prisma.js"

class NettoyageModel {
  /**
   * Crée une nouvelle opération de nettoyage
   * @param {Object} data - Données de l'opération
   * @returns {Promise<Object>} - L'opération créée
   */
  static async create(data) {
    return prisma.nettoyage.create({
      data: {
        id_chambre: data.id_chambre,
        id_utilisateur: data.id_utilisateur,
        date_nettoyage: data.date_nettoyage || new Date(),
        notes: data.notes,
      },
    })
  }

  /**
   * Récupère l'historique des nettoyages pour une chambre
   * @param {number} id_chambre - ID de la chambre
   * @param {number} page - Numéro de page pour la pagination
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Array>} - Liste des opérations de nettoyage
   */
  static async getHistoriqueByChambre(id_chambre, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    return prisma.nettoyage.findMany({
      where: { id_chambre },
      include: {
        utilisateur: {
          select: {
            nom_utilisateur: true,
          },
        },
        fournitures: {
          include: {
            fourniture: true,
          },
        },
      },
      orderBy: {
        date_nettoyage: "desc",
      },
      skip,
      take: limit,
    })
  }

  /**
   * Enregistre l'utilisation de fournitures pour une opération de nettoyage
   * @param {number} id_nettoyage - ID de l'opération de nettoyage
   * @param {Array} fournitures - Liste des fournitures utilisées
   * @returns {Promise<Array>} - Liste des utilisations enregistrées
   */
  static async enregistrerFournituresUtilisees(id_nettoyage, fournitures) {
    const utilisations = []

    for (const item of fournitures) {
      if (item.id_fourniture && item.quantite) {
        // Vérifier si la fourniture existe
        const fourniture = await prisma.fourniture.findUnique({
          where: { id_fourniture: item.id_fourniture },
        })

        if (fourniture) {
          // Créer l'utilisation
          const utilisation = await prisma.nettoyageFourniture.create({
            data: {
              id_nettoyage,
              id_fourniture: item.id_fourniture,
              quantite: item.quantite,
            },
          })

          // Mettre à jour le stock
          await prisma.fourniture.update({
            where: { id_fourniture: item.id_fourniture },
            data: {
              quantite_stock: Math.max(0, fourniture.quantite_stock - item.quantite),
            },
          })

          utilisations.push(utilisation)
        }
      }
    }

    return utilisations
  }
}

export default NettoyageModel
