const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ActiviteUtilisateurModel {
  /**
   * Récupère toutes les entrées d'activité d'un utilisateur
   * @param {number} idUtilisateur - ID de l'utilisateur
   * @param {number} limit - Nombre maximum d'entrées
   * @returns {Promise<Array>} - Liste des entrées
   */
  static findByUser(idUtilisateur, limit = 100) {
    return prisma.activiteUtilisateur.findMany({
      where: { id_utilisateur: idUtilisateur },
      orderBy: { horodatage: 'desc' },
      take: limit
    });
  }

  /**
   * Récupère les activités par type d'action
   * @param {string} action - Type d'action
   * @param {number} limit - Nombre maximum d'entrées
   * @returns {Promise<Array>} - Liste des entrées
   */
  static findByAction(action, limit = 100) {
    return prisma.activiteUtilisateur.findMany({
      where: { action },
      orderBy: { horodatage: 'desc' },
      take: limit,
      include: {
        utilisateur: true
      }
    });
  }

  /**
   * Récupère les statistiques d'activité par utilisateur
   * @returns {Promise<Array>} - Statistiques d'activité
   */
  static getActivityStats() {
    return prisma.$queryRaw`
      SELECT 
        u.id_utilisateur, 
        u.nom_utilisateur, 
        COUNT(a.id_activite) as total_activities,
        MAX(a.horodatage) as last_activity
      FROM "Utilisateur" u
      LEFT JOIN "ActiviteUtilisateur" a ON u.id_utilisateur = a.id_utilisateur
      GROUP BY u.id_utilisateur, u.nom_utilisateur
      ORDER BY total_activities DESC
    `;
  }
}

module.exports = ActiviteUtilisateurModel;
