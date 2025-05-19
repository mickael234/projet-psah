import prisma from "../config/prisma.js";


class FournitureModel {
  /**
   * Récupère toutes les fournitures avec filtres optionnels
   * @param {Object} filters - Filtres à appliquer
   * @param {number} page - Numéro de page pour la pagination
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Array>} - Liste des fournitures
   */
  static async findAll(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    return prisma.fourniture.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: {
        nom: "asc",
      },
    })
  }

  /**
   * Récupère une fourniture par son ID
   * @param {number} id - ID de la fourniture
   * @returns {Promise<Object>} - La fourniture trouvée
   */
  static async findById(id) {
    return prisma.fourniture.findUnique({
      where: { id_fourniture: id },
    })
  }

  /**
   * Crée une nouvelle fourniture
   * @param {Object} data - Données de la fourniture
   * @returns {Promise<Object>} - La fourniture créée
   */
  static async create(data) {
    return prisma.fourniture.create({
      data: {
        nom: data.nom,
        description: data.description,
        categorie: data.categorie,
        quantite_stock: data.quantite_stock,
        unite: data.unite || "unité",
        prix_unitaire: data.prix_unitaire,
        seuil_alerte: data.seuil_alerte || 5,
      },
    })
  }

  /**
   * Met à jour une fourniture
   * @param {number} id - ID de la fourniture
   * @param {Object} data - Nouvelles données
   * @returns {Promise<Object>} - La fourniture mise à jour
   */
  static async update(id, data) {
    return prisma.fourniture.update({
      where: { id_fourniture: id },
      data,
    })
  }

  /**
   * Enregistre l'utilisation d'une fourniture
   * @param {number} id - ID de la fourniture
   * @param {number} quantite - Quantité utilisée
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} - L'utilisation enregistrée
   */
  static async enregistrerUtilisation(id, quantite, options = {}) {
    const { id_operation_nettoyage, notes, id_chambre } = options

    // Créer l'utilisation
    const utilisation = await prisma.utilisationFourniture.create({
      data: {
        id_fourniture: id,
        quantite,
        notes,
        id_operation_nettoyage,
        id_chambre,
      },
    })

    // Mettre à jour le stock
    await prisma.fourniture.update({
      where: { id_fourniture: id },
      data: {
        quantite_stock: {
          decrement: quantite,
        },
      },
    })

    return utilisation
  }

  /**
   * Récupère les fournitures avec un stock bas
   * @returns {Promise<Array>} - Liste des fournitures avec stock bas
   */
  static async getStockBas() {
    return prisma.$queryRaw`
      SELECT * FROM "Fourniture" 
      WHERE quantite_stock <= seuil_alerte
      ORDER BY (quantite_stock::float / seuil_alerte::float) ASC
    `
  }
}

export default FournitureModel;
