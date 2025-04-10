const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class JournalChatbotModel {
  /**
   * Récupère toutes les entrées de journal d'un utilisateur
   * @param {number} idUtilisateur - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des entrées
   */
  static findByUser(idUtilisateur) {
    return prisma.journalChatbot.findMany({
      where: { id_utilisateur: idUtilisateur },
      orderBy: { horodatage: 'desc' }
    });
  }

  /**
   * Recherche dans les journaux du chatbot
   * @param {string} query - Terme de recherche
   * @returns {Promise<Array>} - Entrées correspondantes
   */
  static search(query) {
    return prisma.journalChatbot.findMany({
      where: {
        OR: [
          { requete: { contains: query, mode: 'insensitive' } },
          { reponse: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { horodatage: 'desc' },
      include: {
        utilisateur: true
      }
    });
  }
}

module.exports = JournalChatbotModel;
