const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HistoriquePrixModel {
  /**
   * Récupère tout l'historique de prix d'une chambre
   * @param {number} idChambre - ID de la chambre
   * @returns {Promise<Array>} - Liste des entrées
   */
  static findByChambre(idChambre) {
    return prisma.historiquePrix.findMany({
      where: { id_chambre: idChambre },
      orderBy: { modifie_le: 'desc' }
    });
  }

  /**
   * Récupère l'historique des prix par période
   * @param {Date} debut - Date de début
   * @param {Date} fin - Date de fin
   * @returns {Promise<Array>} - Liste des entrées
   */
  static findByPeriod(debut, fin) {
    return prisma.historiquePrix.findMany({
      where: {
        modifie_le: {
          gte: debut,
          lte: fin
        }
      },
      orderBy: { modifie_le: 'desc' },
      include: {
        chambre: true
      }
    });
  }

  /**
   * Récupère l'historique des prix par modificateur
   * @param {string} modifiePar - Qui a modifié le prix
   * @returns {Promise<Array>} - Liste des entrées
   */
  static findByModifier(modifiePar) {
    return prisma.historiquePrix.findMany({
      where: { modifie_par: modifiePar },
      orderBy: { modifie_le: 'desc' },
      include: {
        chambre: true
      }
    });
  }
}

module.exports = HistoriquePrixModel;