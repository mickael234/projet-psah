const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationModel {
  /**
   * Récupère toutes les notifications d'un utilisateur
   * @param {number} idUtilisateur - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des notifications
   */
  static findByUser(idUtilisateur) {
    return prisma.notification.findMany({
      where: { id_utilisateur: idUtilisateur },
      orderBy: { envoye_le: 'desc' }
    });
  }

  /**
   * Récupère les notifications non lues d'un utilisateur
   * @param {number} idUtilisateur - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des notifications non lues
   */
  static getUnreadNotifications(idUtilisateur) {
    return prisma.notification.findMany({
      where: {
        id_utilisateur: idUtilisateur,
        etat: { not: 'lu' }
      },
      orderBy: { envoye_le: 'desc' }
    });
  }
}

module.exports = NotificationModel;