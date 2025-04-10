const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TransactionFideliteModel {
  /**
   * Récupère toutes les transactions d'un programme de fidélité
   * @param {number} idFidelite - ID du programme de fidélité
   * @returns {Promise<Array>} - Liste des transactions
   */
  static findByFidelite(idFidelite) {
    return prisma.transactionFidelite.findMany({
      where: { id_fidelite: idFidelite },
      orderBy: { date_transaction: 'desc' }
    });
  }

  /**
   * Récupère les transactions par période
   * @param {Date} debut - Date de début
   * @param {Date} fin - Date de fin
   * @returns {Promise<Array>} - Liste des transactions
   */
  static findByPeriod(debut, fin) {
    return prisma.transactionFidelite.findMany({
      where: {
        date_transaction: {
          gte: debut,
          lte: fin
        }
      },
      orderBy: { date_transaction: 'desc' },
      include: {
        fidelite: {
          include: {
            client: true
          }
        }
      }
    });
  }

  /**
   * Récupère les transactions par type (positif/négatif)
   * @param {boolean} isPositive - True pour les transactions positives
   * @returns {Promise<Array>} - Liste des transactions
   */
  static findByType(isPositive) {
    return prisma.transactionFidelite.findMany({
      where: {
        changement_points: isPositive ? { gt: 0 } : { lt: 0 }
      },
      orderBy: { date_transaction: 'desc' },
      include: {
        fidelite: {
          include: {
            client: true
          }
        }
      }
    });
  }
}

module.exports = TransactionFideliteModel;
